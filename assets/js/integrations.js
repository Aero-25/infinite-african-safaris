/* =====================================================================
   Infinite African Safaris — integrations
   Google Analytics 4  +  Supabase lead capture.
   Configure once in assets/js/config.js. Unconfigured = silent no-op,
   so the WhatsApp / email flows always keep working.
   ===================================================================== */
(() => {
  "use strict";
  const cfg = window.IAS_CONFIG || {};
  // A value counts as "configured" only if it's a non-empty string that isn't a placeholder.
  const set = (v) => typeof v === "string" && v.length > 0 && !/YOUR-|^G-XXXX/.test(v);

  /* ---------- Google Analytics 4 ---------- */
  if (set(cfg.GA_MEASUREMENT_ID) && /^G-/.test(cfg.GA_MEASUREMENT_ID)) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + cfg.GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", cfg.GA_MEASUREMENT_ID);
  }

  /* ---------- Supabase lead capture ---------- */
  let clientPromise = null;
  const getClient = () => {
    if (!set(cfg.SUPABASE_URL) || !set(cfg.SUPABASE_ANON_KEY)) return null;
    if (!clientPromise) {
      clientPromise = import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.0/+esm")
        .then((m) => m.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, { auth: { persistSession: false } }))
        .catch((e) => { console.warn("[IAS] Supabase failed to load:", e); return null; });
    }
    return clientPromise;
  };

  /* Save a lead. Fire-and-forget: never blocks the WhatsApp/email handoff.
     Returns true on success, false otherwise. `_hp` = honeypot (bot) → dropped. */
  window.iasSaveLead = async (payload = {}) => {
    try {
      if (payload._hp) return false;                       // honeypot tripped → silently drop
      const client = await getClient();
      if (!client) return false;                           // not configured yet
      const row = {
        source: payload.source || "website",
        name: payload.name || null,
        email: payload.email || null,
        phone: payload.phone || null,
        country: payload.country || null,
        group_size: payload.group_size ? Number(payload.group_size) : null,
        preferred_date: payload.preferred_date || null,    // "" → null for the date column
        tour: payload.tour || null,
        message: payload.message || null,
        raw: payload.raw || null,
      };
      const { error } = await client.from("leads").insert(row);
      if (error) { console.warn("[IAS] lead save failed:", error.message); return false; }
      if (window.gtag) gtag("event", "generate_lead", { source: row.source });
      return true;
    } catch (e) {
      console.warn("[IAS] lead save error:", e);
      return false;
    }
  };
})();
