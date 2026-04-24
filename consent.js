(function(w, d) {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     Configuration
     Set active: true when you integrate the corresponding service.
     Leave active: false when the category has no services yet.
     When changing active flags, increment version to invalidate
     previously stored consent decisions.
  ───────────────────────────────────────────────────────── */
  var CFG = {
    version:    1,
    storageKey: 'lolax-consent-v1',
    categories: {
      analytics:      { active: false, label: 'Analyse' },
      marketing:      { active: false, label: 'Marketing' },
      external_media: { active: false, label: 'Externe Medien' }
    }
  };

  /* ── Internal state ─────────────────────────────────── */
  var _state     = null;
  var _callbacks = {};
  var _root      = null;

  function _activeCats() {
    return Object.keys(CFG.categories).filter(function(k) {
      return CFG.categories[k].active;
    });
  }

  /* ── Storage ────────────────────────────────────────── */
  function _load() {
    try {
      var raw = localStorage.getItem(CFG.storageKey);
      if (!raw) return null;
      var p = JSON.parse(raw);
      return (p && p.version === CFG.version) ? p : null;
    } catch(e) { return null; }
  }

  function _persist(state) {
    try { localStorage.setItem(CFG.storageKey, JSON.stringify(state)); } catch(e) {}
    _state = state;
  }

  /* ── Consent checks ─────────────────────────────────── */
  function _has(cat) {
    return !!(
      _state && _state.decided &&
      _state.categories && _state.categories[cat] === true
    );
  }

  function _onGrant(cat, fn) {
    if (_has(cat)) { fn(); return; }
    (_callbacks[cat] = _callbacks[cat] || []).push(fn);
  }

  function _fire(cat) {
    (_callbacks[cat] || []).forEach(function(fn) {
      try { fn(); } catch(e) {}
    });
    _callbacks[cat] = [];
  }

  /* ── Apply decision ─────────────────────────────────── */
  function _apply(state) {
    _persist(state);
    Object.keys(state.categories).forEach(function(k) {
      if (state.categories[k]) _fire(k);
    });
    _closeUI();
  }

  function _buildState(sel) {
    var cats = { necessary: true };
    _activeCats().forEach(function(k) {
      cats[k] = !!(sel && sel[k]);
    });
    return { version: CFG.version, decided: true, categories: cats };
  }

  /* ── Decisions ──────────────────────────────────────── */
  function _acceptAll() {
    var cats = { necessary: true };
    _activeCats().forEach(function(k) { cats[k] = true; });
    _apply({ version: CFG.version, decided: true, categories: cats });
  }

  function _rejectAll() { _apply(_buildState({})); }

  function _saveSelection() {
    var sel = {};
    if (_root) _root.querySelectorAll('.cm-checkbox').forEach(function(cb) {
      sel[cb.name] = cb.checked;
    });
    _apply(_buildState(sel));
  }

  /* ── UI helpers ─────────────────────────────────────── */
  function _closeUI() {
    if (_root) { _root.setAttribute('hidden', ''); _root.innerHTML = ''; }
  }

  function _on(id, fn) {
    var el = d.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }

  function _focusFirst() {
    setTimeout(function() {
      if (!_root) return;
      var el = _root.querySelector('button:not([disabled])');
      if (el) el.focus();
    }, 40);
  }

  function _dseHref() {
    var links = d.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (/datenschutz/.test(links[i].getAttribute('href')))
        return links[i].getAttribute('href');
    }
    return 'datenschutz.html';
  }

  /* ── Banner ─────────────────────────────────────────── */
  function _renderBanner() {
    if (!_root) return;
    _root.removeAttribute('hidden');
    var cats = _activeCats();

    _root.innerHTML =
      '<div class="cm-banner" role="dialog" aria-modal="true" aria-labelledby="cm-ttl">' +
        '<div class="cm-banner__body">' +
          '<p class="cm-banner__title" id="cm-ttl">Datenschutz-Einstellungen</p>' +
          '<p class="cm-banner__text">Diese Website verwendet technisch notwendige Speicherung.' +
            (cats.length > 0
              ? ' Für bestimmte Funktionen setzen wir optionale Dienste ein, die Ihrer Einwilligung bedürfen.'
              : '') +
            ' Weitere Informationen: <a href="' + _dseHref() + '" class="cm-link">Datenschutzerklärung</a>.</p>' +
        '</div>' +
        '<div class="cm-banner__actions">' +
          (cats.length > 0
            ? '<button type="button" class="cm-btn cm-btn--settings" id="cm-b-settings">Einstellungen</button>'
            : '') +
          '<button type="button" class="cm-btn cm-btn--reject" id="cm-b-reject">Ablehnen</button>' +
          '<button type="button" class="cm-btn cm-btn--accept" id="cm-b-accept">Alle akzeptieren</button>' +
        '</div>' +
      '</div>';

    _on('cm-b-accept',   _acceptAll);
    _on('cm-b-reject',   _rejectAll);
    _on('cm-b-settings', _renderModal);
    _focusFirst();
  }

  /* ── Modal ──────────────────────────────────────────── */
  function _renderModal() {
    if (!_root) return;
    _root.removeAttribute('hidden');
    var cats = _activeCats();
    var cur  = (_state && _state.categories) || {};

    var rows = cats.map(function(k) {
      var lbl = CFG.categories[k].label;
      return '<div class="cm-row">' +
        '<label class="cm-row__label">' +
          '<input type="checkbox" class="cm-checkbox" name="' + k + '"' + (cur[k] ? ' checked' : '') + '>' +
          '<span class="cm-row__name">' + lbl + '</span>' +
        '</label>' +
      '</div>';
    }).join('');

    _root.innerHTML =
      '<div class="cm-modal" role="dialog" aria-modal="true" aria-labelledby="cm-m-ttl">' +
        '<div class="cm-modal__inner">' +
          '<h2 class="cm-modal__title" id="cm-m-ttl">Cookie-Einstellungen</h2>' +
          '<div class="cm-modal__cats">' +
            '<div class="cm-row">' +
              '<label class="cm-row__label cm-row__label--disabled">' +
                '<input type="checkbox" disabled checked>' +
                '<span class="cm-row__name">Notwendig</span>' +
              '</label>' +
              '<span class="cm-row__note">Immer aktiv</span>' +
            '</div>' +
            rows +
          '</div>' +
          '<div class="cm-modal__actions">' +
            (cats.length > 0
              ? '<button type="button" class="cm-btn cm-btn--reject" id="cm-m-reject">Alle ablehnen</button>' +
                '<button type="button" class="cm-btn cm-btn--save"   id="cm-m-save">Auswahl speichern</button>' +
                '<button type="button" class="cm-btn cm-btn--accept" id="cm-m-accept">Alle akzeptieren</button>'
              : '<button type="button" class="cm-btn cm-btn--save"   id="cm-m-close">Schließen</button>') +
          '</div>' +
        '</div>' +
        '<div class="cm-modal__backdrop" id="cm-backdrop"></div>' +
      '</div>';

    _on('cm-m-accept',  _acceptAll);
    _on('cm-m-reject',  _rejectAll);
    _on('cm-m-save',    _saveSelection);
    _on('cm-m-close',   _closeUI);
    _on('cm-backdrop',  function() { if (_state && _state.decided) _closeUI(); });
    _focusFirst();
  }

  /* ── Footer reopeners ───────────────────────────────── */
  function _bindReopeners() {
    d.querySelectorAll('[data-consent-open]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        _renderModal();
      });
    });
  }

  /* ── Init ───────────────────────────────────────────── */
  function _init() {
    _root  = d.getElementById('consent-root');
    _state = _load();
    _bindReopeners();

    if (_state && _state.decided) {
      Object.keys(_state.categories).forEach(function(k) {
        if (_state.categories[k]) _fire(k);
      });
      return;
    }

    if (_activeCats().length > 0) _renderBanner();
  }

  /* ── Public API ─────────────────────────────────────── */
  w._consent = {
    has:     _has,
    onGrant: _onGrant,
    open:    _renderModal,
    config:  CFG
  };

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})(window, document);
