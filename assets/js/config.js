/* =====================================================================
   Infinite African Safaris — integration config
   Fill these in to switch on analytics.
   The site works fine with the placeholders left as-is (they just no-op).
   ===================================================================== */
window.IAS_CONFIG = {
  /* Lead capture — Cloudflare Pages Function that saves enquiries to D1.
     Lives in functions/api/lead.js; same origin, so no keys are needed. */
  LEAD_ENDPOINT: "/api/lead",

  /* Google Analytics 4 — Admin → Data streams → your web stream → Measurement ID */
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX",
};
