/* Kasu — demo app. Hash-routed, no build step, no dependencies.
   Three roles share one state so the demo actually hangs together:
     #/buy/*   buyer   — orders, watches the ledger, flags a bad item
     #/sell/*  seller  — the market vendor: tomorrow's demand, score, payouts
     #/ops/*   admin   — vendor scoring, spoilage, flags queue, zones
   A rejection logged by the seller shows up in ops. A buyer's flag lands
   on the vendor's scorecard. That loop is the product.                     */
(function () {
  'use strict';

  var IMG = 'assets/images/';
  var FEE = 800;
  var STORE = 'kasu-demo-v2';
  var I = KI.icon, MARK = KI.mark;

  /* ---------------- state ---------------- */
  var S;
  function blank() {
    return {
      cart:{}, weekly:[], day:'Wed', district:'Wuse II', pay:'transfer', cat:'all',
      order:null, weeklyOn:false,
      points:1240, streak:5,            /* engagement */
      accepted:{},                       /* seller: demand lines accepted */
      lastBasket:['tombasket','tatashe','rodo','onion']
    };
  }
  function load() {
    try { S = JSON.parse(localStorage.getItem(STORE)) || blank(); }
    catch (e) { S = blank(); }
    if (!S || !S.cart) S = blank();
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }
  window.resetDemo = function () {
    S = blank(); stopClock(); save(); location.hash = '#/buy/market'; render(); toast('Demo reset');
  };

  /* ---------------- helpers ---------------- */
  function fmt(n) { return '₦' + Math.round(n).toLocaleString('en-NG'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]; }); }
  function P(id) { for (var i=0;i<KASU.PRODUCTS.length;i++) if (KASU.PRODUCTS[i].id===id) return KASU.PRODUCTS[i]; }
  function cartCount() { var n=0; for (var k in S.cart) n+=S.cart[k]; return n; }
  function cartTotal() { var t=0; for (var k in S.cart) t+=P(k).price*S.cart[k]; return t; }
  function weeklyTotal() { var t=0; S.weekly.forEach(function(id){ t+=P(id).price; }); return t; }
  function pointsFor(total) { return Math.round(total / 100); }

  var tTimer;
  function toast(msg, ok) {
    var old = document.querySelector('.toast'); if (old) old.remove();
    var el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = (ok === false ? '' : I('check')) + '<span>' + esc(msg) + '</span>';
    document.body.appendChild(el);
    clearTimeout(tTimer); tTimer = setTimeout(function(){ el.remove(); }, 2000);
  }

  /* a dot flies from the tapped card to the basket tab — cheap, and it lands */
  function fly(ev) {
    if (!ev || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var target = document.querySelector('.nav a[data-t="basket"]') || document.querySelector('.iconbtn');
    if (!target) return;
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

  /* ---------------- actions ---------------- */
  var A = {}; window.KA = A;

  A.add = function (id, ev) { fly(ev); S.cart[id]=(S.cart[id]||0)+1; save(); render(); };
  A.dec = function (id) { if(!S.cart[id])return; S.cart[id]--; if(S.cart[id]<=0) delete S.cart[id]; save(); render(); };
  A.cat = function (c) { S.cat=c; save(); render(); };
  A.district = function (d) { S.district=d; save(); render(); };
  A.pay = function (p) { S.pay=p; save(); render(); };
  A.day = function (d) { S.day=d; save(); render(); };

  A.reorder = function () {
    S.lastBasket.forEach(function(id){ S.cart[id]=(S.cart[id]||0)+1; });
    save(); render(); toast('Your usual basket is back'); location.hash = '#/buy/basket';
  };

  A.toggleWeekly = function (id) {
    var i = S.weekly.indexOf(id);
    if (i>=0) S.weekly.splice(i,1); else S.weekly.push(id);
    save(); render();
  };
  A.addKit = function (kit) {
    KASU.KITS[kit].forEach(function(id){ if(S.weekly.indexOf(id)<0) S.weekly.push(id); });
    save(); render(); toast('Kit added');
  };
  A.startWeekly = function () {
    if(!S.weekly.length) return;
    S.weeklyOn = true; save(); render(); toast('Weekly basket set for every ' + S.day);
  };
  A.stopWeekly = function () { S.weeklyOn=false; save(); render(); toast('Weekly basket cancelled', false); };

  A.placeOrder = function () {
    var items=[]; for (var k in S.cart) items.push({ id:k, qty:S.cart[k] });
    if (!items.length) return;
    var total = cartTotal() + FEE;
    S.order = { id:'KS-'+(2481+Math.floor(Math.random()*60)), step:0, items:items,
                total:total, flagged:false, picked:{}, rejected:{}, dispatched:false,
                earned:pointsFor(total) };
    S.cart = {}; save();
    location.hash = '#/buy/track'; startClock();
  };

  A.flag = function () {
    if(!S.order) return;
    S.order.flagged = true; save(); render(); toast('Flagged — replaced on the next run');
  };

  A.collect = function () {
    if(!S.order || S.order.collected) return;
    S.order.collected = true; S.points += S.order.earned; S.streak += 1;
    save(); render(); toast('+' + S.order.earned + ' Kasu points');
  };

  /* seller */
  A.accept = function (id) { S.accepted[id] = !S.accepted[id]; save(); render(); };
  A.acceptAll = function () {
    KASU.SELLER.demand.forEach(function(d){ S.accepted[d.id]=true; });
    save(); render(); toast('Tomorrow’s demand accepted');
  };

  /* checker-style picking, kept inside the seller role's pickup screen */
  A.pickPlus   = function (id) { if(!S.order)return; S.order.picked[id]=(S.order.picked[id]||0)+1; save(); render(); };
  A.rejectPlus = function (id) { if(!S.order)return; S.order.rejected[id]=(S.order.rejected[id]||0)+1; save(); render(); };
  A.dispatch = function () {
    if(!S.order) return;
    S.order.dispatched = true; if (S.order.step<4) S.order.step=4;
    save(); render(); toast('Photo attached · rider dispatched');
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

  /* live countdown to the 6pm cut-off — updated in place, no re-render */
  var cdTimer=null;
  function cutoffText() {
    var now=new Date(), end=new Date(now); end.setHours(18,0,0,0);
    if (end<=now) end.setDate(end.getDate()+1);
    var s=Math.floor((end-now)/1000);
    var h=Math.floor(s/3600), m=Math.floor(s%3600/60), ss=s%60;
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
        '<div class="wm">' + MARK() + 'Kasu</div>' +
        '<div class="loc">' + I('pin') + esc(S.district) + ' · delivering today</div>' +
      '</div>' +
      '<a class="iconbtn" href="#/buy/basket" aria-label="Basket, ' + n + ' items">' + I('basket') +
        (n ? '<span class="dot num">' + n + '</span>' : '') + '</a>' +
      '</div>' +
      '<div class="searchb">' + I('search') + '<span>Search tomatoes, ugu, catfish…</span></div>' +
      '<div class="cutoff">' + I('clock') + '<span>Market closes for tomorrow in</span>' +
        '<span class="t num">' + cutoffText() + '</span></div>' +
      '</div>';
  }

  var NAVS = {
    buy:[ {r:'market',i:'market',l:'Market'}, {r:'weekly',i:'weekly',l:'Weekly'},
          {r:'basket',i:'basket',l:'Basket',badge:true}, {r:'orders',i:'route',l:'Orders'},
          {r:'you',i:'user',l:'You'} ],
    sell:[{r:'demand',i:'box',l:'Demand'}, {r:'pickups',i:'scale',l:'Pickups'},
          {r:'score',i:'shield',l:'Score'}, {r:'payouts',i:'wallet',l:'Payouts'} ],
    ops:[ {r:'today',i:'grid',l:'Today'}, {r:'vendors',i:'store',l:'Vendors'},
          {r:'quality',i:'flag',l:'Quality'}, {r:'zones',i:'chart',l:'Zones'} ]
  };

  function nav(role, active) {
    var n = cartCount();
    return '<nav class="nav">' + NAVS[role].map(function (t) {
      return '<a href="#/' + role + '/' + t.r + '" data-t="' + t.r + '" class="' + (t.r===active?'on':'') + '">' +
        I(t.i) + '<span>' + t.l + '</span>' +
        (t.badge && n ? '<span class="dot num">' + n + '</span>' : '') + '</a>';
    }).join('') + '</nav>';
  }

  function head(title, back) {
    return '<div class="head">' + (back ? '<a class="back" href="#/'+back+'" aria-label="Back">'+I('left')+'</a>' : '') +
      '<h2>' + title + '</h2></div>';
  }

  function shell(inner, role, active, bar) {
    return '<div class="device">' + (bar || '') +
      '<div class="scroll"><div class="screen">' + inner + '</div></div>' +
      nav(role, active) + '</div>';
  }

  function delta(d) {
    if (!d) return '<span class="pill grey">Held</span>';
    var dn = d < 0;
    return '<span class="d ' + (dn?'dn':'up') + '">' + I(dn?'down':'up') +
      Math.abs(d) + '%</span>';
  }

  /* ============================================================
     BUYER
     ============================================================ */
  function pcard(p) {
    var q = S.cart[p.id] || 0;
    return '<article class="pc">' +
      '<div class="im"><img src="'+IMG+p.img+'" alt="'+esc(p.name)+'" loading="lazy">' +
        '<span class="stampb">'+I('check')+'Checked 07:42</span></div>' +
      '<div class="bd"><h4 class="nm">'+esc(p.name)+'</h4>' +
      '<p class="un">'+esc(p.unit)+'</p>' +
      '<div class="ft"><span class="pr num">'+fmt(p.price)+'</span>' +
      '<button class="add'+(q?' in':'')+'" onclick="KA.add(\''+p.id+'\',event)" aria-label="Add '+esc(p.name)+'">' +
        (q ? '<span class="num">'+q+'</span>' : I('plus')) + '</button>' +
      '</div></div></article>';
  }

  function screenMarket() {
    var list = S.cat==='all' ? KASU.PRODUCTS : KASU.PRODUCTS.filter(function(p){ return p.cat===S.cat; });
    var label = KASU.CATS.filter(function(c){ return c.id===S.cat; })[0].label;
    var movers = KASU.PRODUCTS.filter(function(p){ return p.delta<0; })
                   .sort(function(a,b){ return a.delta-b.delta; }).slice(0,6);

    var h = '<div class="streak">' +
      '<div class="spill"><span class="ic leaf">'+I('streak')+'</span><div style="flex:1;min-width:0">' +
        '<div class="v num">'+S.streak+' weeks</div><div class="l">Fresh streak</div>' +
        '<div class="pips">'+[0,1,2,3,4,5].map(function(i){ return '<i class="'+(i<S.streak%6||S.streak>=6?'on':'')+'"></i>'; }).join('')+'</div>' +
      '</div></div>' +
      '<div class="spill"><span class="ic gold">'+I('star')+'</span><div>' +
        '<div class="v num">'+S.points.toLocaleString()+'</div><div class="l">Kasu points</div>' +
      '</div></div></div>';

    h += '<div class="sect"><h3>Cheaper today</h3><span class="m">vs last week’s board</span></div>' +
      '<div class="movers">' + movers.map(function(p){
        return '<button class="mover" onclick="KA.add(\''+p.id+'\',event)">' +
          '<img src="'+IMG+p.img+'" alt="" loading="lazy">' +
          '<span><span class="n">'+esc(p.name)+'</span><br>'+delta(p.delta)+'</span></button>';
      }).join('') + '</div>';

    if (S.lastBasket.length && !cartCount()) {
      h += '<div class="panel leaf" style="display:flex;align-items:center;gap:.7rem">' +
        '<span class="stamp sm leaf">'+I('refresh')+'</span>' +
        '<div style="flex:1;min-width:0"><b style="font-size:.82rem">Your usual, again</b>' +
        '<div class="note">'+S.lastBasket.map(function(id){ return esc(P(id).name); }).join(' · ')+'</div></div>' +
        '<button class="btnsm" onclick="KA.reorder()">One tap</button></div>';
    }

    h += '<a class="promo" href="#/buy/weekly"><img src="'+IMG+'basketBox.jpg" alt=""><span class="sh"></span>' +
      '<div class="in"><div class="eye">Weekly basket</div>' +
      '<h3>Stop reordering the same four things</h3>' +
      '<p>Set it once. Same checker, same day, 9% cheaper.</p>' +
      '<span class="go">Build it '+I('right')+'</span></div></a>';

    h += '<div class="chips">' + KASU.CATS.map(function(c){
      return '<button class="chip'+(S.cat===c.id?' on':'')+'" onclick="KA.cat(\''+c.id+'\')">'+esc(c.label)+'</button>';
    }).join('') + '</div>';

    h += '<div class="sect"><h3>'+esc(S.cat==='all'?'Today’s market':label)+'</h3>' +
         '<span class="m">'+list.length+' items</span></div>';
    h += '<div class="grid stag">' + list.map(pcard).join('') + '</div>';

    h += '<div class="panel"><div class="eye">Why the list is short</div>' +
      '<p class="tiny mut" style="margin:.35rem 0 0">Twenty-two items is everything a checker can judge by hand in five seconds. ' +
      'A twenty-thousand-item catalogue means nobody looked at your tomatoes.</p></div>';

    return shell(h, 'buy', 'market', topbar());
  }

  function screenWeekly() {
    var h = head('Weekly Basket');
    h += '<p class="pad tiny mut" style="margin:.2rem 0 0">Same vetted stall, same check, delivered on your day. Skip or cancel any week from here.</p>';

    if (S.weeklyOn) {
      h += '<div class="panel dark"><div class="eye" style="color:var(--gold)">Active</div>' +
        '<h3 style="margin:.2rem 0 .1rem">Every '+esc(S.day)+' · '+S.weekly.length+' items</h3>' +
        '<p class="tiny" style="color:var(--on-dark-2);margin:0 0 .7rem">Next basket '+esc(S.day)+', ' +
        fmt(weeklyTotal()*0.91+FEE)+' including delivery.</p>' +
        '<button class="btn ghost" style="color:#fff;border-color:rgba(255,255,255,.4)" onclick="KA.stopWeekly()">Cancel weekly basket</button></div>';
    }

    ['stewkit','greenskit'].forEach(function (kit) {
      var p = P(kit);
      var on = KASU.KITS[kit].every(function(id){ return S.weekly.indexOf(id)>=0; });
      h += '<div class="panel" style="padding:0;overflow:hidden">' +
        '<img src="'+IMG+p.img+'" alt="" style="height:120px;width:100%;object-fit:cover" loading="lazy">' +
        '<div style="padding:.8rem .9rem .9rem;display:flex;align-items:flex-start;gap:.7rem">' +
        '<div style="flex:1;min-width:0"><h3 style="font-size:1.05rem">'+esc(p.name)+'</h3>' +
        '<div class="note">'+esc(p.unit)+'</div>' +
        '<div class="num" style="font-weight:800;margin-top:.3rem">'+fmt(p.price)+' <span class="note">/ week</span></div></div>' +
        '<button class="btnsm'+(on?' on':'')+'" onclick="KA.addKit(\''+kit+'\')">'+(on?I('check')+'Added':'Add all')+'</button>' +
        '</div></div>';
    });

    h += '<div class="sect"><h3>Delivery day</h3></div><div class="chips" style="padding-top:0">' +
      KASU.DAYS.map(function(d){
        return '<button class="chip'+(S.day===d?' on':'')+'" onclick="KA.day(\''+d+'\')">'+d+'</button>';
      }).join('') + '</div>';

    h += '<div class="sect"><h3>Build your own</h3><span class="m">'+S.weekly.length+' selected</span></div>';
    h += KASU.PRODUCTS.filter(function(p){ return p.cat!=='kits'; }).map(function (p) {
      var on = S.weekly.indexOf(p.id)>=0;
      return '<div class="row"><img class="th" src="'+IMG+p.img+'" alt="" loading="lazy">' +
        '<div class="bd"><div class="nm">'+esc(p.name)+'</div>' +
        '<div class="un num">'+fmt(p.price)+' · '+esc(p.unit)+'</div></div>' +
        '<button class="sw'+(on?' on':'')+'" role="switch" aria-checked="'+on+'" ' +
        'aria-label="'+esc(p.name)+' in weekly basket" onclick="KA.toggleWeekly(\''+p.id+'\')"><i></i></button></div>';
    }).join('');

    if (S.weekly.length && !S.weeklyOn) {
      var raw=weeklyTotal(), disc=Math.round(raw*0.91);
      h += '<div class="panel">' +
        '<div class="kv"><span>'+S.weekly.length+' items</span><b class="num">'+fmt(raw)+'</b></div>' +
        '<div class="kv"><span>Weekly pricing</span><b class="num" style="color:var(--leaf)">−'+fmt(raw-disc)+'</b></div>' +
        '<div class="kv"><span>Delivery</span><b class="num">'+fmt(FEE)+'</b></div>' +
        '<div class="kv tot"><span>Per week</span><span class="num">'+fmt(disc+FEE)+'</span></div></div>' +
        '<div class="sticky"><button class="btn" onclick="KA.startWeekly()">Start basket · every '+esc(S.day)+'</button>' +
        '<p class="note" style="text-align:center;margin-top:.45rem">No contract · skip or cancel in two taps</p></div>';
    }

    return shell(h, 'buy', 'weekly', '');
  }

  function screenBasket() {
    var ids = Object.keys(S.cart);
    var h = head('Your Basket');

    if (!ids.length) {
      h += '<div class="empty"><div class="ic">'+I('basket','lg')+'</div>' +
        '<h3>Nothing in here yet</h3><p>Add something from today’s market and it will show up here.</p>' +
        '<a class="btn ghost" href="#/buy/market" style="max-width:220px;margin:0 auto">Browse the market</a></div>';
      return shell(h, 'buy', 'basket', '');
    }

    h += '<div class="stag">' + ids.map(function (id) {
      var p = P(id);
      return '<div class="row"><img class="th" src="'+IMG+p.img+'" alt="" loading="lazy">' +
        '<div class="bd"><div class="nm">'+esc(p.name)+'</div>' +
        '<div class="un num">'+fmt(p.price)+' · '+esc(p.unit)+'</div></div>' +
        '<div class="qty"><button class="qb" onclick="KA.dec(\''+id+'\')" aria-label="One fewer">'+I('minus')+'</button>' +
        '<span class="qn num">'+S.cart[id]+'</span>' +
        '<button class="qb" onclick="KA.add(\''+id+'\')" aria-label="One more">'+I('plus')+'</button></div></div>';
    }).join('') + '</div>';

    h += '<div class="panel">' +
      '<div class="kv"><span>Subtotal</span><b class="num">'+fmt(cartTotal())+'</b></div>' +
      '<div class="kv"><span>Delivery · '+esc(S.district)+'</span><b class="num">'+fmt(FEE)+'</b></div>' +
      '<div class="kv tot"><span>Total</span><span class="num">'+fmt(cartTotal()+FEE)+'</span></div>' +
      '<div class="kv" style="border:0;padding-top:.5rem"><span class="note">Earns</span>' +
      '<span class="pill gold">'+I('star')+'+'+pointsFor(cartTotal()+FEE)+' points</span></div></div>';

    h += '<div class="panel leaf" style="display:flex;gap:.7rem;align-items:center">' +
      '<span class="stamp sm leaf">'+I('shield')+'</span>' +
      '<span class="tiny" style="font-weight:600">Every item here is photographed at the stall before dispatch. Not good? One tap replaces it.</span></div>';

    h += '<div class="sticky"><a class="btn" href="#/buy/checkout">Checkout · <span class="num">'+fmt(cartTotal()+FEE)+'</span></a></div>';
    return shell(h, 'buy', 'basket', '');
  }

  function screenCheckout() {
    if (!Object.keys(S.cart).length) { location.hash='#/buy/basket'; return ''; }
    var h = head('Checkout', 'buy/basket');

    h += '<div class="panel"><div class="eye">Deliver to</div>' +
      '<div class="chips" style="padding:.5rem 0 0;margin:0">' + KASU.DISTRICTS.map(function(d){
        return '<button class="chip'+(S.district===d?' on':'')+'" onclick="KA.district(\''+d+'\')">'+d+'</button>';
      }).join('') + '</div>' +
      '<p class="note" style="margin:.55rem 0 0">12 Aminu Kano Crescent · rider calls on arrival</p></div>';

    h += '<div class="panel"><div class="eye" style="margin-bottom:.5rem">Payment</div>' +
      [['transfer','wallet','Bank transfer','Account shown after you confirm'],
       ['card','receipt','Card','Saved card ending 4417'],
       ['cod','store','Pay on delivery','Cash to the rider']].map(function(o){
        return '<button class="opt'+(S.pay===o[0]?' sel':'')+'" onclick="KA.pay(\''+o[0]+'\')">' +
          '<span class="rd"></span>'+I(o[1])+
          '<span style="text-align:left"><span class="nm" style="display:block">'+o[2]+'</span>' +
          '<span class="un">'+o[3]+'</span></span></button>';
      }).join('') + '</div>';

    h += '<div class="panel">' + Object.keys(S.cart).map(function(id){
      var p=P(id);
      return '<div class="kv"><span>'+esc(p.name)+' × '+S.cart[id]+'</span><b class="num">'+fmt(p.price*S.cart[id])+'</b></div>';
    }).join('') +
      '<div class="kv"><span>Delivery</span><b class="num">'+fmt(FEE)+'</b></div>' +
      '<div class="kv tot"><span>Total</span><span class="num">'+fmt(cartTotal()+FEE)+'</span></div></div>';

    h += '<div class="sticky"><button class="btn" onclick="KA.placeOrder()">Place order · <span class="num">'+fmt(cartTotal()+FEE)+'</span></button>' +
      '<p class="note" style="text-align:center;margin-top:.45rem">Demo build — nothing is charged</p></div>';
    return shell(h, 'buy', 'basket', '');
  }

  function screenOrders() {
    var h = head('Orders');
    if (!S.order) {
      h += '<div class="empty"><div class="ic">'+I('route','lg')+'</div>' +
        '<h3>No orders yet</h3><p>Place one and watch it move from the stall to your door.</p>' +
        '<a class="btn ghost" href="#/buy/market" style="max-width:220px;margin:0 auto">Browse the market</a></div>';
      return shell(h, 'buy', 'orders', '');
    }
    var o=S.order, st=KASU.LEDGER[o.step];
    h += '<a class="panel" href="#/buy/track" style="display:block">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem">' +
      '<b style="font-size:.85rem">Order #'+esc(o.id)+'</b>' +
      '<span class="pill '+(o.step>=5?'leaf':'rust')+'">'+(o.step>=5?'Delivered':'In progress')+'</span></div>' +
      '<p class="note" style="margin:.3rem 0 .6rem">'+esc(st.t)+' · '+o.items.length+' items · <span class="num">'+fmt(o.total)+'</span></p>' +
      '<span class="btnsm">Track this order '+I('right')+'</span></a>';
    return shell(h, 'buy', 'orders', '');
  }

  function rejectLine(o) {
    var r=0; for (var k in o.rejected) r+=o.rejected[k];
    return r ? (r+' item'+(r>1?'s':'')+' rejected at the stall') : 'All items passed';
  }

  function screenTrack() {
    if (!S.order) { location.hash='#/buy/orders'; return ''; }
    var o = S.order;
    var h = head('#'+esc(o.id), 'buy/orders');

    h += '<div class="panel flat" style="display:flex;justify-content:space-between;align-items:center;gap:.6rem">' +
      '<span class="pill '+(o.step>=5?'leaf':'rust')+'">' +
      (o.step>=5 ? 'Delivered' : 'Arriving in ~'+(40-o.step*7)+' min') + '</span>' +
      '<span class="note">'+esc(S.district)+'</span></div>';

    /* the ledger — our signature */
    h += '<div class="ledger"><div class="lh"><span class="eye">Inspection ledger</span>' +
      '<span class="note" style="margin-left:auto;color:var(--on-dark-2)">'+esc(S.district)+' run</span></div>';
    h += KASU.LEDGER.map(function (s, i) {
      var cls = i<o.step ? 'done' : (i===o.step ? 'now' : '');
      var proof = (s.proof && i<=o.step) ?
        '<div class="receipt"><img src="'+IMG+'handsBowl.jpg" alt="Inspection photo taken at the stall">' +
        '<div class="rb"><div class="rh"><span class="stamp sm">'+I('check')+'</span>' +
        '<b style="font-size:.72rem">Checked by Ngozi A. · Stall 4</b></div>' +
        '<div class="rl"><span>Photo taken</span><b class="num">07:42</b></div>' +
        '<div class="rl"><span>Outcome</span><b>'+rejectLine(o)+'</b></div>' +
        '<div class="rl"><span>Substitutions</span><b>None</b></div>' +
        '</div></div>' : '';
      return '<div class="lg '+cls+'"><span class="tm">'+s.tm+'</span>' +
        '<span class="rail"><span class="d">'+(i<o.step?I('check'):'')+'</span><span class="ln"></span></span>' +
        '<div class="bd"><div class="t">'+esc(s.t)+'</div><div class="s">'+esc(s.s)+'</div>'+proof+'</div></div>';
    }).join('') + '</div>';

    if (o.step>=4) {
      h += '<div class="rider"><span class="av"><img src="'+IMG+'rider.jpg" alt=""></span>' +
        '<div><div class="nm">Ibrahim · rider</div><div class="sb">Honda Ace · KJA 442 YY</div></div>' +
        '<a class="call" href="tel:08000000000" aria-label="Call the rider">'+I('phone')+'</a></div>';
    }

    h += '<div class="panel"><div class="eye" style="margin-bottom:.35rem">In this order</div>' +
      o.items.map(function(it){ var p=P(it.id);
        return '<div class="kv"><span>'+esc(p.name)+' × '+it.qty+'</span><b class="num">'+fmt(p.price*it.qty)+'</b></div>';
      }).join('') +
      '<div class="kv tot"><span>Paid</span><span class="num">'+fmt(o.total)+'</span></div></div>';

    if (o.step>=5) {
      if (!o.collected) {
        h += '<div class="panel gold" style="text-align:center">' +
          '<h3>Basket '+(S.streak+1)+' in a row</h3>' +
          '<p class="tiny mut" style="margin:.25rem 0 .7rem">You’ve earned <b>'+o.earned+' Kasu points</b> on this order.</p>' +
          '<button class="btn leaf" onclick="KA.collect()">'+I('star')+'Collect points</button></div>';
      }
      if (o.flagged) {
        h += '<div class="panel leaf" style="display:flex;gap:.7rem;align-items:center">' +
          '<span class="stamp sm leaf">'+I('check')+'</span>' +
          '<span class="tiny" style="font-weight:600">Flagged. Replacement goes out on the next run — nothing to send us, nothing to prove.</span></div>';
      } else {
        h += '<div class="panel"><h3>Something not right?</h3>' +
          '<p class="tiny mut" style="margin:.25rem 0 .7rem">One tap. No form, no photos from you, no explanation needed.</p>' +
          '<button class="btn dark" onclick="KA.flag()">'+I('flag')+'Flag an item</button></div>';
      }
    }

    return shell(h, 'buy', 'orders', '');
  }

  function screenYou() {
    var next = 6 - (S.streak % 6);
    var h = head('You');

    h += '<div class="panel dark" style="text-align:center">' +
      '<div style="display:flex;justify-content:center;margin-bottom:.5rem"><span class="stamp">'+I('streak')+'</span></div>' +
      '<h3 style="font-size:1.6rem">'+S.streak+' weeks fresh</h3>' +
      '<p class="tiny" style="color:var(--on-dark-2);margin:.25rem 0 .8rem">' +
      (next===6 ? 'Reward unlocked on your next basket.' : next+' more baskets and your delivery fee is on us.') + '</p>' +
      '<div class="pips" style="max-width:220px;margin:0 auto">' +
      [0,1,2,3,4,5].map(function(i){ return '<i class="'+(i<(S.streak%6||6)?'on':'')+'"></i>'; }).join('') + '</div></div>';

    h += '<div class="panel gold" style="display:flex;align-items:center;gap:.75rem">' +
      '<span class="stamp sm">'+I('star')+'</span>' +
      '<div style="flex:1"><div class="num" style="font-family:var(--f-display);font-weight:800;font-size:1.3rem">'+S.points.toLocaleString()+'</div>' +
      '<div class="note">Kasu points · 100 points = ₦100 off produce</div></div>' +
      '<button class="btnsm" onclick="KA.go()">Redeem</button></div>';

    h += '<div class="sect"><h3>Your standing order</h3></div>';
    h += S.weeklyOn
      ? '<div class="panel leaf"><b style="font-size:.85rem">Every '+esc(S.day)+' · '+S.weekly.length+' items</b>' +
        '<p class="note" style="margin:.25rem 0 .6rem">Next run leaves the market at 06:15.</p>' +
        '<a class="btnsm" href="#/buy/weekly">Manage basket</a></div>'
      : '<div class="panel"><b style="font-size:.85rem">No weekly basket yet</b>' +
        '<p class="note" style="margin:.25rem 0 .6rem">Standing orders are 9% cheaper and hold your slot on busy days.</p>' +
        '<a class="btnsm" href="#/buy/weekly">Set one up</a></div>';

    h += '<div class="sect"><h3>Your guarantee</h3></div>';
    h += '<div class="panel">' +
      [['Photographed before dispatch','Every basket, timestamped at the stall.'],
       ['One tap to replace','Until 9pm the next day. No form, no argument.'],
       ['Two vendors, scored weekly','Above 15% rejection twice and a stall is dropped.']].map(function(r){
        return '<div style="display:flex;gap:.6rem;padding:.45rem 0;border-bottom:1px solid var(--line)">' +
          '<span class="stamp sm leaf" style="width:22px;height:22px">'+I('check')+'</span>' +
          '<span><b style="font-size:.8rem">'+r[0]+'</b><br><span class="note">'+r[1]+'</span></span></div>';
      }).join('') + '</div>';

    h += '<div class="panel flat" style="background:transparent;border:0;text-align:center">' +
      '<a class="btnsm" href="index.html">'+I('left')+'Back to the Kasu site</a></div>';

    return shell(h, 'buy', 'you', '');
  }

  A.go = function () { toast('Redemption is out of scope for the demo', false); };

  /* ============================================================
     SELLER — the market vendor
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
      '<div class="kpi leaf"><div class="l">Tomorrow’s order</div><div class="v num">'+V.demand.length+' lines</div>' +
      '<div class="dl good">'+I('up')+'guaranteed volume</div></div>' +
      '<div class="kpi gold"><div class="l">Worth to you</div><div class="v num">'+fmt(value)+'</div>' +
      '<div class="dl">paid on '+esc(V.nextPayout)+'</div></div></div>';

    h += '<div class="panel rust"><b style="font-size:.83rem">Why this screen exists</b>' +
      '<p class="tiny mut" style="margin:.25rem 0 0">Kasu tells you what it needs <b>before</b> the market opens, so you can hold back your best stock instead of putting it on the front table. ' +
      'That is the whole deal — you get certainty, we get first pick.</p></div>';

    h += '<div class="sect"><h3>Confirm what you can supply</h3><span class="m">'+accepted+'/'+V.demand.length+'</span></div>';

    h += '<div class="stag">' + V.demand.map(function (d) {
      var p = P(d.id), on = !!S.accepted[d.id];
      return '<div class="row"><img class="th" src="'+IMG+p.img+'" alt="" loading="lazy">' +
        '<div class="bd"><div class="nm">'+esc(p.name)+'</div>' +
        '<div class="un"><b class="num">'+d.qty+'</b> needed · '+esc(p.unit)+
        (d.locked ? ' · <span class="pill leaf" style="padding:.1rem .3rem">'+I('shield')+'Standing orders</span>' : '')+'</div></div>' +
        '<button class="btnsm'+(on?' on':'')+'" onclick="KA.accept(\''+d.id+'\')">'+(on?I('check')+'In':'Accept')+'</button></div>';
    }).join('') + '</div>';

    h += '<div class="sticky"><button class="btn leaf" onclick="KA.acceptAll()">'+I('check')+'Accept all '+V.demand.length+' lines</button>' +
      '<p class="note" style="text-align:center;margin-top:.45rem">Locked lines come from customers on a weekly basket</p></div>';

    return shell(h, 'sell', 'demand', sellerBar());
  }

  function screenSellerPickups() {
    var h = sellerBar('Pickup in progress');
    if (!S.order) {
      h = '<div class="empty"><div class="ic">'+I('scale','lg')+'</div><h3>No live pickup</h3>' +
        '<p>Place an order in the buyer app — it lands here as a pick list to fill.</p>' +
        '<a class="btn ghost" href="#/buy/market" style="max-width:220px;margin:0 auto">Open the buyer app</a></div>';
      return shell(h, 'sell', 'pickups', sellerBar('Nothing waiting'));
    }

    var o=S.order, good=0, rej=0;
    for (var k in o.picked) good+=o.picked[k];
    for (var j in o.rejected) rej+=o.rejected[j];
    var rate = (good+rej) ? Math.round(rej/(good+rej)*100) : 0;

    var h2 = '<div class="kpis">' +
      '<div class="kpi leaf"><div class="l">Accepted</div><div class="v num">'+good+'</div></div>' +
      '<div class="kpi bad"><div class="l">Rejected</div><div class="v num">'+rej+'</div></div>' +
      '<div class="kpi '+(rate>=15?'bad':rate>=9?'gold':'leaf')+'"><div class="l">This pickup</div><div class="v num">'+rate+'%</div>' +
      '<div class="dl '+(rate>=15?'bad':'good')+'">'+(rate>=15?'above drop line':'within standard')+'</div></div>' +
      '<div class="kpi"><div class="l">'+esc(S.district)+'</div><div class="v num">#'+esc(o.id.split('-')[1])+'</div></div></div>';

    h2 += '<div class="sect"><h3>Pick list</h3><span class="m">'+o.items.length+' lines</span></div>';
    h2 += o.items.map(function (it) {
      var p=P(it.id), g=o.picked[it.id]||0, r=o.rejected[it.id]||0;
      var cls = g>=it.qty ? ' ok' : (r ? ' rej' : '');
      return '<div class="pick'+cls+'"><img class="th" src="'+IMG+p.img+'" alt="" loading="lazy">' +
        '<div class="bd"><div class="nm">'+esc(p.name)+' <span class="pill grey">×'+it.qty+'</span></div>' +
        '<div class="un"><b class="num">'+g+'</b> accepted · <b class="num">'+r+'</b> rejected</div></div>' +
        '<div class="cnt"><button class="g" onclick="KA.pickPlus(\''+it.id+'\')" aria-label="Accept one">'+I('check')+'</button>' +
        '<button class="r" onclick="KA.rejectPlus(\''+it.id+'\')" aria-label="Reject one">'+I('x')+'</button></div></div>';
    }).join('');

    h2 += '<div class="panel"><div class="eye">The rule</div>' +
      '<p class="tiny mut" style="margin:.3rem 0 0">Never hand over a pre-packed bag. Every item is picked in front of the checker, rejects are pulled before payment, ' +
      'the basket is photographed, then it goes.</p></div>';

    h2 += '<div class="sticky">' + (o.dispatched
      ? '<div class="panel leaf flat" style="margin:0;text-align:center"><b style="font-size:.8rem">Dispatched · photo is on the buyer’s order</b></div>'
      : '<button class="btn leaf" onclick="KA.dispatch()">'+I('camera')+'Attach photo &amp; dispatch</button>') + '</div>';

    return shell(h2, 'sell', 'pickups', sellerBar('Pickup in progress'));
  }

  function screenSellerScore() {
    var V = KASU.SELLER;
    var series = V.rejectSeries, max = Math.max.apply(null, series);
    var h = '<div class="kpis">' +
      '<div class="kpi '+(V.rejectWeek>=15?'bad':V.rejectWeek>=9?'gold':'leaf')+'">' +
      '<div class="l">Rejection this week</div><div class="v num">'+V.rejectWeek+'%</div>' +
      '<div class="dl good">'+I('down')+'best of '+V.ofStalls+' stalls</div></div>' +
      '<div class="kpi leaf"><div class="l">Rank</div><div class="v num">#'+V.rank+'</div>' +
      '<div class="dl good">first pick on new lines</div></div></div>';

    h += '<div class="panel"><div class="eye">Rejection rate · last 12 weeks</div>' +
      '<div class="spark" role="img" aria-label="Rejection rate fell from 11% twelve weeks ago to 6% this week">' +
      series.map(function (v) {
        var cls = v>=15 ? 'bad' : (v>=9 ? 'warn' : 'hi');
        return '<i class="'+cls+'" style="height:'+Math.round(v/max*100)+'%"></i>';
      }).join('') + '</div>' +
      '<div style="display:flex;justify-content:space-between" class="note"><span>12 wks ago · '+series[0]+'%</span><span>Now · '+series[series.length-1]+'%</span></div>' +
      '<p class="tiny mut" style="margin:.6rem 0 0">Below 9% is standard. Two consecutive weeks above 15% and the stall comes off the list. ' +
      'You have never been above 12%.</p></div>';

    h += '<div class="sect"><h3>What we refused, and why</h3><span class="m">this week</span></div>';
    h += V.rejections.map(function (r) {
      var p = P(r.id);
      return '<div class="row"><img class="th" src="'+IMG+r.img+'" alt="" loading="lazy">' +
        '<div class="bd"><div class="nm">'+esc(p.name)+' <span class="pill bad">'+r.n+' rejected</span></div>' +
        '<div class="un">'+esc(r.why)+'</div></div></div>';
    }).join('');

    h += '<div class="panel leaf"><b style="font-size:.83rem">Why you get told</b>' +
      '<p class="tiny mut" style="margin:.25rem 0 0">A rejection with no reason just costs you money. A rejection with a reason tells you what to stop sending — ' +
      'which is how your rate went from 11% to 6% and why you now get first refusal on every new line.</p></div>';

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
      return '<div class="row"><span class="stamp sm '+(p.st==='paid'?'leaf':'')+'" style="margin-left:.15rem">' +
        I(p.st==='paid'?'check':'clock')+'</span>' +
        '<div class="bd" style="margin-left:.5rem"><div class="nm num">'+fmt(p.amt)+'</div>' +
        '<div class="un">'+esc(p.d)+'</div></div>' +
        '<span class="pill '+(p.st==='paid'?'leaf':'gold')+'">'+p.st+'</span></div>';
    }).join('');

    h += '<div class="panel"><div class="eye">Lines you supply</div>' +
      '<div class="chips" style="padding:.5rem 0 0;margin:0">' +
      V.covers.map(function(id){ return '<span class="chip">'+esc(P(id).name)+'</span>'; }).join('') + '</div></div>';

    h += '<div class="panel dark"><div class="eye" style="color:var(--gold)">The trade, plainly</div>' +
      '<h3 style="margin:.2rem 0 .2rem">Certainty, for first pick</h3>' +
      '<p class="tiny" style="color:var(--on-dark-2);margin:0">You know Wednesday’s volume on Monday and get paid twice a week without chasing. ' +
      'In exchange, the checker picks every item and refuses what does not pass. Nobody pretends that costs you nothing.</p></div>';

    return shell(h, 'sell', 'payouts', sellerBar('Paid twice weekly'));
  }

  /* ============================================================
     ADMIN / OPS
     ============================================================ */
  function opsBar(sub) {
    return '<div class="opsbar">'+I('grid')+'<span class="r">Kasu Ops</span>' +
      '<span class="w">Abuja · week 33<br>'+esc(sub||'live')+'</span></div>';
  }

  function sparkline(series, invert) {
    var max = Math.max.apply(null, series);
    return '<div class="spark">' + series.map(function (v) {
      var pct = Math.round(v/max*100);
      var cls = invert ? (v>=7 ? 'bad' : v>=6 ? 'warn' : 'hi') : 'hi';
      return '<i class="'+cls+'" style="height:'+Math.max(pct,6)+'%"></i>';
    }).join('') + '</div>';
  }

  function screenOpsToday() {
    var open = KASU.FLAGS.filter(function(f){ return f.st==='open'; }).length;
    var h = '<div class="kpis">' +
      '<div class="kpi"><div class="l">Orders this week</div><div class="v num">41</div>' +
      '<div class="dl good">'+I('up')+'8% vs last</div></div>' +
      '<div class="kpi leaf"><div class="l">On a weekly basket</div><div class="v num">28</div>' +
      '<div class="dl good">'+I('up')+'68% of orders</div></div>' +
      '<div class="kpi bad"><div class="l">Spoilage cost</div><div class="v num">5.2%</div>' +
      '<div class="dl good">'+I('down')+'from 7.8%</div></div>' +
      '<div class="kpi gold"><div class="l">Flags to settle</div><div class="v num">'+open+'</div></div></div>';

    h += '<div class="panel"><div class="eye">Orders per week · 12 weeks</div>' +
      sparkline(KASU.ORDERS_SERIES) +
      '<div style="display:flex;justify-content:space-between" class="note"><span>18</span><span>41 this week</span></div></div>';

    h += '<div class="panel"><div class="eye">Spoilage as % of spend · 12 weeks</div>' +
      sparkline(KASU.SPOIL_SERIES, true) +
      '<div style="display:flex;justify-content:space-between" class="note"><span>7.8%</span><span>5.2% now</span></div>' +
      '<p class="tiny mut" style="margin:.55rem 0 0">Priced into margin, not wished away. A model that assumes zero spoilage fails its first bad week.</p></div>';

    h += '<div class="sect"><h3>Today’s runs</h3></div>';
    h += KASU.RUNS.map(function (r) {
      var tone = r.status==='dispatched' ? 'leaf' : (r.status==='picking' ? 'rust' : 'grey');
      return '<div class="row"><span class="stamp sm '+(tone==='leaf'?'leaf':'')+'" style="margin-left:.15rem">'+I('route')+'</span>' +
        '<div class="bd" style="margin-left:.5rem"><div class="nm">#'+esc(r.id)+'</div>' +
        '<div class="un">'+esc(r.district)+' · '+r.items+' items</div></div>' +
        '<span class="pill '+tone+'">'+esc(r.status)+'</span></div>';
    }).join('');

    return shell(h, 'ops', 'today', opsBar());
  }

  function screenOpsVendors() {
    var h = '<div class="panel"><div class="eye">The only score that matters</div>' +
      '<p class="tiny mut" style="margin:.3rem 0 0">Rejection rate is the share of stock refused at the stall. Low is good — it means what they offer is already up to standard.</p></div>';

    h += '<div class="sect"><h3>Vendor scorecard</h3><span class="m">rejection rate</span></div>';
    h += '<div class="panel"><table class="tbl"><thead><tr><th>Stall</th><th>Week</th><th>13-wk</th><th>Flags</th></tr></thead><tbody>' +
      KASU.VENDORS.map(function (v) {
        var cls = v.week>=15 ? 'bad' : (v.week>=9 ? 'warn' : '');
        return '<tr><td><b>'+esc(v.name)+'</b>' +
          (v.dropped ? ' <span class="pill bad">Dropped</span>' : '') +
          '<div class="bar2"><i class="'+cls+'" style="width:'+Math.min(v.week*5,100)+'%"></i></div>' +
          '<div class="note" style="margin-top:.15rem">'+esc(v.covers)+'</div></td>' +
          '<td><b class="num">'+v.week+'%</b></td><td class="num">'+v.avg+'%</td><td class="num">'+v.flags+'</td></tr>';
      }).join('') + '</tbody></table>' +
      '<p class="tiny mut" style="margin:.7rem 0 0">Two consecutive weeks above 15% and the stall comes off the list. Stall 7 was dropped in March at 19% over three weeks — ' +
      'published because a scorecard nobody fails is a scorecard nobody is running.</p></div>';

    h += '<div class="panel rust"><b style="font-size:.83rem">Why only two stalls</b>' +
      '<p class="tiny mut" style="margin:.25rem 0 0">Ten stalls would look impressive and quietly destroy the product. Two means the vendors know the checker by name, ' +
      'know exactly what gets refused, and have enough weekly volume at stake to care.</p></div>';

    return shell(h, 'ops', 'vendors', opsBar('scored weekly'));
  }

  function screenOpsQuality() {
    var h = '<div class="kpis">' +
      '<div class="kpi leaf"><div class="l">Flags this week</div><div class="v num">3</div>' +
      '<div class="dl good">'+I('down')+'0.7% of items</div></div>' +
      '<div class="kpi gold"><div class="l">Avg. settle time</div><div class="v num">14m</div></div></div>';

    h += '<div class="sect"><h3>Flag queue</h3><span class="m">buyer-reported</span></div>';
    h += KASU.FLAGS.map(function (f) {
      var tone = f.st==='open' ? 'gold' : (f.st==='replaced' ? 'leaf' : 'grey');
      return '<div class="row"><span class="stamp sm" style="margin-left:.15rem">'+I('flag')+'</span>' +
        '<div class="bd" style="margin-left:.5rem"><div class="nm">'+esc(f.item)+'</div>' +
        '<div class="un">#'+esc(f.id)+' · '+esc(f.why)+' · traced to '+esc(f.vendor)+'</div></div>' +
        '<span class="pill '+tone+'">'+esc(f.st)+'</span></div>';
    }).join('');

    h += '<div class="panel"><div class="eye">Where the cost lands</div>' +
      [['Rejected at the stall','The vendor absorbs it. That is what being on the list costs.'],
       ['Missed by the checker','Kasu absorbs it, and it is logged against the checker.'],
       ['Never the customer','If they have to inspect it, we already failed at the thing they paid for.']]
      .map(function (r) {
        return '<div style="display:flex;gap:.6rem;padding:.45rem 0;border-bottom:1px solid var(--line)">' +
          '<span class="stamp sm leaf" style="width:22px;height:22px">'+I('check')+'</span>' +
          '<span><b style="font-size:.8rem">'+r[0]+'</b><br><span class="note">'+r[1]+'</span></span></div>';
      }).join('') + '</div>';

    return shell(h, 'ops', 'quality', opsBar('flag queue'));
  }

  function screenOpsZones() {
    var max = Math.max.apply(null, KASU.ZONES.map(function(z){ return z.orders; }));
    var h = '<div class="panel"><div class="eye">Orders by district · this week</div>' +
      '<table class="tbl" style="margin-top:.4rem"><thead><tr><th>District</th><th>Orders</th><th>Weekly</th></tr></thead><tbody>' +
      KASU.ZONES.map(function (z) {
        return '<tr><td><b>'+esc(z.d)+'</b>' +
          '<div class="bar2"><i style="width:'+Math.round(z.orders/max*100)+'%"></i></div></td>' +
          '<td><b class="num">'+z.orders+'</b></td><td class="num">'+z.weekly+'</td></tr>';
      }).join('') + '</tbody></table></div>';

    h += '<div class="panel gold"><b style="font-size:.83rem">Gwarinpa is the decision</b>' +
      '<p class="tiny mut" style="margin:.25rem 0 0">Three orders a week does not cover a rider on that route. Either it clusters to eight by week 36 or it comes off the map. ' +
      'Zones open where requests cluster, not on a map drawn in advance.</p></div>';

    h += '<div class="panel dark"><div class="eye" style="color:var(--gold)">Honest constraint</div>' +
      '<h3 style="margin:.2rem 0">One checker, one market</h3>' +
      '<p class="tiny" style="color:var(--on-dark-2);margin:0">Every number here rests on one person being at Wuse Market at 06:15. ' +
      'A second checker is the real unlock for a sixth district — not more app features.</p></div>';

    return shell(h, 'ops', 'zones', opsBar('coverage'));
  }

  /* ---------------- router ---------------- */
  var R = {
    'buy/market':screenMarket, 'buy/weekly':screenWeekly, 'buy/basket':screenBasket,
    'buy/checkout':screenCheckout, 'buy/orders':screenOrders, 'buy/track':screenTrack,
    'buy/you':screenYou,
    'sell/demand':screenSellerDemand, 'sell/pickups':screenSellerPickups,
    'sell/score':screenSellerScore, 'sell/payouts':screenSellerPayouts,
    'ops/today':screenOpsToday, 'ops/vendors':screenOpsVendors,
    'ops/quality':screenOpsQuality, 'ops/zones':screenOpsZones
  };
  var HOME = { buy:'buy/market', sell:'sell/demand', ops:'ops/today' };

  function route() {
    var r = (location.hash || '').replace(/^#\/?/, '');
    if (R[r]) return r;
    if (HOME[r]) return HOME[r];
    return 'buy/market';
  }

  function render() {
    var r = route(), root = document.getElementById('root');
    var prev = root.querySelector('.scroll');
    var top = prev ? prev.scrollTop : 0;
    var same = root.getAttribute('data-r') === r;

    root.innerHTML = R[r]();
    root.setAttribute('data-r', r);
    if (same) { var sc = root.querySelector('.scroll'); if (sc) sc.scrollTop = top; }

    var role = r.split('/')[0];
    document.querySelectorAll('.demobar a[data-role]').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-role') === role);
    });
    if (role === 'buy' && r === 'buy/market') startCountdown();
  }

  window.addEventListener('hashchange', render);
  load();
  if (S.order && S.order.step < KASU.LEDGER.length - 1) startClock();
  render();
})();
