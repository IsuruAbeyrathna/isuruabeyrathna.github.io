/* ============================================================
   site-enhance.js  ·  Isuru Abey portfolio
   One shared layer loaded by every page. It:
   1. Applies a dark/light theme (persisted) before paint.
   2. Injects an override stylesheet: bigger type, de-greyed
      modern cards, dark-mode fixes, animation utilities.
   3. Adds a theme toggle + a real mobile hamburger menu.
   4. Wires scroll-reveal, animated counters, hover polish.
   The base pages inject their own styles at runtime via React;
   this layer uses !important / attribute-specificity so it
   always wins regardless of insertion order.
   ============================================================ */
(function () {
  var root = document.documentElement;

  /* ---- 1. THEME (run immediately, before body paints) ---- */
  // Follow the visitor's device setting (light/dark on their OS or browser) by
  // default. If they've explicitly flipped the toggle on a previous visit, that
  // saved choice wins. Otherwise we track their system preference live.
  var darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function systemTheme() { return darkMQ && darkMQ.matches ? 'dark' : 'light'; }
  var saved = null;
  try { saved = localStorage.getItem('site-theme'); } catch (e) {}
  var initial = (saved === 'dark' || saved === 'light') ? saved : systemTheme();
  root.setAttribute('data-theme', initial);
  root.classList.add('js-on');

  // Live-update when the device switches mode — but only while the visitor
  // hasn't overridden it with the manual toggle.
  if (darkMQ) {
    var onSystemChange = function () {
      var hasManual = false;
      try { var s = localStorage.getItem('site-theme'); hasManual = (s === 'dark' || s === 'light'); } catch (e) {}
      if (!hasManual) {
        root.setAttribute('data-theme', systemTheme());
        if (typeof refreshToggles === 'function') refreshToggles();
      }
    };
    if (darkMQ.addEventListener) darkMQ.addEventListener('change', onSystemChange);
    else if (darkMQ.addListener) darkMQ.addListener(onSystemChange);
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 2. OVERRIDE STYLESHEET ---- */
  var css = `
  /* ===== shadow + theme tokens ===== */
  html.js-on{--shadow1:rgba(17,24,39,.05);--shadow2:rgba(20,44,90,.12);--ring:rgba(35,131,226,.16);}
  html[data-theme="dark"]{
    --bg:#0F0F11;--surface:#1A1A1D;--surface2:#242428;--border:#2C2C31;--border2:#3A3A40;
    --text:#ECECEA;--muted:#8B8B89;--muted2:#B7B7B3;
    --blue:#5AA2F2;--blue-light:#15293D;--blue-mid:#28486B;--blue-dark:#4A8FE0;
    --shadow1:rgba(0,0,0,.45);--shadow2:rgba(0,0,0,.6);--ring:rgba(90,162,242,.22);
  }
  html[data-theme="dark"] body{background:var(--bg)!important;}
  html.js-on body{transition:background-color .35s ease,color .35s ease;}
  html.js-on .nav,html.js-on .section,html.js-on footer,html.js-on .strip,html.js-on .div{transition:background-color .35s ease,border-color .35s ease;}

  /* ===== dark-mode fixes for hardcoded light colors ===== */
  html[data-theme="dark"] .nav{background:rgba(15,15,17,.9)!important;}
  html[data-theme="dark"] .cs-cover{background:#161618!important;}
  html[data-theme="dark"] .cs-cr-dots{background:#161618!important;}
  html[data-theme="dark"] .cs-arch-static{background:#161618!important;}
  html[data-theme="dark"] .cs-gallery-item{background:#161618!important;}
  html[data-theme="dark"] .ac-top{background:linear-gradient(135deg,#16314a,#10233a)!important;}
  html[data-theme="dark"] .cs-pin-badge{background:rgba(22,22,26,.85)!important;color:var(--blue)!important;}
  html[data-theme="dark"] .btn-outline{background:var(--surface)!important;}
  html[data-theme="dark"] .academy-badges img{filter:brightness(.92) contrast(1.02);}

  /* ===== TYPOGRAPHY scale-up ===== */
  .hero-h1{font-size:clamp(34px,4.6vw,54px)!important;}
  .hero-sub{font-size:18px!important;line-height:1.75!important;}
  .sec-title{font-size:clamp(30px,4vw,44px)!important;}
  .sec-sub{font-size:16.5px!important;line-height:1.7!important;}
  .svc-t{font-size:14.5px!important;}
  .svc-d{font-size:15px!important;line-height:1.65!important;}
  .svc-more{font-size:14.5px!important;}
  .wf-title{font-size:16.5px!important;}
  .wf-desc{font-size:15px!important;line-height:1.7!important;}
  .wf-num{font-size:11.5px!important;}
  .rev-text{font-size:16.5px!important;line-height:1.78!important;}
  .rev-client{font-size:13.5px!important;}
  .about-text{font-size:18px!important;line-height:1.85!important;}
  .why-stat{font-size:38px!important;}
  .why-label{font-size:13px!important;}
  .why-desc{font-size:15px!important;line-height:1.6!important;}
  .nav-btn{font-size:15px!important;}
  .hstat-n{font-size:30px!important;}
  .hstat-l{font-size:11.5px!important;}
  .cs-title{font-size:14.5px!important;line-height:1.4!important;}
  .cs-tag-lbl{font-size:11px!important;}
  /* detail pages */
  .detail-title{font-size:clamp(28px,3.4vw,40px)!important;}
  .cs-h2{font-size:26px!important;}
  .cs-h3{font-size:19px!important;}
  .cs-p{font-size:18px!important;line-height:1.8!important;}
  .cs-feature{font-size:17px!important;line-height:1.75!important;}
  .prop-v{font-size:15.5px!important;}
  .svc-sidebar-item{font-size:15.5px!important;}

  /* ===== DE-GREY · modern cards (services / how-it-works / reviews / why) ===== */
  /* services + why: drop the grey 1px-gap grid, use floating bordered cards */
  .svc-grid,.why-grid{background:transparent!important;border:none!important;gap:10px!important;border-radius:0!important;overflow:visible!important;}
  .svc-card,.why-card,.wf-card,.rev-card{
    background:var(--bg)!important;border:1px solid var(--border)!important;border-radius:16px!important;
    box-shadow:0 1px 2px var(--shadow1)!important;
    transition:transform .32s cubic-bezier(.2,.7,.2,1),box-shadow .32s ease,border-color .32s ease,background-color .35s ease!important;
  }
  .svc-card:hover,.why-card:hover,.wf-card:hover,.rev-card:hover{
    transform:translateY(-5px)!important;border-color:var(--blue-mid)!important;
    box-shadow:0 18px 40px var(--shadow2)!important;background:var(--bg)!important;
  }
  .rev-card{padding:20px 22px!important;}
  .why-card{padding:26px 18px!important;}
  .svc-card{padding:24px 20px!important;}

  /* case-study cards: lift + cover zoom */
  .cs-card{transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s ease,border-color .3s ease!important;}
  .cs-card:hover{transform:translateY(-5px)!important;box-shadow:0 18px 40px var(--shadow2)!important;border-color:var(--blue-mid)!important;}
  .cs-cover-img{transition:transform .55s cubic-bezier(.2,.7,.2,1)!important;}
  .cs-card:hover .cs-cover-img{transform:scale(1.06)!important;}

  /* buttons: a touch more presence */
  .btn-blue,.nav-cta,.ac-fiverr,.btn-white,.btn-outline,.cat-btn{transition:transform .18s ease,box-shadow .2s ease,background-color .2s ease,color .2s ease,border-color .2s ease!important;}
  .cat-btn:hover{transform:translateY(-1px);}

  /* ===== ANIMATION utilities ===== */
  html.js-on .reveal{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);will-change:opacity,transform;}
  html.js-on .reveal.in{opacity:1;transform:none;}
  @media(prefers-reduced-motion:reduce){html.js-on .reveal{opacity:1!important;transform:none!important;}}

  /* ===== THEME TOGGLE button ===== */
  .theme-toggle{font-family:var(--mono);background:none;border:1px solid transparent;color:var(--muted2);cursor:pointer;width:38px;height:34px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;transition:all .2s;padding:0;margin-left:2px;}
  .theme-toggle:hover{background:var(--surface);color:var(--text);}
  .theme-toggle svg{width:18px;height:18px;display:block;}

  /* ===== MOBILE hamburger + menu ===== */
  .nav-burger{display:none;flex-direction:column;justify-content:center;align-items:center;gap:5px;width:42px;height:42px;background:none;border:none;cursor:pointer;padding:0;margin-left:6px;}
  .nav-burger span{display:block;height:2px;width:23px;background:var(--text);border-radius:2px;transition:transform .3s ease,opacity .22s ease;}
  .nav-burger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
  .nav-burger.open span:nth-child(2){opacity:0;}
  .nav-burger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

  .mnav{position:fixed;inset:0;z-index:190;background:var(--bg);opacity:0;pointer-events:none;transition:opacity .26s ease;overflow-y:auto;-webkit-overflow-scrolling:touch;}
  html[data-theme="dark"] .mnav{background:var(--bg);}
  .mnav.open{opacity:.985;pointer-events:auto;}
  .mnav-inner{padding:84px 22px 40px;width:100%;max-width:480px;margin:0 auto;display:flex;flex-direction:column;gap:8px;}
  .mnav-link{font-family:var(--mono);font-size:21px;color:var(--text);text-decoration:none;padding:17px 20px;border-radius:14px;border:1px solid var(--border);background:var(--surface);transition:opacity .35s ease,transform .35s ease,background-color .2s,border-color .2s,color .2s;opacity:0;transform:translateY(10px);display:flex;align-items:center;justify-content:space-between;}
  .mnav-link:active{background:var(--surface2);}
  .mnav-link.active{color:var(--blue);border-color:var(--blue-mid);background:var(--blue-light);}
  .mnav-link .mnav-arrow{opacity:.4;font-size:18px;}
  .mnav-cta{font-family:var(--mono);font-size:18px;text-align:center;justify-content:center;background:var(--blue);color:#fff!important;text-decoration:none;padding:18px;border-radius:14px;margin-top:6px;border:none;opacity:0;transform:translateY(10px);transition:opacity .35s ease,transform .35s ease,background-color .2s;display:flex;align-items:center;}
  .mnav-theme{font-family:var(--mono);font-size:15px;color:var(--muted2);background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px 20px;margin-top:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;opacity:0;transform:translateY(10px);transition:opacity .35s ease,transform .35s ease,background-color .2s;}
  .mnav-theme svg{width:18px;height:18px;}
  .mnav.open .mnav-inner > *{opacity:1;transform:none;}
  .mnav.open .mnav-inner > *:nth-child(1){transition-delay:.04s;}
  .mnav.open .mnav-inner > *:nth-child(2){transition-delay:.09s;}
  .mnav.open .mnav-inner > *:nth-child(3){transition-delay:.14s;}
  .mnav.open .mnav-inner > *:nth-child(4){transition-delay:.19s;}
  .mnav.open .mnav-inner > *:nth-child(5){transition-delay:.24s;}
  .mnav.open .mnav-inner > *:nth-child(6){transition-delay:.29s;}

  @media(max-width:820px){
    .nav .nav-right{display:none!important;}
    .nav-burger{display:flex!important;}
  }
  @media(min-width:821px){ .mnav{display:none!important;} }

  /* ===== MOBILE polish ===== */
  @media(max-width:640px){
    .nav{height:58px!important;}
    .hero{padding:38px 24px 30px!important;}
    .hero-h1{font-size:30px!important;line-height:1.16!important;}
    .hero-title-row{gap:14px!important;}
    .hero-avatar{width:56px!important;height:56px!important;}
    .hero-sub{font-size:16.5px!important;}
    .hero-stats{gap:14px 0!important;}
    .hstat{padding-right:16px!important;margin-right:16px!important;}
    .hstat-n{font-size:24px!important;}
    .section{padding:46px 24px!important;}
    .sec-title{font-size:27px!important;}
    .sec-header{margin-bottom:22px!important;}
    .wf-grid{gap:10px!important;}
    .rev-text{font-size:16px!important;}
    .about-text{font-size:16.5px!important;}
    .cs-p{font-size:16.5px!important;}
    .cta-wrap{padding:0 24px 44px!important;}
    .cta-inner{padding:28px 22px!important;}
    .cta-title{font-size:25px!important;}
    .footer-r{gap:10px 14px!important;}
    .detail-title{font-size:26px!important;}
    .cs-h2{font-size:22px!important;}
  }

  /* ===== NEW: Academy badge chips (4 in a row, both themes) ===== */
  .academy-badges{margin-top:26px!important;display:flex!important;align-items:stretch!important;gap:10px!important;flex-wrap:nowrap!important;max-width:460px;}
  .badge-tile{flex:1 1 0;min-width:0;background:#fff;border:1px solid var(--border);border-radius:14px;padding:12px 8px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 2px var(--shadow1);transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s ease,border-color .3s ease;}
  .badge-tile:hover{transform:translateY(-4px);box-shadow:0 14px 30px var(--shadow2);border-color:var(--blue-mid);}
  .badge-tile img{height:78px!important;width:auto!important;max-width:100%!important;object-fit:contain;display:block;}
  html[data-theme="dark"] .badge-tile{background:var(--surface);border-color:var(--border2);}
  @media(max-width:640px){
    .academy-badges{gap:7px!important;max-width:none;margin-top:20px!important;}
    .badge-tile{padding:8px 5px;border-radius:11px;}
    .badge-tile img{height:54px!important;}
  }

  /* ===== NEW: review cards — gold stars, bigger icon, glassy sheen ===== */
  .rev-card{display:flex!important;flex-direction:column!important;background:linear-gradient(165deg,var(--surface),var(--bg))!important;}
  .rev-stars-g{display:flex;gap:3px;font-size:18px;color:#FFB400;letter-spacing:1px;line-height:1;margin-bottom:14px;}
  .rev-card .rev-text{font-size:16px!important;line-height:1.72!important;}
  .rev-foot{display:flex;align-items:center;gap:11px;margin-top:auto;padding-top:15px;border-top:1px solid var(--border);}
  .rev-foot .rev-av{width:40px;height:40px;border-radius:50%;background:var(--blue-light);border:1px solid var(--blue-mid);color:var(--blue);flex-shrink:0;display:flex;align-items:center;justify-content:center;}
  .rev-foot .rev-av svg{width:21px;height:21px;display:block;}
  .rev-foot-meta{display:flex;flex-direction:column;gap:2px;min-width:0;}
  .rev-foot .rev-client{margin-top:0!important;font-size:13.5px!important;color:var(--text)!important;font-weight:600;}
  .rev-source{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11.5px;color:var(--muted);letter-spacing:.01em;}
  .rev-fiverr-dot{width:6px;height:6px;border-radius:50%;background:#1DBF73;flex-shrink:0;}

  /* ===== NEW: hero stats — aligned 2x2 grid on small screens ===== */
  @media(max-width:560px){
    .hero-stats{display:grid!important;grid-template-columns:1fr 1fr;gap:16px 12px!important;}
    .hstat{padding:2px 0 2px 12px!important;margin:0!important;border-right:none!important;border-left:2px solid var(--blue-mid)!important;}
    .hstat-n{font-size:23px!important;}
  }
  `;
  var st = document.createElement('style');
  st.id = 'site-enhance-css';
  st.textContent = css;
  document.head.appendChild(st);

  /* ---- icons ---- */
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function iconFor() { return currentTheme() === 'dark' ? SUN : MOON; }
  function labelFor() { return currentTheme() === 'dark' ? 'Light mode' : 'Dark mode'; }

  var toggles = [];
  function refreshToggles() {
    toggles.forEach(function (t) {
      if (t.kind === 'icon') t.el.innerHTML = iconFor();
      else t.el.innerHTML = iconFor() + '<span>' + labelFor() + '</span>';
    });
  }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('site-theme', t); } catch (e) {}
    refreshToggles();
  }
  function flipTheme() { setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }

  /* ---- 3. NAV enhancement ---- */
  function enhanceNav() {
    var nav = document.querySelector('.nav');
    if (!nav || nav.dataset.enh) return !!(nav && nav.dataset.enh);
    var right = nav.querySelector('.nav-right');
    if (!right) return false;
    nav.dataset.enh = '1';

    // desktop theme toggle, placed before the CTA
    var tbtn = document.createElement('button');
    tbtn.className = 'theme-toggle';
    tbtn.type = 'button';
    tbtn.setAttribute('aria-label', 'Toggle dark mode');
    tbtn.innerHTML = iconFor();
    tbtn.addEventListener('click', flipTheme);
    toggles.push({ el: tbtn, kind: 'icon' });
    var cta = right.querySelector('.nav-cta');
    if (cta) { cta.textContent = "Let's Talk \u2192"; right.insertBefore(tbtn, cta); } else right.appendChild(tbtn);

    // hamburger
    var burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Open menu');
    burger.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(burger);

    // mobile menu — clone existing nav links so hrefs/active carry over
    var menu = document.createElement('div');
    menu.className = 'mnav';
    var inner = document.createElement('div');
    inner.className = 'mnav-inner';
    menu.appendChild(inner);

    right.querySelectorAll('a').forEach(function (a) {
      var isCta = a.classList.contains('nav-cta');
      var c = document.createElement('a');
      c.href = a.getAttribute('href');
      if (a.target) c.target = a.target;
      if (a.rel) c.rel = a.rel;
      if (isCta) {
        c.className = 'mnav-cta';
        c.textContent = a.textContent;
      } else {
        c.className = 'mnav-link' + (a.classList.contains('active') ? ' active' : '');
        c.innerHTML = '<span>' + a.textContent + '</span><span class="mnav-arrow">→</span>';
      }
      inner.appendChild(c);
    });

    // mobile theme toggle row
    var mtheme = document.createElement('button');
    mtheme.className = 'mnav-theme';
    mtheme.type = 'button';
    mtheme.innerHTML = iconFor() + '<span>' + labelFor() + '</span>';
    mtheme.addEventListener('click', flipTheme);
    toggles.push({ el: mtheme, kind: 'row' });
    inner.appendChild(mtheme);

    document.body.appendChild(menu);

    function close() { menu.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-label', 'Open menu'); document.body.style.overflow = ''; }
    function open() { menu.classList.add('open'); burger.classList.add('open'); burger.setAttribute('aria-label', 'Close menu'); document.body.style.overflow = 'hidden'; }
    burger.addEventListener('click', function () { menu.classList.contains('open') ? close() : open(); });
    inner.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 820) close(); });

    refreshToggles();
    return true;
  }

  /* ---- 4. Scroll reveal ---- */
  var revealSel = '.sec-header,.svc-card,.cs-card,.wf-card,.rev-card,.why-card,.cta-inner,.academy-badges,.detail-cover,.props-table,.cs-h2,.cs-testimonial,.cs-outcome,.cs-structure,.cs-cr,.cs-arch-static,.about-text,.about-av,.svc-sidebar';
  var io = null;
  function setupReveal() {
    if (reduce || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });
  }
  function scanReveal() {
    if (reduce || !io) return;
    document.querySelectorAll(revealSel).forEach(function (el) {
      if (el.dataset.rev) return;
      el.dataset.rev = '1';
      el.classList.add('reveal');
      // stagger cards by position among siblings
      if (el.parentElement) {
        var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
        if (idx > 0) el.style.transitionDelay = Math.min(idx, 7) * 55 + 'ms';
      }
      io.observe(el);
    });
  }

  /* ---- 5. Animated counters ---- */
  function animateCount(el) {
    var txt = (el.textContent || '').trim();
    var m = txt.match(/^(\d[\d,]*)(.*)$/);
    if (!m) return;
    var target = parseInt(m[1].replace(/,/g, ''), 10);
    var suffix = m[2] || '';
    if (isNaN(target)) return;
    var from = target >= 1900 ? Math.max(0, target - 40) : 0;
    var dur = 1000, start = null;
    function step(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      var val = Math.round(from + (target - from) * e);
      el.textContent = String(val) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = String(from) + suffix;
    requestAnimationFrame(step);
  }
  var cio = null;
  function setupCounters() {
    if (reduce || !('IntersectionObserver' in window)) return;
    cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.hstat-n,.why-stat').forEach(function (el) {
      if (el.dataset.cnt) return; el.dataset.cnt = '1'; cio.observe(el);
    });
  }

  /* ---- init (wait for React mount) ---- */
  var scanQueued = false;
  function queueScan() {
    if (scanQueued) return; scanQueued = true;
    requestAnimationFrame(function () { scanQueued = false; scanReveal(); });
  }
  // The base pages fade the hero in via a `.fu` class whose @keyframes live
  // in a stylesheet React injects AFTER render. Injecting our own stylesheet
  // can make the browser treat that animation as already-finished, leaving
  // elements stuck at opacity:0. Re-trigger them once so they actually play.
  function restartIntro() {
    document.querySelectorAll('.fu').forEach(function (el) {
      el.style.animation = 'none';
      void el.offsetWidth; // force reflow
      el.style.animation = '';
    });
    // Safety net: never let an intro-animated element stay invisible. If the
    // keyframe animation didn't run (stylesheet race, throttled tab, etc.),
    // force the finished state after it should have completed.
    setTimeout(function () {
      document.querySelectorAll('.fu').forEach(function (el) {
        var op = parseFloat(getComputedStyle(el).opacity);
        if (isNaN(op) || op < 0.99) { el.style.opacity = '1'; el.style.transform = 'none'; }
      });
    }, 1400);
  }

  function init() {
    setupReveal();
    enhanceNav();
    restartIntro();
    scanReveal();
    setupCounters();
    // watch for re-rendered cards (filters / load more)
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { enhanceNav(); queueScan(); });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }
  var tries = 0;
  var poll = setInterval(function () {
    tries++;
    if (document.querySelector('.nav') || tries > 80) { clearInterval(poll); init(); }
  }, 50);
})();
