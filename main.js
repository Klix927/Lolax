/* =============================================
   LOLAX – main.js
   Minimal, no dependencies.
   ============================================= */

/* ── 1. Dark Mode ─────────────────────────── */
(function () {
  var STORAGE_KEY = 'lolax-theme';
  var root   = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var icon  = toggle.querySelector('.theme-toggle__icon');
    var label = toggle.querySelector('.theme-toggle__label');
    if (icon)  icon.textContent  = theme === 'dark' ? '●' : '○';
    if (label) label.textContent = theme === 'dark' ? 'Hell' : 'Dunkel';
    toggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'
    );
  }

  toggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme') || 'light';
    var next    = current === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  });

  /* Sync icon with already-applied theme (set in <head> inline script) */
  apply(root.getAttribute('data-theme') || 'light');
})();


/* ── 2. Scroll Reveal ─────────────────────── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.IntersectionObserver) return;

  var els = document.querySelectorAll('.reveal');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(function (el) { observer.observe(el); });
})();


/* ── 3. Mobile Nav Toggle ─────────────────── */
(function () {
  var btn  = document.getElementById('nav-hamburger');
  var list = document.getElementById('nav-list');
  if (!btn || !list) return;

  btn.addEventListener('click', function () {
    var open = list.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Navigation schließen' : 'Navigation öffnen');
  });

  /* Close on nav link click */
  list.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      list.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Navigation öffnen');
    });
  });
})();
