// Covered & Stuffed Upholstery: theme, phone menu, scroll effects, photo viewer, enquiry form
(function () {
  var root = document.documentElement, body = document.body;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'covered-theme';
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  var ICON = {
    close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
  };

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
  // A tap outside closes the menu and does nothing else, so it can't open a link by accident
  document.addEventListener('click', function (e) {
    if (body.classList.contains('menu-open') && !e.target.closest('.nav, .menu-toggle')) { e.preventDefault(); e.stopPropagation(); setMenu(false); }
  }, true);
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

  /* ---------- Fade in on scroll (anything already on screen, or a reload/back/#link, is left alone) ---------- */
  var navType = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0] || {}).type;
  if (!reduce && 'IntersectionObserver' in window && navType !== 'reload' && navType !== 'back_forward' && !location.hash) {
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
    each('.section-head, .work-grid > li, .work-cta, #services h2, .panel, .amp, .also, .quote blockquote, .visit .print, .visit-text, .split > *', function (el) {
      if (el.closest('.reveal') || el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---------- Photo viewer: arrows, swipe, Escape; the page behind doesn't scroll ---------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
  if (shots.length && window.HTMLDialogElement) {
    var dlg = document.createElement('dialog'), current = 0, opener = null;
    dlg.className = 'viewer';
    dlg.setAttribute('aria-label', 'Photo viewer');
    dlg.innerHTML = '<figure><div class="viewer-frame"></div><figcaption></figcaption></figure><p class="viewer-count" aria-live="polite"></p>' +
      '<button class="viewer-close" type="button" aria-label="Close photo">' + ICON.close + '</button>' +
      '<button class="viewer-prev" type="button" aria-label="Previous photo">' + ICON.prev + '</button>' +
      '<button class="viewer-next" type="button" aria-label="Next photo">' + ICON.next + '</button>';
    body.appendChild(dlg);
    var frame = dlg.querySelector('.viewer-frame'), cap = dlg.querySelector('figcaption'), count = dlg.querySelector('.viewer-count');

    var show = function (i) {
      current = (i + shots.length) % shots.length;
      var a = shots[current], thumb = a.querySelector('img'), img = document.createElement('img');
      img.src = a.getAttribute('href');
      img.alt = thumb.alt;
      img.width = 1054; img.height = 1400;
      frame.replaceChildren(img);
      cap.textContent = a.getAttribute('data-caption');
      count.textContent = 'Photo ' + (current + 1) + ' of ' + shots.length;
    };
    var lockScroll = function (on) {
      if (on) { var gap = window.innerWidth - root.clientWidth; if (gap > 0) body.style.paddingRight = gap + 'px'; }
      else body.style.paddingRight = '';
      root.classList.toggle('viewer-open', on);
    };
    shots.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        opener = a;
        show(i);
        lockScroll(true);
        dlg.showModal();
        dlg.querySelector('.viewer-close').focus();
      });
    });
    dlg.addEventListener('close', function () {
      lockScroll(false);
      frame.replaceChildren();
      if (opener) opener.focus();
    });
    dlg.querySelector('.viewer-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.viewer-prev').addEventListener('click', function () { show(current - 1); });
    dlg.querySelector('.viewer-next').addEventListener('click', function () { show(current + 1); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });
    // Tap the dark area around the photo to close
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target === frame || e.target.tagName === 'FIGURE') dlg.close(); });
    var startX = null, startY = 0;
    frame.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
    frame.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX, dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
      startX = null;
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
      var link = document.createElement('a');
      link.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Estimate please') + '&body=' + encodeURIComponent(lines.join('\n').replace(/\r?\n/g, '\r\n'));
      body.appendChild(link); link.click(); link.remove();
    });
  });

  each('.year', function (y) { y.textContent = new Date().getFullYear(); });
})();
