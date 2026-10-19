IMAGE FOLDERS  (this file is not published)
=============

logos/          small-logo.webp (header + browser tab), big-logo.webp (loading screen)
hero/           rotating photo wall on the homepage — 760x950 portrait WebP
cards/          tour card photos — about 1000px wide WebP
photos/         gallery photos, full size for the lightbox — 1800px WebP
photos/thumb/   the same gallery photos at 960px for the grid (same file name)
gallery/        earlier gallery photos (JPEG)
about/          homepage section photos
feature/        "Create a tour around you" photo on the homepage
elephants.png   footer silhouette

Every image is wired up in assets/js/data.js (hero, tours, gallery) or
directly in index.html. Keep photos as WebP and under ~300 KB each.
