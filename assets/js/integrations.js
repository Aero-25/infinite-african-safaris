/* =====================================================================
   Infinite African Safaris — integrations
   Google Analytics 4  +  lead capture (Cloudflare Pages Function → D1).
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

  /* ---------- Lead capture ---------- */
  /* Save a lead. Fire-and-forget: never blocks the WhatsApp/email handoff.
     Returns true on success, false otherwise. `_hp` = honeypot (bot) → dropped.
     keepalive lets the request finish even if the page opens mail/WhatsApp. */
  window.iasSaveLead = async (payload = {}) => {
    try {
      if (payload._hp) return false;                       // honeypot tripped → silently drop
      if (!set(cfg.LEAD_ENDPOINT) || location.protocol === "file:") return false;
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
      const res = await fetch(cfg.LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
        keepalive: true,
      });
      if (!res.ok) { console.warn("[IAS] lead save failed:", res.status); return false; }
      if (window.gtag) gtag("event", "generate_lead", { source: row.source });
      return true;
    } catch (e) {
      console.warn("[IAS] lead save error:", e);
      return false;
    }
  };
})();
