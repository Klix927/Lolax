(function(w){
  function _sf(txt, parent) {
    for (var i = 0; i < txt.length; i++) {
      var s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      s.textContent = txt[i];
      parent.appendChild(s);
    }
  }

  function _sr(txt) {
    var s = document.createElement('span');
    s.className = 'sr-only';
    s.textContent = txt;
    return s;
  }

  // Render address lines as char-spans; screen-reader text via sr-only span
  function _b(id, lines) {
    var el = document.getElementById(id);
    if (!el) return;
    el.appendChild(_sr(lines.join('\n')));
    var vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    for (var r = 0; r < lines.length; r++) {
      _sf(lines[r], vis);
      if (r < lines.length - 1) vis.appendChild(document.createElement('br'));
    }
    el.appendChild(vis);
  }

  // Reveal contact info behind button; t=parts, o=order, sc=scheme prefix
  function _v(id, t, o, sc) {
    var el = document.getElementById(id);
    if (!el) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'obf-btn';
    btn.textContent = 'Kontakt anzeigen';
    btn.addEventListener('click', function() {
      var val = '';
      for (var i = 0; i < o.length; i++) val += t[o[i]];
      var a = document.createElement('a');
      a.href = sc + val;
      a.className = 'obf-link';
      a.appendChild(_sr(val));
      var vis = document.createElement('span');
      vis.setAttribute('aria-hidden', 'true');
      _sf(val, vis);
      a.appendChild(vis);
      el.innerHTML = '';
      el.appendChild(a);
      a.focus();
    }, {once: true});
    el.innerHTML = '';
    el.appendChild(btn);
  }

  w._lx = {b: _b, v: _v};
})(window);
