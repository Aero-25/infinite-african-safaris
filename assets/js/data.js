/* =====================================================================
   Infinite African Safaris — site data
   Everything the client edits lives here: prices, tours, reviews, links.
   All prices are in Namibian Dollar (NAD). Other currencies are
   converted live using the rates in CURRENCY below.
   ===================================================================== */

/* --- Currency: edit these rates whenever they change -------------------
   value = how many NAD make 1 of that currency.  */
const CURRENCY = {
  NAD: { symbol: "N$",  name: "Namibian Dollar", rate: 1,    decimals: 0 },
  EUR: { symbol: "€",   name: "Euro",            rate: 19.5, decimals: 0 },
  USD: { symbol: "US$", name: "US Dollar",       rate: 18.0, decimals: 0 },
};

/* --- Tours / experiences ---------------------------------------------
   adult / child are in NAD.  null price = "On request".
   scene = a built-in artwork theme (sunrise | dune | ocean | kayak | savanna | moon | fish | star)
           Swap any tile for a real photo by adding  img: "assets/img/your-photo.jpg"  */
const TOURS = [
  { id:"sh-half",   name:"Half-Day Sandwich Harbour", adult:2500, child:1250, hours:"4 hours", min:2, scene:"dune",    feature:true,
    blurb:"Drive the towering dunes where the desert pours straight into the Atlantic." },
  { id:"sh-sunset", name:"Sunset Sandwich Harbour",   adult:3500, child:1750, hours:"4 hours", min:2, scene:"sunrise", feature:true,
    blurb:"Golden hour on the dunes — the coast set alight as the sun drops into the sea." },
  { id:"sh-full",   name:"Full-Day Sandwich Harbour", adult:3500, child:1750, hours:"6 hours", min:2, scene:"sunrise", feature:true,
    blurb:"The complete Sandwich Harbour day: dunes, lagoon, wildlife and a long lunch." },
  { id:"sh-private",name:"Private Sandwich Harbour Custom", adult:3500, child:1750, hours:"4 hours", min:2, scene:"dune",
    blurb:"Your own vehicle and guide. Go at your pace, stop where you like." },
  { id:"cruise",    name:"Marine Boat Cruise",        adult:1500, child:750,  hours:"3 hours", min:2, scene:"ocean",   feature:true,
    blurb:"Dolphins, seals and pelicans on a relaxed cruise across Walvis Bay." },
  { id:"kayak",     name:"Kayaking · Pelican Point Seal Colony", adult:1500, child:750, hours:"3 hours", min:2, scene:"kayak", feature:true,
    blurb:"Paddle among thousands of Cape fur seals at the Pelican Point colony." },
  { id:"moon",      name:"Moon Landscape · Moonvalley & Welwitschia", adult:2000, child:1000, hours:"5 hours", min:2, scene:"moon", feature:true,
    blurb:"Lunar valleys and ancient Welwitschia plants on a desert geology tour." },
  { id:"sh-dune",   name:"Sandwich Harbour & Dune Boarding Combo", adult:3500, child:1750, hours:"6 hours", min:2, scene:"dune",
    blurb:"Big dunes by day, board down them by afternoon. The full sand experience." },
  { id:"cruise-sh", name:"Marine Cruise & Sandwich Harbour Combo", adult:4000, child:2250, hours:"7+ hours", min:2, scene:"ocean",
    blurb:"Ocean wildlife in the morning, dune adventure after lunch — the best of both." },
  { id:"kayak-sh",  name:"Kayaking & Sandwich Harbour Combo", adult:4000, child:2250, hours:"7+ hours", min:2, scene:"kayak",
    blurb:"Seals at sunrise, dunes by afternoon. A complete coast-to-desert day." },
  { id:"fishing",   name:"Shoreline Fishing Trip",    adult:null, child:null, hours:"On request", min:2, scene:"fish",
    blurb:"Cast a line along the Atlantic shore. Tackle and guidance provided." },
  { id:"sossus",    name:"Sossusvlei & Deadvlei",     adult:null, child:null, hours:"On request", min:2, scene:"sunrise",
    blurb:"The world's tallest dunes and the haunting white pan of Deadvlei." },
  { id:"spitz",     name:"Spitzkoppe",                adult:null, child:null, hours:"On request", min:2, scene:"savanna",
    blurb:"Ancient granite peaks, rock art and some of Namibia's darkest skies." },
];

/* Extra experiences offered on request (no fixed rate) — shown in About / builder */
const EXTRAS = [
  "Living Desert Adventures","Etosha National Park Safaris","Skeleton Coast Tours",
  "Cultural & Township Experiences","Airport Transfers & Shuttles","Multi-Day Namibia Tours",
];

/* --- Gallery tiles (swap scene for img:'assets/img/...jpg' to use photos) */
const GALLERY = [
  { scene:"dune",    label:"Sandwich Harbour" },
  { scene:"kayak",   label:"Kayaking the seals" },
  { scene:"ocean",   label:"Marine cruise" },
  { scene:"moon",    label:"Moon landscape" },
  { scene:"sunrise", label:"Dune sunset" },
  { scene:"savanna", label:"Spitzkoppe" },
  { scene:"star",    label:"Desert nights" },
  { scene:"fish",    label:"Shoreline fishing" },
];

/* --- Reviews (replace with real Google / GetYourGuide quotes) */
const REVIEWS = [
  { name:"Lena M.", from:"Germany", stars:5, text:"The Sandwich Harbour tour was the highlight of our Namibia trip. Watching the dunes drop into the ocean is unreal — and our guide made it feel personal." },
  { name:"James & Pip", from:"United Kingdom", stars:5, text:"Kayaking with the seals had our kids glued. Brilliantly organised, flexible with our timing, and genuinely warm people." },
  { name:"Sofia R.", from:"Spain", stars:5, text:"Booked a private custom tour. They listened to exactly what we wanted and built the perfect day. Worth every cent." },
  { name:"Thabo K.", from:"South Africa", stars:5, text:"Professional, safe and so knowledgeable about the desert. The moon landscape tour blew me away." },
  { name:"Amara O.", from:"Nigeria", stars:5, text:"From first WhatsApp to the last photo, faultless. Felt like exploring with friends who happen to be experts." },
];

/* --- Policies (from the brochure) */
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

const CONTACT = {
  whatsapp: "264817269221",
  email: "info@infiniteafricansafaris.com",
};
