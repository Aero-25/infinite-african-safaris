/* =====================================================================
   POST /api/lead — save a website enquiry to Cloudflare D1.
   Binding `DB` is declared in wrangler.toml; table in db/schema.sql.
   Called fire-and-forget by assets/js/integrations.js, so failures never
   block the visitor's WhatsApp / email handoff.
   ===================================================================== */

const LIMITS = { source: 40, name: 120, email: 200, phone: 60, country: 80, tour: 160, message: 5000 };
const MAX_BODY = 32 * 1024;
const MAX_RAW = 16 * 1024;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const text = (v, max) => {
  if (v == null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
};

export async function onRequestPost({ request, env }) {
  // Only accept submissions from this site's own pages.
  const origin = request.headers.get("Origin");
  if (origin && !sameHost(origin, request.url)) return json({ ok: false, error: "forbidden" }, 403);
  if (!env.DB) return json({ ok: false, error: "database not configured" }, 503);

  const body = await request.text();
  if (body.length > MAX_BODY) return json({ ok: false, error: "too large" }, 413);
  let d;
  try { d = JSON.parse(body); } catch { return json({ ok: false, error: "invalid json" }, 400); }
  if (!d || typeof d !== "object") return json({ ok: false, error: "invalid body" }, 400);
  if (d._hp) return json({ ok: true });                      // honeypot: pretend success, store nothing

  const email = text(d.email, LIMITS.email);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "valid email required" }, 422);
  }
  const size = Number.parseInt(d.group_size, 10);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(d.preferred_date || "") ? d.preferred_date : null;
  let raw = d.raw == null ? null : JSON.stringify(d.raw);
  if (raw && raw.length > MAX_RAW) raw = raw.slice(0, MAX_RAW);

  try {
    await env.DB.prepare(
      `INSERT INTO leads (id, source, name, email, phone, country, group_size, preferred_date, tour, message, raw)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
    ).bind(
      crypto.randomUUID(),
      text(d.source, LIMITS.source) || "website",
      text(d.name, LIMITS.name),
      email,
      text(d.phone, LIMITS.phone),
      text(d.country, LIMITS.country),
      Number.isFinite(size) && size > 0 && size < 1000 ? size : null,
      date,
      text(d.tour, LIMITS.tour),
      text(d.message, LIMITS.message),
      raw,
    ).run();
  } catch (e) {
    console.error("lead insert failed:", e);
    return json({ ok: false, error: "could not save" }, 500);
  }

  return json({ ok: true }, 201);
}

function sameHost(origin, url) {
  try { return new URL(origin).host === new URL(url).host; } catch { return false; }
}
