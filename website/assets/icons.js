/* Kasu icon set — one family, 24x24 grid, 1.75 stroke, currentColor.
   Design-skill rule: emoji are never used as structural icons. */
(function (root) {
  var P = {
    market:      '<path d="M4 9h16l-1.2 10.2A2 2 0 0 1 16.8 21H7.2a2 2 0 0 1-2-1.8L4 9Z"/><path d="M4 9 6 4h12l2 5"/><path d="M9.5 13v4M14.5 13v4"/>',
    basket:      '<path d="M4 9h16l-1.4 9.3A2 2 0 0 1 16.6 20H7.4a2 2 0 0 1-2-1.7L4 9Z"/><path d="m8.5 9 2-5M15.5 9l-2-5"/>',
    weekly:      '<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4v-9Z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/>',
    route:       '<circle cx="6" cy="18" r="2.6"/><circle cx="18.5" cy="18" r="2.6"/><path d="M8.6 18h5.2l-2.4-6.6H8.2"/><path d="m13.8 11.4 2.6 6.6M14 6.5h2.4l1.6 5"/>',
    search:      '<circle cx="11" cy="11" r="6.2"/><path d="m20 20-3.6-3.6"/>',
    pin:         '<path d="M12 21s-6.4-5.7-6.4-10.6a6.4 6.4 0 0 1 12.8 0C18.4 15.3 12 21 12 21Z"/><circle cx="12" cy="10.2" r="2.3"/>',
    check:       '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x:           '<path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"/>',
    plus:        '<path d="M12 5.5v13M5.5 12h13"/>',
    minus:       '<path d="M5.5 12h13"/>',
    camera:      '<path d="M3.5 8.5h3.2l1.5-2.3h7.6l1.5 2.3h3.2v10.2H3.5V8.5Z"/><circle cx="12" cy="13.4" r="3.4"/>',
    shield:      '<path d="M12 3.2 19.5 6v6.1c0 4.4-3.1 7.4-7.5 8.7-4.4-1.3-7.5-4.3-7.5-8.7V6L12 3.2Z"/><path d="m8.8 12.2 2.3 2.3 4.1-4.5"/>',
    receipt:     '<path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4v-17Z"/><path d="M9 8h6M9 12h6"/>',
    store:       '<path d="M4 10v9.5h16V10"/><path d="M3 10 4.8 4.5h14.4L21 10a2.6 2.6 0 0 1-4.5 1.8A2.6 2.6 0 0 1 12 11.9a2.6 2.6 0 0 1-4.5-.1A2.6 2.6 0 0 1 3 10Z"/><path d="M10 19.5v-5h4v5"/>',
    chart:       '<path d="M4 20h16"/><path d="M7 20v-6.5M12 20V6.5M17 20v-9.5"/>',
    clock:       '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.4V12l3 1.8"/>',
    star:        '<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z"/>',
    streak:      '<path d="M12 3.5s5.2 4 5.2 8.6a5.2 5.2 0 0 1-10.4 0C6.8 7.5 12 3.5 12 3.5Z"/><path d="M12 17.4a2.6 2.6 0 0 1-2.6-2.6c0-1.9 2.6-3.7 2.6-3.7s2.6 1.8 2.6 3.7A2.6 2.6 0 0 1 12 17.4Z"/>',
    leaf:        '<path d="M20 4.5c0 8.4-4.5 13-11 13-2.2 0-3.9-.5-5-1.2 0-8.4 4.5-13 11-13 2.2 0 3.9.5 5 1.2Z"/><path d="M4 20.5c1.8-4.6 5-8 9.5-10"/>',
    up:          '<path d="M12 19V6"/><path d="m6.5 11.5 5.5-5.5 5.5 5.5"/>',
    down:        '<path d="M12 5v13"/><path d="m6.5 12.5 5.5 5.5 5.5-5.5"/>',
    right:       '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    left:        '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
    alert:       '<path d="M12 4.2 21 19.5H3L12 4.2Z"/><path d="M12 10v4M12 16.8v.2"/>',
    wallet:      '<path d="M3.5 7.8h17V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7.8Z"/><path d="M3.5 7.8 16 3.5l1.4 4.3"/><circle cx="16.6" cy="14" r="1.2"/>',
    bell:        '<path d="M6.5 10.2a5.5 5.5 0 0 1 11 0c0 4 1.5 5.6 1.5 5.6H5s1.5-1.6 1.5-5.6Z"/><path d="M10.2 19a2 2 0 0 0 3.6 0"/>',
    user:        '<circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0"/>',
    refresh:     '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>',
    phone:       '<path d="M8.4 4.5 10 8l-1.9 1.9a11 11 0 0 0 5.9 5.9L16 13.9l3.5 1.6v3.1a1.6 1.6 0 0 1-1.8 1.6C10.6 19.5 4.4 13.3 3.6 6.2A1.6 1.6 0 0 1 5.2 4.4h3.2Z"/>',
    mail:        '<path d="M3.5 6h17v12h-17V6Z"/><path d="m3.5 6.8 8.5 6 8.5-6"/>',
    chat:        '<path d="M20.5 11.6c0 4-3.8 7.2-8.5 7.2a9.9 9.9 0 0 1-2.7-.4L4 20l1.5-4a6.8 6.8 0 0 1-2-4.4c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"/>',
    scale:       '<path d="M12 4.5v15"/><path d="M6 19.5h12"/><path d="M4 9h16"/><path d="M4 9 1.8 14a2.6 2.6 0 0 0 4.4 0L4 9Z"/><path d="M20 9l-2.2 5a2.6 2.6 0 0 0 4.4 0L20 9Z"/>',
    box:         '<path d="M3.5 7.6 12 3.6l8.5 4v8.8L12 20.4l-8.5-4V7.6Z"/><path d="m3.5 7.6 8.5 4 8.5-4M12 11.6v8.8"/><path d="m7.8 5.6 8.4 4"/>',
    grid:        '<path d="M4 4h6.4v6.4H4zM13.6 4H20v6.4h-6.4zM4 13.6h6.4V20H4zM13.6 13.6H20V20h-6.4z"/>',
    flag:        '<path d="M5.5 21V4"/><path d="M5.5 5.2h12l-2.2 3.9 2.2 3.9h-12"/>'
  };

  function icon(name, cls) {
    var d = P[name] || '';
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + '</svg>';
  }

  /* The Kasu mark: a rounded market basket whose handle cuts a leaf shape. */
  function mark(cls) {
    return '<svg class="mark ' + (cls || '') + '" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
      '<path d="M4.6 11.6h22.8l-2 15.2a3 3 0 0 1-3 2.6H9.6a3 3 0 0 1-3-2.6l-2-15.2Z" fill="currentColor" opacity=".92"/>' +
      '<path d="M26 2.4c0 6.2-3.6 9.6-8.9 9.6-1.4 0-2.6-.2-3.6-.6 0-6.2 3.6-9.6 8.9-9.6 1.4 0 2.6.2 3.6.6Z" fill="currentColor"/>' +
      '<path d="M11.4 16.4v7.8M20.6 16.4v7.8" stroke="var(--void,#0E100C)" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
      '</svg>';
  }

  root.KI = { icon: icon, mark: mark, paths: P };
})(window);
