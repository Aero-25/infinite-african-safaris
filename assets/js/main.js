/* =====================================================================
   Infinite African Safaris — interactions
   ===================================================================== */
(() => {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- currency ---------- */
  let cur = localStorage.getItem("ias_cur") || "NAD";
  const fmt = (nad) => {
    if (nad == null) return "On request";
    const c = CURRENCY[cur];
    const v = nad / c.rate;
    const rounded = c.decimals ? v.toFixed(c.decimals) : Math.round(v);
    return c.symbol + " " + Number(rounded).toLocaleString("en-US");
  };

  /* ---------- scene helper ---------- */
  const scene = (s, img) =>
    img
      ? `<div class="scene" style="background-image:url('${img}')"></div>`
      : `<div class="scene scene--${s}"></div>`;

  /* =================================================================
     RENDER: tour cards
     ================================================================= */
  const cardsEl = $("#tourCards");
  if (cardsEl) {
    cardsEl.innerHTML = TOURS.filter(t => t.feature).map(t => `
      <article class="card">
        <div class="card__scene">${scene(t.scene, t.img)}</div>
        <div class="card__body">
          <div class="card__meta"><span>◷ ${t.hours}</span><span>min ${t.min}</span></div>
          <h3>${t.name}</h3>
          <p>${t.blurb}</p>
          <div class="card__foot">
            <div class="card__price">
              <b data-nad="${t.adult ?? ""}">${fmt(t.adult)}</b>
              <small>${t.adult == null ? "tailored quote" : "per adult · child " + fmt(t.child)}</small>
            </div>
            <a class="card__add" href="#builder" data-add="${t.id}">Add +</a>
          </div>
        </div>
      </article>`).join("");
  }

  /* RENDER: rates table */
  const ratesBody = $("#ratesTable tbody");
  if (ratesBody) {
    ratesBody.innerHTML = TOURS.map(t => `
      <tr>
        <td>${t.name}</td>
        <td data-nad="${t.adult ?? ""}">${fmt(t.adult)}</td>
        <td data-nad="${t.child ?? ""}">${t.child == null ? "—" : fmt(t.child)}</td>
        <td>${t.hours}</td>
        <td>${t.min}</td>
      </tr>`).join("");
  }

  /* RENDER: gallery */
  const galEl = $("#galleryGrid");
  if (galEl) {
    galEl.innerHTML = GALLERY.map((g, i) => `
      <figure class="gtile" data-lb="${i}">${scene(g.scene, g.img)}<span>${g.label}</span></figure>`).join("");
  }

  /* RENDER: reviews */
  const revEl = $("#reviewsTrack");
  if (revEl) {
    revEl.innerHTML = REVIEWS.map(r => `
      <blockquote class="rev">
        <div class="rev__stars">${"★".repeat(r.stars)}</div>
        <p class="rev__text">“${r.text}”</p>
        <footer class="rev__by"><b>${r.name}</b> <span>· ${r.from}</span></footer>
      </blockquote>`).join("");
  }

  /* RENDER: policies */
  const polEl = $("#policyGrid");
  if (polEl) {
    polEl.innerHTML = POLICIES.map((p, i) => `
      <details class="pol"${i === 0 ? " open" : ""}>
        <summary>${p.t}</summary><p>${p.b}</p>
      </details>`).join("");
  }

  /* RENDER: socials */
  const socSVG = {
    whatsapp:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.5-4-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 .9-2.2c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.5c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.9-.1 1.5z"/></svg>',
    instagram:'<svg viewBox="0 0 24 24"><path d="M12 2c2.7 0 3 0 4.1.1 1 0 1.7.2 2.3.5.6.2 1.1.5 1.6 1 .5.5.8 1 1 1.6.3.6.4 1.3.5 2.3.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1-.2 1.7-.5 2.3-.2.6-.5 1.1-1 1.6-.5.5-1 .8-1.6 1-.6.3-1.3.4-2.3.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1 0-1.7-.2-2.3-.5-.6-.2-1.1-.5-1.6-1-.5-.5-.8-1-1-1.6-.3-.6-.4-1.3-.5-2.3C2 15 2 14.7 2 12s0-3 .1-4.1c0-1 .2-1.7.5-2.3.2-.6.5-1.1 1-1.6.5-.5 1-.8 1.6-1 .6-.3 1.3-.4 2.3-.5C9 2 9.3 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zM17.8 6a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/></svg>',
    facebook:'<svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z"/></svg>',
    x:'<svg viewBox="0 0 24 24"><path d="M18.2 2H21l-6.6 7.6L22 22h-6.3l-5-6.5L5 22H2.2l7.1-8.1L2 2h6.4l4.5 6 5.3-6zm-1.1 18h1.6L7 3.7H5.3L17.1 20z"/></svg>',
    getyourguide:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8L12 15.7 8.6 17l.7-3.8L6.5 10.5l3.8-.5L12 6.5z"/></svg>',
    google:'<svg viewBox="0 0 24 24"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-1 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0012 22zm-5.6-8.1a6 6 0 010-3.8V7.5H3.1a10 10 0 000 9l3.3-2.6zM12 6.1c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 003.1 7.5l3.3 2.6C7.2 7.8 9.4 6.1 12 6.1z"/></svg>',
  };
  const socHTML = (s) => `<a class="soc" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label}">${socSVG[s.key] || ""}<span>${s.label}</span></a>`;
  if ($("#socialRow"))   $("#socialRow").innerHTML   = SOCIALS.map(socHTML).join("");
  if ($("#footerSocial"))$("#footerSocial").innerHTML= SOCIALS.map(socHTML).join("");
  $$("[data-social]").forEach(a => {
    const s = SOCIALS.find(x => x.key === a.dataset.social);
    if (s) a.href = s.url;
  });

  /* interest select in contact form */
  const interest = $("#interestSelect");
  if (interest) TOURS.forEach(t => interest.insertAdjacentHTML("beforeend", `<option value="${t.name}">${t.name}</option>`));

  /* =================================================================
     CURRENCY switching
     ================================================================= */
  function applyCurrency() {
    $$("[data-nad]").forEach(el => {
      const v = el.dataset.nad;
      el.textContent = v === "" ? "On request" : fmt(Number(v));
    });
    $$(".cur__btn").forEach(b => b.classList.toggle("is-active", b.dataset.cur === cur));
    if ($("#curName")) $("#curName").textContent = CURRENCY[cur].name;
    renderBuilder();
  }
  $$(".cur__btn").forEach(b => b.addEventListener("click", () => {
    cur = b.dataset.cur; localStorage.setItem("ias_cur", cur); applyCurrency();
  }));

  /* =================================================================
     HERO — rotating 3D photo cylinder that cycles in new photos
     ================================================================= */
  const rotor = $("#rotor"), cyl = $("#cyl");
  if (rotor && cyl) {
    const pool = HERO_POOL.map(p => ({ url: IMG(p.id, 700), cap: p.cap }));
    const N = Math.min(12, pool.length);          // panels on the cylinder
    const step = 360 / N;
    let radius = 560;                              // recomputed by sizeUp()
    let nextIdx = N % pool.length;                 // next photo to feed in

    // build panels
    const panels = [];
    for (let i = 0; i < N; i++) {
      const el = document.createElement("div");
      el.className = "panel";
      const img = document.createElement("img");
      img.loading = "lazy"; img.decoding = "async"; img.alt = "";
      img.onload = () => img.classList.add("is-loaded");
      const cap = document.createElement("span");
      cap.className = "panel__cap";
      el.append(img, cap);
      rotor.appendChild(el);
      const item = pool[i % pool.length];
      img.src = item.url; cap.textContent = item.cap;
      panels.push({ el, img, cap, angle: i * step, refreshed: false });
    }

    const sizeUp = () => {
      const pw = parseFloat(getComputedStyle(cyl).getPropertyValue("--pw")) || 240;
      // radius so panels tile the cylinder with a comfortable gap
      radius = Math.round((pw / 2) / Math.tan((Math.PI / N)) * 1.25);
      panels.forEach(p => { p.el.style.transform = `rotateY(${p.angle}deg) translateZ(${radius}px)`; });
    };
    sizeUp();
    addEventListener("resize", sizeUp);

    const IDLE = 0.18;           // automatic spin speed (deg/frame ≈ 11°/s)
    let rot = 0;                 // current rotation
    let vel = IDLE;              // current spin speed
    let dragging = false, lastX = 0, dragVel = 0;

    // pointer drag to spin
    cyl.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; dragVel = 0; cyl.setPointerCapture(e.pointerId); });
    cyl.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      dragVel = dx * 0.25; rot += dragVel;
    });
    const endDrag = () => { dragging = false; };
    cyl.addEventListener("pointerup", endDrag);
    cyl.addEventListener("pointercancel", endDrag);
    cyl.addEventListener("pointerleave", endDrag);

    const frame = () => {
      if (dragging) {
        // follow the drag
      } else {
        vel += (IDLE - vel) * 0.04;  // always ease back to the automatic spin
        rot += vel + dragVel;
        dragVel *= 0.92;                              // momentum decay
      }
      rotor.style.transform = `translateZ(${-radius}px) rotateY(${rot}deg)`;

      // per-panel: face detection + feed new photos while hidden at the back
      panels.forEach(p => {
        let world = ((rot + p.angle) % 360 + 360) % 360;   // 0..360
        const front = Math.abs(((world + 180) % 360) - 180) < step / 2;
        p.el.classList.toggle("is-front", front);
        const atBack = world > 150 && world < 210;
        if (atBack && !p.refreshed) {
          const item = pool[nextIdx]; nextIdx = (nextIdx + 1) % pool.length;
          p.img.classList.remove("is-loaded");
          p.img.src = item.url; p.cap.textContent = item.cap;
          p.refreshed = true;
        }
        if (!atBack) p.refreshed = false;
      });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* =================================================================
     PRELOADER + reveals + nav
     ================================================================= */
  addEventListener("load", () => {
    setTimeout(() => $("#preloader")?.classList.add("is-done"), 1500);
  });
  // safety: never trap the page
  setTimeout(() => $("#preloader")?.classList.add("is-done"), 3000);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach(el => io.observe(el));

  /* nav state */
  const nav = $("#nav");
  addEventListener("scroll", () => nav.classList.toggle("is-stuck", scrollY > 40), { passive: true });

  /* burger */
  const burger = $("#burger"), links = $("#navLinks");
  burger?.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
  });
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => {
    links.classList.remove("is-open"); burger.setAttribute("aria-expanded", false);
  }));

  /* counters */
  const counters = $$("[data-count]");
  if (counters.length) {
    const cIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, end = +el.dataset.count; let n = 0;
        const tick = () => { n += Math.ceil(end / 40); if (n >= end) n = end; el.textContent = n; if (n < end) requestAnimationFrame(tick); };
        tick(); cIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cIO.observe(c));
  }

  /* magnetic buttons */
  if (!reduce) $$("[data-magnet]").forEach(btn => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width/2) * .25}px, ${(e.clientY - r.top - r.height/2) * .35}px)`;
    });
    btn.addEventListener("pointerleave", () => btn.style.transform = "");
  });

  /* =================================================================
     BUILD YOUR OWN TOUR
     ================================================================= */
  const bList = $("#bList");
  const selected = new Set();
  if (bList) {
    bList.innerHTML = TOURS.map(t => `
      <label class="bopt" data-id="${t.id}">
        <input type="checkbox" value="${t.id}">
        <span class="bopt__name">${t.name.split("·")[0].trim()}</span>
        <span class="bopt__price" data-bprice="${t.adult ?? ""}">${t.adult == null ? "On request" : fmt(t.adult)}</span>
      </label>`).join("");
  }

  const adultsEl = $("#bAdults"), kidsEl = $("#bKids");

  function renderBuilder() {
    // refresh builder prices for currency
    $$("[data-bprice]").forEach(el => {
      const v = el.dataset.bprice;
      el.textContent = v === "" ? "On request" : fmt(Number(v));
    });
    const linesEl = $("#bLines"); if (!linesEl) return;
    const adults = Math.max(1, +adultsEl.value || 1);
    const kids = Math.max(0, +kidsEl.value || 0);
    const chosen = TOURS.filter(t => selected.has(t.id));

    if (!chosen.length) {
      linesEl.innerHTML = `<li class="bsum__empty">Select an experience to begin.</li>`;
      $("#bTotal").textContent = "—";
      updateBuilderLinks(adults, kids, chosen, null);
      return;
    }
    let total = 0, anyRequest = false;
    linesEl.innerHTML = chosen.map(t => {
      if (t.adult == null) { anyRequest = true; return `<li><span>${t.name}</span><span>On request</span></li>`; }
      const sub = t.adult * adults + t.child * kids;
      total += sub;
      return `<li><span>${t.name}<br><small style="color:var(--txt-soft)">${adults} adult${adults>1?"s":""}${kids?` · ${kids} child${kids>1?"ren":""}`:""}</small></span><span>${fmt(sub)}</span></li>`;
    }).join("");
    $("#bTotal").innerHTML = (total ? fmt(total) : "") + (anyRequest ? `<small style="display:block;font-size:.7rem;color:var(--txt-soft)">+ items on request</small>` : "");
    updateBuilderLinks(adults, kids, chosen, total);
  }

  function builderMessage(adults, kids, chosen, total) {
    const date = $("#bDate").value, notes = $("#bNotes").value.trim();
    let m = `Hi Infinite African Safaris! I'd like to plan a tour:%0A%0A`;
    chosen.forEach(t => m += `• ${t.name}%0A`);
    m += `%0AGuests: ${adults} adult${adults>1?"s":""}${kids?`, ${kids} child${kids>1?"ren":""}`:""}`;
    if (date) m += `%0APreferred date: ${date}`;
    if (total) m += `%0AEstimated total: ${fmt(total).replace(/ /g,"%20")}`;
    if (notes) m += `%0ANotes: ${encodeURIComponent(notes)}`;
    return m;
  }
  function updateBuilderLinks(adults, kids, chosen, total) {
    const wa = $("#bWhats");
    if (!chosen.length) { wa.href = `https://wa.me/${CONTACT.whatsapp}`; return; }
    wa.href = `https://wa.me/${CONTACT.whatsapp}?text=${builderMessage(adults, kids, chosen, total)}`;
  }

  bList?.addEventListener("change", (e) => {
    const opt = e.target.closest(".bopt");
    if (selected.has(e.target.value)) selected.delete(e.target.value);
    else selected.add(e.target.value);
    opt.classList.toggle("is-on", e.target.checked);
    renderBuilder();
  });
  $$("[data-step]").forEach(b => b.addEventListener("click", () => {
    const el = b.dataset.step === "adults" ? adultsEl : kidsEl;
    const min = b.dataset.step === "adults" ? 1 : 0;
    el.value = Math.max(min, (+el.value || 0) + (+b.dataset.d));
    renderBuilder();
  }));
  [adultsEl, kidsEl, $("#bDate"), $("#bNotes")].forEach(el => el?.addEventListener("input", renderBuilder));

  // "Add +" buttons on cards -> tick builder + scroll
  $$("[data-add]").forEach(a => a.addEventListener("click", () => {
    const id = a.dataset.add;
    const input = bList?.querySelector(`input[value="${id}"]`);
    if (input && !input.checked) { input.checked = true; input.dispatchEvent(new Event("change", { bubbles: true })); }
  }));

  // email this plan
  $("#bEmail")?.addEventListener("click", () => {
    const adults = +adultsEl.value, kids = +kidsEl.value;
    const chosen = TOURS.filter(t => selected.has(t.id));
    if (!chosen.length) { alert("Choose at least one experience first."); return; }
    const body = builderMessage(adults, kids, chosen, chosen.reduce((s,t)=>s+(t.adult?t.adult*adults+t.child*kids:0),0))
      .replace(/%0A/g, "\n").replace(/%20/g, " ");
    location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Tour enquiry — Build your own")}&body=${encodeURIComponent(body)}`;
  });

  /* =================================================================
     INQUIRY FORM
     ================================================================= */
  $("#inquiryForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, d = Object.fromEntries(new FormData(f));
    if (!d.name || !d.email) { $("#formNote").textContent = "Please add your name and email."; return; }
    let body = `Name: ${d.name}\nEmail: ${d.email}\nCountry: ${d.country||"-"}\nGroup size: ${d.size||"-"}\nDate: ${d.date||"-"}\nInterested in: ${d.interest||"-"}\n\n${d.message||""}`;
    location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Website enquiry — "+d.name)}&body=${encodeURIComponent(body)}`;
    $("#formNote").textContent = "Opening your email app… or message us on WhatsApp.";
  });

  /* client album */
  $("#clientForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = $("#clientCode").value.trim();
    $("#clientHint").textContent = code
      ? `Looking for album “${code}”… connect your gallery service to go live.`
      : "Enter the access code from your guide.";
  });

  /* =================================================================
     LIGHTBOX
     ================================================================= */
  const lb = $("#lightbox"), lbFig = $("#lbFig");
  let lbIndex = 0;
  const openLB = (i) => {
    lbIndex = (i + GALLERY.length) % GALLERY.length;
    const g = GALLERY[lbIndex];
    lbFig.innerHTML = `${scene(g.scene, g.img)}<figcaption>${g.label}</figcaption>`;
    lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false");
  };
  $$(".gtile").forEach(t => t.addEventListener("click", () => openLB(+t.dataset.lb)));
  $("#lbClose")?.addEventListener("click", () => { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden","true"); });
  $("#lbNext")?.addEventListener("click", () => openLB(lbIndex + 1));
  $("#lbPrev")?.addEventListener("click", () => openLB(lbIndex - 1));
  lb?.addEventListener("click", (e) => { if (e.target === lb) { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden","true"); } });
  addEventListener("keydown", (e) => {
    if (!lb?.classList.contains("is-open")) return;
    if (e.key === "Escape") lb.classList.remove("is-open");
    if (e.key === "ArrowRight") openLB(lbIndex + 1);
    if (e.key === "ArrowLeft") openLB(lbIndex - 1);
  });

  /* film play placeholder */
  $("#filmPlay")?.addEventListener("click", () => {
    $("#filmMedia").innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:#fff;background:#0c2128;padding:2rem"><p>Add your showreel to <b>assets/video/showreel.mp4</b><br><small style="opacity:.7">then the player goes live here.</small></p></div>`;
  });

  /* year */
  $("#year") && ($("#year").textContent = new Date().getFullYear());

  /* init */
  applyCurrency();
  renderBuilder();

  /* optional GSAP polish for hero head (graceful if absent) */
  addEventListener("load", () => {
    if (window.gsap && !reduce) {
      gsap.from(".hero__kicker", { opacity: 0, y: 16, duration: .9, delay: 1.25 });
      gsap.from(".hero__title", { opacity: 0, y: 28, duration: 1.1, ease: "power3.out", delay: 1.35 });
      gsap.from(".hero__sub", { opacity: 0, y: 16, duration: .9, delay: 1.55 });
      gsap.from(".panel", { opacity: 0, scale: .8, stagger: .05, duration: 1, ease: "power2.out", delay: 1.6 });
    }
  });
})();
