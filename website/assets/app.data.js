/* Kasu — demo data. Prices in naira, units the way Abuja markets actually sell. */
var KASU = {};

KASU.CATS = [
  { id:'all',     label:'Everything' },
  { id:'stew',    label:'Stew base' },
  { id:'greens',  label:'Soup greens' },
  { id:'veg',     label:'Vegetables' },
  { id:'roots',   label:'Roots & tubers' },
  { id:'fruit',   label:'Fruit' },
  { id:'protein', label:'Protein' },
  { id:'kits',    label:'Kits' }
];

/* delta = % move vs last week's board. Negative is cheaper. */
KASU.PRODUCTS = [
  { id:'tombasket', name:'Tomato basket',   unit:'per basket · ~4kg',       price:2500, img:'tomatoBasket.jpg', cat:'stew',    delta:-12, tag:'Hand-sorted' },
  { id:'tomloose',  name:'Tomatoes, loose', unit:'per kg',                  price:700,  img:'tomato.jpg',       cat:'stew',    delta:-9 },
  { id:'tatashe',   name:'Tatashe',         unit:'8 pieces · bell pepper',  price:1500, img:'tatashe.jpg',      cat:'stew',    delta:4 },
  { id:'rodo',      name:'Rodo',            unit:'per rubber · hot',        price:1000, img:'rodo.jpg',         cat:'stew',    delta:0 },
  { id:'onion',     name:'Onions',          unit:'2kg bag · dry skins',     price:1800, img:'onion.jpg',        cat:'stew',    delta:7 },

  { id:'ugu',       name:'Ugu leaves',      unit:'per bunch',               price:800,  img:'ugu.jpg',          cat:'greens',  delta:-5, tag:'Cut <3hrs' },
  { id:'efo',       name:'Efo shoko',       unit:'per bunch',               price:600,  img:'efo.jpg',          cat:'greens',  delta:0 },
  { id:'waterleaf', name:'Waterleaf',       unit:'per bunch',               price:700,  img:'waterleaf.jpg',    cat:'greens',  delta:-3 },
  { id:'scentleaf', name:'Scent leaf',      unit:'per bunch · nchanwu',     price:400,  img:'scentleaf.jpg',    cat:'greens',  delta:0 },

  { id:'okra',      name:'Okra',            unit:'per rubber',              price:900,  img:'okra.jpg',         cat:'veg',     delta:6 },
  { id:'gardenegg', name:'Garden eggs',     unit:'per rubber',              price:1100, img:'gardenegg.jpg',    cat:'veg',     delta:-2 },
  { id:'peppermix', name:'Blended pepper',  unit:'1 litre tub · milled',    price:2400, img:'rodo.jpg',         cat:'veg',     delta:-8, tag:'Saves an hour' },

  { id:'yam',       name:'Yam tuber',       unit:'medium · cut-tested',     price:4200, img:'yam.jpg',          cat:'roots',   delta:11, tag:'Cut-tested' },
  { id:'plantainU', name:'Unripe plantain', unit:'5 fingers',               price:1600, img:'plantain.jpg',     cat:'roots',   delta:0 },
  { id:'plantainR', name:'Ripe plantain',   unit:'5 fingers · dodo',        price:1700, img:'plantain.jpg',     cat:'roots',   delta:-4 },

  { id:'watermelon',name:'Watermelon',      unit:'whole, medium',           price:2200, img:'watermelon.jpg',   cat:'fruit',   delta:-14 },
  { id:'pineapple', name:'Pineapple',       unit:'whole',                   price:1200, img:'pineapple.jpg',    cat:'fruit',   delta:-6 },
  { id:'fruitbox',  name:'Fruit box',       unit:"checker's pick",          price:6500, img:'marketFruit.jpg',  cat:'fruit',   delta:0 },

  { id:'catfish',   name:'Fresh catfish',   unit:'per kg · cleaned',        price:3500, img:'catfish.jpg',      cat:'protein', delta:3, tag:'Clear-eye check' },
  { id:'chicken',   name:'Whole chicken',   unit:'per bird · dressed',      price:6500, img:'chicken.jpg',      cat:'protein', delta:0 },

  { id:'stewkit',   name:'Stew Base Kit',   unit:'tomato · tatashe · rodo · onion', price:6300, img:'stew.jpg',   cat:'kits', delta:-7, tag:'₦500 off' },
  { id:'greenskit', name:'Soup Greens Kit', unit:'ugu · efo · waterleaf · scent',   price:2300, img:'jollof.jpg', cat:'kits', delta:-3, tag:'₦200 off' }
];

