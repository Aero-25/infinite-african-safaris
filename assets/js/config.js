/* =====================================================================
   Infinite African Safaris — integration config
   Fill these in to switch on analytics + lead capture.
   The site works fine with the placeholders left as-is (they just no-op).
   ===================================================================== */
window.IAS_CONFIG = {
  /* Supabase — reuse your existing image project.
     Dashboard → Project Settings → API:
       • Project URL      → SUPABASE_URL   (e.g. https://kbmgpqwmgthswjkfmqfe.supabase.co)
       • anon / public key → SUPABASE_ANON_KEY  (safe to expose in the browser)
     Then run supabase/setup-leads.sql once in the SQL Editor. */
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-PUBLIC-ANON-KEY",

  /* Google Analytics 4 — Admin → Data streams → your web stream → Measurement ID */
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX",
};
