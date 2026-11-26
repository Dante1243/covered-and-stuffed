// Covered & Stuffed Upholstery: theme, phone menu, scroll effects, enquiry form
(function () {
  var root = document.documentElement, body = document.body;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'covered-theme';
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  /* ---------- Theme (first value is set inline in <head> before paint) ---------- */
  var btn = document.querySelector('.theme-toggle');
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function apply(t) {
    root.setAttribute('data-theme', t);
    document.querySelector('meta[name="theme-color"]').content = t === 'dark' ? '#0c1626' : '#fcfbf6';
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (!reduce) { root.classList.add('theme-fade'); setTimeout(function () { root.classList.remove('theme-fade'); }, 360); }
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
  });
  apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  if (window.matchMedia) {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', function (e) { if (!stored()) apply(e.matches ? 'dark' : 'light'); });
  }

  /* ---------- Phone menu ---------- */
  var toggle = document.querySelector('.menu-toggle'), nav = document.getElementById('site-nav');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && body.classList.contains('menu-open')) { setMenu(false); toggle.focus(); } });
  document.addEventListener('click', function (e) { if (body.classList.contains('menu-open') && !e.target.closest('.nav, .menu-toggle')) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });

  /* ---------- Header shadow and back to top ---------- */
  var header = document.querySelector('.site-header'), up = document.createElement('button');
  up.className = 'to-top'; up.type = 'button'; up.setAttribute('aria-label', 'Back to top');
  up.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  up.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.querySelector('.brand').focus({ preventScroll: true });
  });
  body.appendChild(up);
  var ticking = false;
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    body.classList.toggle('show-top', window.scrollY > 600);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Fade in on scroll (anything already on screen is left alone) ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.style.setProperty('--delay', Math.min(n++, 5) * 70 + 'ms');
        el.classList.add('is-in');
        setTimeout(function () { el.classList.remove('reveal', 'is-in'); el.style.removeProperty('--delay'); }, 1200);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    each('.section h2, .panel, .amp, .also, .picker > *, .quote blockquote, .split > *', function (el) {
      if (el.closest('.reveal') || el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---------- Enquiry form (mockup: opens the visitor's own email app, filled in) ---------- */
  each('form[data-to]', function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var lines = [], to = form.getAttribute('data-to');
      Array.prototype.forEach.call(form.elements, function (f) {
        if (f.name && f.value.trim()) lines.push(f.getAttribute('data-label') + ': ' + f.value.trim());
      });
      form.querySelector('.sent').textContent = 'Your email app should be open with your message ready to send. If it isn’t, call or text Lisa on 0438 963 884.';
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Estimate please') + '&body=' + encodeURIComponent(lines.join('\n').replace(/\r?\n/g, '\r\n'));
    });
  });

  each('.year', function (y) { y.textContent = new Date().getFullYear(); });
})();
