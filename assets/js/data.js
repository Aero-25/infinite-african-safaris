/* =====================================================================
   Infinite African Safaris — site data
   Everything the client edits lives here: prices, tours, photos, links.
   Prices are in Namibian Dollar (NAD); other currencies convert via CURRENCY.
   ===================================================================== */

/* Helper to build an Unsplash image URL. Replace any `img` value with a
   local file, e.g.  img: "assets/img/your-photo.jpg"  */
const IMG = (id, w = 900, h = 0) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}` + (h ? `&h=${h}` : "");

/* --- Currency: edit these rates whenever they change (NAD per 1 unit) - */
const CURRENCY = {
  NAD: { symbol: "N$",  name: "Namibian Dollar", rate: 1,    decimals: 0 },
  EUR: { symbol: "€",   name: "Euro",            rate: 19.5, decimals: 0 },
  USD: { symbol: "US$", name: "US Dollar",       rate: 18.0, decimals: 0 },
};

/* --- The rotating hero photo wall. Add/replace freely. ----------------
   Use full URLs in `url`, or an Unsplash id in `id`.                    */
/* Logos, tour cards, about images and the showreel are on Supabase Storage
   (Infinite African Safaris project). The hero wall and gallery photos live
   with the site in assets/img/ (760×950 WebP for the hero, ~20-50 KB each). */
const MEDIA = "https://uksddraybxgpgnhocqyc.supabase.co/storage/v1/object/public/media/";
const heroImg = (name) => `assets/img/hero/${name}.webp`;
const galleryImg = (name) => `assets/img/gallery/${name}.jpg`;
const pad3 = (n) => String(n).padStart(3, "0");
const HERO_POOL = [
  { url: heroImg("sandwich-harbour-giant-dune"), cap: "Sandwich Harbour" },
  { url: heroImg("oryx-on-dune-crest"),          cap: "Oryx" },
  { url: heroImg("couple-jumping-beach"),        cap: "Where dunes meet the sea" },
  { url: heroImg("flamingos-walvis-bay-lagoon"), cap: "Flamingos" },
  { url: heroImg("web-footed-gecko-close-up"),   cap: "Desert geckos" },
  { url: heroImg("sunset-clouds-dunes-ocean"),   cap: "Desert sunsets" },
  { url: heroImg("jackal-along-the-surf"),       cap: "Jackals" },
  { url: heroImg("pink-salt-pans"),              cap: "Pink salt pans" },
  { url: heroImg("pelican-in-flight"),           cap: "Birdlife" },
  { url: heroImg("sea-of-dunes"),                cap: "The dunes" },
];

/* --- Tours / experiences (adult/child in NAD; null = "On request") ----
   scene = built-in fallback artwork. img = the photo actually shown.    */
const TOURS = [
  { id:"sh-half",   name:"Half-Day Sandwich Harbour", adult:2800, child:1800, hours:"4 hours", min:2, feature:true,
    scene:"dune", img:`${MEDIA}cards/sandwich-harbour.webp`,
    blurb:"Drive the towering dunes where the desert pours straight into the Atlantic." },
  { id:"sh-sunset", name:"Sunset Sandwich Harbour",   adult:3500, child:2500, hours:"4 hours", min:2, feature:true,
    scene:"sunrise", img:`${MEDIA}Sunset%20SW.png`,
    blurb:"Golden hour on the dunes — the coast set alight as the sun drops into the sea." },
  { id:"sh-full",   name:"Full-Day Sandwich Harbour", adult:3500, child:2500, hours:"6 hours", min:2, feature:true,
    scene:"sunrise", img:`${MEDIA}Full%20day.png`,
    blurb:"The complete Sandwich Harbour day: dunes, lagoon, wildlife and a long lunch." },
  { id:"cruise",    name:"Marine Boat Cruise",        adult:1600, child:1000, hours:"3 hours", min:2, feature:true,
    scene:"ocean", img:`${MEDIA}cards/marine-cruise.webp`,
    blurb:"Dolphins, seals and pelicans on a relaxed cruise across Walvis Bay." },
  { id:"kayak",     name:"Kayaking · Pelican Point Seal Colony", adult:1600, child:1000, hours:"3 hours", min:2, feature:true,
    scene:"kayak", img:`${MEDIA}cards/pelican-point-seals.webp`,
    blurb:"Paddle among thousands of Cape fur seals at the Pelican Point colony." },
  { id:"moon",      name:"Moon Landscape · Moonvalley & Welwitschia", adult:2000, child:1000, hours:"5 hours", min:2, feature:true,
    scene:"moon", img:"https://images.pexels.com/photos/34780180/pexels-photo-34780180.jpeg",
    blurb:"Lunar valleys and ancient Welwitschia plants on a desert geology tour." },
  { id:"sh-dune",   name:"Sandwich Harbour & Dune Boarding Combo", adult:3500, child:1750, hours:"6 hours", min:2,
    scene:"dune", img:"assets/img/cards/guests-sliding-down-dune.webp",
    blurb:"Big dunes by day, board down them by afternoon. The full sand experience." },
  { id:"cruise-sh", name:"Marine Cruise & Sandwich Harbour Combo", adult:4000, child:2250, hours:"7+ hours", min:2,
    scene:"ocean", img:"assets/img/cards/sandwich-harbour-dunes-meet-ocean.webp",
    blurb:"Ocean wildlife in the morning, dune adventure after lunch — the best of both." },
  { id:"kayak-sh",  name:"Kayaking & Sandwich Harbour Combo", adult:4000, child:2250, hours:"7+ hours", min:2,
    scene:"kayak", img:"assets/img/cards/cape-fur-seal-beach.webp",
    blurb:"Seals at sunrise, dunes by afternoon. A complete coast-to-desert day." },
  { id:"sossus",    name:"Sossusvlei & Deadvlei",     adult:null, child:null, hours:"On request", min:2,
    scene:"sunrise", img:"https://images.pexels.com/photos/14032289/pexels-photo-14032289.jpeg",
    blurb:"The world's tallest dunes and the haunting white pan of Deadvlei." },
  { id:"spitz",     name:"Spitzkoppe",                adult:null, child:null, hours:"On request", min:2,
    scene:"savanna", img:"https://images.pexels.com/photos/35298609/pexels-photo-35298609.jpeg",
    blurb:"Ancient granite peaks, rock art and some of Namibia's darkest skies." },
];

const EXTRAS = [
  "Living Desert Adventures","Etosha National Park Safaris","Skeleton Coast Tours",
  "Cultural & Township Experiences","Airport Transfers & Shuttles","Multi-Day Namibia Tours",
];

/* --- Gallery tiles ---------------------------------------------------
   Newest photos first: enhanced WebP at 1800px for the lightbox plus a
   960px thumbnail for the grid. Then the earlier gallery photos
   (vehicle shots removed). Tile 1 is shown large, tile 6 extra wide.
   To add one: put <name>.webp in assets/img/photos/ and photos/thumb/,
   then add  photo("<name>", "what's in the picture")  below.            */
const photo = (name, alt) => ({
  img: `assets/img/photos/${name}.webp`,
  thumb: `assets/img/photos/thumb/${name}.webp`,
  alt,
});
const GALLERY = [
  photo("sandwich-harbour-giant-dune",        "A giant dune towering over the Atlantic at Sandwich Harbour"),
  photo("oryx-on-dune-crest",                 "An oryx standing on a dune crest under a soft sky"),
  photo("couple-jumping-beach",               "A couple jumping for joy on the beach below the dunes"),
  photo("web-footed-gecko-close-up",          "Close-up of a web-footed gecko"),
  photo("sunset-clouds-dunes-ocean",          "Dramatic sunset clouds over the dunes and ocean"),
  photo("flamingo-flock-panorama",            "Panorama of a flamingo flock feeding and flying over Walvis Bay"),
  photo("sandwich-harbour-dunes-meet-ocean",  "Sandwich Harbour, where the Namib dunes sweep down into the Atlantic"),
  photo("guests-sliding-down-dune",           "Guests sliding down a dune towards the sea"),
  photo("flamingos-walvis-bay-lagoon",        "Greater flamingos wading in the Walvis Bay lagoon"),
  photo("atlantic-sunset",                    "Sunset light over the Atlantic"),
  photo("namib-dune-ridges",                  "Rolling ridges of the Namib dune sea"),
  photo("beach-picnic-sparkling-wine",        "Picnic platters and sparkling wine set up on the beach"),
  photo("dune-curves",                        "Soft curves of Namib sand dunes"),
  photo("guest-on-steep-dune",                "A guest celebrating on a steep dune face"),
  photo("flamingo-in-flight",                 "A flamingo taking flight low over the lagoon"),
  photo("sunset-atlantic-surf",               "The sun setting over the Atlantic surf"),
  photo("dune-ridge-detail",                  "Pastel light along a dune ridge"),
  photo("couple-on-dune-above-ocean",         "A couple sitting on a dune above the ocean"),
  photo("salt-crystals-close-up",             "Close-up of salt crystals from the salt pans"),
  photo("pastel-dune-slopes",                 "Pastel dune slopes in early light"),
  photo("couple-looking-out-to-sea",          "A couple looking out over the Atlantic from the dunes"),
  photo("antelope-silhouette-dusk",           "An antelope silhouetted on a desert ridge at dusk"),
  photo("sun-dipping-into-ocean",             "The sun dipping into the ocean"),
  photo("layered-dunes-warm-light",           "Layered dunes in warm light"),
  photo("couple-on-beach",                    "A couple on the beach at Sandwich Harbour"),
  photo("whale-bone-on-beach",                "A weathered whale bone on the beach"),
  photo("dune-layers",                        "Overlapping dune slopes and shadows"),
  photo("guest-resting-dune-sea",             "A guest resting on the dunes by the sea"),
  photo("springbok-grazing",                  "A springbok grazing in the desert"),
  photo("last-light-over-waves",              "Last light over the waves"),
  photo("sea-of-dunes",                       "A sea of dunes with swirling shadows"),
  photo("couple-relaxing-dunes",              "A couple relaxing on the dunes"),
  photo("dune-shadows-detail",                "Curved shadows carved into a dune face"),
  photo("couple-beach-beneath-dunes",         "A couple on the beach beneath towering dunes"),
  photo("pelican-in-flight",                  "A great white pelican in flight"),
  photo("sunset-over-dunes-and-sea",          "The sun lowering over the dunes and the sea"),
  photo("dune-curve-detail",                  "Detail of a sweeping dune curve"),
  photo("guest-photographing-view",           "A guest photographing the dunes and sea"),
  photo("dunes-to-sandwich-harbour-lagoon",   "Dunes rolling down to the Sandwich Harbour lagoon"),
  photo("couple-above-lagoon",                "A couple on a dune above the lagoon"),
  photo("oryx-grazing",                       "Oryx grazing among desert grasses"),
  photo("golden-sun-over-atlantic",           "A golden sun over the Atlantic, seen from the dunes"),
  photo("dune-field-golden-light",            "Namib dune field in golden light"),
  photo("couple-waving-dune-lagoon",          "A couple waving from a dune above the Sandwich Harbour lagoon"),
  photo("distant-dune-field",                 "Endless dunes stretching to the horizon"),
  photo("couple-pink-salt-lake",              "A couple at the pink salt lake"),
  photo("oryx-feeding",                       "An oryx feeding in the dune grassland"),
  photo("sunset-glow-dunes",                  "Sunset glow over the dunes"),
  photo("tall-dune-crest",                    "A tall dune with a sharp crest"),
  photo("couple-sitting-pink-lake",           "A couple sitting on the rocks by the pink lake"),
  photo("dune-crest-evening",                 "Smooth dune crest in evening light"),
  photo("couple-beach-sandwich-harbour",      "A couple on the beach track at Sandwich Harbour"),
  photo("oryx-dune-grassland",                "Oryx in the dune grassland"),
  photo("sun-above-sea-portrait",             "The sun above the sea from the dune tops"),
  photo("light-and-shadow-dunes",             "Light and shadow on dune ridges"),
  photo("couple-dune-track",                  "A couple on the sandy track between dunes and sea"),
  photo("sculpted-dune-bowl",                 "A wind-sculpted dune bowl"),
  photo("guests-overlooking-lagoon",          "Guests sitting on the dunes overlooking the lagoon"),
  photo("two-oryx",                           "Two oryx browsing in the desert"),
  photo("endless-dune-sea",                   "The endless Namib dune sea"),
  photo("guests-arms-outstretched",           "Guests with arms outstretched on the dunes"),
  photo("hazy-dunes-coast",                   "Dunes fading into coastal haze"),
  photo("couple-dune-lagoon-overcast",        "A couple on a dune above the lagoon on a misty day"),
  photo("oryx-herd",                          "A small herd of oryx"),
  photo("sunburst-guests-portrait",           "Sunburst over the sea with guests on the dune"),
  photo("dune-waves",                         "Waves of sand under a soft sky"),
  photo("couple-jumping-dune-crest",          "A couple jumping on a dune crest above the lagoon"),
  photo("dune-sea-texture",                   "Textures of the Namib dune sea"),
  photo("guest-leaping-lagoon",               "A guest leaping high above the lagoon"),
  photo("cape-fur-seal-beach",                "A Cape fur seal resting on the beach"),
  photo("dune-valleys-portrait",              "Dune valleys seen from above"),
  photo("guest-jumping-dune",                 "A guest jumping on the dune with the lagoon behind"),
  photo("dunes-golden-hour",                  "Namib dunes at golden hour"),
  photo("group-celebrating-dune",             "A group celebrating on top of a dune"),
  photo("seal-by-the-surf",                   "A Cape fur seal by the surf"),
  photo("sunburst-over-sea",                  "Sunburst over the sea above the dunes"),
  photo("dune-horizon",                       "Dune horizon in warm light"),
  photo("guest-arms-wide-lagoon",             "A guest with arms wide above the lagoon"),
  photo("couple-dune-ridge-ocean",            "A couple on a dune ridge above the ocean"),
  photo("web-footed-gecko-in-hand",           "A web-footed gecko resting in a guide's hand"),
  photo("layered-dunes-portrait",             "Layers of dunes receding into the distance"),
  photo("sunlit-dune-ripples",                "Sunlit ripples across the dunes"),
  photo("couple-embracing-dune-ridge",        "A couple embracing on a dune ridge above the sea"),
  photo("gecko-on-hands",                     "A web-footed gecko on a guide's hands"),
  photo("sun-star-over-ocean",                "A sun star over the ocean"),
  photo("sandwich-harbour-lagoon-curve",      "Dunes curving along the Sandwich Harbour shoreline"),
  photo("dune-slope-atlantic-surf",           "Dune slope meeting the Atlantic surf at Sandwich Harbour"),
  photo("photographers-sunset-dunes",         "Photographers with a tripod in the dunes at sunset"),
  photo("black-backed-jackal-beach",          "A black-backed jackal foraging on the beach"),
  photo("red-sun-sinking",                    "A red sun sinking into the Atlantic"),
  photo("dunes-meet-the-bay",                 "Dunes meeting a sweeping Atlantic bay"),
  photo("photographer-tripod-dunes",          "A photographer with a tripod overlooking the dunes"),
  photo("sharp-dune-ridge",                   "A sharp, wind-shaped dune ridge"),
  photo("jackal-along-the-surf",              "A black-backed jackal trotting along the surf"),
  photo("pink-salt-pans",                     "Pink water in the Walvis Bay salt pans"),
  photo("sandwich-harbour-lagoon-from-dunes", "The Sandwich Harbour lagoon seen from the dunes"),
  photo("jackal-in-the-surf",                 "A black-backed jackal at the water's edge"),
  photo("sunburst-portrait",                  "Sunburst over the dune tops"),
  photo("atlantic-bay-dunes",                 "An Atlantic bay framed by dunes"),
  photo("red-sun-above-sea",                  "A red sun above the sea at dusk"),
  photo("golden-dunes-afternoon",             "Golden dunes in afternoon light"),
  photo("hiker-in-dune-sea",                  "A walker in a backlit dune valley"),
  photo("pink-sunset-lagoon",                 "A pink sunset over the lagoon"),
  photo("sunlit-dune-crest",                  "A sunlit dune crest"),
  photo("pink-sunset-lagoon-2",               "Pink sunset clouds over the lagoon"),
  ...[4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 24, 52, 54, 57, 62, 64, 65, 66, 67, 68, 69, 74, 84, 88, 95, 96, 99, 102, 110, 111]
    .map(n => ({ img: galleryImg(`infinite-${pad3(n)}`), alt: "" })),
];

/* --- Reviews (replace with real Google / GetYourGuide quotes) -------- */
const REVIEWS = [
  { name:"Lena M.", from:"Germany", stars:5, text:"The Sandwich Harbour tour was the highlight of our Namibia trip. Watching the dunes drop into the ocean is unreal — and our guide made it feel personal." },
  { name:"James & Pip", from:"United Kingdom", stars:5, text:"Kayaking with the seals had our kids glued. Brilliantly organised, flexible with our timing, and genuinely warm people." },
  { name:"Sofia R.", from:"Spain", stars:5, text:"Booked a private custom tour. They listened to exactly what we wanted and built the perfect day. Worth every cent." },
  { name:"Thabo K.", from:"South Africa", stars:5, text:"Professional, safe and so knowledgeable about the desert. The moon landscape tour blew me away." },
  { name:"Amara O.", from:"Nigeria", stars:5, text:"From first WhatsApp to the last photo, faultless. Felt like exploring with friends who happen to be experts." },
  { name:"Marco V.", from:"Italy", stars:5, text:"Sandwich Harbour at sunrise, then dolphins on the cruise — two different worlds in one day. Our guide's knowledge of the desert was incredible." },
  { name:"Hannah B.", from:"Netherlands", stars:5, text:"So well organised from start to finish. Comfortable vehicle, great snacks, and they knew exactly where the light would be best for photos." },
  { name:"David & Sam", from:"Australia", stars:5, text:"The dune driving was a thrill and we never felt unsafe for a second. Proper professionals who clearly love what they do." },
  { name:"Yuki T.", from:"Japan", stars:5, text:"A quiet, magical morning among the seals at Pelican Point. Unforgettable, and beautifully run." },
  { name:"Claire D.", from:"France", stars:5, text:"We added the braai school after our tour — such a special evening under the stars. We felt like family by the end of the night." },
  { name:"Peter & Anke", from:"Germany", stars:5, text:"Our second time booking with Michael's team. Flexible, friendly and they treat the desert with real respect. We'll be back." },
];

/* --- Policies (from the brochure) ------------------------------------ */
const POLICIES = [
  { t:"Dietary requirements", b:"Guests needing vegetarian, vegan, gluten-free or allergy-friendly options must notify us at least 24 hours before departure." },
  { t:"Payment terms", b:"Cash or card, paid at check-in." },
  { t:"Cancellation policy", b:"7–15 days before tour: 20% of total. 1–7 days before: 50%. No-show: 100%." },
  { t:"Tide & weather", b:"We may adjust route, timing or experience based on tide, weather and safety. If beach access is unsafe, the tour continues via an alternative dune route. Guest safety always comes first." },
  { t:"Passenger liability & insurance", b:"All passengers are covered under our Passenger Liability Insurance of N$5,000,000. We strongly recommend comprehensive personal travel insurance covering medical, cancellation and belongings." },
  { t:"Acceptance of terms", b:"Confirming a booking means the client, agent or representative accepts all rates, payment terms and cancellation policies set out here." },
];

/* --- Social links ----------------------------------------------------- */
const SOCIALS = [
  { key:"whatsapp",    label:"WhatsApp",    url:"https://wa.me/264817269221" },
  { key:"instagram",   label:"Instagram",   url:"https://www.instagram.com/infiniteafricansafaris/" },
  { key:"facebook",    label:"Facebook",    url:"https://www.facebook.com/people/Infinite-African-Safaris/61576546264285/" },
];

const CONTACT = { whatsapp: "264817269221", email: "info@infiniteafricansafaris.com" };
