/* =====================================================================
   Infinite African Safaris — interactions
   ===================================================================== */
(() => {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
            <a class="card__add" href="#book" data-book="${t.id}">Book</a>
          </div>
        </div>
      </article>`).join("");
  }

  /* RENDER: full safaris grid (safaris.html) */
  const safariGrid = $("#safariGrid");
  if (safariGrid) {
    const CAT = {
      "sh-half":"desert","sh-sunset":"desert","sh-full":"desert","sh-private":"desert",
      "moon":"desert","sossus":"desert","spitz":"desert","sh-dune":"combo",
      "cruise":"ocean","kayak":"ocean","fishing":"ocean","cruise-sh":"combo","kayak-sh":"combo",
    };
    safariGrid.innerHTML = TOURS.map(t => `
      <article class="card" data-cat="${CAT[t.id] || "desert"}">
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
            <a class="card__add" href="#book" data-book="${t.id}">Book</a>
          </div>
        </div>
      </article>`).join("");

    const fbar = $("#filterBar");
    fbar?.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const f = b.dataset.filter;
      $$("#filterBar button").forEach(x => x.classList.toggle("is-active", x === b));
      $$(".card", safariGrid).forEach(c => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
    });
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

  /* RENDER: full reviews wall (reviews.html) */
  const revWall = $("#revWall");
  if (revWall) {
    const initial = (s) => (s.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase();
    revWall.innerHTML = REVIEWS.map(r => `
      <blockquote class="rw">
        <div class="rw__stars">${"★".repeat(r.stars)}</div>
        <p class="rw__text">“${r.text}”</p>
        <footer class="rw__by"><span class="rw__avatar">${initial(r.name)}</span><span><b>${r.name}</b><small>${r.from}</small></span></footer>
      </blockquote>`).join("");
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
  const socHTML = (s) => `<a class="soc" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label}">${socSVG[s.key] || ""}<span>${s.label}</span></a>`;
  if ($("#socialRow"))   $("#socialRow").innerHTML   = SOCIALS.map(socHTML).join("");
  if ($("#footerSocial"))$("#footerSocial").innerHTML= SOCIALS.map(socHTML).join("");
  $$("[data-social]").forEach(a => {
    const s = SOCIALS.find(x => x.key === a.dataset.social);
    if (s) a.href = s.url;
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
    $$(".cur__btn").forEach(b => b.classList.toggle("is-active", b.dataset.cur === cur));
    if ($("#curName")) $("#curName").textContent = CURRENCY[cur].name;
    renderBuilder();
    renderBooking();
  }
  // delegated so injected switchers (e.g. inside the booking popup) work too
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".cur__btn");
    if (!b) return;
    cur = b.dataset.cur; localStorage.setItem("ias_cur", cur); applyCurrency();
  });

  /* =================================================================
     HERO — rotating 3D photo cylinder that cycles in new photos
     ================================================================= */
  const rotor = $("#rotor"), cyl = $("#cyl");
  if (rotor && cyl) {
    const pool = HERO_POOL.map(p => ({ url: p.url || IMG(p.id, 700), cap: p.cap }));
    const N = Math.max(13, pool.length);          // panels on the cylinder (denser than the photo pool)
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
      const mult = innerWidth <= 760 ? 1.06 : 1.04;   // small gap between panels on every screen
      radius = Math.round((pw / 2) / Math.tan((Math.PI / N)) * mult);
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
      frame.style.transform = `scale(${startScale + (coverScale - startScale) * grow})`;
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

    // ---- YouTube background player: autoplay muted, start at 1:00, loop from 1:00 ----
    const VID = frame.dataset.yt, START = +(frame.dataset.start || 0);
    let ytPlayer = null, ytReady = false, inView = false;
    const sound = $("#filmSound");
    window.onYouTubeIframeAPIReady = () => {
      ytPlayer = new YT.Player("ytPlayer", {
        videoId: VID,
        playerVars: { autoplay: 1, mute: 1, controls: 0, start: START, playsinline: 1, modestbranding: 1, rel: 0, fs: 0, disablekb: 1, iv_load_policy: 3 },
        events: {
          onReady: (e) => { ytReady = true; e.target.mute(); if (inView) e.target.playVideo(); },
          onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(START, true); e.target.playVideo(); } },
        },
      });
    };
    // Lazy: don't fetch YouTube's heavy player JS until the showreel nears view
    let ytRequested = false;
    const loadYT = () => {
      if (ytRequested || !VID) return;
      ytRequested = true;
      if (window.YT && window.YT.Player) window.onYouTubeIframeAPIReady();
      else if (!document.querySelector('script[src*="iframe_api"]')) {
        const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s);
      }
    };
    // preload ~one screen early so it's ready by the time it's on screen
    new IntersectionObserver((es) => es.forEach(e => {
      if (e.isIntersecting) loadYT();
    }), { rootMargin: "700px 0px" }).observe(film);
    new IntersectionObserver((es) => es.forEach(e => {
      inView = e.isIntersecting;
      if (ytReady) inView ? ytPlayer.playVideo() : ytPlayer.pauseVideo();
    }), { threshold: 0.04 }).observe(film);
    sound?.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!ytReady) return;
      const muted = ytPlayer.isMuted();
      if (muted) { ytPlayer.unMute(); ytPlayer.setVolume(85); } else ytPlayer.mute();
      sound.classList.toggle("is-on", muted);
      sound.setAttribute("aria-pressed", String(muted));
    });
  }

  /* =================================================================
     FLOATING INFINITY — pulse tracing the mark (replaces WA icon)
     ================================================================= */
  const fab = $(".fab");
  if (fab) {
    fab.classList.add("fab--inf");
    const d = "M50,25 C45,10 25,10 18,25 C25,40 45,40 50,25 C55,10 75,10 82,25 C75,40 55,40 50,25 Z";
    fab.innerHTML = `<span class="fab__label">Chat with us</span>
      <svg class="fab__inf" viewBox="0 0 100 50" aria-hidden="true">
        <path class="fab__base" d="${d}"/>
        <path class="fab__trace" pathLength="100" d="${d}"/>
      </svg>`;
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
  stagger(".revwall .rw", 60);

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
  }

  /* Our Safaris rail arrows */
  const rail = $("#tourCards");
  const scrollRail = (dir) => {
    if (!rail) return;
    const card = rail.querySelector(".card");
    const w = card ? card.offsetWidth + 21 : 320;
    rail.scrollBy({ left: dir * w * 1.15, behavior: "smooth" });
  };
  $("#railPrev")?.addEventListener("click", () => scrollRail(-1));
  $("#railNext")?.addEventListener("click", () => scrollRail(1));

  /* nav state */
  const nav = $("#nav");
  addEventListener("scroll", () => nav.classList.toggle("is-stuck", scrollY > 40), { passive: true });

  /* burger */
  const burger = $("#burger"), links = $("#navLinks");
  const setMenu = (open) => {
    links.classList.toggle("is-open", open);
    nav.classList.toggle("is-menu", open);
    burger.setAttribute("aria-expanded", String(open));
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger?.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && links.classList.contains("is-open")) setMenu(false); });

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
     BOOKING POPUP — slim drawer, injected on every page
     ================================================================= */
  if (!$("#bookModal")) {
    const wrap = document.createElement("div");
    wrap.className = "bookmodal"; wrap.id = "bookModal"; wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = `
      <div class="bookmodal__scrim" data-close></div>
      <aside class="bookmodal__panel" role="dialog" aria-modal="true" aria-label="Book a safari">
        <button class="bookmodal__x" data-close aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="bookmodal__head">
          <p class="eyebrow">— Book a safari</p>
          <h3 class="bookmodal__title">Reserve your day</h3>
          <p class="bookmodal__sub">Pick a tour and we'll confirm by WhatsApp or email. No payment now.</p>
        </div>
        <form class="bkf" id="bookForm" novalidate>
          <div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden"><label>Company<input name="_hp" tabindex="-1" autocomplete="off"></label></div>
          <label class="bk">Experience<select id="bookTour" name="tour" required></select></label>
          <div class="bk__row--2">
            <label class="bk">Date<input type="date" name="date" required></label>
            <label class="bk">Time<input type="time" name="time" value="08:00"></label>
          </div>
          <div class="bk__row--2">
            <label class="bk">Adults<span class="stepper"><button type="button" data-bk="adults" data-d="-1">–</button><input id="bookAdults" name="adults" type="text" inputmode="numeric" value="2" readonly><button type="button" data-bk="adults" data-d="1">+</button></span></label>
            <label class="bk">Children<span class="stepper"><button type="button" data-bk="kids" data-d="-1">–</button><input id="bookKids" name="kids" type="text" inputmode="numeric" value="0" readonly><button type="button" data-bk="kids" data-d="1">+</button></span></label>
          </div>
          <div class="bk__row--2">
            <label class="bk">Name<input name="name" autocomplete="name" required></label>
            <label class="bk">Email<input type="email" name="email" autocomplete="email" required></label>
          </div>
          <div class="bk__row--2">
            <label class="bk">Phone<input name="phone" autocomplete="tel"></label>
            <label class="bk">Nationality<input name="country"></label>
          </div>
          <label class="bk">Requests<textarea name="notes" rows="2" placeholder="Anything special?"></textarea></label>
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
          <p class="bk__note" id="bookNote">We reply within a few hours · no payment now.</p>
        </form>
      </aside>`;
    document.body.appendChild(wrap);
  }
  const bookModal = $("#bookModal");
  const openBook = (id) => {
    if (!bookModal) return;
    if (id) { const sel = $("#bookTour"); if (sel) { sel.value = id; renderBooking(); } }
    bookModal.classList.add("is-open"); bookModal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    lenis && lenis.stop();
    setTimeout(() => $("#bookTour")?.focus(), 360);
  };
  const closeBook = () => {
    if (!bookModal) return;
    bookModal.classList.remove("is-open"); bookModal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    lenis && lenis.start();
  };
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-book]");
    if (opener) { e.preventDefault(); openBook(opener.dataset.book || ""); return; }
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
    if (t.adult == null) { totalEl.textContent = "On request"; hint.textContent = "We'll confirm a tailored quote for this experience."; return; }
    totalEl.textContent = fmt(t.adult * a + t.child * k);
    hint.textContent = `${a} adult${a>1?"s":""}${k?` · ${k} child${k>1?"ren":""}`:""} · incl. VAT, levies & park fees`;
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
  // pre-select a tour when "Add +" / booking links pass a hash like #book?tour=
  $("#bookForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const t = TOURS.find(x => x.id === d.tour);
    if (!t || !d.name || !d.email || !d.date) { $("#bookNote").textContent = "Please choose a tour, date, your name and email."; return; }
    const a = +$("#bookAdults").value, k = +$("#bookKids").value;
    const total = t.adult == null ? null : t.adult * a + t.child * k;
    // Save the booking request to Supabase (no-op until configured)
    window.iasSaveLead?.({
      source: "booking", name: d.name, email: d.email, phone: d.phone, country: d.country,
      preferred_date: d.date, tour: t.name, message: d.notes, group_size: a + k,
      _hp: d._hp, raw: { ...d, adults: a, kids: k, tour_id: t.id, estimated_total: total },
    });
    let m = `BOOKING REQUEST — Infinite African Safaris%0A%0A`;
    m += `Tour: ${t.name}%0ADate: ${d.date}%0ATime: ${d.time}%0A`;
    m += `Guests: ${a} adult${a>1?"s":""}${k?`, ${k} child${k>1?"ren":""}`:""}%0A`;
    if (total) m += `Estimated total: ${fmt(total).replace(/ /g,"%20")}%0A`;
    m += `Name: ${encodeURIComponent(d.name)}%0AEmail: ${encodeURIComponent(d.email)}%0A`;
    m += `Phone: ${encodeURIComponent(d.phone||"-")}%0ANationality: ${encodeURIComponent(d.country||"-")}`;
    if (d.notes) m += `%0ARequests: ${encodeURIComponent(d.notes)}`;
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${m}`, "_blank");
    const body = m.replace(/%0A/g, "\n").replace(/%20/g, " ");
    $("#bookNote").innerHTML = `Thanks ${(d.name.split(" ")[0]||"")}! Opening WhatsApp — or <a href="mailto:${CONTACT.email}?subject=${encodeURIComponent("Booking request — "+t.name)}&body=${encodeURIComponent(body)}" style="color:var(--khaki-deep);font-weight:600">send by email</a>.`;
  });
  // clicking "Add +" on a safari card also pre-fills the booking tour
  $$("[data-add]").forEach(a => a.addEventListener("click", () => {
    if (bookTour) { bookTour.value = a.dataset.add; renderBooking(); }
  }));

  /* =================================================================
     INQUIRY FORM
     ================================================================= */
  $("#inquiryForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, d = Object.fromEntries(new FormData(f));
    if (!d.name || !d.email) { $("#formNote").textContent = "Please add your name and email."; return; }
    // Save the lead to Supabase (no-op until configured) — never blocks the email handoff
    window.iasSaveLead?.({
      source: "contact", name: d.name, email: d.email, country: d.country,
      group_size: d.size, preferred_date: d.date, tour: d.interest, message: d.message,
      _hp: d._hp, raw: d,
    });
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

  /* back to top */
  $("#toTop")?.addEventListener("click", () => {
    if (lenis) lenis.scrollTo(0); else scrollTo({ top: 0, behavior: "smooth" });
  });

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
