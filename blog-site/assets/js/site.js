/* Site-wide behaviour: theme toggle, scroll reveals, GIF play-on-view/hover,
   scrollytelling, comparison sliders, reading progress, header graphics. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var mql = window.matchMedia('(prefers-color-scheme: dark)');
  var themeListeners = [];
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    return t || (mql.matches ? 'dark' : 'light');
  }
  function emitTheme() { themeListeners.forEach(function (f) { f(currentTheme()); }); }
  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  var toggle = document.querySelector('.theme-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    emitTheme();
  });
  mql.addEventListener && mql.addEventListener('change', emitTheme);

  // Small public API for post-specific scripts (see assets/js/demos/)
  window.Blog = {
    theme: currentTheme,
    onTheme: function (f) { themeListeners.push(f); },
    color: cssVar,
    reduceMotion: reduceMotion
  };

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- GIFs: play when visible, or on hover ---------- */
  // <img class="gif-swap" src="still.png" data-gif="anim.gif" data-poster="still.png" data-play="view|hover">
  document.querySelectorAll('img.gif-swap').forEach(function (img) {
    var gif = img.dataset.gif, poster = img.dataset.poster;
    var play = function () { if (img.getAttribute('src') !== gif) img.src = gif; };
    var stop = function () { if (img.getAttribute('src') !== poster) img.src = poster; };
    if (img.dataset.play === 'hover') {
      var host = img.closest('a, figure') || img;
      host.addEventListener('mouseenter', play);
      host.addEventListener('mouseleave', stop);
      img.addEventListener('click', function (e) {
        if (img.closest('a')) return;               // let links navigate
        img.getAttribute('src') === gif ? stop() : play();
        e.preventDefault();
      });
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? play() : stop(); });
      }, { threshold: 0.35 }).observe(img);
    } else { play(); }
  });

  /* ---------- Videos: autoplay muted while visible ---------- */
  // <video class="autoplay" src="clip.mp4" muted loop playsinline></video>
  document.querySelectorAll('video.autoplay').forEach(function (v) {
    v.muted = true; v.loop = true; v.playsInline = true;
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !reduceMotion) v.play().catch(function () {}); else v.pause();
      });
    }, { threshold: 0.35 }).observe(v);
  });

  /* ---------- Scrollytelling ---------- */
  // Steps carry data-show="key"; graphic children carry data-key="key".
  // Each change also fires a "scrolly:step" event on the .scrolly element
  // with detail {index, key, step} for canvas-driven graphics.
  document.querySelectorAll('.scrolly').forEach(function (s) {
    var steps = s.querySelectorAll('.scrolly-step');
    var layers = s.querySelectorAll('.scrolly-graphic [data-key]');
    function activate(step) {
      var key = step.dataset.show;
      steps.forEach(function (x) { x.classList.toggle('is-active', x === step); });
      if (key) layers.forEach(function (l) { l.style.opacity = l.dataset.key === key ? 1 : 0; });
      s.dispatchEvent(new CustomEvent('scrolly:step', {
        detail: { index: Array.prototype.indexOf.call(steps, step), key: key, step: step }
      }));
    }
    layers.forEach(function (l, i) { l.style.opacity = i === 0 ? 1 : 0; });
    if (steps[0]) activate(steps[0]);
    if (!('IntersectionObserver' in window)) return;
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) activate(e.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (st) { so.observe(st); });
  });

  /* ---------- Before / after slider ---------- */
  document.querySelectorAll('.compare').forEach(function (c) {
    var top = c.querySelector('.compare-top'), handle = c.querySelector('.compare-handle');
    function set(x) {
      var r = c.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (x - r.left) / r.width)) * 100;
      top.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
      handle.style.left = p + '%';
    }
    var dragging = false;
    c.addEventListener('pointerdown', function (e) { dragging = true; c.setPointerCapture(e.pointerId); set(e.clientX); });
    c.addEventListener('pointermove', function (e) { if (dragging || e.pointerType === 'mouse') set(e.clientX); });
    c.addEventListener('pointerup', function () { dragging = false; });
  });

  /* ---------- Reading progress ---------- */
  var bar = document.querySelector('.progress span');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Canvas helper ---------- */
  function fitCanvas(cv) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = cv.getBoundingClientRect();
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: r.width, h: r.height };
  }
  window.Blog.fitCanvas = fitCanvas;

  /* ---------- Header mark: a slowly orbiting set of points ---------- */
  var mark = document.querySelector('.brand-mark');
  if (mark) {
    var m = fitCanvas(mark), t0 = performance.now();
    var drawMark = function (now) {
      var t = (now - t0) / 1000, c = m.ctx, cx = m.w / 2, cy = m.h / 2;
      c.clearRect(0, 0, m.w, m.h);
      c.fillStyle = cssVar('--text');
      for (var i = 0; i < 14; i++) {
        var a = i / 14 * Math.PI * 2 + t * 0.4;
        var rr = m.w * 0.32 + Math.sin(t * 1.3 + i * 0.9) * m.w * 0.08;
        c.globalAlpha = 0.35 + 0.65 * (i / 14);
        c.beginPath(); c.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1.6, 0, 7); c.fill();
      }
      c.globalAlpha = 1;
      if (!reduceMotion) requestAnimationFrame(drawMark);
    };
    requestAnimationFrame(drawMark);
  }

  /* ---------- Home hero: particles descending a loss landscape ----------
     Particles follow the negative gradient of a sum of Gaussian wells.
     The cursor adds a temporary minimum that pulls particles toward it. */
  var hero = document.getElementById('hero-canvas');
  if (hero) {
    var H = fitCanvas(hero), parts = [], mouse = null;
    var wells = [
      { x: 0.22, y: 0.40, s: 0.13, d: 1.0 },
      { x: 0.62, y: 0.30, s: 0.10, d: 0.8 },
      { x: 0.80, y: 0.68, s: 0.16, d: 1.2 },
      { x: 0.45, y: 0.75, s: 0.09, d: 0.6 }
    ];
    function grad(x, y, t) {
      var gx = 0, gy = 0, all = wells.slice();
      if (mouse) all.push({ x: mouse.x, y: mouse.y, s: 0.12, d: 2.2 });
      for (var i = 0; i < all.length; i++) {
        var w = all[i];
        var wx = w.x + Math.sin(t * 0.15 + i) * 0.03, wy = w.y + Math.cos(t * 0.12 + i * 2) * 0.03;
        var dx = x - wx, dy = (y - wy) * (H.h / H.w), s2 = w.s * w.s;
        var g = w.d * Math.exp(-(dx * dx + dy * dy) / (2 * s2)) / s2;
        gx += g * dx; gy += g * dy;
      }
      // small rotational term so motion feels like an optimizer with momentum
      return { x: gx - gy * 0.15, y: gy + gx * 0.15 };
    }
    var TRAIL = 16;
    function spawn(p) {
      p = p || {};
      p.x = Math.random(); p.y = Math.random(); p.vx = 0; p.vy = 0;
      p.hist = [];
      p.life = 200 + Math.random() * 300; return p;
    }
    var N = Math.round(Math.min(260, H.w * 0.3));
    for (var i = 0; i < N; i++) parts.push(spawn());

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    });
    hero.addEventListener('pointerleave', function () { mouse = null; });
    window.addEventListener('resize', function () { H = fitCanvas(hero); });

    var fg;
    function readColors() { fg = cssVar('--text'); }
    readColors(); window.Blog.onTheme(function () { setTimeout(readColors, 0); });

    var start = performance.now();
    var step = function (now) {
      var t = (now - start) / 1000, c = H.ctx;
      c.clearRect(0, 0, H.w, H.h);
      c.strokeStyle = fg; c.lineWidth = 1;
      for (var k = 0; k < parts.length; k++) {
        var p = parts[k], g = grad(p.x, p.y, t);
        p.vx = p.vx * 0.9 - g.x * 0.00006; p.vy = p.vy * 0.9 - g.y * 0.00006;
        p.x += p.vx; p.y += p.vy;
        p.hist.push(p.x * H.w, p.y * H.h);
        if (p.hist.length > TRAIL * 2) p.hist.splice(0, 2);
        if (--p.life < 0 || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) { spawn(p); continue; }
        var h = p.hist;
        // fade in at birth and out at death
        c.globalAlpha = 0.5 * Math.min(1, h.length / (TRAIL * 2), p.life / 40);
        c.beginPath(); c.moveTo(h[0], h[1]);
        for (var j = 2; j < h.length; j += 2) c.lineTo(h[j], h[j + 1]);
        c.stroke();
      }
      c.globalAlpha = 1;
      if (!reduceMotion) requestAnimationFrame(step);
    };
    if (reduceMotion) { for (var f = 0; f < 120; f++) step(start + f * 16); } else requestAnimationFrame(step);
  }
})();
