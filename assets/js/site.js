/* =====================================================================
   Infinite African Safaris — interactions
   ===================================================================== */
(() => {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dialogReturn = new WeakMap();
  const dialogSelector = ".bookmodal.is-open, .tourmodal.is-open, .lightbox.is-open";
  const dialogFocusable = (root) => $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
    .filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden");
  const openDialogFocus = (root, preferred, returnTarget = null) => {
    if (!root) return;
    const active = document.activeElement;
    if (returnTarget instanceof HTMLElement) {
      dialogReturn.set(root, returnTarget);
    } else if (active instanceof HTMLElement && !root.contains(active)) {
      const parentDialog = active.closest(".bookmodal, .tourmodal, .lightbox");
      dialogReturn.set(root, (parentDialog && dialogReturn.get(parentDialog)) || active);
    }
    setTimeout(() => {
      const target = (preferred && $(preferred, root)) || dialogFocusable(root)[0];
      target?.focus({ preventScroll: true });
    }, 80);
  };
  const closeDialogFocus = (root) => {
    if (!root) return;
    const target = dialogReturn.get(root);
    setTimeout(() => {
      if (!$(dialogSelector) && target instanceof HTMLElement && target.isConnected) target.focus({ preventScroll: true });
    }, 0);
  };
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const dialogs = $$(dialogSelector);
    const root = dialogs[dialogs.length - 1];
    if (!root) return;
    const items = dialogFocusable(root);
    if (!items.length) { e.preventDefault(); return; }
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
      e.preventDefault(); first.focus();
    }
  });

  /* ---------- smooth scrolling (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  // in-page anchor links → smooth scroll (works with or without Lenis)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -70 });
    else target.scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- currency ---------- */
  let savedCur = "";
  try { savedCur = localStorage.getItem("ias_cur") || ""; } catch (_) {}
  let cur = CURRENCY[savedCur] ? savedCur : "NAD";
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
  const cardScene = (tour) => tour.img
    ? `<img src="${tour.img}" alt="" loading="lazy" decoding="async" fetchpriority="low">`
    : `<div class="scene scene--${tour.scene}"></div>`;

  /* =================================================================
     RENDER: tour cards
     ================================================================= */
  const cardsEl = $("#tourCards");
  if (cardsEl) {
    cardsEl.innerHTML = TOURS.filter(t => t.feature).map(t => `
      <article class="card">
        <div class="card__scene">${cardScene(t)}</div>
        <div class="card__body">
          <div class="card__meta"><span>◷ ${t.hours}</span><span>min ${t.min}</span></div>
          <h3>${t.name}</h3>
          <p>${t.blurb}</p>
          <button type="button" class="card__more" data-more="${t.id}">Learn more</button>
          <div class="card__foot">
            <div class="card__price">
              <b data-nad="${t.adult ?? ""}">${fmt(t.adult)}</b>
              <small data-child-nad="${t.child ?? ""}" data-tailored="${t.adult == null}">${t.adult == null ? "tailored quote" : "per adult · child " + fmt(t.child)}</small>
            </div>
            <a class="card__add" href="#book" data-book="${t.id}">Book</a>
          </div>
        </div>
      </article>`).join("");
  }

  /* RENDER: full safaris grid (safaris.html) */
  const safariGrid = $("#safariGrid");
  if (safariGrid) {
    const CAT = {
      "sh-half":"desert","sh-sunset":"desert","sh-full":"desert",
      "moon":"desert","sossus":"desert","spitz":"desert","sh-dune":"combo",
      "cruise":"ocean","kayak":"ocean","fishing":"ocean","cruise-sh":"combo","kayak-sh":"combo",
    };
    const isCombo = (t) => (CAT[t.id] || "desert") === "combo";
    const cardHTML = (t) => `
      <article class="card" data-cat="${CAT[t.id] || "desert"}" data-group="${isCombo(t) ? "combo" : "normal"}">
        <div class="card__scene">${cardScene(t)}</div>
        <div class="card__body">
          <div class="card__meta"><span>◷ ${t.hours}</span><span>min ${t.min}</span></div>
          <h3>${t.name}</h3>
          <p>${t.blurb}</p>
          <button type="button" class="card__more" data-more="${t.id}">Learn more</button>
          <div class="card__foot">
            <div class="card__price">
              <b data-nad="${t.adult ?? ""}">${fmt(t.adult)}</b>
              <small data-child-nad="${t.child ?? ""}" data-tailored="${t.adult == null}">${t.adult == null ? "tailored quote" : "per adult · child " + fmt(t.child)}</small>
            </div>
            <a class="card__add" href="#book" data-book="${t.id}">Book</a>
          </div>
        </div>
      </article>`;
    const normalTours = TOURS.filter(t => !isCombo(t));
    const comboTours = TOURS.filter(isCombo);
    safariGrid.innerHTML = `
      <div class="safari-break" data-group-heading="normal">
        <span>Normal safaris</span>
      </div>
      ${normalTours.map(cardHTML).join("")}
      <div class="safari-break safari-break--combo" data-group-heading="combo">
        <span>Combo safaris</span>
      </div>
      ${comboTours.map(cardHTML).join("")}`;
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
      <button type="button" class="gtile" data-lb="${i}" aria-label="Open gallery photo ${i + 1} of ${GALLERY.length}">
        <img src="${g.img}" alt="" loading="lazy" decoding="async">
      </button>`).join("");
  }

  /* RENDER: reviews — live spotlight */
  const rvSlides = $("#rvSlides"), rvDots = $("#rvDots");
  if (rvSlides && rvDots) {
    const initial = (s) => (s.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase();
    rvSlides.innerHTML = REVIEWS.map((r, i) => `
      <blockquote class="rv__slide${i === 0 ? " is-active" : ""}">
        <div class="rv__s-stars">${"★".repeat(r.stars)}</div>
        <p class="rv__text">“${r.text}”</p>
        <footer class="rv__by">
          <span class="rv__avatar">${initial(r.name)}</span>
          <span class="rv__who"><b>${r.name}</b><span>${r.from}</span></span>
        </footer>
      </blockquote>`).join("");
    rvDots.innerHTML = REVIEWS.map((_, i) =>
      `<button role="tab" aria-label="Review ${i + 1}" class="${i === 0 ? "is-active" : ""}" data-rv="${i}"></button>`).join("");

    const slides = $$(".rv__slide", rvSlides);
    const dots = $$("button", rvDots);
    const bar = $("#rvBar");
    const DUR = 6000;
    let cur = 0, timer = null, paused = false;

    const restartBar = () => {
      if (!bar) return;
      bar.classList.remove("run"); void bar.offsetWidth; // reflow to restart
      if (!reduce && !paused) bar.classList.add("run");
    };
    const show = (i) => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("is-active", k === cur));
      dots.forEach((d, k) => d.classList.toggle("is-active", k === cur));
      restartBar();
    };
    const next = () => show(cur + 1);
    const start = () => { if (reduce) return; clearInterval(timer); timer = setInterval(() => { if (!paused) next(); }, DUR); restartBar(); };

    $("#rvNext")?.addEventListener("click", () => { next(); start(); });
    $("#rvPrev")?.addEventListener("click", () => { show(cur - 1); start(); });
    dots.forEach(d => d.addEventListener("click", () => { show(+d.dataset.rv); start(); }));

    const stage = $("#rvStage");
    stage?.addEventListener("pointerenter", () => { paused = true; bar?.classList.remove("run"); });
    stage?.addEventListener("pointerleave", () => { paused = false; restartBar(); });
    // swipe
    let sx = null;
    stage?.addEventListener("pointerdown", (e) => { sx = e.clientX; });
    stage?.addEventListener("pointerup", (e) => {
      if (sx == null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) { dx < 0 ? next() : show(cur - 1); start(); }
    });
    start();
  }

  /* RENDER: full reviews wall (reviews.html) — auto-scrolling marquee columns,
     alternating direction; static columns if the user prefers reduced motion */
  const revWall = $("#revWall");
  if (revWall) {
    const initial = (s) => (s.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase();
    const card = (r, duplicate = false) => `
      <blockquote class="rw"${duplicate ? ' aria-hidden="true"' : ""}>
        <div class="rw__stars">${"★".repeat(r.stars)}</div>
        <p class="rw__text">“${r.text}”</p>
        <footer class="rw__by"><span class="rw__avatar">${initial(r.name)}</span><span><b>${r.name}</b><small>${r.from}</small></span></footer>
      </blockquote>`;
    const colCount = () => (innerWidth <= 760 ? 1 : innerWidth <= 1024 ? 2 : 3);
    let built = 0;
    const build = () => {
      const n = colCount();
      if (n === built) return;
      built = n;
      const cols = Array.from({ length: n }, () => []);
      REVIEWS.forEach((r, i) => cols[i % n].push(r));
      if (reduce) {
        revWall.classList.add("revwall--static");
        revWall.innerHTML = cols.map(list => `<div class="revcol"><div class="revcol__track">${list.map(card).join("")}</div></div>`).join("");
        return;
      }
      revWall.innerHTML = cols.map((list, i) => {
        const html = list.map(card).join("");
        const duplicate = list.map(r => card(r, true)).join("");
        return `<div class="revcol ${i % 2 ? "revcol--down" : ""}" style="--dur:${42 + ((i * 13) % 21)}s">
          <div class="revcol__track">${html}${duplicate}</div>
        </div>`;
      }).join("");
    };
    build();
    addEventListener("resize", build);
  }

  /* count-up animation (data-to) for the review score + total */
  const upEls = $$("[data-to]");
  if (upEls.length) {
    const upIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, end = parseFloat(el.dataset.to);
        const dec = (el.dataset.to.indexOf(".") > -1) ? 1 : 0;
        const dur = 1400, t0 = performance.now();
        const run = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const v = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec);
          el.textContent = v;
          if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
        upIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    upEls.forEach(el => upIO.observe(el));
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
  const liveSocials = SOCIALS.filter(s => /^https?:\/\//i.test(s.url));
  const socHTML = (s) => `<a class="soc" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label}">${socSVG[s.key] || ""}<span>${s.label}</span></a>`;
  if ($("#socialRow"))   $("#socialRow").innerHTML   = liveSocials.map(socHTML).join("");
  if ($("#footerSocial"))$("#footerSocial").innerHTML= liveSocials.map(socHTML).join("");
  if ($("#signatureSocial"))$("#signatureSocial").innerHTML= liveSocials.map(socHTML).join("");
  $$("[data-social]").forEach(a => {
    const s = liveSocials.find(x => x.key === a.dataset.social);
    if (s) a.href = s.url;
    else a.remove();
  });

  /* interest select in contact form */
  const interest = $("#interestSelect");
  if (interest) {
    TOURS.forEach(t => interest.insertAdjacentHTML("beforeend", `<option value="${t.name}">${t.name}</option>`));
    const wanted = new URLSearchParams(location.search).get("tour");
    const tw = wanted && TOURS.find(t => t.id === wanted);
    if (tw) {
      interest.value = tw.name;
      const note = $("#contactPreface");
      if (note) note.textContent = `You're enquiring about “${tw.name}”. Add your details and we'll confirm everything by WhatsApp or email.`;
    }
  }

  /* =================================================================
     CURRENCY switching
     ================================================================= */
  function applyCurrency() {
    $$("[data-nad]").forEach(el => {
      const v = el.dataset.nad;
      el.textContent = v === "" ? "On request" : fmt(Number(v));
    });
    $$("[data-child-nad]").forEach(el => {
      el.textContent = el.dataset.tailored === "true"
        ? "tailored quote"
        : `per adult · child ${fmt(Number(el.dataset.childNad))}`;
    });
    $$(".cur__btn").forEach(b => b.classList.toggle("is-active", b.dataset.cur === cur));
    if ($("#curName")) $("#curName").textContent = CURRENCY[cur].name;
    renderBuilder();
    renderBooking();
  }
  // delegated so injected switchers (e.g. inside the booking popup) work too
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".cur__btn");
    if (!b) return;
    if (!CURRENCY[b.dataset.cur]) return;
    cur = b.dataset.cur;
    try { localStorage.setItem("ias_cur", cur); } catch (_) {}
    applyCurrency();
  });

  /* =================================================================
     HERO — rotating 3D photo cylinder that cycles in new photos
     ================================================================= */
  const rotor = $("#rotor"), cyl = $("#cyl");
  if (rotor && cyl) {
    const pool = HERO_POOL.map(p => ({ url: p.url || IMG(p.id, 700), cap: p.cap }));
    // exactly one panel per photo — anything denser than the pool forces
    // duplicates onto the wall (13 slots, 8 photos = guaranteed repeats
    // visible at once), which is the opposite of what we want here.
    const N = pool.length;
    const step = 360 / N;
    let radius = 560;                              // recomputed by sizeUp()

    // build panels
    const panels = [];
    for (let i = 0; i < N; i++) {
      const el = document.createElement("div");
      el.className = "panel";
      const img = document.createElement("img");
      img.loading = i < 2 ? "eager" : "lazy";
      if (i < 2) img.fetchPriority = "high";
      img.decoding = "async"; img.alt = "";
      img.onload = () => img.classList.add("is-loaded");
      const cap = document.createElement("span");
      cap.className = "panel__cap";
      el.append(img, cap);
      rotor.appendChild(el);
      const item = pool[i];
      img.src = item.url; cap.textContent = item.cap;
      panels.push({ el, img, cap, angle: i * step });
    }

    const sizeUp = () => {
      // --pw is often a clamp()/vw expression: getComputedStyle on the custom
      // property returns that raw expression (not resolved to px), so read the
      // panel's actual computed width instead — it has width:var(--pw) applied.
      const pw = parseFloat(getComputedStyle(panels[0].el).width) || 240;
      // radius so panels tile the cylinder with a comfortable gap
      const mult = innerWidth <= 760 ? 1.06 : 1.04;   // small gap between panels on every screen
      radius = Math.round((pw / 2) / Math.tan((Math.PI / N)) * mult);
      panels.forEach(p => { p.el.style.transform = `rotateY(${p.angle}deg) translateZ(${radius}px)`; });
    };
    sizeUp();
    addEventListener("resize", sizeUp);

    const IDLE = reduce ? 0 : 0.18; // motion preference disables automatic spin
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

      // per-panel: just face detection now — every panel keeps its own
      // fixed photo for good (see N above), so there's nothing to refresh
      panels.forEach(p => {
        const world = ((rot + p.angle) % 360 + 360) % 360;   // 0..360
        const front = Math.abs(((world + 180) % 360) - 180) < step / 2;
        p.el.classList.toggle("is-front", front);
      });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* =================================================================
     CURATE → BRAAI : cinematic dune-ridge "ember wipe"
     ================================================================= */
  const curate = $("#curate");
  if (curate) {
    const sticky = $(".curate__sticky", curate);
    const scenes = $$(".curate__scene", curate);
    const bg2 = $(".curate__bg--2", curate);
    const bg1 = $(".curate__bg--1", curate);
    const dots = $$(".curate__pager span", curate);
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

    // inject the cinematic layers (seam, warm flash, rising embers)
    const seam  = Object.assign(document.createElement("div"), { className: "curate__seam" });
    const flash = Object.assign(document.createElement("div"), { className: "curate__flash" });
    seam.setAttribute("aria-hidden", "true"); flash.setAttribute("aria-hidden", "true");
    sticky.append(flash, seam);
    let embers = null;
    if (!reduce) {
      embers = Object.assign(document.createElement("div"), { className: "curate__embers" });
      embers.setAttribute("aria-hidden", "true");
      let html = "";
      for (let i = 0; i < 18; i++) {
        const dur = 3.4 + Math.random() * 3.6, size = 3 + Math.random() * 4.5;
        html += `<b style="left:${(Math.random() * 100).toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
                `--x:${(Math.random() * 90 - 45).toFixed(0)}px;animation-duration:${dur.toFixed(2)}s;animation-delay:${(-Math.random() * dur).toFixed(2)}s"></b>`;
      }
      embers.innerHTML = html;
      sticky.append(embers);
    }
    // drive scene motion by hand (no CSS transition fighting per-frame updates)
    scenes.forEach(s => { s.style.transition = "none"; });
    bg2.style.opacity = "1";

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = curate.getBoundingClientRect();
      const runway = curate.offsetHeight - innerHeight;
      if (runway <= 0) return;
      const p = clamp(-rect.top / runway, 0, 1);       // 0 → 1 through the section

      // the wipe: braai scene revealed behind a slanted dune-ridge edge
      const e = smooth(0.28, 0.74, p);
      const lead = 0.16, top = e * (1 + lead), bot = top - lead;
      bg2.style.clipPath = `polygon(-2% -2%, ${(top * 100).toFixed(2)}% -2%, ${(bot * 100).toFixed(2)}% 102%, -2% 102%)`;

      // opposing drift + zoom for depth
      bg1.style.transform = `translateY(${(p * -26).toFixed(1)}px) scale(${(1.06 + p * 0.06).toFixed(3)})`;
      bg2.style.transform = `translateY(${((p - 1) * -26).toFixed(1)}px) scale(${(1.12 - e * 0.06).toFixed(3)})`;

      // the ember seam rides the wipe edge; flash + embers bloom at the crossover
      const burn = Math.sin(clamp(e, 0, 1) * Math.PI);   // 0 at ends → 1 mid-wipe
      seam.style.left = `${(((top + bot) / 2) * 100).toFixed(2)}%`;
      seam.style.opacity = (burn * 0.95).toFixed(3);
      flash.style.opacity = (burn * 0.8).toFixed(3);
      if (embers) embers.style.opacity = burn.toFixed(3);

      // headlines pass each other with blur + scale, not a flat crossfade
      const o1 = 1 - smooth(0.30, 0.48, p), o2 = smooth(0.54, 0.72, p);
      scenes[0].style.opacity = o1.toFixed(3);
      scenes[0].style.transform = `translateY(${((1 - o1) * -44).toFixed(1)}px) scale(${(1 - (1 - o1) * 0.05).toFixed(3)})`;
      scenes[0].style.filter = `blur(${((1 - o1) * 5).toFixed(1)}px)`;
      scenes[1].style.opacity = o2.toFixed(3);
      scenes[1].style.transform = `translateY(${((1 - o2) * 46).toFixed(1)}px) scale(${(1 - (1 - o2) * 0.05).toFixed(3)})`;
      scenes[1].style.filter = `blur(${((1 - o2) * 5).toFixed(1)}px)`;

      const two = p >= 0.5;
      scenes[0].classList.toggle("is-on", !two);       // pointer-events only
      scenes[1].classList.toggle("is-on", two);
      dots[0].classList.toggle("is-on", !two);
      dots[1].classList.toggle("is-on", two);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    dots.forEach((d, i) => d.addEventListener("click", () => {
      const runway = curate.offsetHeight - innerHeight;
      const target = curate.offsetTop + (i === 0 ? runway * 0.16 : runway * 0.82);
      if (lenis) lenis.scrollTo(target); else scrollTo({ top: target, behavior: "smooth" });
    }));
    update();
  }

  /* =================================================================
     SHOWREEL — scroll-grown cinematic video
     ================================================================= */
  const film = $("#film");
  if (film) {
    const frame = $("#filmFrame"), intro = $("#filmIntro"), stage = $("#filmStage");
    const backdrop = $(".film__backdrop", film);
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
    let coverScale = 1, startScale = 0.5, ticking = false;

    const measure = () => {
      const w = frame.offsetWidth, h = frame.offsetHeight;
      if (!w || !h) return;
      coverScale = Math.max(innerWidth / w, innerHeight / h);
      startScale = Math.min(coverScale * 0.5, 1);
    };
    const update = () => {
      ticking = false;
      const runway = film.offsetHeight - innerHeight;
      if (runway <= 0) return;
      const p = clamp(-film.getBoundingClientRect().top / runway, 0, 1);
      const grow = smooth(0, 0.58, p);
      const out = smooth(0.84, 1, p);
      const frameScale = startScale + (coverScale - startScale) * grow;
      frame.style.transform = `scale(${frameScale})`;
      frame.style.setProperty("--control-inv", (1 / frameScale).toFixed(4));
      frame.style.borderRadius = `${18 * (1 - grow)}px`;
      frame.style.setProperty("--veil", (0.55 * (1 - grow * 0.7)).toFixed(3));
      backdrop.style.opacity = (grow * 0.92).toFixed(3);
      intro.style.opacity = ((1 - smooth(0.05, 0.32, p)) * (1 - out)).toFixed(3);
      intro.style.transform = `translateY(${(-grow * 34).toFixed(1)}px)`;
      stage.style.opacity = (1 - out).toFixed(3);
      stage.style.transform = `scale(${1 + out * 0.05})`;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", () => { measure(); update(); });
    measure(); update();

    // ---- self-hosted background video ----
    // Fully native: `autoplay` + `preload="auto"` in the HTML handle fetching
    // and starting playback. Every test where JS instead called .play()
    // imperatively (regardless of load()/preload timing) eventually stalled
    // the timeline permanently at readyState HAVE_CURRENT_DATA — so this
    // section no longer touches playback at all, only the mute toggle.
    const vid = $("#filmVideo");
    const sound = $("#filmSound");
    if (reduce && vid) {
      vid.pause();
      vid.removeAttribute("autoplay");
      vid.controls = true;
      if (sound) sound.hidden = true;
    }
    sound?.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!vid) return;
      const muted = vid.muted;
      vid.muted = !muted; if (muted) vid.volume = 0.85;
      sound.classList.toggle("is-on", muted);
      sound.setAttribute("aria-pressed", String(muted));
    });
  }

  /* =================================================================
     CHAT FAB — a clean, plain infinity mark. The site's own signature
     chat button.
     ================================================================= */
  $$(".fab").forEach((fab) => {
    fab.classList.add("fab--inf");
    const INF = "M40,150 C40,100 90,72 140,90 C185,106 205,150 230,150 C255,150 275,106 320,90 C370,72 420,100 420,150 C420,200 370,228 320,210 C275,194 255,150 230,150 C205,150 185,194 140,210 C90,228 40,200 40,150 Z";
    fab.innerHTML = `
      <svg class="fab__inf" viewBox="0 0 460 300" aria-hidden="true">
        <defs>
          <filter id="fabPulseGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path fill="none" stroke="#141312" stroke-width="16" stroke-linecap="round" d="${INF}"/>
        <path class="fab__pulse" fill="none" stroke="#b3a079" stroke-width="16" stroke-linecap="round"
              pathLength="100" stroke-dasharray="14 86" filter="url(#fabPulseGlow)" d="${INF}"/>
      </svg>`;
  });

  /* =================================================================
     PRELOADER + reveals + nav
     ================================================================= */
  addEventListener("load", () => {
    requestAnimationFrame(() => $("#preloader")?.classList.add("is-done"));
  });
  // safety: never trap the page
  setTimeout(() => $("#preloader")?.classList.add("is-done"), 1200);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach(el => io.observe(el));

  /* staggered reveals for grids/rails */
  const stagger = (selector, step = 80) => {
    $$(selector).forEach((el, i) => {
      el.setAttribute("data-reveal", "");
      el.style.transitionDelay = `${(i % 6) * step}ms`;
      io.observe(el);
    });
  };
  stagger(".cards--rail .card", 70);
  stagger(".why article", 70);
  stagger(".gallery__grid .gtile", 60);
  stagger(".policy__grid .pol", 50);
  stagger(".safari-grid .card", 60);
  stagger(".contact__form > *", 60);

  /* =================================================================
     SIGNATURE PANELS — drifting dust (day) + rising embers (night)
     ================================================================= */
  if (!reduce) {
    const dustHost = $("#sigDustDay");
    if (dustHost) {
      let html = "";
      for (let i = 0; i < 16; i++) {
        const size = 2 + Math.random() * 3.2;
        const left = Math.random() * 100;
        const dur = 9 + Math.random() * 8;
        const delay = -Math.random() * dur;
        const dx = (Math.random() * 2 - 1) * 40;
        html += `<span style="left:${left.toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;--dx:${dx.toFixed(0)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s"></span>`;
      }
      dustHost.innerHTML = html;
    }
    const emberHost = $("#sigEmbers");
    if (emberHost) {
      let html = "";
      for (let i = 0; i < 20; i++) {
        const size = 2 + Math.random() * 3.6;
        const left = Math.random() * 100;
        const dur = 4 + Math.random() * 5;
        const delay = -Math.random() * dur;
        const dx = (Math.random() * 2 - 1) * 50;
        html += `<span style="left:${left.toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;--dx:${dx.toFixed(0)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s"></span>`;
      }
      emberHost.innerHTML = html;
    }
    const reviewsDustHost = $("#reviewsDust");
    if (reviewsDustHost) {
      let html = "";
      for (let i = 0; i < 22; i++) {
        const size = 1.5 + Math.random() * 2.8;
        const left = Math.random() * 100;
        const dur = 10 + Math.random() * 9;
        const delay = -Math.random() * dur;
        const dx = (Math.random() * 2 - 1) * 36;
        html += `<span style="left:${left.toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;--dx:${dx.toFixed(0)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s"></span>`;
      }
      reviewsDustHost.innerHTML = html;
    }
  }

  /* split/merge reveal: body slides in from one side, media from the
     other, converging together as each panel scrolls into view. Tied
     continuously to scroll position (not a one-shot fade). This is a
     deliberate brand effect the site always shows — it isn't gated behind
     `reduce`, since OS-level reduced-motion would otherwise silently pin it
     to a flat, merged state with no way to notice the effect exists. */
  const sigItems = $$(".sig__item");
  if (sigItems.length) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = innerHeight;
      sigItems.forEach(el => {
        const r = el.getBoundingClientRect();
        const raw = (vh * 0.92 - r.top) / (vh * 0.62);
        const progress = Math.max(0, Math.min(1, raw));
        el.style.setProperty("--split", (1 - progress).toFixed(3));
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    update();
  }

  /* =================================================================
     SCROLL FX — progress bar · parallax depth · cinematic headlines
     ================================================================= */
  // 1) thin progress bar that fills as you scroll the page
  (() => {
    const bar = document.createElement("div");
    bar.className = "scrollprog"; bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = "<span></span>";
    document.body.appendChild(bar);
    const fill = bar.firstElementChild;
    let t = false;
    const draw = () => {
      t = false;
      const max = (document.documentElement.scrollHeight - innerHeight) || 1;
      fill.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / max))})`;
    };
    const on = () => { if (!t) { t = true; requestAnimationFrame(draw); } };
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    draw();
  })();

  // 2) parallax depth — any [data-parallax] element drifts against the scroll.
  //    data-parallax = px of travel, data-scale = baseline zoom so edges never show.
  if (!reduce) {
    const items = $$("[data-parallax]").map(el => ({
      el, speed: parseFloat(el.dataset.parallax) || 24, scale: parseFloat(el.dataset.scale) || 1.2,
    }));
    if (items.length) {
      items.forEach(i => i.el.classList.add("is-parallax"));
      let t = false;
      const draw = () => {
        t = false;
        const vh = innerHeight;
        items.forEach(i => {
          const r = i.el.getBoundingClientRect();
          if (r.bottom < -120 || r.top > vh + 120) return;
          const prog = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // ~ -1..1
          i.el.style.transform = `translate3d(0, ${(-prog * i.speed).toFixed(1)}px, 0) scale(${i.scale})`;
        });
      };
      const on = () => { if (!t) { t = true; requestAnimationFrame(draw); } };
      addEventListener("scroll", on, { passive: true });
      addEventListener("resize", on);
      draw();
    }
  }

  // 3) cinematic headline reveals — big titles rise line-by-line out of a mask
  if (!reduce) {
    const heads = $$(".h2, .pagehead h1");
    heads.forEach(h => {
      h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i)
        .map(p => `<span class="lh-line"><span class="lh-in">${p.trim()}</span></span>`).join("");
      h.classList.add("lh");
    });
    if (heads.length) {
      const hIO = new IntersectionObserver((es) => {
        es.forEach(e => {
          if (!e.isIntersecting) return;
          $$(".lh-line", e.target).forEach((ln, i) => ln.style.setProperty("--d", (i * 0.09) + "s"));
          e.target.classList.add("is-in");
          hIO.unobserve(e.target);
        });
      }, { threshold: 0.25, rootMargin: "0px 0px -6% 0px" });
      heads.forEach(h => hIO.observe(h));
    }
  }

  /* 3D tilt on cards */
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    const tilt = (el, max = 7) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateY(-6px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    };
    $$(".cards--rail .card").forEach(c => tilt(c, 6));

    /* About section photo: a persistent 3D tilt that always orients toward
       the mouse anywhere on the page (not just while hovering the image
       itself), smoothly eased frame-by-frame rather than snapping. */
    const aboutTilt = $("#aboutTilt");
    if (aboutTilt) {
      const MAX = 16, REACH = 650;
      let curRX = 0, curRY = 0, curGX = 50, curGY = 50;
      let targetRX = 0, targetRY = 0, targetGX = 50, targetGY = 50;
      const setTarget = (x, y) => {
        const r = aboutTilt.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = Math.max(-1, Math.min(1, (x - cx) / REACH));
        const dy = Math.max(-1, Math.min(1, (y - cy) / REACH));
        targetRY = dx * MAX;
        targetRX = -dy * MAX;
        targetGX = Math.max(0, Math.min(1, (x - r.left) / r.width)) * 100;
        targetGY = Math.max(0, Math.min(1, (y - r.top) / r.height)) * 100;
      };
      addEventListener("mousemove", (e) => setTarget(e.clientX, e.clientY), { passive: true });
      (function raf() {
        curRX += (targetRX - curRX) * 0.07;
        curRY += (targetRY - curRY) * 0.07;
        curGX += (targetGX - curGX) * 0.1;
        curGY += (targetGY - curGY) * 0.1;
        aboutTilt.style.transform = `perspective(1000px) rotateY(${curRY.toFixed(2)}deg) rotateX(${curRX.toFixed(2)}deg)`;
        aboutTilt.style.setProperty("--gx", curGX.toFixed(1) + "%");
        aboutTilt.style.setProperty("--gy", curGY.toFixed(1) + "%");
        aboutTilt.classList.toggle("is-tilting", Math.abs(curRX) > 0.4 || Math.abs(curRY) > 0.4);
        requestAnimationFrame(raf);
      })();
    }
  }

  /* Our Safaris rail — continuous right-to-left auto-drift, plus a
     click-and-drag carousel with momentum on release. Everything moves
     the same way: direct scrollLeft writes each frame, so nothing here
     ever fights scroll-snap (removed) or fires two competing animations
     at once, which is what made the old interval + overshoot jumpy. */
  const rail = $("#tourCards");
  if (rail) {
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const SPEED = 34;                     // px/s ambient drift
    const maxScroll = () => rail.scrollWidth - rail.clientWidth;

    let paused = false, resumeTimer = null;
    let dragging = false, dragMoved = false, dragX = 0, dragScroll = 0;
    let lastDragX = 0, lastDragT = 0, vel = 0;
    let looping = false, last = 0;

    const pause = (ms = 2600) => {
      paused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { paused = false; }, ms);
    };

    const tick = (t) => {
      if (!last) last = t;
      const dt = Math.min((t - last) / 1000, 0.05); last = t;

      if (dragging) {
        // position is driven directly by pointermove below
      } else if (Math.abs(vel) > 2) {
        // momentum coast after a drag release
        const max = maxScroll();
        rail.scrollLeft = clamp(rail.scrollLeft + vel * dt, 0, max);
        vel *= 0.94;
        if (rail.scrollLeft <= 0 || rail.scrollLeft >= max) vel = 0;
      } else if (!reduce && !paused && !looping) {
        const max = maxScroll();
        if (max > 4) {
          const next = rail.scrollLeft + SPEED * dt;
          if (next >= max) {
            looping = true;
            rail.scrollTo({ left: 0, behavior: "smooth" });
            setTimeout(() => { looping = false; }, 700);
          } else {
            rail.scrollLeft = next;
          }
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const scrollRail = (dir) => {
      const card = rail.querySelector(".card");
      const w = card ? card.offsetWidth + 21 : 320;
      rail.scrollBy({ left: dir * w, behavior: "smooth" });
    };
    $("#railPrev")?.addEventListener("click", () => { pause(); scrollRail(-1); });
    $("#railNext")?.addEventListener("click", () => { pause(); scrollRail(1); });

    rail.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true; dragMoved = false; vel = 0;
      dragX = lastDragX = e.clientX; dragScroll = rail.scrollLeft; lastDragT = performance.now();
      pause(4000);
    });
    rail.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragX;
      if (Math.abs(dx) > 4 && !dragMoved) {
        dragMoved = true;
        rail.setPointerCapture(e.pointerId);
        rail.classList.add("is-dragging");
      }
      rail.scrollLeft = clamp(dragScroll - dx, 0, maxScroll());
      const now = performance.now(), dtMs = now - lastDragT;
      if (dtMs > 0) vel = ((e.clientX - lastDragX) / dtMs) * -1000; // px/s, matches scrollLeft sign
      lastDragX = e.clientX; lastDragT = now;
    });
    const endDrag = () => { dragging = false; rail.classList.remove("is-dragging"); };
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    rail.addEventListener("pointerleave", endDrag);
    // swallow the click that follows a real drag so it doesn't open a card's modal
    rail.addEventListener("click", (e) => { if (dragMoved) { e.preventDefault(); e.stopPropagation(); } }, true);

    rail.addEventListener("wheel", () => pause(2600), { passive: true });
    rail.addEventListener("touchstart", () => pause(4000), { passive: true });
    rail.addEventListener("mouseenter", () => pause(3600000));
    rail.addEventListener("mouseleave", () => { paused = false; });
  }

  /* nav state — the floating "shrink to pill" treatment is desktop-only;
     on mobile it clips the currency switcher, so the header stays put */
  const nav = $("#nav"), NAV_MOBILE_MAX = 1100;
  const syncNavState = () => {
    const mobile = innerWidth <= NAV_MOBILE_MAX;
    nav.classList.toggle("is-stuck", !mobile && scrollY > 40);
    nav.classList.toggle("is-mobile-stuck", mobile && scrollY > 20);
  };
  addEventListener("scroll", syncNavState, { passive: true });
  syncNavState();

  /* burger */
  const burger = $("#burger"), links = $("#navLinks");
  const headerCurrency = $(".nav__tools > .cur");
  if (links && headerCurrency && !$(".nav__mobile-cur", links)) {
    const mobileCurrency = headerCurrency.cloneNode(true);
    mobileCurrency.removeAttribute("id");
    mobileCurrency.classList.add("nav__mobile-cur");
    links.appendChild(mobileCurrency);
  }
  const syncMenuA11y = () => {
    const closedOnMobile = innerWidth <= NAV_MOBILE_MAX && !links.classList.contains("is-open");
    links.inert = closedOnMobile;
    links.setAttribute("aria-hidden", String(closedOnMobile));
  };
  const setMenu = (open) => {
    const active = innerWidth <= NAV_MOBILE_MAX && Boolean(open);
    links.classList.toggle("is-open", active);
    nav.classList.toggle("is-menu", active);
    burger.setAttribute("aria-expanded", String(active));
    syncMenuA11y();
    document.documentElement.style.overflow = active ? "hidden" : "";
    if (lenis) active ? lenis.stop() : lenis.start();
  };
  syncMenuA11y();
  burger?.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && links.classList.contains("is-open")) setMenu(false); });
  addEventListener("resize", () => {
    syncNavState();
    if (innerWidth > NAV_MOBILE_MAX && links.classList.contains("is-open")) setMenu(false);
    else syncMenuA11y();
  }, { passive: true });

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
    const lines = ["Hi Infinite African Safaris! I'd like to plan a tour:", ""];
    chosen.forEach(t => lines.push(`• ${t.name}`));
    lines.push("", `Guests: ${adults} adult${adults>1?"s":""}${kids?`, ${kids} child${kids>1?"ren":""}`:""}`);
    if (date) lines.push(`Preferred date: ${date}`);
    if (total) lines.push(`Estimated total: ${fmt(total)}`);
    if (notes) lines.push(`Notes: ${notes}`);
    return lines.join("\n");
  }
  function updateBuilderLinks(adults, kids, chosen, total) {
    const wa = $("#bWhats");
    if (!chosen.length) { wa.href = `https://wa.me/${CONTACT.whatsapp}`; return; }
    wa.href = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(builderMessage(adults, kids, chosen, total))}`;
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
    const body = builderMessage(adults, kids, chosen, chosen.reduce((s,t)=>s+(t.adult?t.adult*adults+t.child*kids:0),0));
    location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Tour enquiry — Build your own")}&body=${encodeURIComponent(body)}`;
  });

  /* =================================================================
     BOOKING POPUP — slim drawer, injected on every page
     ================================================================= */
  if (!$("#bookModal")) {
    const wrap = document.createElement("div");
    wrap.className = "bookmodal"; wrap.id = "bookModal"; wrap.setAttribute("aria-hidden", "true"); wrap.inert = true;
    wrap.innerHTML = `
      <div class="bookmodal__scrim" data-close></div>
      <aside class="bookmodal__panel" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Book a safari">
        <button class="bookmodal__x" data-close aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="bookmodal__head">
          <p class="eyebrow">— Book a safari</p>
          <h3 class="bookmodal__title">Reserve your day</h3>
          <p class="bookmodal__sub">Pick a tour and we'll confirm by WhatsApp or email. No payment now.</p>
        </div>
        <form class="bkf" id="bookForm">
          <div class="hp-field" aria-hidden="true"><label>Company<input type="text" name="_hp" tabindex="-1" autocomplete="off"></label></div>
          <label class="bk">Experience<select id="bookTour" name="tour" required></select></label>
          <div class="bk__row--2">
            <label class="bk">Date<input type="date" name="date" required></label>
            <label class="bk">Time<input type="time" name="time" value="08:00"></label>
          </div>
          <div class="bk__row--2">
            <div class="bk"><span>Adults</span><span class="stepper"><button type="button" data-bk="adults" data-d="-1">–</button><input id="bookAdults" name="adults" type="text" inputmode="numeric" value="2" readonly><button type="button" data-bk="adults" data-d="1">+</button></span></div>
            <div class="bk"><span>Children</span><span class="stepper"><button type="button" data-bk="kids" data-d="-1">–</button><input id="bookKids" name="kids" type="text" inputmode="numeric" value="0" readonly><button type="button" data-bk="kids" data-d="1">+</button></span></div>
          </div>
          <div class="bk__row--2">
            <label class="bk">Name<input type="text" name="name" autocomplete="name" required></label>
            <label class="bk">Email<input type="email" name="email" autocomplete="email" required></label>
          </div>
          <div class="bk__row--2">
            <label class="bk">Phone<input type="tel" name="phone" autocomplete="tel"></label>
            <label class="bk">Nationality<input type="text" name="country" autocomplete="country-name"></label>
          </div>
          <label class="bk">Dietary requirements<textarea name="dietary" rows="2" placeholder="Vegetarian, vegan, halal, allergies — leave blank if none"></textarea></label>
          <label class="bk">Requests<textarea name="notes" rows="2" placeholder="Anything special?"></textarea></label>
          <label class="form-consent"><input type="checkbox" name="consent" value="yes" required><span>I agree that Infinite African Safaris may use these details, including any dietary or allergy information, to respond and arrange my request.</span></label>
          <p class="data-use-link"><a href="contact.html#data-use" target="_blank" rel="noopener">How we use your information</a></p>
          <div class="book__total">
            <div class="book__total-l">
              <span>Estimated total</span>
              <strong id="bookTotal">—</strong>
            </div>
            <div class="book__total-r">
              <div class="cur cur--book" role="group" aria-label="Currency">
                <button type="button" data-cur="NAD" class="cur__btn">N$</button>
                <button type="button" data-cur="EUR" class="cur__btn">€</button>
                <button type="button" data-cur="USD" class="cur__btn">$</button>
              </div>
              <p id="bookHint">Select a tour to see your estimate.</p>
            </div>
          </div>
          <button class="btn btn--solid btn--block" type="submit">Request booking</button>
          <p class="bk__note" id="bookNote" role="status" aria-live="polite">We reply within a few hours · no payment now · converted totals are approximate.</p>
        </form>
      </aside>`;
    document.body.appendChild(wrap);
  }
  const bookModal = $("#bookModal");
  const openBook = (id, returnTarget = null) => {
    if (!bookModal) return;
    if (id) { const sel = $("#bookTour"); if (sel) { sel.value = id; renderBooking(); } }
    bookModal.inert = false; bookModal.classList.add("is-open"); bookModal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    lenis && lenis.stop();
    openDialogFocus(bookModal, "#bookTour", returnTarget);
  };
  const closeBook = () => {
    if (!bookModal?.classList.contains("is-open")) return;
    bookModal.classList.remove("is-open"); bookModal.setAttribute("aria-hidden", "true");
    bookModal.inert = true;
    document.documentElement.style.overflow = "";
    lenis && lenis.start();
    closeDialogFocus(bookModal);
  };
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-book]");
    if (opener && opener.id !== "tourModalBook") {
      e.preventDefault();
      openBook(opener.dataset.book || "", opener.closest("#navLinks") ? burger : null);
      return;
    }
    if (e.target.closest("[data-close]")) closeBook();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeBook(); });

  /* =================================================================
     BOOKING FORM
     ================================================================= */
  const bookTour = $("#bookTour");
  if (bookTour) TOURS.forEach(t =>
    bookTour.insertAdjacentHTML("beforeend", `<option value="${t.id}">${t.name}${t.adult == null ? " (on request)" : ""}</option>`));

  function renderBooking() {
    const sel = $("#bookTour"); if (!sel) return;
    const t = TOURS.find(x => x.id === sel.value);
    const a = Math.max(1, +$("#bookAdults").value || 1);
    const k = Math.max(0, +$("#bookKids").value || 0);
    const totalEl = $("#bookTotal"), hint = $("#bookHint");
    if (!t) { totalEl.textContent = "—"; hint.textContent = "Select a tour to see your estimate."; return; }
    const guests = a + k;
    if (t.adult == null) {
      totalEl.textContent = "On request";
      hint.textContent = guests < t.min ? `Minimum ${t.min} guests for this safari.` : "We'll confirm a tailored quote for this experience.";
      return;
    }
    totalEl.textContent = fmt(t.adult * a + t.child * k);
    hint.textContent = guests < t.min
      ? `Minimum ${t.min} guests for this safari.`
      : `${a} adult${a>1?"s":""}${k?` · ${k} child${k>1?"ren":""}`:""} · incl. VAT, levies & park fees`;
  }
  bookTour?.addEventListener("change", renderBooking);
  $("#bookAdults")?.addEventListener("input", renderBooking);
  $("#bookKids")?.addEventListener("input", renderBooking);
  $$("[data-bk]").forEach(b => b.addEventListener("click", () => {
    const el = b.dataset.bk === "adults" ? $("#bookAdults") : $("#bookKids");
    const min = b.dataset.bk === "adults" ? 1 : 0;
    el.value = Math.max(min, (+el.value || 0) + (+b.dataset.d));
    renderBooking();
  }));
  const leadMessage = (message = "", dietary = "") => {
    const parts = [];
    if (message.trim()) parts.push(message.trim());
    if (dietary.trim()) parts.push(`Dietary requirements: ${dietary.trim()}`);
    return parts.join("\n\n") || null;
  };
  const setHandoffNote = (selector, name, mailto, color) => {
    const note = $(selector);
    if (!note) return;
    const first = String(name || "").trim().split(/\s+/)[0];
    const link = document.createElement("a");
    link.href = mailto;
    link.textContent = "send by email";
    link.style.color = color;
    link.style.fontWeight = "600";
    note.replaceChildren(
      document.createTextNode(`Thanks${first ? ` ${first}` : ""}! WhatsApp is opening — press Send there to complete your request, or `),
      link,
      document.createTextNode(".")
    );
  };

  // pre-select a tour when "Add +" / booking links pass a hash like #book?tour=
  $("#bookForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const t = TOURS.find(x => x.id === d.tour);
    if (!t || !d.name || !d.email || !d.date || d.consent !== "yes") { $("#bookNote").textContent = "Please choose a tour and date, add your name and email, and confirm data use."; return; }
    const a = +$("#bookAdults").value, k = +$("#bookKids").value;
    if (a + k < t.min) { $("#bookNote").textContent = `This safari requires at least ${t.min} guests.`; return; }
    const total = t.adult == null ? null : t.adult * a + t.child * k;
    // Save the booking request to Supabase (no-op until configured)
    window.iasSaveLead?.({
      source: "booking", name: d.name, email: d.email, phone: d.phone, country: d.country,
      preferred_date: d.date, tour: t.name, message: leadMessage(d.notes, d.dietary), group_size: a + k,
      _hp: d._hp, raw: { ...d, adults: a, kids: k, tour_id: t.id, estimated_total: total },
    });
    const lines = [
      "BOOKING REQUEST — Infinite African Safaris", "",
      `Tour: ${t.name}`, `Date: ${d.date}`, `Time: ${d.time}`,
      `Guests: ${a} adult${a>1?"s":""}${k?`, ${k} child${k>1?"ren":""}`:""}`,
    ];
    if (total) lines.push(`Estimated total: ${fmt(total)}`);
    lines.push(
      `Name: ${d.name}`, `Email: ${d.email}`,
      `Phone: ${d.phone||"-"}`, `Nationality: ${d.country||"-"}`,
      `Dietary requirements: ${d.dietary||"Not specified"}`
    );
    if (d.notes) lines.push(`Requests: ${d.notes}`);
    const body = lines.join("\n");
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(body)}`, "_blank", "noopener");
    setHandoffNote(
      "#bookNote",
      d.name,
      `mailto:${CONTACT.email}?subject=${encodeURIComponent("Booking request — "+t.name)}&body=${encodeURIComponent(body)}`,
      "var(--khaki-deep)"
    );
  });
  // clicking "Add +" on a safari card also pre-fills the booking tour
  $$("[data-add]").forEach(a => a.addEventListener("click", () => {
    if (bookTour) { bookTour.value = a.dataset.add; renderBooking(); }
  }));

  /* =================================================================
     TOUR DETAIL — "Learn more" opens a bigger, focused view of the
     tour (photo, full description, price) with a straight line to Book.
     ================================================================= */
  if (!$("#tourModal") && TOURS.length) {
    const wrap = document.createElement("div");
    wrap.className = "tourmodal"; wrap.id = "tourModal"; wrap.setAttribute("aria-hidden", "true"); wrap.inert = true;
    wrap.innerHTML = `
      <div class="tourmodal__scrim" data-close></div>
      <div class="tourmodal__panel" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Tour details">
        <button class="tourmodal__x" data-close aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="tourmodal__scene" id="tourModalScene"></div>
        <div class="tourmodal__body">
          <div class="card__meta" id="tourModalMeta"></div>
          <h3 id="tourModalName"></h3>
          <p id="tourModalBlurb"></p>
          <div class="card__foot">
            <div class="card__price">
              <b id="tourModalPrice"></b>
              <small id="tourModalPriceNote"></small>
            </div>
            <button type="button" class="card__add" id="tourModalBook">Book</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }
  const tourModal = $("#tourModal");
  const openTourModal = (id) => {
    const t = TOURS.find(x => x.id === id);
    if (!t || !tourModal) return;
    $("#tourModalScene").innerHTML = scene(t.scene, t.img);
    $("#tourModalMeta").innerHTML = `<span>◷ ${t.hours}</span><span>min ${t.min}</span>`;
    $("#tourModalName").textContent = t.name;
    $("#tourModalBlurb").textContent = t.blurb;
    $("#tourModalPrice").textContent = fmt(t.adult);
    $("#tourModalPrice").dataset.nad = t.adult ?? "";
    const tourPriceNote = $("#tourModalPriceNote");
    tourPriceNote.dataset.childNad = t.child ?? "";
    tourPriceNote.dataset.tailored = String(t.adult == null);
    tourPriceNote.textContent = t.adult == null ? "tailored quote" : "per adult · child " + fmt(t.child);
    $("#tourModalBook").dataset.book = t.id;
    tourModal.inert = false; tourModal.classList.add("is-open"); tourModal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    lenis && lenis.stop();
    openDialogFocus(tourModal, ".tourmodal__x");
  };
  const closeTourModal = () => {
    if (!tourModal?.classList.contains("is-open")) return;
    tourModal.classList.remove("is-open"); tourModal.setAttribute("aria-hidden", "true");
    tourModal.inert = true;
    document.documentElement.style.overflow = "";
    lenis && lenis.start();
    closeDialogFocus(tourModal);
  };
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-more]");
    if (opener) { e.preventDefault(); openTourModal(opener.dataset.more); return; }
    if (e.target.closest("#tourModal [data-close]")) closeTourModal();
    if (e.target.closest("#tourModal #tourModalBook")) { closeTourModal(); openBook($("#tourModalBook").dataset.book); }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeTourModal(); });

  /* =================================================================
     PRIVATE SAFARI BUILDER — its own themed drawer, matching the
     "Build the day around the light" panel (pick a start, shape the
     route, then the usual date/guests/contact details).
     ================================================================= */
  if (!$("#builderModal")) {
    const wrap = document.createElement("div");
    wrap.className = "bookmodal bookmodal--builder"; wrap.id = "builderModal"; wrap.setAttribute("aria-hidden", "true"); wrap.inert = true;
    wrap.innerHTML = `
      <div class="bookmodal__scrim" data-close></div>
      <aside class="bookmodal__panel" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Plan a private safari">
        <button class="bookmodal__x" data-close aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="bookmodal__head">
          <p class="eyebrow">— Private rhythm</p>
          <h3 class="bookmodal__title">Design your day</h3>
          <p class="bookmodal__sub">Tell us the rhythm you want — we'll shape a private route around it.</p>
        </div>
        <form class="bkf" id="builderForm">
          <div class="hp-field" aria-hidden="true"><label>Company<input type="text" name="_hp" tabindex="-1" autocomplete="off"></label></div>
          <div>
            <p class="bk__step"><b>01</b> Choose your start</p>
            <div class="builder__pills" id="builderStart" role="radiogroup" aria-label="Preferred start">
              <button type="button" data-val="Sunrise">Sunrise</button>
              <button type="button" data-val="Mid-morning">Mid-morning</button>
              <button type="button" data-val="Golden hour">Golden hour</button>
            </div>
          </div>
          <div>
            <p class="bk__step"><b>02</b> Shape the route</p>
            <div class="builder__chips" id="builderRoute" aria-label="Route focus — choose any">
              <button type="button" data-val="Dunes">Dunes</button>
              <button type="button" data-val="Ocean">Ocean</button>
              <button type="button" data-val="Wildlife">Wildlife</button>
              <button type="button" data-val="Culture">Culture</button>
            </div>
          </div>
          <div>
            <p class="bk__step"><b>03</b> Your details</p>
          </div>
          <div class="bk__row--2">
            <label class="bk">Date<input type="date" name="date" required></label>
            <div class="bk"><span>Adults</span><span class="stepper"><button type="button" data-stepper="builderAdults" data-d="-1">–</button><input id="builderAdults" name="adults" type="text" inputmode="numeric" value="2" readonly><button type="button" data-stepper="builderAdults" data-d="1">+</button></span></div>
          </div>
          <div class="bk__row--2">
            <div class="bk"><span>Children</span><span class="stepper"><button type="button" data-stepper="builderKids" data-d="-1">–</button><input id="builderKids" name="kids" type="text" inputmode="numeric" value="0" readonly><button type="button" data-stepper="builderKids" data-d="1">+</button></span></div>
            <label class="bk">Phone<input type="tel" name="phone" autocomplete="tel"></label>
          </div>
          <div class="bk__row--2">
            <label class="bk">Name<input type="text" name="name" autocomplete="name" required></label>
            <label class="bk">Email<input type="email" name="email" autocomplete="email" required></label>
          </div>
          <label class="bk">Dietary requirements<textarea name="dietary" rows="2" placeholder="Vegetarian, vegan, halal, allergies — leave blank if none"></textarea></label>
          <label class="bk">Anything else?<textarea name="notes" rows="2" placeholder="Special requests, occasions, pace…"></textarea></label>
          <label class="form-consent"><input type="checkbox" name="consent" value="yes" required><span>I agree that Infinite African Safaris may use these details, including any dietary or allergy information, to respond and arrange my request.</span></label>
          <p class="data-use-link"><a href="contact.html#data-use" target="_blank" rel="noopener">How we use your information</a></p>
          <button class="btn btn--solid btn--block" type="submit">Request my private safari</button>
          <p class="bk__note" id="builderNote" role="status" aria-live="polite">We reply within a few hours · no payment now.</p>
        </form>
      </aside>`;
    document.body.appendChild(wrap);
  }

  /* =================================================================
     DESERT BRAAI BOOKING — its own themed drawer, matching the
     "A desert braai, done properly" night panel.
     ================================================================= */
  if (!$("#braaiModal")) {
    const wrap = document.createElement("div");
    wrap.className = "bookmodal bookmodal--braai"; wrap.id = "braaiModal"; wrap.setAttribute("aria-hidden", "true"); wrap.inert = true;
    wrap.innerHTML = `
      <div class="bookmodal__scrim" data-close></div>
      <aside class="bookmodal__panel" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Add a desert braai">
        <button class="bookmodal__x" data-close aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="bookmodal__head">
          <p class="eyebrow">— After the drive</p>
          <h3 class="bookmodal__title">Reserve your desert braai</h3>
          <p class="bookmodal__sub">Coals, a table in the sand, and someone else handling the setup.</p>
        </div>
        <form class="bkf" id="braaiForm">
          <div class="hp-field" aria-hidden="true"><label>Company<input type="text" name="_hp" tabindex="-1" autocomplete="off"></label></div>
          <div class="bk__row--2">
            <label class="bk">Date<input type="date" name="date" required></label>
            <label class="bk">Time<input type="time" name="time" value="17:30"></label>
          </div>
          <div class="bk__row--2">
            <div class="bk"><span>Adults</span><span class="stepper"><button type="button" data-stepper="braaiAdults" data-d="-1">–</button><input id="braaiAdults" name="adults" type="text" inputmode="numeric" value="2" readonly><button type="button" data-stepper="braaiAdults" data-d="1">+</button></span></div>
            <div class="bk"><span>Children</span><span class="stepper"><button type="button" data-stepper="braaiKids" data-d="-1">–</button><input id="braaiKids" name="kids" type="text" inputmode="numeric" value="0" readonly><button type="button" data-stepper="braaiKids" data-d="1">+</button></span></div>
          </div>
          <div class="bk__row--2">
            <label class="bk">Name<input type="text" name="name" autocomplete="name" required></label>
            <label class="bk">Email<input type="email" name="email" autocomplete="email" required></label>
          </div>
          <label class="bk">Phone<input type="tel" name="phone" autocomplete="tel"></label>
          <label class="bk">Dietary requirements<textarea name="dietary" rows="2" placeholder="Vegetarian, vegan, halal, allergies — leave blank if none"></textarea></label>
          <label class="bk">Other requests<textarea name="notes" rows="2" placeholder="Celebrations, setup, or anything else…"></textarea></label>
          <label class="form-consent"><input type="checkbox" name="consent" value="yes" required><span>I agree that Infinite African Safaris may use these details, including any dietary or allergy information, to respond and arrange my request.</span></label>
          <p class="data-use-link"><a href="contact.html#data-use" target="_blank" rel="noopener">How we use your information</a></p>
          <button class="btn btn--solid btn--block" type="submit">Request my desert braai</button>
          <p class="bk__note" id="braaiNote" role="status" aria-live="polite">We reply within a few hours · no payment now.</p>
        </form>
      </aside>`;
    document.body.appendChild(wrap);
  }

  /* shared open/close for the builder + braai drawers (same mechanics as #bookModal) */
  const sideModals = { builder: $("#builderModal"), braai: $("#braaiModal") };
  const openSideModal = (key) => {
    const m = sideModals[key]; if (!m) return;
    m.inert = false; m.classList.add("is-open"); m.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    lenis && lenis.stop();
    openDialogFocus(m, key === "builder" ? "#builderStart button" : 'input[name="date"]');
  };
  const closeSideModal = (key) => {
    const m = sideModals[key]; if (!m?.classList.contains("is-open")) return;
    m.classList.remove("is-open"); m.setAttribute("aria-hidden", "true");
    m.inert = true;
    document.documentElement.style.overflow = "";
    lenis && lenis.start();
    closeDialogFocus(m);
  };
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open-modal]");
    if (opener) { e.preventDefault(); openSideModal(opener.dataset.openModal); return; }
    if (e.target.closest("#builderModal [data-close]")) closeSideModal("builder");
    if (e.target.closest("#braaiModal [data-close]")) closeSideModal("braai");
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeSideModal("builder"); closeSideModal("braai"); } });

  /* generic +/- stepper wiring, shared by the builder + braai guest counts */
  $$("[data-stepper]").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = $("#" + btn.dataset.stepper);
      if (!input) return;
      const min = /kids|children/i.test(input.id) ? 0 : 1;
      input.value = Math.max(min, (+input.value || 0) + (+btn.dataset.d));
    });
  });

  /* single-select pills (start time) + multi-select chips (route focus) */
  $$("#builderStart button").forEach(b => b.addEventListener("click", () => {
    $$("#builderStart button").forEach(x => x.classList.toggle("is-active", x === b));
  }));
  $$("#builderRoute button").forEach(b => b.addEventListener("click", () => b.classList.toggle("is-active")));

  $("#builderForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const start = $("#builderStart .is-active")?.dataset.val || "";
    const route = $$("#builderRoute .is-active").map(b => b.dataset.val).join(", ");
    if (!d.name || !d.email || !d.date || d.consent !== "yes") { $("#builderNote").textContent = "Please add a date, your name and email, and confirm data use."; return; }
    const a = +$("#builderAdults").value, k = +$("#builderKids").value;
    window.iasSaveLead?.({
      source: "private-builder", name: d.name, email: d.email, phone: d.phone, country: d.country,
      preferred_date: d.date, tour: "Private safari — " + (start || "flexible start"), message: leadMessage(d.notes, d.dietary), group_size: a + k,
      _hp: d._hp, raw: { ...d, adults: a, kids: k, start, route },
    });
    const lines = [
      "PRIVATE SAFARI REQUEST — Infinite African Safaris", "",
      `Start: ${start || "Flexible"}`, `Route focus: ${route || "Open to suggestions"}`,
      `Date: ${d.date}`, `Guests: ${a} adult${a>1?"s":""}${k?`, ${k} child${k>1?"ren":""}`:""}`,
      `Name: ${d.name}`, `Email: ${d.email}`,
      `Phone: ${d.phone||"-"}`, `Nationality: ${d.country||"-"}`,
      `Dietary requirements: ${d.dietary||"Not specified"}`,
    ];
    if (d.notes) lines.push(`Notes: ${d.notes}`);
    const body = lines.join("\n");
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(body)}`, "_blank", "noopener");
    setHandoffNote(
      "#builderNote",
      d.name,
      `mailto:${CONTACT.email}?subject=${encodeURIComponent("Private safari request — "+d.name)}&body=${encodeURIComponent(body)}`,
      "var(--khaki-deep)"
    );
  });

  $("#braaiForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (!d.name || !d.email || !d.date || d.consent !== "yes") { $("#braaiNote").textContent = "Please add a date, your name and email, and confirm data use."; return; }
    const a = +$("#braaiAdults").value, k = +$("#braaiKids").value;
    window.iasSaveLead?.({
      source: "braai", name: d.name, email: d.email, phone: d.phone, country: d.country,
      preferred_date: d.date, tour: "Desert braai", message: leadMessage(d.notes, d.dietary), group_size: a + k,
      _hp: d._hp, raw: { ...d, adults: a, kids: k },
    });
    const lines = [
      "DESERT BRAAI REQUEST — Infinite African Safaris", "",
      `Date: ${d.date}`, `Time: ${d.time}`,
      `Guests: ${a} adult${a>1?"s":""}${k?`, ${k} child${k>1?"ren":""}`:""}`,
      `Name: ${d.name}`, `Email: ${d.email}`,
      `Phone: ${d.phone||"-"}`,
      `Dietary requirements: ${d.dietary||"Not specified"}`,
    ];
    if (d.notes) lines.push(`Other requests: ${d.notes}`);
    const body = lines.join("\n");
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(body)}`, "_blank", "noopener");
    setHandoffNote(
      "#braaiNote",
      d.name,
      `mailto:${CONTACT.email}?subject=${encodeURIComponent("Desert braai request — "+d.name)}&body=${encodeURIComponent(body)}`,
      "#f0a45a"
    );
  });

  /* =================================================================
     INQUIRY FORM
     ================================================================= */
  $("#inquiryForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, d = Object.fromEntries(new FormData(f));
    if (!d.name || !d.email || d.consent !== "yes") { $("#formNote").textContent = "Please add your name and email and confirm data use."; return; }
    // Save the lead to Supabase (no-op until configured) — never blocks the email handoff
    window.iasSaveLead?.({
      source: "contact", name: d.name, email: d.email, country: d.country,
      group_size: d.size, preferred_date: d.date, tour: d.interest, message: leadMessage(d.message, d.dietary),
      _hp: d._hp, raw: d,
    });
    let body = `Name: ${d.name}\nEmail: ${d.email}\nCountry: ${d.country||"-"}\nGroup size: ${d.size||"-"}\nDate: ${d.date||"-"}\nInterested in: ${d.interest||"-"}\nDietary requirements: ${d.dietary||"Not specified"}\n\n${d.message||""}`;
    location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Website enquiry — "+d.name)}&body=${encodeURIComponent(body)}`;
    $("#formNote").textContent = "Opening your email app… or message us on WhatsApp.";
  });
  $("#inquirySubmit")?.removeAttribute("disabled");

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
    const opening = !lb.classList.contains("is-open");
    lbIndex = (i + GALLERY.length) % GALLERY.length;
    const g = GALLERY[lbIndex];
    lbFig.innerHTML = scene(g.scene, g.img);
    lb.inert = false; lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false");
    if (opening) {
      document.documentElement.style.overflow = "hidden";
      lenis && lenis.stop();
      openDialogFocus(lb, "#lbClose");
    }
  };
  const closeLB = () => {
    if (!lb?.classList.contains("is-open")) return;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    lb.inert = true;
    document.documentElement.style.overflow = "";
    lenis && lenis.start();
    closeDialogFocus(lb);
  };
  $$(".gtile").forEach(t => t.addEventListener("click", () => openLB(+t.dataset.lb)));
  $("#lbClose")?.addEventListener("click", closeLB);
  $("#lbNext")?.addEventListener("click", () => openLB(lbIndex + 1));
  $("#lbPrev")?.addEventListener("click", () => openLB(lbIndex - 1));
  lb?.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });
  addEventListener("keydown", (e) => {
    if (!lb?.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowRight") openLB(lbIndex + 1);
    if (e.key === "ArrowLeft") openLB(lbIndex - 1);
  });

  /* film play placeholder */
  $("#filmPlay")?.addEventListener("click", () => {
    $("#filmMedia").innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:#fff;background:#0c2128;padding:2rem"><p>Add your showreel to <b>assets/video/showreel.mp4</b><br><small style="opacity:.7">then the player goes live here.</small></p></div>`;
  });

  /* year */
  $("#year") && ($("#year").textContent = new Date().getFullYear());

  /* live Walvis Bay clock (Africa/Windhoek, UTC+2) */
  const clockEl = $("#footClock");
  if (clockEl) {
    const tick = () => {
      const t = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Africa/Windhoek", hour: "2-digit", minute: "2-digit", hour12: false
      });
      clockEl.textContent = t;
    };
    tick(); setInterval(tick, 1000 * 20);
  }

  /* init */
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const todayISO = today.toISOString().slice(0, 10);
  $$("input[type='date']").forEach(input => { if (!input.min) input.min = todayISO; });
  $$(".stepper").forEach(stepper => {
    const input = $("input", stepper), buttons = $$("button", stepper);
    const fieldRoot = stepper.closest(".bk, .cf, label");
    const heading = fieldRoot && [...fieldRoot.children].find(el => el !== stepper && el.tagName === "SPAN");
    const textNode = fieldRoot && [...fieldRoot.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    const field = (heading?.textContent || textNode?.textContent || input?.name || "guest").trim().toLowerCase();
    if (input) input.setAttribute("aria-label", `${field} count`);
    if (buttons[0]) buttons[0].setAttribute("aria-label", `Decrease ${field}`);
    if (buttons[1]) buttons[1].setAttribute("aria-label", `Increase ${field}`);
  });
  applyCurrency();
  renderBuilder();

  /* optional GSAP polish for hero head (graceful if absent) */
  addEventListener("load", () => {
    if (window.gsap && !reduce) {
      if ($(".hero__kicker")) gsap.from(".hero__kicker", { opacity: 0, y: 16, duration: .9, delay: 1.25 });
      if ($(".hero__title")) gsap.from(".hero__title", { opacity: 0, y: 28, duration: 1.1, ease: "power3.out", delay: 1.35 });
      if ($(".hero__sub")) gsap.from(".hero__sub", { opacity: 0, y: 16, duration: .9, delay: 1.55 });
      if ($(".panel")) gsap.from(".panel", { opacity: 0, scale: .8, stagger: .05, duration: 1, ease: "power2.out", delay: 1.6 });
    }
  });
})();
