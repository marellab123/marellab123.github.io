/* Example post-specific demo: gradient descent on a 1-D loss with a
   learning-rate slider. Copy this file as a starting point for your own.
   Load it from a post with front matter:  scripts: [/assets/js/demos/learning-rate.js]
   Uses window.Blog (from site.js) for theme colours and canvas sizing. */
(function () {
  var cv = document.getElementById('lr-demo');
  if (!cv) return;
  var slider = document.getElementById('lr-slider');
  var out = document.getElementById('lr-value');

  var f = function (x) { return 0.25 * x * x + 0.6 * Math.sin(1.8 * x) + 1.2; };
  var df = function (x) { return 0.5 * x + 1.08 * Math.cos(1.8 * x); };
  var X0 = -4.5, XMIN = -5, XMAX = 5, YMAX = 8.5;

  var C, x, trail, timer;
  function px(xv) { return (xv - XMIN) / (XMAX - XMIN) * C.w; }
  function py(yv) { return C.h - 14 - (yv / YMAX) * (C.h - 28); }

  function draw() {
    var c = C.ctx, fg = Blog.color('--text'), soft = Blog.color('--text-soft'), ac = Blog.color('--accent');
    c.clearRect(0, 0, C.w, C.h);
    c.strokeStyle = soft; c.lineWidth = 1.5; c.beginPath();
    for (var i = 0; i <= 200; i++) {
      var xv = XMIN + (XMAX - XMIN) * i / 200;
      i ? c.lineTo(px(xv), py(f(xv))) : c.moveTo(px(xv), py(f(xv)));
    }
    c.stroke();
    c.strokeStyle = ac; c.fillStyle = ac; c.lineWidth = 1.5; c.beginPath();
    trail.forEach(function (t, i) { i ? c.lineTo(px(t), py(f(t))) : c.moveTo(px(t), py(f(t))); });
    c.stroke();
    trail.forEach(function (t, i) {
      c.globalAlpha = 0.25 + 0.75 * (i / trail.length);
      c.beginPath(); c.arc(px(t), py(f(t)), i === trail.length - 1 ? 6 : 3, 0, 7); c.fill();
    });
    c.globalAlpha = 1; c.fillStyle = fg; c.font = '13px Helvetica, Arial, sans-serif';
    c.fillText('step ' + (trail.length - 1) + '   loss ' + f(x).toFixed(3), 10, 20);
  }

  function run() {
    clearInterval(timer);
    var lr = parseFloat(slider.value);
    out.textContent = lr.toFixed(2);
    x = X0; trail = [x];
    draw();
    timer = setInterval(function () {
      x = x - lr * df(x);
      if (Math.abs(x) > 50 || trail.length > 60) { clearInterval(timer); return; }
      trail.push(x); draw();
    }, Blog.reduceMotion ? 0 : 120);
  }

  function resize() { C = Blog.fitCanvas(cv); if (trail) draw(); }
  resize();
  window.addEventListener('resize', resize);
  Blog.onTheme(function () { setTimeout(draw, 0); });
  slider.addEventListener('input', run);
  document.getElementById('lr-reset').addEventListener('click', run);

  // Start when the demo scrolls into view
  new IntersectionObserver(function (es, obs) {
    if (es[0].isIntersecting) { run(); obs.disconnect(); }
  }, { threshold: 0.4 }).observe(cv);
})();
