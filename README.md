# Infinite African Safaris — Website

A cinematic single-page site for Infinite African Safaris (Walvis Bay, Namibia).
Pure HTML/CSS/JS — no build step. Open `index.html` or deploy the folder as-is.

## What's inside
- **Curved image-wall hero** with pointer parallax (the signature moment)
- **Currency switcher** — Namibian Dollar / Euro / US Dollar, applied site-wide
- **Build-your-own-tour** tool with live pricing → sends to WhatsApp or email
- **Experiences** cards + full 2026 rate card
- **Gallery** with lightbox + **client photo album** access (ready to connect)
- **Showreel** video slot, **reviews**, **policies**, **Flamingo Villas map**
- **Inquiry form**, social links, floating WhatsApp button
- Responsive, keyboard-accessible, respects reduced-motion

## Editing content — everything lives in one file
Open **`assets/js/data.js`**:

| Want to change…            | Edit |
|----------------------------|------|
| Prices / tours / durations | `TOURS` |
| Exchange rates             | `CURRENCY` (NAD per 1 unit) |
| Gallery tiles              | `GALLERY` |
| Reviews                    | `REVIEWS` |
| Policies                   | `POLICIES` |
| Social media links         | `SOCIALS` (paste real URLs) |
| WhatsApp / email           | `CONTACT` |

## Adding your own photos & videos
The hero, cards and gallery use built-in artwork so the site looks complete today.
To use real media, drop files into `assets/img/` and `assets/video/`, then:

- **Photos:** in `data.js`, add `img: "assets/img/your-photo.jpg"` to any tour or gallery item.
- **Hero video / showreel:** add `assets/video/showreel.mp4`; the player section is already built.
- **Logo:** the wordmark is drawn in code. To use the signature PNG, add it to `assets/img/`
  and swap the emblem markup in `index.html`.

## Going live
The form and tour builder open WhatsApp / the visitor's email app pre-filled.
To collect submissions on a server instead, point the form in `assets/js/site.js`
at a service like Formspree. The **client photo album** is ready to connect to your
gallery host (e.g. Pixieset / Google Photos) — wire it in `clientForm` in `site.js`.

## Deploy
Any static host works (Cloudflare Pages, Netlify, GitHub Pages). No build command;
output directory is the project root.
