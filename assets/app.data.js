/* Kasu — demo data. Prices in naira, units the way Abuja markets actually sell.
 *
 * `syn` matters more than it looks: it is what the shopping-list parser matches
 * against, so it carries the English, Igbo, Hausa and Yoruba names for each item
 * plus the misspellings people actually type. Adding a name here is what makes
 * the list feature understand it.
 */
var KASU = {};

KASU.CATS = [
  { id:'all',     key:'all' },
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
  { id:'tombasket', name:'Tomato basket',   unit:'per basket · ~4kg',      price:2500, img:'tomatoBasket.jpg', cat:'stew',    delta:-12,
    why:'Jos harvest arrived in volume this week',
    syn:['tomato basket','basket of tomato','basket tomato','tomatoes basket','kwandon tumatir','agbọn tomati'] },
  { id:'tomloose',  name:'Tomatoes, loose', unit:'per kg',                 price:700,  img:'tomato.jpg',       cat:'stew',    delta:-9,
    why:'Same Jos supply, sold loose by weight',
    syn:['tomato','tomatoes','tomatos','tomatoe','tumatir','tomati','tòmátì','ntoo'] },
  { id:'tatashe',   name:'Tatashe',         unit:'8 pieces · bell pepper', price:1500, img:'tatashe.jpg',      cat:'stew',    delta:4,
    why:'Rain slowed the Kaduna trucks',
    syn:['tatashe','bell pepper','sweet pepper','ata tatashe','red pepper','tanjere'] },
  { id:'rodo',      name:'Rodo',            unit:'per rubber · hot',       price:1000, img:'rodo.jpg',         cat:'stew',    delta:0,
    why:'Steady all week',
    syn:['rodo','scotch bonnet','hot pepper','ata rodo','ose','barkono','ata wewe','pepper'] },
  { id:'onion',     name:'Onions',          unit:'2kg bag · dry skins',    price:1800, img:'onion.jpg',        cat:'stew',    delta:7,
    why:'Northern stock thinning before the new crop',
    syn:['onion','onions','albasa','alubosa','yabasi','ayo'] },

  { id:'ugu',       name:'Ugu leaves',      unit:'per bunch',              price:800,  img:'ugu.jpg',          cat:'greens',  delta:-5,
    why:'Local farms cutting daily',
    syn:['ugu','ugwu','pumpkin leaf','pumpkin leaves','fluted pumpkin'] },
  { id:'efo',       name:'Efo shoko',       unit:'per bunch',              price:600,  img:'efo.jpg',          cat:'greens',  delta:0,
    why:'Steady all week',
    syn:['efo','shoko','efo shoko','spinach','alayyahu','soko','green'] },
  { id:'waterleaf', name:'Waterleaf',       unit:'per bunch',              price:700,  img:'waterleaf.jpg',    cat:'greens',  delta:-3,
    why:'Good rains, plenty cut',
    syn:['waterleaf','water leaf','gbure','mgbolodi'] },
  { id:'scentleaf', name:'Scent leaf',      unit:'per bunch · nchanwu',    price:400,  img:'scentleaf.jpg',    cat:'greens',  delta:0,
    why:'Steady all week',
    syn:['scent leaf','scentleaf','nchanwu','efirin','basil','daidoya'] },

  { id:'okra',      name:'Okra',            unit:'per rubber',             price:900,  img:'okra.jpg',         cat:'veg',     delta:6,
    why:'End of the local season',
    syn:['okra','okro','ila','kubewa','okwuru','ọkwụrụ'] },
  { id:'gardenegg', name:'Garden eggs',     unit:'per rubber',             price:1100, img:'gardenegg.jpg',    cat:'veg',     delta:-2,
    why:'Plenty at both stalls',
    syn:['garden egg','garden eggs','anara','igba','yalo','aubergine','eggplant'] },
  { id:'peppermix', name:'Blended pepper',  unit:'1 litre tub · milled',   price:2400, img:'rodo.jpg',         cat:'veg',     delta:-8,
    why:'Follows the tomato price down',
    syn:['blended pepper','pepper mix','ground pepper','stew base','obe','miya','ata lilo'] },

  { id:'yam',       name:'Yam tuber',       unit:'medium · cut-tested',    price:4200, img:'yam.jpg',          cat:'roots',   delta:11,
    why:'Between harvests — the yearly squeeze',
    syn:['yam','ji','isu','doya','tuber'] },
  { id:'plantainU', name:'Unripe plantain', unit:'5 fingers',              price:1600, img:'plantain.jpg',     cat:'roots',   delta:0,
    why:'Steady all week',
    syn:['unripe plantain','green plantain','plantain','ogede','ayaba','abuba','boli'] },
  { id:'plantainR', name:'Ripe plantain',   unit:'5 fingers · dodo',       price:1700, img:'plantain.jpg',     cat:'roots',   delta:-4,
    why:'More ripening than people are buying',
    syn:['ripe plantain','dodo','ogede didun','sweet plantain'] },

  { id:'watermelon',name:'Watermelon',      unit:'whole, medium',          price:2200, img:'watermelon.jpg',   cat:'fruit',   delta:-14,
    why:'Peak season, trucks arriving daily',
    syn:['watermelon','water melon','kankana','elegede omi','bara'] },
  { id:'pineapple', name:'Pineapple',       unit:'whole',                  price:1200, img:'pineapple.jpg',    cat:'fruit',   delta:-6,
    why:'Plenty coming up from the south',
    syn:['pineapple','pine apple','abarba','ope oyinbo','afion'] },
  { id:'fruitbox',  name:'Fruit box',       unit:"checker's pick",         price:6500, img:'marketFruit.jpg',  cat:'fruit',   delta:0,
    why:'Priced on the week’s best fruit',
    syn:['fruit box','fruits','mixed fruit','fruit basket'] },

  { id:'catfish',   name:'Fresh catfish',   unit:'per kg · cleaned',       price:3500, img:'catfish.jpg',      cat:'protein', delta:3,
    why:'Fuel cost on the Lokoja run',
    syn:['catfish','cat fish','fish','azu','eja','ẹja','kifi','point and kill'] },
  { id:'chicken',   name:'Whole chicken',   unit:'per bird · dressed',     price:6500, img:'chicken.jpg',      cat:'protein', delta:0,
    why:'Steady all week',
    syn:['chicken','whole chicken','fowl','okuko','okpa','adiye','kaza'] },

  { id:'stewkit',   name:'Stew Base Kit',   unit:'tomato · tatashe · rodo · onion', price:6300, img:'stew.jpg',   cat:'kits', delta:-7,
    why:'Tracks the tomato board',
    syn:['stew kit','stew base kit','stew base','obe kit'] },
  { id:'greenskit', name:'Soup Greens Kit', unit:'ugu · efo · waterleaf · scent',   price:2300, img:'jollof.jpg', cat:'kits', delta:-3,
    why:'Greens all cheap together',
    syn:['soup kit','greens kit','soup greens','vegetable kit'] }
];

