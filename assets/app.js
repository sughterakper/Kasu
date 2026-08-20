/* Kasua — the app. Hash-routed, no build step, no dependencies.
   Three roles share one state so the demo actually hangs together:
     #/buy/*   buyer   — market, price board, shopping list, packages, orders
     #/sell/*  seller  — the market vendor: demand, pickups, score, payouts
     #/ops/*   admin   — vendor scoring, spoilage, flags queue, zones          */
(function () {
  'use strict';

  var IMG = 'assets/images/';
  var FEE = 800;
  /* One rider, one run: below this a basket costs more to deliver than it earns.
     Stated to the buyer in those words rather than hidden until checkout. */
  var MIN_SPEND = 5000;
  var STORE = 'kasua-demo-v4';
  var I = KI.icon, MARK = KI.mark, t = KL.t;

  /* ---------------- state ---------------- */
  var S;
  function blank() {
    return {
      cart:{}, district:'Wuse II', pay:'card', cat:'all',
      order:null,
      sched:{ day:'tomorrow', slot:'morning' },
      pkg:null,                          // { name, day, slot, items[] }
      pkgDraft:{ name:'', day:'Wed', slot:'morning', items:[] },
      points:1240, streak:5,
      accepted:{},
      lastBasket:['tombasket','tatashe','rodo','onion'],
      listText:'', listResult:null,
      scale:'md',
      seen:false                         // has the welcome screen been completed
    };
  }
  function load() {
    try { S = JSON.parse(localStorage.getItem(STORE)) || blank(); }
    catch (e) { S = blank(); }
    if (!S || !S.cart) S = blank();
    if (!S.sched) S.sched = { day:'tomorrow', slot:'morning' };
    if (!S.pkgDraft) S.pkgDraft = { name:'', day:'Wed', slot:'morning', items:[] };
    applyScale();
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }
  function applyScale() { document.documentElement.setAttribute('data-scale', S.scale === 'md' ? '' : S.scale); }

  window.resetDemo = function () {
    S = blank(); stopClock(); save(); applyScale();
    location.hash = '#/buy/market'; render(); toast('Demo reset');
  };

  /* ---------------- helpers ---------------- */
  function fmt(n) { return '₦' + Math.round(n).toLocaleString('en-NG'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]; }); }
  function P(id) { for (var i=0;i<KASU.PRODUCTS.length;i++) if (KASU.PRODUCTS[i].id===id) return KASU.PRODUCTS[i]; }
  function cartCount() { var n=0; for (var k in S.cart) n+=S.cart[k]; return n; }
  function cartTotal() { var x=0; for (var k in S.cart) x+=P(k).price*S.cart[k]; return x; }
  function pointsFor(x) { return Math.round(x/100); }
  function shortfall() { return Math.max(0, MIN_SPEND - cartTotal()); }
  function meetsMin() { return cartTotal() >= MIN_SPEND; }
  /* i18n strings carry {X} / {MIN} placeholders so word order stays natural
     in each language instead of being concatenated in English order. */
  function fill(key, vals) {
    return String(t(key)).replace(/\{(\w+)\}/g, function (_, k) { return vals[k] != null ? vals[k] : ''; });
  }
  function dayLabel(id) {
    for (var i=0;i<KASU.DAYS.length;i++) if (KASU.DAYS[i].id===id) return KASU.DAYS[i][KL.getLang()] || KASU.DAYS[i].en;
    return id;
  }
  function slotOf(id) { for (var i=0;i<KASU.SLOTS.length;i++) if (KASU.SLOTS[i].id===id) return KASU.SLOTS[i]; }
  function catLabel(c) { return c.key ? t(c.key) : c.label; }

  var tTimer;
  function toast(msg, ok) {
    var old = document.querySelector('.toast'); if (old) old.remove();
    var el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = (ok === false ? '' : I('check')) + '<span>' + esc(msg) + '</span>';
    document.body.appendChild(el);
    clearTimeout(tTimer); tTimer = setTimeout(function(){ el.remove(); }, 2200);
  }

  function fly(ev) {
    if (!ev || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var target = document.querySelector('.nav a[data-t="basket"]');
    if (!target || !ev.currentTarget) return;
    var a = ev.currentTarget.getBoundingClientRect(), b = target.getBoundingClientRect();
    var d = document.createElement('div'); d.className = 'fly';
    d.style.left = (a.left + a.width/2 - 7) + 'px';
    d.style.top  = (a.top  + a.height/2 - 7) + 'px';
    document.body.appendChild(d);
    d.animate([
      { transform:'translate(0,0) scale(1)', opacity:1 },
      { transform:'translate(' + (b.left+b.width/2-a.left-a.width/2) + 'px,' +
                  (b.top+b.height/2-a.top-a.height/2) + 'px) scale(.35)', opacity:.2 }
    ], { duration:520, easing:'cubic-bezier(.3,.1,.3,1)' }).onfinish = function(){ d.remove(); };
  }

  /* ============================================================
     THE LIST PARSER
     Matches free text against the catalogue. Longest matching name
     wins, so "tomato basket" beats the bare "tomato" on tomloose.
     Understands quantities in digits and in all four languages.
     ============================================================ */
  var NUMWORDS = {
    one:1, two:2, three:3, four:4, five:5, six:6, ten:10,
    otu:1, abuo:2, 'abụọ':2, ato:3, 'atọ':3, ano:4, 'anọ':4,       // Igbo
    daya:1, biyu:2, uku:3, hudu:4, biyar:5,                        // Hausa
    kan:1, meji:2, 'méjì':2, meta:3, 'mẹ́ta':3, merin:4            // Yoruba
  };

  function parseList(text) {
    var chunks = String(text).split(/[\n,;•·]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var found = [], missing = [], seen = {};

    chunks.forEach(function (raw) {
      var line = raw.toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ').trim();
      if (!line) return;

      /* quantity: first standalone number, else a number word, else 1 */
      var qty = 1;
      var digits = line.match(/(?:^|\s)(\d{1,2})(?:\s|$|kg|kilo)/);
      if (digits) qty = Math.max(1, Math.min(parseInt(digits[1], 10) || 1, 20));
      else {
        for (var w in NUMWORDS) {
          if (new RegExp('(^|\\s)' + w + '($|\\s)').test(line)) { qty = NUMWORDS[w]; break; }
        }
      }

      /* best match: the longest catalogue term contained in the line */
      var best = null, bestLen = 0;
      KASU.PRODUCTS.forEach(function (p) {
        var terms = (p.syn || []).concat([p.name.toLowerCase()]);
        terms.forEach(function (term) {
          if (term.length > bestLen && line.indexOf(term) !== -1) { best = p; bestLen = term.length; }
        });
      });

      if (best) {
        if (seen[best.id]) { seen[best.id].qty += qty; }
        else { seen[best.id] = { id:best.id, qty:qty, src:raw.trim() }; found.push(seen[best.id]); }
      } else {
        missing.push(raw.trim());
      }
    });

    return { found:found, missing:missing };
  }

  /* ---------------- actions ---------------- */
  var A = {}; window.KA = A;

  A.add = function (id, ev) { fly(ev); S.cart[id]=(S.cart[id]||0)+1; save(); render(); };
  A.dec = function (id) { if(!S.cart[id])return; S.cart[id]--; if(S.cart[id]<=0) delete S.cart[id]; save(); render(); };
  A.cat = function (c) { S.cat=c; save(); render(); };
  A.district = function (d) { S.district=d; save(); render(); };
  A.pay = function (p) { S.pay=p; save(); render(); };
  A.schedDay = function (d) { S.sched.day=d; save(); render(); };
  A.schedSlot = function (s) { S.sched.slot=s; save(); render(); };

  A.lang = function (id) { KL.setLang(id); save(); render(); };
  A.enter = function () { S.seen = true; save(); location.hash = '#/buy/market'; render(); };
  A.showWelcome = function () { S.seen = false; save(); location.hash = '#/welcome'; render(); };
  A.scale = function (s) { S.scale=s; applyScale(); save(); render(); };

  A.reorder = function () {
    S.lastBasket.forEach(function(id){ S.cart[id]=(S.cart[id]||0)+1; });
    save(); location.hash = '#/buy/basket'; toast(t('added'));
  };

  /* list */
  A.listInput = function (el) { S.listText = el.value; };
  A.listBuild = function () {
    if (!S.listText.trim()) { toast(t('list_empty'), false); return; }
    S.listResult = parseList(S.listText); save(); render();
  };
  A.listPhoto = function (input) {
    if (!input.files || !input.files[0]) return;
    S.listResult = 'reading'; render();
    setTimeout(function () {
      S.listText = KASU.PHOTO_DEMO;
      S.listResult = parseList(S.listText);
      save(); render();
    }, 1400);
  };
  A.listAddAll = function () {
    if (!S.listResult || !S.listResult.found) return;
    S.listResult.found.forEach(function (m) { S.cart[m.id] = (S.cart[m.id]||0) + m.qty; });
    save(); location.hash = '#/buy/basket'; toast(t('added'));
  };
  A.listClear = function () { S.listText=''; S.listResult=null; save(); render(); };

  /* packages */
  A.pkgField = function (k, v) { S.pkgDraft[k] = v; save(); render(); };
  A.pkgName = function (el) { S.pkgDraft.name = el.value; };
  A.pkgToggle = function (id) {
    var i = S.pkgDraft.items.indexOf(id);
    if (i>=0) S.pkgDraft.items.splice(i,1); else S.pkgDraft.items.push(id);
    save(); render();
  };
  A.pkgKit = function (kit) {
    KASU.KITS[kit].forEach(function(id){ if(S.pkgDraft.items.indexOf(id)<0) S.pkgDraft.items.push(id); });
    save(); render(); toast(t('added'));
  };
  A.pkgStart = function () {
    var d = S.pkgDraft;
    if (!d.items.length) { toast(t('pkg_items'), false); return; }
    S.pkg = { name: d.name.trim() || t('pkg_title'), day:d.day, slot:d.slot, items:d.items.slice() };
    save(); render();
    toast(t('pkg_every') + ' ' + dayLabel(d.day) + ' ' + t('pkg_at') + ' ' + t(slotOf(d.slot).key));
  };
  A.pkgStop = function () { S.pkg = null; save(); render(); toast(t('cancel'), false); };

  /* order */
  A.placeOrder = function () {
    var items=[]; for (var k in S.cart) items.push({ id:k, qty:S.cart[k] });
    if (!items.length) return;
    var total = cartTotal() + FEE;
    S.order = { id:'KS-'+(2481+Math.floor(Math.random()*60)), step:0, items:items,
                total:total, flagged:false, picked:{}, rejected:{}, dispatched:false,
                earned:pointsFor(total), pay:S.pay,
                sched:{ day:S.sched.day, slot:S.sched.slot } };
    S.cart = {}; save();
    location.hash = '#/buy/track'; startClock();
  };
  A.flag = function () { if(!S.order) return; S.order.flagged=true; save(); render(); toast(t('flagged_ok')); };
  A.collect = function () {
    if(!S.order || S.order.collected) return;
    S.order.collected = true; S.points += S.order.earned; S.streak += 1;
    save(); render(); toast('+' + S.order.earned + ' ' + t('points_label'));
  };
  A.redeem = function () { toast('—', false); };

  /* seller */
  A.accept = function (id) { S.accepted[id] = !S.accepted[id]; save(); render(); };
  A.acceptAll = function () {
    KASU.SELLER.demand.forEach(function(d){ S.accepted[d.id]=true; }); save(); render(); toast(t('confirm'));
  };
  A.pickPlus   = function (id) { if(!S.order)return; S.order.picked[id]=(S.order.picked[id]||0)+1; save(); render(); };
  A.rejectPlus = function (id) { if(!S.order)return; S.order.rejected[id]=(S.order.rejected[id]||0)+1; save(); render(); };
  A.dispatch = function () {
    if(!S.order) return;
    S.order.dispatched = true; if (S.order.step<4) S.order.step=4;
    save(); render(); toast(t('confirm'));
  };

  /* ---------------- clocks ---------------- */
  var clock=null;
  function startClock() {
    stopClock();
    clock = setInterval(function () {
      if (!S.order) { stopClock(); return; }
      if (S.order.step < KASU.LEDGER.length-1) { S.order.step++; save(); render(); }
      else stopClock();
    }, 3200);
  }
  function stopClock(){ if(clock){ clearInterval(clock); clock=null; } }

  var cdTimer=null;
  function cutoffText() {
    var now=new Date(), end=new Date(now); end.setHours(18,0,0,0);
    if (end<=now) end.setDate(end.getDate()+1);
    var s=Math.floor((end-now)/1000), h=Math.floor(s/3600), m=Math.floor(s%3600/60), ss=s%60;
    function p(n){ return (n<10?'0':'')+n; }
    return p(h)+':'+p(m)+':'+p(ss);
  }
  function startCountdown() {
    if (cdTimer) clearInterval(cdTimer);
    cdTimer = setInterval(function () {
      var el=document.querySelector('.cutoff .t'); if(el) el.textContent = cutoffText();
    }, 1000);
  }

  /* ---------------- chrome ---------------- */
  function topbar() {
    var n = cartCount();
    return '<div class="bar"><div class="barrow">' +
      '<div style="flex:1;min-width:0">' +
        '<div class="wm">' + MARK() + 'Kasua</div>' +
        '<div class="loc">' + I('pin') + esc(S.district) + ' · ' + t('delivering_to') + '</div>' +
      '</div>' +
      '<a class="iconbtn" href="#/buy/basket" aria-label="' + t('nav_basket') + '">' + I('basket') +
        (n ? '<span class="dot num">' + n + '</span>' : '') + '</a>' +
      '</div>' +
      '<div class="searchb">' + I('search') + '<span>' + t('search_ph') + '</span></div>' +
      '<div class="cutoff">' + I('clock') + '<span>' + t('closes_in') + '</span>' +
        '<span class="t num">' + cutoffText() + '</span></div>' +
      '</div>';
  }

  var NAVS = {
    buy:[ {r:'market',i:'market',k:'nav_market'}, {r:'prices',i:'chart',k:'nav_prices'},
          {r:'list',i:'receipt',k:'nav_list'},    {r:'basket',i:'basket',k:'nav_basket',badge:true},
          {r:'me',i:'user',k:'nav_me'} ],
    sell:[{r:'demand',i:'box',k:'nav_demand'},    {r:'pickups',i:'scale',k:'nav_pickups'},
          {r:'score',i:'shield',k:'nav_score'},   {r:'payouts',i:'wallet',k:'nav_payouts'} ],
    ops:[ {r:'today',i:'grid',k:'nav_today'},     {r:'vendors',i:'store',k:'nav_vendors'},
          {r:'quality',i:'flag',k:'nav_quality'}, {r:'zones',i:'chart',k:'nav_zones'} ]
  };

  function nav(role, active) {
    var n = cartCount();
    return '<nav class="nav">' + NAVS[role].map(function (x) {
      return '<a href="#/' + role + '/' + x.r + '" data-t="' + x.r + '" class="' + (x.r===active?'on':'') + '">' +
        I(x.i) + '<span>' + t(x.k) + '</span>' +
        (x.badge && n ? '<span class="dot num">' + n + '</span>' : '') + '</a>';
    }).join('') + '</nav>';
  }

  function head(title, back) {
    return '<div class="head">' + (back ? '<a class="back" href="#/'+back+'" aria-label="'+t('back')+'">'+I('left')+'</a>' : '') +
      '<h2>' + esc(title) + '</h2></div>';
  }

  function shell(inner, role, active, bar) {
    return '<div class="device">' + (bar || '') +
      '<div class="scroll"><div class="screen">' + inner + '</div></div>' +
      nav(role, active) + '</div>';
  }

  function moveTag(d, big) {
    var cls = d < 0 ? 'dn' : (d > 0 ? 'up' : 'fl');
    var ico = d < 0 ? I('down') : (d > 0 ? I('up') : '');
    var txt = d ? Math.abs(d) + '%' : t('price_held');
    return '<span class="' + (big?'mv ':'mv ') + cls + '">' + ico + txt + '</span>';
  }

  function trackbar() {
    if (!S.order) return '';
    var done = S.order.step >= KASU.LEDGER.length-1;
    return '<a class="trackbar" href="#/buy/track">' + I(done?'check':'route','lg') +
      '<span class="bd"><b>' + t('track_order') + ' · #' + esc(S.order.id) + '</b>' +
      '<small>' + esc(KASU.LEDGER[S.order.step].t) + '</small></span>' + I('right') + '</a>';
  }

  /* ============================================================
     WELCOME — first run. Two decisions, both already answered, so
     the fast path in is a single tap. Language comes first because
     everything after it is unreadable to the wrong reader.
     ============================================================ */
  function screenWelcome() {
    return '<div class="welcome">' +
      '<div class="top"><div class="wm">' + MARK() + 'Kasua</div>' +
      '<h1>' + t('w_tagline') + '</h1>' +
      '<p class="sub">' + t('w_sub') + '</p></div>' +

      '<div class="grp"><div class="lbl">' + t('w_lang') + '</div>' +
      '<div class="wlang">' + KL.LANGS.map(function (L) {
        var on = KL.getLang() === L.id;
        return '<button aria-pressed="' + on + '" onclick="KA.lang(\'' + L.id + '\')">' +
          '<span>' + esc(L.native) + '</span>' + I('check') + '</button>';
      }).join('') + '</div></div>' +

      '<div class="grp"><div class="lbl">' + t('w_where') + '</div>' +
      '<div class="wdist">' + KASU.DISTRICTS.map(function (d) {
        var on = S.district === d;
        return '<button aria-pressed="' + on + '" onclick="KA.district(\'' + d + '\')">' + esc(d) + '</button>';
      }).join('') + '</div></div>' +

      '<div class="foot"><button class="btn" onclick="KA.enter()">' + t('w_start') + I('right') + '</button>' +
      '<p class="note">' + t('w_change') + '</p></div>' +
      '</div>';
  }

  /* ============================================================
     BUYER — market
     ============================================================ */
  function pcard(p) {
    var q = S.cart[p.id] || 0;
    return '<article class="pc">' +
      '<div class="im"><img src="'+IMG+p.img+'" alt="'+esc(p.name)+'" loading="lazy">' +
        '<span class="stampb">'+I('check')+t('checked_at')+' 07:42</span></div>' +
      '<div class="bd"><h4 class="nm">'+esc(p.name)+'</h4>' +
      '<p class="un">'+esc(p.unit)+'</p>' +
      '<div class="ft"><span class="pr num">'+fmt(p.price)+'</span>' +
      '<button class="add'+(q?' in':'')+'" onclick="KA.add(\''+p.id+'\',event)" aria-label="'+t('add')+' '+esc(p.name)+'">' +
        (q ? '<span class="num">'+q+'</span>' : I('plus')) + '</button>' +
      '</div></div></article>';
  }

  function screenMarket() {
    var list = S.cat==='all' ? KASU.PRODUCTS : KASU.PRODUCTS.filter(function(p){ return p.cat===S.cat; });
    var label = KASU.CATS.filter(function(c){ return c.id===S.cat; })[0];

    var h = trackbar();

    h += '<div class="streak">' +
      '<div class="spill"><span class="ic leaf">'+I('streak')+'</span><div style="flex:1;min-width:0">' +
        '<div class="v num">'+S.streak+' '+t('streak_weeks')+'</div><div class="l">'+t('streak_label')+'</div>' +
        '<div class="pips">'+[0,1,2,3,4,5].map(function(i){ return '<i class="'+(i<(S.streak%6||6)?'on':'')+'"></i>'; }).join('')+'</div>' +
      '</div></div>' +
      '<div class="spill"><span class="ic gold">'+I('star')+'</span><div>' +
        '<div class="v num">'+S.points.toLocaleString()+'</div><div class="l">'+t('points_label')+'</div>' +
      '</div></div></div>';

    if (S.lastBasket.length && !cartCount()) {
      h += '<div class="panel leaf" style="display:flex;align-items:center;gap:.7rem">' +
        '<span class="stamp sm leaf">'+I('refresh')+'</span>' +
        '<div style="flex:1;min-width:0"><b style="font-size:.92rem">'+t('usual_title')+'</b>' +
        '<div class="note">'+S.lastBasket.map(function(id){ return esc(P(id).name); }).join(' · ')+'</div></div>' +
        '<button class="btnsm" onclick="KA.reorder()">'+t('usual_cta')+'</button></div>';
    }

    h += '<a class="promo" href="#/buy/packages"><img src="'+IMG+'basketBox.jpg" alt=""><span class="sh"></span>' +
      '<div class="in"><div class="lbl">'+t('promo_eyebrow')+'</div>' +
      '<h3>'+t('promo_title')+'</h3><p>'+t('promo_sub')+'</p>' +
      '<span class="go">'+t('promo_cta')+' '+I('right')+'</span></div></a>';

    h += '<div class="chips">' + KASU.CATS.map(function(c){
      return '<button class="chip'+(S.cat===c.id?' on':'')+'" onclick="KA.cat(\''+c.id+'\')">'+esc(catLabel(c))+'</button>';
    }).join('') + '</div>';

    h += '<div class="sect"><h3>'+esc(S.cat==='all' ? t('todays_market') : catLabel(label))+'</h3>' +
         '<span class="m">'+list.length+' '+t('items')+'</span></div>';
    h += '<div class="grid">' + list.map(pcard).join('') + '</div>';

    return shell(h, 'buy', 'market', topbar());
  }

  /* ============================================================
     BUYER — price board
     ============================================================ */
  function priceRow(p) {
    return '<div class="prow"><img src="'+IMG+p.img+'" alt="" loading="lazy">' +
      '<div class="bd"><div class="nm">'+esc(p.name)+'</div>' +
      '<div class="wy">'+esc(p.why)+'</div></div>' +
      '<div class="rt"><div class="pr num">'+fmt(p.price)+'</div>'+moveTag(p.delta)+'</div></div>';
  }

  function screenPrices() {
    var falls = KASU.PRODUCTS.filter(function(p){return p.delta<0;}).sort(function(a,b){return a.delta-b.delta;});
    var rises = KASU.PRODUCTS.filter(function(p){return p.delta>0;}).sort(function(a,b){return b.delta-a.delta;});
    var flat  = KASU.PRODUCTS.filter(function(p){return !p.delta;});

    var h = head(t('prices_title'));
    h += '<p class="pad tiny mut" style="margin:.1rem 0 0">'+t('prices_sub')+'</p>';

    h += '<div class="panel gold" style="display:flex;align-items:center;gap:.7rem">' +
      '<span class="stamp sm">'+I('clock')+'</span>' +
      '<span class="tiny" style="font-weight:700">'+t('price_locked')+'</span></div>';

    h += '<div class="sect"><h3>'+t('biggest_falls')+'</h3><span class="m">'+t('vs_last_week')+'</span></div>';
    h += falls.map(priceRow).join('');

    h += '<div class="sect"><h3>'+t('biggest_rises')+'</h3><span class="m">'+t('vs_last_week')+'</span></div>';
    h += rises.map(priceRow).join('');

    h += '<div class="sect"><h3>'+t('price_held')+'</h3></div>';
    h += flat.map(priceRow).join('');

    h += '<div class="panel"><div class="lbl">'+t('why_moved')+'</div>' +
      '<p class="tiny mut" style="margin:.35rem 0 0">Prices come from what the checker actually paid at the stall that morning, ' +
      'not a markup on a list. When the market moves, this board moves with it — up as well as down.</p></div>';

    return shell(h, 'buy', 'prices', '');
  }

  /* ============================================================
     BUYER — shopping list (type it or photograph it)
     ============================================================ */
  function screenList() {
    var h = head(t('list_title'));
    h += '<p class="pad tiny mut" style="margin:.1rem 0 0">'+t('list_intro')+'</p>';

    h += '<div class="listbox">' +
      '<label for="lst" class="lbl" style="display:block;margin-bottom:.4rem">'+t('list_type')+'</label>' +
      '<textarea id="lst" oninput="KA.listInput(this)" placeholder="'+t('list_ph')+'">'+esc(S.listText)+'</textarea>' +
      '<div class="listways">' +
        '<button class="way" onclick="KA.listBuild()">'+I('check','lg')+'<span>'+t('list_build')+'</span></button>' +
        '<label class="way" for="lphoto">'+I('camera','lg')+'<span>'+t('list_photo')+'</span></label>' +
        '<input id="lphoto" type="file" accept="image/*" capture="environment" hidden onchange="KA.listPhoto(this)">' +
      '</div>' +
      '<p class="note" style="margin-top:.5rem">'+t('list_photo_note')+'</p>' +
      '</div>';

    if (S.listResult === 'reading') {
      h += '<div class="thinking"><i></i><i></i><i></i><span>'+t('list_reading')+'</span></div>';
      return shell(h, 'buy', 'list', '');
    }

    if (S.listResult) {
      var r = S.listResult;
      if (r.found.length) {
        h += '<div class="sect"><h3>'+t('list_found')+'</h3><span class="m">'+r.found.length+'</span></div>';
        h += '<div>' + r.found.map(function (m) {
          var p = P(m.id);
          return '<div class="match"><img src="'+IMG+p.img+'" alt="" loading="lazy">' +
            '<div class="bd"><div class="nm" style="font-weight:700">'+esc(p.name)+' × '+m.qty+'</div>' +
            '<div class="src">“'+esc(m.src)+'”</div></div>' +
            '<b class="num">'+fmt(p.price*m.qty)+'</b></div>';
        }).join('') + '</div>';
      }
      if (r.missing.length) {
        h += '<div class="sect"><h3>'+t('list_missing')+'</h3></div>';
        h += r.missing.map(function (x) {
          return '<div class="match miss">'+I('alert')+'<div class="bd">“'+esc(x)+'”</div></div>';
        }).join('');
      }
      if (r.found.length) {
        var sum = r.found.reduce(function(a,m){ return a + P(m.id).price*m.qty; }, 0);
        h += '<div class="panel"><div class="kv tot"><span>'+t('subtotal')+'</span><span class="num">'+fmt(sum)+'</span></div></div>';
        h += '<div class="sticky"><button class="btn" onclick="KA.listAddAll()">'+I('basket')+t('list_addall')+'</button>' +
          '<p class="note" style="text-align:center;margin-top:.4rem"><button onclick="KA.listClear()" style="text-decoration:underline">'+t('cancel')+'</button></p></div>';
      }
    }

    return shell(h, 'buy', 'list', '');
  }

  /* ============================================================
     BUYER — basket, checkout (with scheduling + approval)
     ============================================================ */
  function screenBasket() {
    var ids = Object.keys(S.cart);
    var h = head(t('basket_title'));

    if (!ids.length) {
      h += '<div class="empty"><div class="ic">'+I('basket','lg')+'</div>' +
        '<h3>'+t('basket_empty')+'</h3><p>'+t('basket_empty_sub')+'</p>' +
        '<a class="btn ghost" href="#/buy/market" style="max-width:15rem;margin:0 auto">'+t('browse')+'</a></div>';
      return shell(h, 'buy', 'basket', '');
    }

    h += '<div>' + ids.map(function (id) {
      var p = P(id);
      return '<div class="row"><img class="th" src="'+IMG+p.img+'" alt="" loading="lazy">' +
        '<div class="bd"><div class="nm">'+esc(p.name)+'</div>' +
        '<div class="un num">'+fmt(p.price)+' · '+esc(p.unit)+'</div></div>' +
        '<div class="qty"><button class="qb" onclick="KA.dec(\''+id+'\')" aria-label="−">'+I('minus')+'</button>' +
        '<span class="qn num">'+S.cart[id]+'</span>' +
        '<button class="qb" onclick="KA.add(\''+id+'\')" aria-label="+">'+I('plus')+'</button></div></div>';
    }).join('') + '</div>';

    h += '<div class="panel">' +
      '<div class="kv"><span>'+t('subtotal')+'</span><b class="num">'+fmt(cartTotal())+'</b></div>' +
      '<div class="kv"><span>'+t('delivery')+' · '+esc(S.district)+'</span><b class="num">'+fmt(FEE)+'</b></div>' +
      '<div class="kv tot"><span>'+t('total')+'</span><span class="num">'+fmt(cartTotal()+FEE)+'</span></div>' +
      '<div class="kv" style="border:0;padding-top:.5rem"><span class="note">'+t('earns')+'</span>' +
      '<span class="pill gold">'+I('star')+'+'+pointsFor(cartTotal()+FEE)+'</span></div></div>';

    /* Below the minimum: say how much is missing and why, and show progress —
       not a dead button the shopper has to work out for themselves. */
    if (!meetsMin()) {
      var pct = Math.round(cartTotal() / MIN_SPEND * 100);
      h += '<div class="minbar">' + I('alert','lg') +
        '<div style="flex:1;min-width:0">' +
        '<b>' + fill('min_short', { X: fmt(shortfall()) }) + '</b>' +
        '<small>' + fill('min_note', { MIN: fmt(MIN_SPEND) }) + '</small>' +
        '<div class="progress"><i style="width:' + pct + '%"></i></div>' +
        '</div></div>';
      h += '<div class="sticky"><button class="btn" disabled aria-disabled="true">' +
        t('checkout') + ' · <span class="num">' + fmt(MIN_SPEND) + '</span> ' + t('min_title').toLowerCase() + '</button>' +
        '<p class="note" style="text-align:center;margin-top:.45rem">' +
        '<a href="#/buy/market" style="text-decoration:underline">' + t('browse') + '</a></p></div>';
      return shell(h, 'buy', 'basket', '');
    }

    h += '<div class="sticky"><a class="btn" href="#/buy/checkout">'+t('checkout')+' · <span class="num">'+fmt(cartTotal()+FEE)+'</span></a></div>';
    return shell(h, 'buy', 'basket', '');
  }

  function scheduleBlock() {
    var days = [{id:'today',lab:t('today')},{id:'tomorrow',lab:t('tomorrow')}]
      .concat(KASU.DAYS.slice(0,4).map(function(d){ return {id:d.id, lab:dayLabel(d.id)}; }));

    var h = '<div class="panel"><div class="lbl" style="margin-bottom:.5rem">'+t('when')+'</div>' +
      '<div class="dayrow">' + days.map(function (d) {
        return '<button class="daybtn'+(S.sched.day===d.id?' on':'')+'" onclick="KA.schedDay(\''+d.id+'\')">'+esc(d.lab)+'</button>';
      }).join('') + '</div>' +
      '<div class="lbl" style="margin:.9rem 0 .5rem">'+t('pick_time')+'</div>' +
      KASU.SLOTS.map(function (s) {
        return '<button class="slot'+(S.sched.slot===s.id?' on':'')+'" onclick="KA.schedSlot(\''+s.id+'\')">' +
          '<span class="rd"></span>'+I('clock')+
          '<span style="flex:1"><span class="nm" style="display:block">'+t(s.key)+'</span>' +
          '<span class="tm">'+t(s.timeKey)+'</span></span></button>';
      }).join('') + '</div>';
    return h;
  }

  function schedLabel(sc) {
    var d = (sc.day==='today') ? t('today') : (sc.day==='tomorrow' ? t('tomorrow') : dayLabel(sc.day));
    return d + ' · ' + t(slotOf(sc.slot).key) + ' (' + t(slotOf(sc.slot).timeKey) + ')';
  }

  function screenCheckout() {
    /* Guard the route as well as the button: the basket can drop below the
       minimum with the back button, and checkout must not be reachable then. */
    if (!Object.keys(S.cart).length || !meetsMin()) { location.hash='#/buy/basket'; return ''; }
    var total = cartTotal() + FEE;
    var h = head(t('checkout'), 'buy/basket');

    h += '<div class="panel"><div class="lbl">'+t('deliver_to')+'</div>' +
      '<div class="chips" style="padding:.5rem 0 0;margin:0">' + KASU.DISTRICTS.map(function(d){
        return '<button class="chip'+(S.district===d?' on':'')+'" onclick="KA.district(\''+d+'\')">'+d+'</button>';
      }).join('') + '</div></div>';

    h += scheduleBlock();

    h += '<div class="panel"><div class="lbl" style="margin-bottom:.5rem">'+t('payment')+'</div>' +
      [['card','receipt',t('pay_card'),t('pay_card_sub')],
       ['transfer','wallet',t('pay_transfer'),t('pay_transfer_sub')],
       ['cod','store',t('pay_cash'),t('pay_cash_sub')]].map(function(o){
        return '<button class="opt'+(S.pay===o[0]?' sel':'')+'" onclick="KA.pay(\''+o[0]+'\')">' +
          '<span class="rd"></span>'+I(o[1])+
          '<span style="text-align:left;flex:1"><span class="nm" style="display:block">'+esc(o[2])+'</span>' +
          '<span class="un">'+esc(o[3])+'</span></span></button>';
      }).join('') + '</div>';

    h += '<div class="panel">' + Object.keys(S.cart).map(function(id){
      var p=P(id);
      return '<div class="kv"><span>'+esc(p.name)+' × '+S.cart[id]+'</span><b class="num">'+fmt(p.price*S.cart[id])+'</b></div>';
    }).join('') +
      '<div class="kv"><span>'+t('delivery')+'</span><b class="num">'+fmt(FEE)+'</b></div>' +
      '<div class="kv"><span>'+t('scheduled_for')+'</span><b>'+esc(schedLabel(S.sched))+'</b></div>' +
      '<div class="kv tot"><span>'+t('total')+'</span><span class="num">'+fmt(total)+'</span></div></div>';

    /* the debit is approved here, explicitly, before anything happens */
    h += '<div class="panel rust"><div style="display:flex;align-items:center;gap:.7rem">' +
      '<span class="stamp sm">'+I('shield')+'</span>' +
      '<div><b style="font-size:.92rem">'+t('approve_debit')+'</b>' +
      '<div class="note">'+t('approve_sub')+'</div></div></div></div>';

    h += '<div class="sticky"><button class="btn" onclick="KA.placeOrder()">' +
      I('shield')+t('approve_debit')+' · <span class="num">'+fmt(total)+'</span></button>' +
      '<p class="note" style="text-align:center;margin-top:.4rem">'+t('demo_no_charge')+'</p></div>';
    return shell(h, 'buy', 'basket', '');
  }

  /* ============================================================
     BUYER — packages (fixed day, fixed time, repeats weekly)
     ============================================================ */
  function screenPackages() {
    var d = S.pkgDraft;
    var h = head(t('pkg_title'), 'buy/me');
    h += '<p class="pad tiny mut" style="margin:.1rem 0 0">'+t('pkg_sub')+'</p>';

    if (S.pkg) {
      var raw = S.pkg.items.reduce(function(a,id){ return a+P(id).price; },0);
      h += '<div class="panel dark"><div class="eye" style="color:var(--gold)">'+t('pkg_active')+'</div>' +
        '<h3 style="margin:.2rem 0 .1rem">'+esc(S.pkg.name)+'</h3>' +
        '<p class="tiny" style="color:var(--on-deep-2);margin:0 0 .3rem">' +
          t('pkg_every')+' '+esc(dayLabel(S.pkg.day))+' '+t('pkg_at')+' '+t(slotOf(S.pkg.slot).key) +
          ' ('+t(slotOf(S.pkg.slot).timeKey)+')</p>' +
        '<p class="tiny" style="color:var(--on-deep-2);margin:0 0 .7rem">' +
          S.pkg.items.length+' '+t('items')+' · <b class="num">'+fmt(raw*0.91+FEE)+'</b> / '+t('week')+'</p>' +
        '<button class="btn ghost" style="color:#fff;border-color:rgba(255,255,255,.4)" onclick="KA.pkgStop()">'+t('pkg_stop')+'</button></div>';
    }

    h += '<div class="sect"><h3>'+t('pkg_build')+'</h3></div>';

    h += '<div class="panel"><label for="pkgn" class="lbl" style="display:block;margin-bottom:.4rem">'+t('pkg_name')+'</label>' +
      '<input id="pkgn" value="'+esc(d.name)+'" oninput="KA.pkgName(this)" placeholder="'+t('pkg_name_ph')+'"></div>';

    h += '<div class="panel"><div class="lbl" style="margin-bottom:.5rem">'+t('pkg_day')+'</div>' +
      '<div class="dayrow">' + KASU.DAYS.map(function (x) {
        return '<button class="daybtn'+(d.day===x.id?' on':'')+'" onclick="KA.pkgField(\'day\',\''+x.id+'\')">'+esc(dayLabel(x.id))+'</button>';
      }).join('') + '</div>' +
      '<div class="lbl" style="margin:.9rem 0 .5rem">'+t('pkg_time')+'</div>' +
      KASU.SLOTS.map(function (s) {
        return '<button class="slot'+(d.slot===s.id?' on':'')+'" onclick="KA.pkgField(\'slot\',\''+s.id+'\')">' +
          '<span class="rd"></span>'+I('clock')+
          '<span style="flex:1"><span class="nm" style="display:block">'+t(s.key)+'</span>' +
          '<span class="tm">'+t(s.timeKey)+'</span></span></button>';
      }).join('') + '</div>';

    h += '<div class="sect"><h3>'+t('pkg_items')+'</h3><span class="m">'+d.items.length+'</span></div>';
    h += '<div class="chips" style="padding-top:0">' +
      '<button class="chip" onclick="KA.pkgKit(\'stewkit\')">+ '+esc(P('stewkit').name)+'</button>' +
      '<button class="chip" onclick="KA.pkgKit(\'greenskit\')">+ '+esc(P('greenskit').name)+'</button></div>';

    h += KASU.PRODUCTS.filter(function(p){ return p.cat!=='kits'; }).map(function (p) {
      var on = d.items.indexOf(p.id)>=0;
      return '<div class="row"><img class="th" src="'+IMG+p.img+'" alt="" loading="lazy">' +
        '<div class="bd"><div class="nm">'+esc(p.name)+'</div>' +
        '<div class="un num">'+fmt(p.price)+' · '+esc(p.unit)+'</div></div>' +
        '<button class="sw'+(on?' on':'')+'" role="switch" aria-checked="'+on+'" ' +
        'aria-label="'+esc(p.name)+'" onclick="KA.pkgToggle(\''+p.id+'\')"><i></i></button></div>';
    }).join('');

    if (d.items.length) {
      var r2 = d.items.reduce(function(a,id){ return a+P(id).price; },0);
      var disc = Math.round(r2*0.91);
      h += '<div class="panel">' +
        '<div class="kv"><span>'+d.items.length+' '+t('items')+'</span><b class="num">'+fmt(r2)+'</b></div>' +
        '<div class="kv"><span>-9%</span><b class="num" style="color:var(--ok)">−'+fmt(r2-disc)+'</b></div>' +
        '<div class="kv"><span>'+t('delivery')+'</span><b class="num">'+fmt(FEE)+'</b></div>' +
        '<div class="kv tot"><span>'+t('week')+'</span><span class="num">'+fmt(disc+FEE)+'</span></div></div>';
      h += '<div class="sticky"><button class="btn" onclick="KA.pkgStart()">'+I('weekly')+t('pkg_start')+'</button>' +
        '<div class="savenote">'+t('pkg_saving')+'</div></div>';
    }

    return shell(h, 'buy', 'me', '');
  }

  /* ============================================================
     BUYER — orders + tracking
     ============================================================ */
  function screenOrders() {
    var h = head(t('orders_title'), 'buy/me');
    if (!S.order) {
      h += '<div class="empty"><div class="ic">'+I('route','lg')+'</div>' +
        '<h3>'+t('no_orders')+'</h3><p>'+t('no_orders_sub')+'</p>' +
        '<a class="btn ghost" href="#/buy/market" style="max-width:15rem;margin:0 auto">'+t('browse')+'</a></div>';
      return shell(h, 'buy', 'me', '');
    }
    var o=S.order, done=o.step>=KASU.LEDGER.length-1;
    h += '<a class="panel" href="#/buy/track" style="display:block">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem">' +
      '<b style="font-size:.95rem">#'+esc(o.id)+'</b>' +
      '<span class="pill '+(done?'leaf':'rust')+'">'+(done?t('delivered'):t('in_progress'))+'</span></div>' +
      '<p class="note" style="margin:.3rem 0 .6rem">'+esc(KASU.LEDGER[o.step].t)+' · '+o.items.length+' '+t('items')+
      ' · <span class="num">'+fmt(o.total)+'</span></p>' +
      '<span class="btnsm">'+t('track_order')+' '+I('right')+'</span></a>';
    return shell(h, 'buy', 'me', '');
  }

  function rejectLine(o) {
    var r=0; for (var k in o.rejected) r+=o.rejected[k];
    return r ? (r+' '+t('items')) : '—';
  }

  function screenTrack() {
    if (!S.order) { location.hash='#/buy/orders'; return ''; }
    var o = S.order, done = o.step>=KASU.LEDGER.length-1;
    var h = head('#'+esc(o.id), 'buy/orders');

    h += '<div class="panel flat" style="display:flex;justify-content:space-between;align-items:center;gap:.6rem">' +
      '<span class="pill '+(done?'leaf':'rust')+'">' +
      (done ? t('delivered') : t('arriving')+' ~'+(40-o.step*7)+' min') + '</span>' +
      '<span class="note">'+esc(S.district)+'</span></div>';

    if (o.sched) {
      h += '<div class="panel" style="display:flex;align-items:center;gap:.7rem">'+I('clock')+
        '<div><b style="font-size:.88rem">'+t('scheduled_for')+'</b>' +
        '<div class="note">'+esc(schedLabel(o.sched))+'</div></div></div>';
    }

    h += '<div class="ledger"><div class="lh"><span class="eye">'+t('ledger')+'</span></div>';
    h += KASU.LEDGER.map(function (s, i) {
      var cls = i<o.step ? 'done' : (i===o.step ? 'now' : '');
      var proof = (s.proof && i<=o.step) ?
        '<div class="receipt"><img src="'+IMG+'handsBowl.jpg" alt="Inspection photo taken at the stall">' +
        '<div class="rb"><div class="rh"><span class="stamp sm">'+I('check')+'</span>' +
        '<b style="font-size:.8rem">Ngozi A. · Stall 4</b></div>' +
        '<div class="rl"><span>'+t('checked_at')+'</span><b class="num">07:42</b></div>' +
        '<div class="rl"><span>'+t('list_missing')+'</span><b>'+rejectLine(o)+'</b></div>' +
        '</div></div>' : '';
      return '<div class="lg '+cls+'"><span class="tm">'+s.tm+'</span>' +
        '<span class="rail"><span class="d">'+(i<o.step?I('check'):'')+'</span><span class="ln"></span></span>' +
        '<div class="bd"><div class="t">'+esc(s.t)+'</div><div class="s">'+esc(s.s)+'</div>'+proof+'</div></div>';
    }).join('') + '</div>';

    if (o.step>=4) {
      h += '<div class="rider"><span class="av"><img src="'+IMG+'rider.jpg" alt=""></span>' +
        '<div><div class="nm">Ibrahim · '+t('rider')+'</div><div class="sb">Honda Ace · KJA 442 YY</div></div>' +
        '<a class="call" href="tel:08000000000" aria-label="'+t('call_rider')+'">'+I('phone')+'</a></div>';
    }

    h += '<div class="panel"><div class="lbl" style="margin-bottom:.35rem">'+t('in_this_order')+'</div>' +
      o.items.map(function(it){ var p=P(it.id);
        return '<div class="kv"><span>'+esc(p.name)+' × '+it.qty+'</span><b class="num">'+fmt(p.price*it.qty)+'</b></div>';
      }).join('') +
      '<div class="kv tot"><span>'+t('paid')+'</span><span class="num">'+fmt(o.total)+'</span></div></div>';

    if (done) {
      if (!o.collected) {
        h += '<div class="panel gold" style="text-align:center">' +
          '<h3>'+(S.streak+1)+' '+t('weeks_fresh')+'</h3>' +
          '<p class="tiny mut" style="margin:.25rem 0 .7rem">+'+o.earned+' '+t('points_label')+'</p>' +
          '<button class="btn leaf" onclick="KA.collect()">'+I('star')+t('collect')+'</button></div>';
      }
      h += o.flagged
        ? '<div class="panel leaf" style="display:flex;gap:.7rem;align-items:center">' +
          '<span class="stamp sm leaf">'+I('check')+'</span>' +
          '<span class="tiny" style="font-weight:600">'+t('flagged_ok')+'</span></div>'
        : '<div class="panel"><h3>'+t('flag_title')+'</h3>' +
          '<p class="tiny mut" style="margin:.25rem 0 .7rem">'+t('flag_sub')+'</p>' +
          '<button class="btn dark" onclick="KA.flag()">'+I('flag')+t('flag_cta')+'</button></div>';
    }

    return shell(h, 'buy', 'me', '');
  }

  /* ============================================================
     BUYER — Me (settings hub: language, text size, orders, packages)
     ============================================================ */
  function screenMe() {
    var h = head(t('me_title'));

    h += '<div class="panel dark" style="text-align:center">' +
      '<div style="display:flex;justify-content:center;margin-bottom:.5rem"><span class="stamp">'+I('streak')+'</span></div>' +
      '<h3 style="font-size:1.7rem">'+S.streak+' '+t('weeks_fresh')+'</h3>' +
      '<div class="pips" style="max-width:14rem;margin:.6rem auto 0">' +
      [0,1,2,3,4,5].map(function(i){ return '<i class="'+(i<(S.streak%6||6)?'on':'')+'"></i>'; }).join('') + '</div></div>';

    h += '<div class="panel gold" style="display:flex;align-items:center;gap:.75rem">' +
      '<span class="stamp sm">'+I('star')+'</span>' +
      '<div style="flex:1"><div class="num" style="font-family:var(--f-display);font-weight:800;font-size:1.4rem">'+S.points.toLocaleString()+'</div>' +
      '<div class="note">'+t('points_worth')+'</div></div>' +
      '<button class="btnsm" onclick="KA.redeem()">'+t('redeem')+'</button></div>';

    /* language — the reason this app exists for a lot of people */
    h += '<div class="sect"><h3>'+t('language')+'</h3></div>';
    h += '<div class="panel"><div class="langrow">' + KL.LANGS.map(function (L) {
      return '<button class="langbtn'+(KL.getLang()===L.id?' on':'')+'" onclick="KA.lang(\''+L.id+'\')">' +
        '<span>'+esc(L.native)+'</span>'+I('check','tick')+'</button>';
    }).join('') + '</div>' +
    '<p class="note" style="margin-top:.6rem">'+t('lang_note')+'</p></div>';

    h += '<div class="sect"><h3>'+t('text_size')+'</h3></div>';
    h += '<div class="panel"><div class="sizerow">' +
      [['md',t('text_normal')],['lg',t('text_large')],['xl',t('text_xlarge')]].map(function (x) {
        return '<button class="sizebtn'+(S.scale===x[0]?' on':'')+'" onclick="KA.scale(\''+x[0]+'\')">' +
          '<span class="a">Aa</span><span class="l">'+esc(x[1])+'</span></button>';
      }).join('') + '</div></div>';

    h += '<div class="sect"><h3>'+t('my_orders')+'</h3></div>';
    h += '<a class="panel" href="#/buy/orders" style="display:flex;align-items:center;gap:.7rem">' +
      I('route','lg')+'<span style="flex:1"><b style="font-size:.92rem">'+t('orders_title')+'</b>' +
      '<div class="note">'+(S.order ? '#'+esc(S.order.id) : t('no_orders'))+'</div></span>'+I('right')+'</a>';

    h += '<a class="panel" href="#/buy/packages" style="display:flex;align-items:center;gap:.7rem">' +
      I('weekly','lg')+'<span style="flex:1"><b style="font-size:.92rem">'+t('my_packages')+'</b>' +
      '<div class="note">'+(S.pkg
        ? esc(S.pkg.name)+' · '+t('pkg_every')+' '+esc(dayLabel(S.pkg.day))
        : t('pkg_none'))+'</div></span>'+I('right')+'</a>';

    h += '<button class="panel" style="display:flex;align-items:center;gap:.7rem;width:calc(100% - 2rem);text-align:left" onclick="KA.showWelcome()">' +
      I('refresh','lg')+'<span style="flex:1"><b style="font-size:.92rem">'+t('w_lang')+'</b>' +
      '<div class="note">'+t('w_change')+'</div></span>'+I('right')+'</button>';

    h += '<div class="sect"><h3>'+t('guarantee')+'</h3></div>';
    h += '<div class="panel" style="padding:0;overflow:hidden">' +
      '<img src="'+IMG+'qualityHands.jpg" alt="A checker weighing tomatoes by hand at the stall" ' +
      'style="width:100%;height:8rem;object-fit:cover" loading="lazy"></div>';
    h += '<div class="panel">' +
      [[t('g1'),t('g1s')],[t('g2'),t('g2s')],[t('g3'),t('g3s')]].map(function(r){
        return '<div style="display:flex;gap:.6rem;padding:.5rem 0;border-bottom:1px solid var(--line)">' +
          '<span class="stamp sm leaf" style="width:1.5rem;height:1.5rem">'+I('check')+'</span>' +
          '<span><b style="font-size:.88rem">'+esc(r[0])+'</b><br><span class="note">'+esc(r[1])+'</span></span></div>';
      }).join('') + '</div>';

    return shell(h, 'buy', 'me', '');
  }

  /* ============================================================
     SELLER
     ============================================================ */
  function sellerBar(sub) {
    var V = KASU.SELLER;
    return '<div class="opsbar">'+I('store')+'<span class="r">'+esc(V.name)+'</span>' +
      '<span class="w">'+esc(V.stall)+'<br>'+esc(sub||V.since)+'</span></div>';
  }

  function screenSellerDemand() {
    var V = KASU.SELLER;
    var accepted = V.demand.filter(function(d){ return S.accepted[d.id]; }).length;
    var value = V.demand.reduce(function(s,d){ return s + P(d.id).price*d.qty*0.72; }, 0);

    var h = '<div class="kpis">' +
      '<div class="kpi leaf"><div class="l">'+t('nav_demand')+'</div><div class="v num">'+V.demand.length+'</div>' +
      '<div class="dl good">'+I('up')+'guaranteed volume</div></div>' +
      '<div class="kpi gold"><div class="l">Worth to you</div><div class="v num">'+fmt(value)+'</div>' +
      '<div class="dl">'+esc(V.nextPayout)+'</div></div></div>';

    h += '<div class="panel" style="padding:0;overflow:hidden">' +
      '<img src="'+IMG+'vendor.jpg" alt="The stall at Wuse Market" style="width:100%;height:7rem;object-fit:cover" loading="lazy"></div>';

    h += '<div class="panel rust"><b style="font-size:.92rem">Why this screen exists</b>' +
      '<p class="tiny mut" style="margin:.25rem 0 0">Kasua tells you what it needs <b>before</b> the market opens, so you can hold back your best stock instead of putting it on the front table. ' +
      'You get certainty, we get first pick.</p></div>';

    h += '<div class="sect"><h3>Confirm what you can supply</h3><span class="m">'+accepted+'/'+V.demand.length+'</span></div>';
    h += '<div>' + V.demand.map(function (d) {
      var p = P(d.id), on = !!S.accepted[d.id];
      return '<div class="row"><img class="th" src="'+IMG+p.img+'" alt="" loading="lazy">' +
        '<div class="bd"><div class="nm">'+esc(p.name)+'</div>' +
        '<div class="un"><b class="num">'+d.qty+'</b> needed · '+esc(p.unit)+
        (d.locked ? ' · <span class="pill leaf">'+I('shield')+'fixed</span>' : '')+'</div></div>' +
        '<button class="btnsm'+(on?' on':'')+'" onclick="KA.accept(\''+d.id+'\')">'+(on?I('check')+t('added'):t('confirm'))+'</button></div>';
    }).join('') + '</div>';

    h += '<div class="sticky"><button class="btn leaf" onclick="KA.acceptAll()">'+I('check')+'Accept all '+V.demand.length+'</button>' +
      '<p class="note" style="text-align:center;margin-top:.4rem">Fixed lines come from customers on a weekly package</p></div>';

    return shell(h, 'sell', 'demand', sellerBar());
  }

  function screenSellerPickups() {
    if (!S.order) {
      var e = '<div class="empty"><div class="ic">'+I('scale','lg')+'</div><h3>No live pickup</h3>' +
        '<p>Place an order in the buyer app — it lands here as a pick list to fill.</p>' +
        '<a class="btn ghost" href="#/buy/market" style="max-width:15rem;margin:0 auto">Open the buyer app</a></div>';
      return shell(e, 'sell', 'pickups', sellerBar('Nothing waiting'));
    }

    var o=S.order, good=0, rej=0;
    for (var k in o.picked) good+=o.picked[k];
    for (var j in o.rejected) rej+=o.rejected[j];
    var rate = (good+rej) ? Math.round(rej/(good+rej)*100) : 0;

    var h = '<div class="kpis">' +
      '<div class="kpi leaf"><div class="l">Accepted</div><div class="v num">'+good+'</div></div>' +
      '<div class="kpi bad"><div class="l">Rejected</div><div class="v num">'+rej+'</div></div>' +
      '<div class="kpi '+(rate>=15?'bad':rate>=9?'gold':'leaf')+'"><div class="l">This pickup</div><div class="v num">'+rate+'%</div></div>' +
      '<div class="kpi"><div class="l">'+esc(S.district)+'</div><div class="v num">#'+esc(o.id.split('-')[1])+'</div></div></div>';

    h += '<div class="sect"><h3>Pick list</h3><span class="m">'+o.items.length+'</span></div>';
    h += o.items.map(function (it) {
      var p=P(it.id), g=o.picked[it.id]||0, r=o.rejected[it.id]||0;
      var cls = g>=it.qty ? ' ok' : (r ? ' rej' : '');
      return '<div class="pick'+cls+'"><img class="th" src="'+IMG+p.img+'" alt="" loading="lazy">' +
        '<div class="bd"><div class="nm">'+esc(p.name)+' <span class="pill grey">×'+it.qty+'</span></div>' +
        '<div class="un"><b class="num">'+g+'</b> ok · <b class="num">'+r+'</b> rejected</div></div>' +
        '<div class="cnt"><button class="g" onclick="KA.pickPlus(\''+it.id+'\')" aria-label="Accept one">'+I('check')+'</button>' +
        '<button class="r" onclick="KA.rejectPlus(\''+it.id+'\')" aria-label="Reject one">'+I('x')+'</button></div></div>';
    }).join('');

    h += '<div class="panel"><div class="lbl">The rule</div>' +
      '<p class="tiny mut" style="margin:.3rem 0 0">Never hand over a pre-packed bag. Every item is picked in front of the checker, rejects pulled before payment, ' +
      'the basket photographed, then it goes.</p></div>';

    h += '<div class="sticky">' + (o.dispatched
      ? '<div class="panel leaf flat" style="margin:0;text-align:center"><b style="font-size:.88rem">Dispatched · photo is on the buyer’s order</b></div>'
      : '<button class="btn leaf" onclick="KA.dispatch()">'+I('camera')+'Attach photo &amp; dispatch</button>') + '</div>';

    return shell(h, 'sell', 'pickups', sellerBar('Pickup in progress'));
  }

  function screenSellerScore() {
    var V = KASU.SELLER, series = V.rejectSeries, max = Math.max.apply(null, series);
    var h = '<div class="kpis">' +
      '<div class="kpi '+(V.rejectWeek>=15?'bad':V.rejectWeek>=9?'gold':'leaf')+'">' +
      '<div class="l">Rejection this week</div><div class="v num">'+V.rejectWeek+'%</div>' +
      '<div class="dl good">'+I('down')+'best of '+V.ofStalls+'</div></div>' +
      '<div class="kpi leaf"><div class="l">Rank</div><div class="v num">#'+V.rank+'</div>' +
      '<div class="dl good">first pick on new lines</div></div></div>';

    h += '<div class="panel"><div class="lbl">Rejection rate · '+t('last_12')+'</div>' +
      '<div class="spark" role="img" aria-label="Rejection rate fell from 11% to 6%">' +
      series.map(function (v) {
        return '<i class="'+(v>=15?'bad':v>=9?'warn':'hi')+'" style="height:'+Math.round(v/max*100)+'%"></i>';
      }).join('') + '</div>' +
      '<div style="display:flex;justify-content:space-between" class="note"><span>'+series[0]+'%</span><span>'+series[series.length-1]+'%</span></div>' +
      '<p class="tiny mut" style="margin:.6rem 0 0">Below 9% is standard. Two consecutive weeks above 15% and the stall comes off the list.</p></div>';

    h += '<div class="sect"><h3>What we refused, and why</h3></div>';
    h += V.rejections.map(function (r) {
      return '<div class="row"><img class="th" src="'+IMG+r.img+'" alt="" loading="lazy">' +
        '<div class="bd"><div class="nm">'+esc(P(r.id).name)+' <span class="pill bad">'+r.n+'</span></div>' +
        '<div class="un">'+esc(r.why)+'</div></div></div>';
    }).join('');

    h += '<div class="panel leaf"><b style="font-size:.92rem">Why you get told</b>' +
      '<p class="tiny mut" style="margin:.25rem 0 0">A rejection with no reason just costs you money. A rejection with a reason tells you what to stop sending — ' +
      'which is how your rate went from 11% to 6%.</p></div>';

    return shell(h, 'sell', 'score', sellerBar('Scored weekly'));
  }

  function screenSellerPayouts() {
    var V = KASU.SELLER;
    var h = '<div class="kpis">' +
      '<div class="kpi leaf"><div class="l">Earned this week</div><div class="v num">'+fmt(V.earnedWeek)+'</div></div>' +
      '<div class="kpi gold"><div class="l">Pending</div><div class="v num">'+fmt(V.pendingPayout)+'</div>' +
      '<div class="dl">clears '+esc(V.nextPayout)+'</div></div></div>';

    h += '<div class="sect"><h3>Payout history</h3></div>';
    h += V.payouts.map(function (p) {
      return '<div class="row"><span class="stamp sm '+(p.st==='paid'?'leaf':'')+'">'+I(p.st==='paid'?'check':'clock')+'</span>' +
        '<div class="bd" style="margin-left:.5rem"><div class="nm num">'+fmt(p.amt)+'</div>' +
        '<div class="un">'+esc(p.d)+'</div></div>' +
        '<span class="pill '+(p.st==='paid'?'leaf':'gold')+'">'+p.st+'</span></div>';
    }).join('');

    h += '<div class="panel dark"><div class="eye" style="color:var(--gold)">The trade, plainly</div>' +
      '<h3 style="margin:.2rem 0">Certainty, for first pick</h3>' +
      '<p class="tiny" style="color:var(--on-deep-2);margin:0">You know Wednesday’s volume on Monday and get paid twice a week without chasing. ' +
      'In exchange the checker picks every item and refuses what does not pass. Nobody pretends that costs you nothing.</p></div>';

    return shell(h, 'sell', 'payouts', sellerBar('Paid twice weekly'));
  }

  /* ============================================================
     ADMIN
     ============================================================ */
  function opsBar(sub) {
    return '<div class="opsbar">'+I('grid')+'<span class="r">Kasua Ops</span>' +
      '<span class="w">Abuja · week 33<br>'+esc(sub||'live')+'</span></div>';
  }
  function sparkline(series, invert) {
    var max = Math.max.apply(null, series);
    return '<div class="spark">' + series.map(function (v) {
      return '<i class="'+(invert ? (v>=7?'bad':v>=6?'warn':'hi') : 'hi')+'" style="height:'+Math.max(Math.round(v/max*100),6)+'%"></i>';
    }).join('') + '</div>';
  }

  function screenOpsToday() {
    var open = KASU.FLAGS.filter(function(f){ return f.st==='open'; }).length;
    var h = '<div class="kpis">' +
      '<div class="kpi"><div class="l">Orders this week</div><div class="v num">41</div><div class="dl good">'+I('up')+'8%</div></div>' +
      '<div class="kpi leaf"><div class="l">On a package</div><div class="v num">28</div><div class="dl good">'+I('up')+'68%</div></div>' +
      '<div class="kpi bad"><div class="l">Spoilage cost</div><div class="v num">5.2%</div><div class="dl good">'+I('down')+'from 7.8%</div></div>' +
      '<div class="kpi gold"><div class="l">Flags to settle</div><div class="v num">'+open+'</div></div></div>';

    h += '<div class="panel"><div class="lbl">Orders per week · '+t('last_12')+'</div>' + sparkline(KASU.ORDERS_SERIES) +
      '<div style="display:flex;justify-content:space-between" class="note"><span>18</span><span>41</span></div></div>';

    h += '<div class="panel"><div class="lbl">Spoilage as % of spend · '+t('last_12')+'</div>' + sparkline(KASU.SPOIL_SERIES, true) +
      '<div style="display:flex;justify-content:space-between" class="note"><span>7.8%</span><span>5.2%</span></div>' +
      '<p class="tiny mut" style="margin:.55rem 0 0">Priced into margin, not wished away. A model that assumes zero spoilage fails its first bad week.</p></div>';

    h += '<div class="sect"><h3>Today’s runs</h3></div>';
    h += KASU.RUNS.map(function (r) {
      var tone = r.status==='dispatched' ? 'leaf' : (r.status==='picking' ? 'rust' : 'grey');
      return '<div class="row"><span class="stamp sm '+(tone==='leaf'?'leaf':'')+'">'+I('route')+'</span>' +
        '<div class="bd" style="margin-left:.5rem"><div class="nm">#'+esc(r.id)+'</div>' +
        '<div class="un">'+esc(r.district)+' · '+r.items+' '+t('items')+'</div></div>' +
        '<span class="pill '+tone+'">'+esc(r.status)+'</span></div>';
    }).join('');

    return shell(h, 'ops', 'today', opsBar());
  }

  function screenOpsVendors() {
    var h = '<div class="panel"><div class="lbl">The only score that matters</div>' +
      '<p class="tiny mut" style="margin:.3rem 0 0">Rejection rate is the share of stock refused at the stall. Low is good.</p></div>';
    h += '<div class="sect"><h3>Vendor scorecard</h3></div>';
    h += '<div class="panel"><table class="tbl"><thead><tr><th>Stall</th><th>Week</th><th>13-wk</th><th>Flags</th></tr></thead><tbody>' +
      KASU.VENDORS.map(function (v) {
        var cls = v.week>=15 ? 'bad' : (v.week>=9 ? 'warn' : '');
        return '<tr><td><b>'+esc(v.name)+'</b>' + (v.dropped ? ' <span class="pill bad">Dropped</span>' : '') +
          '<div class="bar2"><i class="'+cls+'" style="width:'+Math.min(v.week*5,100)+'%"></i></div>' +
          '<div class="note" style="margin-top:.15rem">'+esc(v.covers)+'</div></td>' +
          '<td><b class="num">'+v.week+'%</b></td><td class="num">'+v.avg+'%</td><td class="num">'+v.flags+'</td></tr>';
      }).join('') + '</tbody></table>' +
      '<p class="tiny mut" style="margin:.7rem 0 0">Two consecutive weeks above 15% and the stall comes off the list. Stall 7 was dropped in March — published, because a scorecard nobody fails is a scorecard nobody is running.</p></div>';
    return shell(h, 'ops', 'vendors', opsBar('scored weekly'));
  }

  function screenOpsQuality() {
    var h = '<div class="kpis">' +
      '<div class="kpi leaf"><div class="l">Flags this week</div><div class="v num">3</div><div class="dl good">'+I('down')+'0.7% of items</div></div>' +
      '<div class="kpi gold"><div class="l">Avg. settle time</div><div class="v num">14m</div></div></div>';
    h += '<div class="sect"><h3>Flag queue</h3></div>';
    h += KASU.FLAGS.map(function (f) {
      var tone = f.st==='open' ? 'gold' : (f.st==='replaced' ? 'leaf' : 'grey');
      return '<div class="row"><span class="stamp sm">'+I('flag')+'</span>' +
        '<div class="bd" style="margin-left:.5rem"><div class="nm">'+esc(f.item)+'</div>' +
        '<div class="un">#'+esc(f.id)+' · '+esc(f.why)+' · '+esc(f.vendor)+'</div></div>' +
        '<span class="pill '+tone+'">'+esc(f.st)+'</span></div>';
    }).join('');
    h += '<div class="panel"><div class="lbl">Where the cost lands</div>' +
      [['Rejected at the stall','The vendor absorbs it. That is what being on the list costs.'],
       ['Missed by the checker','Kasua absorbs it, and it is logged against the checker.'],
       ['Never the customer','If they have to inspect it, we already failed at the thing they paid for.']]
      .map(function (r) {
        return '<div style="display:flex;gap:.6rem;padding:.5rem 0;border-bottom:1px solid var(--line)">' +
          '<span class="stamp sm leaf" style="width:1.5rem;height:1.5rem">'+I('check')+'</span>' +
          '<span><b style="font-size:.88rem">'+r[0]+'</b><br><span class="note">'+r[1]+'</span></span></div>';
      }).join('') + '</div>';
    return shell(h, 'ops', 'quality', opsBar('flag queue'));
  }

  function screenOpsZones() {
    var max = Math.max.apply(null, KASU.ZONES.map(function(z){ return z.orders; }));
    var h = '<div class="panel"><div class="lbl">Orders by district · this week</div>' +
      '<table class="tbl" style="margin-top:.4rem"><thead><tr><th>District</th><th>Orders</th><th>Weekly</th></tr></thead><tbody>' +
      KASU.ZONES.map(function (z) {
        return '<tr><td><b>'+esc(z.d)+'</b><div class="bar2"><i style="width:'+Math.round(z.orders/max*100)+'%"></i></div></td>' +
          '<td><b class="num">'+z.orders+'</b></td><td class="num">'+z.weekly+'</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<div class="panel gold"><b style="font-size:.92rem">Gwarinpa is the decision</b>' +
      '<p class="tiny mut" style="margin:.25rem 0 0">Three orders a week does not cover a rider on that route. Either it clusters to eight by week 36 or it comes off the map.</p></div>';
    h += '<div class="panel dark"><div class="eye" style="color:var(--gold)">Honest constraint</div>' +
      '<h3 style="margin:.2rem 0">One checker, one market</h3>' +
      '<p class="tiny" style="color:var(--on-deep-2);margin:0">Every number here rests on one person being at Wuse Market at 06:15. ' +
      'A second checker is the real unlock for a sixth district — not more app features.</p></div>';
    return shell(h, 'ops', 'zones', opsBar('coverage'));
  }

  /* ---------------- router ---------------- */
  var R = {
    'welcome':screenWelcome,
    'buy/market':screenMarket, 'buy/prices':screenPrices, 'buy/list':screenList,
    'buy/basket':screenBasket, 'buy/checkout':screenCheckout, 'buy/packages':screenPackages,
    'buy/orders':screenOrders, 'buy/track':screenTrack, 'buy/me':screenMe,
    'sell/demand':screenSellerDemand, 'sell/pickups':screenSellerPickups,
    'sell/score':screenSellerScore, 'sell/payouts':screenSellerPayouts,
    'ops/today':screenOpsToday, 'ops/vendors':screenOpsVendors,
    'ops/quality':screenOpsQuality, 'ops/zones':screenOpsZones
  };
  var HOME = { buy:'buy/market', sell:'sell/demand', ops:'ops/today' };

  function route() {
    var r = (location.hash || '').replace(/^#\/?/, '');
    /* First run lands on welcome whatever the URL says — but only for the
       buyer. Someone opening the seller or admin view is not a new shopper
       and should not be asked to pick a delivery district. */
    if (!S.seen && (r === '' || r === 'welcome' || r.indexOf('buy') === 0)) return 'welcome';
    if (R[r]) return r;
    if (HOME[r]) return HOME[r];
    return S.seen ? 'buy/market' : 'welcome';
  }

  function render() {
    var r = route(), root = document.getElementById('root');
    var prev = root.querySelector('.scroll');
    var top = prev ? prev.scrollTop : 0;
    var same = root.getAttribute('data-r') === r;
    var focusId = document.activeElement && document.activeElement.id;

    root.innerHTML = R[r]();
    root.setAttribute('data-r', r);
    if (same) {
      var sc = root.querySelector('.scroll'); if (sc) sc.scrollTop = top;
      /* keep the caret where it was — re-rendering under a typing user is rude */
      if (focusId) { var f = document.getElementById(focusId); if (f) { f.focus(); if (f.setSelectionRange) { var v=f.value.length; f.setSelectionRange(v,v); } } }
    }

    var role = r.split('/')[0];
    document.querySelectorAll('.demobar a[data-role]').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-role') === role);
    });
    if (r === 'buy/market') startCountdown();
  }

  window.addEventListener('hashchange', render);
  load();
  if (S.order && S.order.step < KASU.LEDGER.length - 1) startClock();
  render();
})();
