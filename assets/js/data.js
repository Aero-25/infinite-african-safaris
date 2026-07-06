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
/* Pre-optimized WebP hosted on Supabase Storage (Infinite African Safaris project).
   Served straight from /object/public (no transform dependency), already ~30-60 KB each. */
const MEDIA = "https://uksddraybxgpgnhocqyc.supabase.co/storage/v1/object/public/media/";
const heroImg = (name) => `${MEDIA}hero/${name}.webp`;
const galleryImg = (name) => `assets/img/gallery/${name}.jpg`;
const pad3 = (n) => String(n).padStart(3, "0");
const HERO_POOL = [
  { url: heroImg("dune"),      cap: "The dunes" },
  { url: heroImg("sunset"),    cap: "Desert sunsets" },
  { url: heroImg("flamingos"), cap: "Flamingos" },
  { url: heroImg("chameleon"), cap: "Chameleons" },
  { url: heroImg("trail"),     cap: "On the trail" },
  { url: heroImg("gecko"),     cap: "Desert geckos" },
  { url: heroImg("jakkals"),   cap: "Jackals" },
  { url: heroImg("birds"),     cap: "Birdlife" },
];

/* --- Tours / experiences (adult/child in NAD; null = "On request") ----
   scene = built-in fallback artwork. img = the photo actually shown.    */
const TOURS = [
  { id:"sh-half",   name:"Half-Day Sandwich Harbour", adult:2500, child:1250, hours:"4 hours", min:2, feature:true,
    scene:"dune", img:`${MEDIA}cards/sandwich-harbour.webp`,
    blurb:"Drive the towering dunes where the desert pours straight into the Atlantic." },
  { id:"sh-sunset", name:"Sunset Sandwich Harbour",   adult:3500, child:1750, hours:"4 hours", min:2, feature:true,
    scene:"sunrise", img:IMG("1547471080-7cc2caa01a7e"),
    blurb:"Golden hour on the dunes — the coast set alight as the sun drops into the sea." },
  { id:"sh-full",   name:"Full-Day Sandwich Harbour", adult:3500, child:1750, hours:"6 hours", min:2, feature:true,
    scene:"sunrise", img:IMG("1547234935-80c7145ec969"),
    blurb:"The complete Sandwich Harbour day: dunes, lagoon, wildlife and a long lunch." },
  { id:"sh-private",name:"Private Sandwich Harbour Custom", adult:3500, child:1750, hours:"4 hours", min:2,
    scene:"dune", img:IMG("1471922694854-ff1b63b20054"),
    blurb:"Your own vehicle and guide. Go at your pace, stop where you like." },
  { id:"cruise",    name:"Marine Boat Cruise",        adult:1500, child:750,  hours:"3 hours", min:2, feature:true,
    scene:"ocean", img:`${MEDIA}cards/marine-cruise.webp`,
    blurb:"Dolphins, seals and pelicans on a relaxed cruise across Walvis Bay." },
  { id:"kayak",     name:"Kayaking · Pelican Point Seal Colony", adult:1500, child:750, hours:"3 hours", min:2, feature:true,
    scene:"kayak", img:`${MEDIA}cards/pelican-point-seals.webp`,
    blurb:"Paddle among thousands of Cape fur seals at the Pelican Point colony." },
  { id:"moon",      name:"Moon Landscape · Moonvalley & Welwitschia", adult:2000, child:1000, hours:"5 hours", min:2, feature:true,
    scene:"moon", img:IMG("1500964757637-c85e8a162699"),
    blurb:"Lunar valleys and ancient Welwitschia plants on a desert geology tour." },
  { id:"sh-dune",   name:"Sandwich Harbour & Dune Boarding Combo", adult:3500, child:1750, hours:"6 hours", min:2,
    scene:"dune", img:IMG("1489493887464-892be6d1daae"),
    blurb:"Big dunes by day, board down them by afternoon. The full sand experience." },
  { id:"cruise-sh", name:"Marine Cruise & Sandwich Harbour Combo", adult:4000, child:2250, hours:"7+ hours", min:2,
    scene:"ocean", img:IMG("1471922694854-ff1b63b20054"),
    blurb:"Ocean wildlife in the morning, dune adventure after lunch — the best of both." },
  { id:"kayak-sh",  name:"Kayaking & Sandwich Harbour Combo", adult:4000, child:2250, hours:"7+ hours", min:2,
    scene:"kayak", img:IMG("1502784444187-359ac186c5bb"),
    blurb:"Seals at sunrise, dunes by afternoon. A complete coast-to-desert day." },
  { id:"fishing",   name:"Shoreline Fishing Trip",    adult:null, child:null, hours:"On request", min:2,
    scene:"fish", img:IMG("1471922694854-ff1b63b20054"),
    blurb:"Cast a line along the Atlantic shore. Tackle and guidance provided." },
  { id:"sossus",    name:"Sossusvlei & Deadvlei",     adult:null, child:null, hours:"On request", min:2,
    scene:"sunrise", img:IMG("1516026672322-bc52d61a55d5"),
    blurb:"The world's tallest dunes and the haunting white pan of Deadvlei." },
  { id:"spitz",     name:"Spitzkoppe",                adult:null, child:null, hours:"On request", min:2,
    scene:"savanna", img:IMG("1547234935-80c7145ec969"),
    blurb:"Ancient granite peaks, rock art and some of Namibia's darkest skies." },
];

const EXTRAS = [
  "Living Desert Adventures","Etosha National Park Safaris","Skeleton Coast Tours",
  "Cultural & Township Experiences","Airport Transfers & Shuttles","Multi-Day Namibia Tours",
];

/* --- Gallery tiles --------------------------------------------------- */
const GALLERY = Array.from({ length: 118 }, (_, i) => ({
  img: galleryImg(`infinite-${pad3(i + 1)}`),
  label: "",
}));

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

/* --- Social links: drop in the real URLs ----------------------------- */
const SOCIALS = [
  { key:"whatsapp",    label:"WhatsApp",    url:"https://wa.me/264817269221" },
  { key:"instagram",   label:"Instagram",   url:"#" },
  { key:"facebook",    label:"Facebook",    url:"#" },
  { key:"x",           label:"X (Twitter)", url:"#" },
  { key:"getyourguide",label:"GetYourGuide",url:"#" },
  { key:"google",      label:"Google",      url:"#" },
];

const CONTACT = { whatsapp: "264817269221", email: "info@infiniteafricansafaris.com" };
