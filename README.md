# Infinite African Safaris — Website

A cinematic site for Infinite African Safaris (Walvis Bay, Namibia).
Plain HTML/CSS/JS hosted on **Cloudflare Pages**, with one small Pages Function
that saves enquiries to a **Cloudflare D1** database. All photos and video are
self-hosted in `assets/`. Nothing depends on Supabase any more.

## What's inside
- **Curved image-wall hero** with pointer parallax (the signature moment)
- **Currency switcher** — Namibian Dollar / Euro / US Dollar, applied site-wide
- **Build-your-own-tour** tool with live pricing → sends to WhatsApp or email
- **Experiences** cards + full 2026 rate card
- **Gallery** with lightbox + **client photo album** access (ready to connect)
- **Showreel** video, **reviews**, **policies**, **Flamingo Villas map**
- **Inquiry form** (saved to D1 *and* handed off to WhatsApp/email), social links,
  floating WhatsApp button
- Responsive, keyboard-accessible, respects reduced-motion

## Editing content — everything lives in one file
Open **`assets/js/data.js`**:

| Want to change…            | Edit |
|----------------------------|------|
| Prices / tours / durations | `TOURS` |
| Exchange rates             | `CURRENCY` (NAD per 1 unit) |
| Homepage photo wall        | `HERO_POOL` |
| Gallery photos             | `GALLERY` |
| Reviews                    | `REVIEWS` |
| Policies                   | `POLICIES` |
| Social media links         | `SOCIALS` |
| WhatsApp / email           | `CONTACT` |

After changing a CSS or JS file, bump the `?v=` string where it is referenced in
the HTML pages. Browsers cache CSS/JS for a year.

## Photos
See `assets/img/README.txt` for the folder layout. Gallery photos are WebP:
`assets/img/photos/<name>.webp` (1800px, opens in the lightbox) plus
`assets/img/photos/thumb/<name>.webp` (960px, shown in the grid). Add a line
`photo("<name>", "what's in the picture")` to `GALLERY` in `data.js`.
Keep vehicles out of shot, and strip location data (GPS) before publishing.

## Run it locally
```bash
npm install
npm run db:init:local   # once: creates the leads table in a local D1 database
npm run dev             # http://localhost:8788 (site + /api/lead + local D1)
```
Pages are served at clean URLs (`/safaris`, `/gallery`, `/contact`), the same as on
Cloudflare. Opening the HTML files straight from disk still renders the site, but
the menu links and the lead saving need `npm run dev`.

## Enquiries (leads)
Every form also POSTs to `/api/lead` (`functions/api/lead.js`), which stores it in
the D1 table `leads` (`db/schema.sql`). The WhatsApp/email handoff never waits for
it. To read enquiries:
- Cloudflare dashboard → **Storage & Databases → D1 → ias-leads → Explore data**, or
- `npm run leads` (latest 50).

## Deploying
Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site,
finds (or creates) the `ias-leads` D1 database, applies `db/schema.sql` and deploys
to the Cloudflare Pages project `infinite-african-safaris`. It uses the repository
secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (the token needs
*Cloudflare Pages: Edit* and *D1: Edit*). If the token can't manage D1, the site
still deploys, but enquiries aren't stored (WhatsApp/email still work).

For a manual deploy (`npm run deploy`), first put the real `database_id`
(`npx wrangler d1 list`) into `wrangler.toml`.

## Pointing the domain at Cloudflare Pages (one-time)
Do this in the Cloudflare account that holds both the Pages project and the
`infiniteafricansafaris.com` DNS zone:
1. **Workers & Pages → infinite-african-safaris → Custom domains** → add
   `infiniteafricansafaris.com`. When asked, let it replace the old root records
   that point to the cPanel server. **Leave `mail` and MX records alone** so email
   keeps working.
2. **Rules → Redirect Rules** → template **"Redirect from WWW to root"**, so `www.`
   goes to the main domain.
3. Supabase: export the old leads (Table editor → `leads` → Export to CSV). Once the
   new site is confirmed working, pause or delete the Supabase project.

## What gets published
`npm run build` copies only the public files (HTML pages, `assets/`, `robots.txt`,
`sitemap.xml`, `_headers`, `_redirects`) into `dist/`. Security and cache headers
live in `_headers`. `.htaccess` is only used if the site is ever served from
cPanel/Apache again.