KASU.KITS = {
  stewkit:   ['tombasket','tatashe','rodo','onion'],
  greenskit: ['ugu','efo','waterleaf','scentleaf']
};

KASU.DAYS = ['Mon','Wed','Fri','Sat'];
KASU.DISTRICTS = ['Wuse II','Garki','Maitama','Jabi','Gwarinpa'];

/* The ledger — what the buyer watches, timestamped like an inspection log. */
KASU.LEDGER = [
  { tm:'06:02', t:'Order confirmed',      s:'Slot held for the morning run' },
  { tm:'06:15', t:'Checker at the market', s:'Ngozi A. arrived before the front tables filled' },
  { tm:'06:50', t:'Your items picked',     s:'Chosen by hand — no pre-packed bags accepted' },
  { tm:'07:42', t:'Counted & photographed',s:'Rejects pulled, photo attached below', proof:true },
  { tm:'08:20', t:'Out for delivery',      s:'Ibrahim is riding to your district' },
  { tm:'09:05', t:'Delivered',             s:'Anything off? One tap, no questions.' }
];

/* ---- Seller (market vendor) demo data ---- */
KASU.SELLER = {
  name:'Ngozi Adeyemi',
  stall:'Stall 4 · Wuse Market',
  since:'14 months with Kasu',
  covers:['tombasket','tomloose','tatashe','rodo','onion'],
  rejectWeek:6,
  rejectSeries:[11,9,12,8,7,9,6,8,5,7,6,6],   /* last 12 weeks, % */
  rank:1, ofStalls:2,
  earnedWeek:184500,
  pendingPayout:62300,
  nextPayout:'Friday',
  payouts:[
    { d:'Wed 13 Aug', amt:58200, st:'paid' },
    { d:'Mon 11 Aug', amt:64100, st:'paid' },
    { d:'Sat 09 Aug', amt:62300, st:'pending' }
  ],
  /* tomorrow's demand Kasu is committing to — the reason a vendor holds stock back */
  demand:[
    { id:'tombasket', qty:14, locked:true },
    { id:'tatashe',   qty:22, locked:true },
    { id:'rodo',      qty:18, locked:false },
    { id:'onion',     qty:11, locked:false },
    { id:'tomloose',  qty:26, locked:false }
  ],
  /* what got refused, and why — the feedback loop that actually changes behaviour */
  rejections:[
    { id:'tomloose', n:3, why:'Soft at the stem, bruising under the skin', img:'tomato.jpg' },
    { id:'onion',    n:2, why:'Necks damp — early sprouting risk',         img:'onion.jpg' }
  ]
};

/* ---- Admin / ops demo data ---- */
KASU.VENDORS = [
  { name:'Stall 4 — Ngozi A.',  covers:'Tomatoes, peppers, onions', week:6,  avg:7.4,  flags:2,  months:14 },
  { name:'Stall 11 — Emeka O.', covers:'Greens, tubers, plantain',  week:11, avg:9.1,  flags:5,  months:9 },
  { name:'Stall 7 — dropped',   covers:'Was: greens',               week:19, avg:16.2, flags:14, months:0, dropped:true }
];

KASU.RUNS = [
  { id:'KS-2481', district:'Wuse II',  items:5, status:'picking' },
  { id:'KS-2482', district:'Garki',    items:3, status:'queued' },
  { id:'KS-2483', district:'Maitama',  items:7, status:'queued' },
  { id:'KS-2480', district:'Gwarinpa', items:4, status:'dispatched' }
];

KASU.ZONES = [
  { d:'Wuse II',  orders:16, weekly:12 },
  { d:'Garki',    orders:9,  weekly:6 },
  { d:'Maitama',  orders:7,  weekly:5 },
  { d:'Jabi',     orders:6,  weekly:3 },
  { d:'Gwarinpa', orders:3,  weekly:2 }
];

KASU.ORDERS_SERIES = [18,21,19,24,26,23,29,31,28,34,38,41];  /* orders per week */
KASU.SPOIL_SERIES  = [7.8,7.1,6.9,6.2,6.4,5.9,5.5,5.8,5.1,5.4,5.0,5.2]; /* % of spend */

KASU.FLAGS = [
  { id:'KS-2477', item:'Tomatoes, loose', why:'Two soft at the bottom', st:'replaced', vendor:'Stall 4' },
  { id:'KS-2474', item:'Ugu leaves',      why:'Wilted on arrival',      st:'refunded', vendor:'Stall 11' },
  { id:'KS-2471', item:'Yam tuber',       why:'Hollow at the cut',      st:'open',     vendor:'Stall 11' }
];