KASU.KITS = {
  stewkit:   ['tombasket','tatashe','rodo','onion'],
  greenskit: ['ugu','efo','waterleaf','scentleaf']
};

/* Days a package can repeat on, and the delivery windows. */
KASU.DAYS = [
  { id:'Mon', en:'Monday',    ig:'Mọnde',   ha:'Litinin',  yo:'Ajé' },
  { id:'Tue', en:'Tuesday',   ig:'Tuzde',   ha:'Talata',   yo:'Ìsẹ́gun' },
  { id:'Wed', en:'Wednesday', ig:'Wenezde', ha:'Laraba',   yo:'Ọjọ́rú' },
  { id:'Thu', en:'Thursday',  ig:'Tọọzde',  ha:'Alhamis',  yo:'Ọjọ́bọ̀' },
  { id:'Fri', en:'Friday',    ig:'Fraịde',  ha:'Jumaa',    yo:'Ẹtì' },
  { id:'Sat', en:'Saturday',  ig:'Satọde',  ha:'Asabar',   yo:'Àbámẹ́ta' }
];

KASU.SLOTS = [
  { id:'morning',   key:'slot_morning',   timeKey:'slot_morning_t' },
  { id:'afternoon', key:'slot_afternoon', timeKey:'slot_afternoon_t' },
  { id:'evening',   key:'slot_evening',   timeKey:'slot_evening_t' }
];

KASU.DISTRICTS = ['Wuse II','Garki','Maitama','Jabi','Gwarinpa'];

/* The ledger the buyer watches, timestamped like an inspection log. */
KASU.LEDGER = [
  { tm:'06:02', t:'Order confirmed',       s:'Slot held for the morning run' },
  { tm:'06:15', t:'Checker at the market', s:'Ngozi A. arrived before the front tables filled' },
  { tm:'06:50', t:'Your items picked',     s:'Chosen by hand — no pre-packed bags accepted' },
  { tm:'07:42', t:'Counted & photographed',s:'Rejects pulled, photo attached below', proof:true },
  { tm:'08:20', t:'Out for delivery',      s:'Ibrahim is riding to your district' },
  { tm:'09:05', t:'Delivered',             s:'Anything off? One tap, no questions.' }
];

/* What the simulated photo reader "sees". Kept here so it is obvious that this
   is scripted demo data and not real image recognition. */
KASU.PHOTO_DEMO = 'tomato basket 2\nugu 1\nrodo\nonions 1\ncatfish 2kg';

/* ---- Seller (market vendor) demo data ---- */
KASU.SELLER = {
  name:'Ngozi Adeyemi',
  stall:'Stall 4 · Wuse Market',
  since:'14 months with Kasu',
  covers:['tombasket','tomloose','tatashe','rodo','onion'],
  rejectWeek:6,
  rejectSeries:[11,9,12,8,7,9,6,8,5,7,6,6],
  rank:1, ofStalls:2,
  earnedWeek:184500,
  pendingPayout:62300,
  nextPayout:'Friday',
  payouts:[
    { d:'Wed 13 Aug', amt:58200, st:'paid' },
    { d:'Mon 11 Aug', amt:64100, st:'paid' },
    { d:'Sat 09 Aug', amt:62300, st:'pending' }
  ],
  demand:[
    { id:'tombasket', qty:14, locked:true },
    { id:'tatashe',   qty:22, locked:true },
    { id:'rodo',      qty:18, locked:false },
    { id:'onion',     qty:11, locked:false },
    { id:'tomloose',  qty:26, locked:false }
  ],
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

KASU.ORDERS_SERIES = [18,21,19,24,26,23,29,31,28,34,38,41];
KASU.SPOIL_SERIES  = [7.8,7.1,6.9,6.2,6.4,5.9,5.5,5.8,5.1,5.4,5.0,5.2];

KASU.FLAGS = [
  { id:'KS-2477', item:'Tomatoes, loose', why:'Two soft at the bottom', st:'replaced', vendor:'Stall 4' },
  { id:'KS-2474', item:'Ugu leaves',      why:'Wilted on arrival',      st:'refunded', vendor:'Stall 11' },
  { id:'KS-2471', item:'Yam tuber',       why:'Hollow at the cut',      st:'open',     vendor:'Stall 11' }
];
