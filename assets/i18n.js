/* Kasua — language layer. English · Igbo · Hausa · Yoruba.
 *
 * IMPORTANT, and stated plainly: the Igbo, Hausa and Yoruba strings below are a
 * best-effort first pass. They are good enough to demo the feature and to show a
 * native speaker what needs fixing — they are NOT reviewed translations and
 * should not ship to real customers until someone who speaks each language has
 * gone through them. Diacritics in particular need checking.
 *
 * Adding a string: add the key to `en` first, then the other three. A missing
 * key falls back to English rather than showing a blank.
 */
(function (root) {

  var LANGS = [
    { id: 'en', label: 'English',  native: 'English' },
    { id: 'ig', label: 'Igbo',     native: 'Igbo' },
    { id: 'ha', label: 'Hausa',    native: 'Hausa' },
    { id: 'yo', label: 'Yoruba',   native: 'Yorùbá' }
  ];

  var DICT = {

    en: {
      /* welcome + minimum spend */
      w_tagline:'Ten tomatoes. Ten good ones.',
      w_sub:'Market produce from Wuse, checked by hand and photographed before it leaves the stall.',
      w_lang:'Choose your language',
      w_where:'Where should we deliver?',
      w_start:'Start shopping',
      w_change:'You can change both later',
      min_title:'Minimum order',
      min_short:'Add {X} more to check out',
      min_note:'Orders start at {MIN}. One rider, one run — smaller baskets cost more to deliver than they are worth.',
      /* nav + chrome */
      nav_market:'Market', nav_prices:'Prices', nav_list:'My List', nav_basket:'Basket', nav_me:'Me',
      nav_demand:'Orders', nav_pickups:'Pickups', nav_score:'Score', nav_payouts:'Payouts',
      nav_today:'Today', nav_vendors:'Vendors', nav_quality:'Quality', nav_zones:'Zones',
      search_ph:'Search tomatoes, ugu, catfish…',
      delivering_to:'delivering today', closes_in:'Market closes for tomorrow in',
      back:'Back', done:'Done', cancel:'Cancel', confirm:'Confirm', add:'Add', added:'Added',
      yes:'Yes', no:'No', all:'Everything', items:'items', week:'week', free:'Free',

      /* market */
      streak_label:'Fresh streak', streak_weeks:'weeks', points_label:'Kasua points',
      cheaper_today:'Cheaper today', vs_last_week:'vs last week',
      usual_title:'Your usual, again', usual_cta:'One tap',
      todays_market:"Today's market",
      promo_eyebrow:'Fixed package', promo_title:'Stop reordering the same four things',
      promo_sub:'Same day, same time, every week.', promo_cta:'Build it',
      checked_at:'Checked', track_order:'Track your order',

      /* prices */
      prices_title:'Price board', prices_sub:'Repriced every morning before 7am, then locked for the day.',
      price_up:'up', price_down:'down', price_held:'held',
      why_moved:'Why it moved', biggest_falls:'Biggest falls', biggest_rises:'Biggest rises',
      price_locked:'Locked until 7am tomorrow', last_12:'Last 12 weeks',

      /* shopping list */
      list_title:'Build my list', list_intro:'Type your list the way you would say it, or send a photo of a written one. We match it to today’s market.',
      list_ph:'e.g. 2 tomato basket, one ugu, pepper, fish',
      list_type:'Type it', list_photo:'Send a photo', list_build:'Build my list',
      list_found:'Matched', list_missing:'Not on our list', list_addall:'Add all to basket',
      list_empty:'Write something first', list_photo_note:'Photo reading is simulated in this demo.',
      list_reading:'Reading your list…',

      /* basket + checkout */
      basket_title:'Your basket', basket_empty:'Nothing in here yet',
      basket_empty_sub:'Add something from today’s market and it will show up here.',
      browse:'Browse the market', subtotal:'Subtotal', delivery:'Delivery', total:'Total',
      checkout:'Checkout', earns:'Earns', place_order:'Place order',
      deliver_to:'Deliver to', payment:'Payment', when:'When should it come?',
      pay_transfer:'Bank transfer', pay_card:'Card', pay_cash:'Pay on delivery',
      pay_transfer_sub:'Account shown after you confirm', pay_card_sub:'Saved card ending 4417',
      pay_cash_sub:'Cash to the rider',
      approve_debit:'Approve payment', approve_sub:'You approve every debit before it happens.',
      demo_no_charge:'Demo — nothing is charged',

      /* scheduling */
      today:'Today', tomorrow:'Tomorrow', slot_morning:'Morning', slot_afternoon:'Afternoon',
      slot_evening:'Evening', slot_morning_t:'8am – 11am', slot_afternoon_t:'12pm – 3pm',
      slot_evening_t:'4pm – 7pm', pick_day:'Pick a day', pick_time:'Pick a time',
      arriving:'Arriving', scheduled_for:'Scheduled for',

      /* packages */
      pkg_title:'Fixed packages', pkg_sub:'Choose what comes, which day, and what time. It repeats every week until you stop it.',
      pkg_build:'Build your own', pkg_name:'Name this package', pkg_name_ph:'e.g. Sunday soup',
      pkg_day:'Which day', pkg_time:'What time', pkg_items:'What goes in it',
      pkg_start:'Start this package', pkg_active:'Active package', pkg_stop:'Stop package',
      pkg_every:'Every', pkg_at:'at', pkg_none:'No package yet',
      pkg_none_sub:'A fixed package costs 9% less and holds your slot on busy days.',
      pkg_saving:'9% cheaper than ordering one by one',

      /* orders */
      orders_title:'Orders', no_orders:'No orders yet',
      no_orders_sub:'Place one and watch it move from the stall to your door.',
      ledger:'Inspection ledger', delivered:'Delivered', in_progress:'On the way',
      flag_title:'Something not right?', flag_sub:'One tap. No form, no photos from you.',
      flag_cta:'Report an item', flagged_ok:'Reported. A replacement comes on the next run.',
      collect:'Collect points', in_this_order:'In this order', paid:'Paid',
      rider:'rider', call_rider:'Call the rider',

      /* me */
      me_title:'Me', language:'Language', text_size:'Text size',
      text_normal:'Normal', text_large:'Large', text_xlarge:'Largest',
      my_orders:'My orders', my_packages:'My packages', guarantee:'Our guarantee',
      weeks_fresh:'weeks fresh', points_worth:'100 points = ₦100 off produce',
      redeem:'Redeem',
      g1:'Photographed before it leaves', g1s:'Every basket, timed and stamped at the stall.',
      g2:'One tap to replace', g2s:'Until 9pm the next day. No form, no argument.',
      g3:'Two vendors, scored weekly', g3s:'Above 15% rejection twice and a stall is dropped.',
      lang_note:'Igbo, Hausa and Yoruba are a first pass and need a native speaker’s review.'
    },

    ig: {
      w_tagline:'Tomato iri. Iri ha dị mma.',
      w_sub:'Ihe ubi si Wuse, e ji aka nyochaa ma see foto tupu ọ hapụ ebe ahịa.',
      w_lang:'Họrọ asụsụ gị',
      w_where:'Ebee ka anyị ga-ebuga ya?',
      w_start:'Malite ịzụ ahịa',
      w_change:'Ị nwere ike ịgbanwe ha abụọ mgbe e mesịrị',
      min_title:'Ihe kacha nta ị ga-azụ',
      min_short:'Tinye {X} ọzọ ka ị kwụọ ụgwọ',
      min_note:'Ịzụ ahịa na-amalite na {MIN}. Otu onye na-ebuga, otu njem — obere nkata na-efu ego karịa uru ọ bara.',
      nav_market:'Ahịa', nav_prices:'Ọnụahịa', nav_list:'Ndepụta m', nav_basket:'Nkata', nav_me:'Mụ',
      nav_demand:'Ihe achọrọ', nav_pickups:'Nnakọta', nav_score:'Ọkwa', nav_payouts:'Ụgwọ',
      nav_today:'Taa', nav_vendors:'Ndị na-ere', nav_quality:'Ịdị mma', nav_zones:'Mpaghara',
      search_ph:'Chọọ tomato, ugu, azụ…',
      delivering_to:'na-ebuga taa', closes_in:'Ahịa na-emechi maka echi na',
      back:'Laghachi', done:'Emechaa', cancel:'Kagbuo', confirm:'Kwado', add:'Tinye', added:'Etinyela',
      yes:'Ee', no:'Mba', all:'Ihe niile', items:'ihe', week:'izu', free:'N’efu',

      streak_label:'Izu ọhụrụ', streak_weeks:'izu', points_label:'Akara Kasua',
      cheaper_today:'Dị ọnụ ala taa', vs_last_week:'karịa izu gara aga',
      usual_title:'Nke ị na-azụkarị', usual_cta:'Otu pị',
      todays_market:'Ahịa taa',
      promo_eyebrow:'Ngwugwu kwadoro', promo_title:'Kwụsị ịzụ otu ihe anọ ugboro ugboro',
      promo_sub:'Otu ụbọchị, otu oge, kwa izu.', promo_cta:'Wuo ya',
      checked_at:'Enyochara', track_order:'Soro ihe ị zụrụ',

      prices_title:'Bọọdụ ọnụahịa', prices_sub:'A na-agbanwe ya kwa ụtụtụ tupu elekere asaa, mechie ya ruo ọgwụgwụ ụbọchị.',
      price_up:'rịgoro', price_down:'dara', price_held:'ka ọ dị',
      why_moved:'Ihe kpatara ọ gbanwere', biggest_falls:'Ndị dara kacha', biggest_rises:'Ndị rịgoro kacha',
      price_locked:'Emechiri ruo ụtụtụ echi', last_12:'Izu iri na abụọ gara aga',

      list_title:'Depụta ihe m chọrọ', list_intro:'Dee ndepụta gị otú ị ga-esi kwuo ya, ma ọ bụ zipu foto nke edere ede. Anyị ga-achọta ha n’ahịa taa.',
      list_ph:'d.ọ. tomato nkata abụọ, otu ugu, ose, azụ',
      list_type:'Dee ya', list_photo:'Zipu foto', list_build:'Mepụta ndepụta m',
      list_found:'Achọtara', list_missing:'Ọ dịghị n’ahịa anyị', list_addall:'Tinye ha niile na nkata',
      list_empty:'Buru ụzọ dee ihe', list_photo_note:'Ịgụ foto bụ naanị ihe atụ na demo a.',
      list_reading:'Na-agụ ndepụta gị…',

      basket_title:'Nkata gị', basket_empty:'Ọ dịghị ihe dị ebe a',
      basket_empty_sub:'Tinye ihe si n’ahịa taa, ọ ga-apụta ebe a.',
      browse:'Lelee ahịa', subtotal:'Ngụkọta mbụ', delivery:'Nnyefe', total:'Ngụkọta',
      checkout:'Kwụọ ụgwọ', earns:'Ị ga-enweta', place_order:'Zụta ugbu a',
      deliver_to:'Bugara', payment:'Ụgwọ', when:'Kedu mgbe ị chọrọ ya?',
      pay_transfer:'Nzipu ego bank', pay_card:'Kaadị', pay_cash:'Kwụọ mgbe e wetara',
      pay_transfer_sub:'A ga-egosi akaụntụ mgbe i kwadoro', pay_card_sub:'Kaadị na-akwụsị na 4417',
      pay_cash_sub:'Nye onye na-ebuga ego',
      approve_debit:'Kwado ịkwụ ụgwọ', approve_sub:'Ị na-akwado ego ọ bụla tupu e wepụ ya.',
      demo_no_charge:'Demo — anaghị anara gị ego',

      today:'Taa', tomorrow:'Echi', slot_morning:'Ụtụtụ', slot_afternoon:'Ehihie',
      slot_evening:'Mgbede', slot_morning_t:'8 – 11 ụtụtụ', slot_afternoon_t:'12 – 3 ehihie',
      slot_evening_t:'4 – 7 mgbede', pick_day:'Họrọ ụbọchị', pick_time:'Họrọ oge',
      arriving:'Ọ na-abịa', scheduled_for:'Edobere ya maka',

      pkg_title:'Ngwugwu kwadoro', pkg_sub:'Họrọ ihe ga-abịa, ụbọchị, na oge. Ọ ga-abịa kwa izu ruo mgbe ị kwụsịrị ya.',
      pkg_build:'Wuo nke gị', pkg_name:'Kpọọ ngwugwu a aha', pkg_name_ph:'d.ọ. Ofe Sọnde',
      pkg_day:'Ụbọchị ole', pkg_time:'Oge ole', pkg_items:'Ihe ga-adị na ya',
      pkg_start:'Malite ngwugwu a', pkg_active:'Ngwugwu na-arụ ọrụ', pkg_stop:'Kwụsị ngwugwu',
      pkg_every:'Kwa', pkg_at:'na', pkg_none:'Enwebeghị ngwugwu',
      pkg_none_sub:'Ngwugwu kwadoro dị ọnụ ala 9% ma jide oge gị n’ụbọchị ndị siri ike.',
      pkg_saving:'Dị ọnụ ala 9% karịa ịzụ otu otu',

      orders_title:'Ihe m zụrụ', no_orders:'Ọ dịghị ihe ị zụrụ',
      no_orders_sub:'Zụta otu ma hụ ka o si n’ahịa bịaruo n’ọnụ ụzọ gị.',
      ledger:'Akwụkwọ nyocha', delivered:'Ewetara ya', in_progress:'Ọ na-abịa',
      flag_title:'Ọ dịghị mma?', flag_sub:'Otu pị. Ọ dịghị fọm, ọ dịghị foto ị ga-eziga.',
      flag_cta:'Kọọ banyere ihe', flagged_ok:'Anabatala ya. A ga-eweta nnọchi n’oge ọzọ.',
      collect:'Nara akara gị', in_this_order:'Ihe dị na ya', paid:'Ụgwọ akwụrụ',
      rider:'onye na-ebuga', call_rider:'Kpọọ onye na-ebuga',

      me_title:'Mụ', language:'Asụsụ', text_size:'Nha mkpụrụedemede',
      text_normal:'Nkịtị', text_large:'Buru ibu', text_xlarge:'Kacha ibu',
      my_orders:'Ihe m zụrụ', my_packages:'Ngwugwu m', guarantee:'Nkwa anyị',
      weeks_fresh:'izu ọhụrụ', points_worth:'Akara 100 = ₦100 ka ewepụ',
      redeem:'Gbanwee ya',
      g1:'A na-ese ya foto tupu ọ pụọ', g1s:'Nkata ọ bụla, e depụtara oge na aha n’ahịa.',
      g2:'Otu pị iji dochie ya', g2s:'Ruo elekere itoolu abalị echi. Ọ dịghị fọm, ọ dịghị esemokwu.',
      g3:'Ndị na-ere abụọ, a na-enyocha kwa izu', g3s:'Ọ gafee 15% ugboro abụọ, a chụpụ ha.',
      lang_note:'Igbo, Hausa na Yoruba bụ nsụgharị mbụ — onye na-asụ ya kwesịrị ilele ya.'
    },

    ha: {
      w_tagline:'Tumatir goma. Goma masu kyau.',
      w_sub:'Kayan lambu daga Wuse, an duba da hannu an kuma ɗauki hoto kafin ya bar shago.',
      w_lang:'Zaɓi harshenka',
      w_where:'Ina za mu kai?',
      w_start:'Fara siyayya',
      w_change:'Za ka iya canza duka biyu daga baya',
      min_title:'Mafi ƙarancin oda',
      min_short:'Ƙara {X} don ka biya',
      min_note:'Oda na farawa daga {MIN}. Mai kaiwa ɗaya, tafiya ɗaya — ƙananan kwando sun fi tsada a kai fiye da darajarsu.',
      nav_market:'Kasuwa', nav_prices:'Farashi', nav_list:'Jerina', nav_basket:'Kwando', nav_me:'Ni',
      nav_demand:'Buƙata', nav_pickups:'Ɗauka', nav_score:'Maki', nav_payouts:'Biya',
      nav_today:'Yau', nav_vendors:'Masu sayarwa', nav_quality:'Inganci', nav_zones:'Yankuna',
      search_ph:'Nemi tumatir, ugu, kifi…',
      delivering_to:'ana kaiwa yau', closes_in:'Kasuwa na rufewa don gobe cikin',
      back:'Koma', done:'An gama', cancel:'Soke', confirm:'Tabbatar', add:'Ƙara', added:'An ƙara',
      yes:'Eh', no:"A'a", all:'Komai', items:'kaya', week:'mako', free:'Kyauta',

      streak_label:'Sabbin makonni', streak_weeks:'makonni', points_label:'Maki Kasua',
      cheaper_today:'Mai rahusa yau', vs_last_week:'idan aka kwatanta da makon jiya',
      usual_title:'Abin da ka saba saya', usual_cta:'Danna sau ɗaya',
      todays_market:'Kasuwar yau',
      promo_eyebrow:'Kunshin da aka tsara', promo_title:'Ka daina sake yin oda iri ɗaya kowane mako',
      promo_sub:'Rana ɗaya, lokaci ɗaya, kowane mako.', promo_cta:'Gina shi',
      checked_at:'An duba', track_order:'Bi odarka',

      prices_title:'Allon farashi', prices_sub:'Ana sabunta shi kowace safiya kafin ƙarfe 7, sannan a kulle shi har ƙarshen rana.',
      price_up:'ya tashi', price_down:'ya sauka', price_held:'bai canza ba',
      why_moved:'Dalilin canjin', biggest_falls:'Mafi saukowa', biggest_rises:'Mafi tashi',
      price_locked:'A kulle har safiyar gobe', last_12:'Makonni 12 da suka wuce',

      list_title:'Gina jerina', list_intro:'Rubuta jerinka kamar yadda za ka faɗe shi, ko ka aika hoton wanda aka rubuta. Za mu nemo su a kasuwar yau.',
      list_ph:'misali kwandon tumatir 2, ugu ɗaya, barkono, kifi',
      list_type:'Rubuta shi', list_photo:'Aika hoto', list_build:'Gina jerina',
      list_found:'An samu', list_missing:'Ba ya cikin jerinmu', list_addall:'Saka duka a kwando',
      list_empty:'Ka fara rubuta wani abu', list_photo_note:'Karanta hoto kwaikwayo ne kawai a wannan demo.',
      list_reading:'Ana karanta jerinka…',

      basket_title:'Kwandonka', basket_empty:'Babu kome a nan tukuna',
      basket_empty_sub:'Ƙara wani abu daga kasuwar yau, zai bayyana a nan.',
      browse:'Duba kasuwa', subtotal:'Jimla ta farko', delivery:'Kaiwa', total:'Jimla',
      checkout:'Biya', earns:'Za ka samu', place_order:'Yi oda',
      deliver_to:'A kai wa', payment:'Biya', when:'Yaushe ake so ya zo?',
      pay_transfer:'Tura kuɗi banki', pay_card:'Kati', pay_cash:'Biya lokacin kaiwa',
      pay_transfer_sub:'Za a nuna asusu bayan ka tabbatar', pay_card_sub:'Kati mai ƙarewa da 4417',
      pay_cash_sub:'Ba wa mai kaiwa kuɗi',
      approve_debit:'Amince da biyan', approve_sub:'Kai ne ke amincewa kafin a cire kowane kuɗi.',
      demo_no_charge:'Demo — ba a cire kuɗi',

      today:'Yau', tomorrow:'Gobe', slot_morning:'Safe', slot_afternoon:'Rana',
      slot_evening:'Yamma', slot_morning_t:'8 – 11 na safe', slot_afternoon_t:'12 – 3 na rana',
      slot_evening_t:'4 – 7 na yamma', pick_day:'Zaɓi rana', pick_time:'Zaɓi lokaci',
      arriving:'Yana zuwa', scheduled_for:'An tsara don',

      pkg_title:'Kunshi da aka tsara', pkg_sub:'Zaɓi abin da zai zo, ranar, da lokacin. Zai maimaita kowane mako har sai ka tsayar.',
      pkg_build:'Gina naka', pkg_name:'Ba wannan kunshin suna', pkg_name_ph:'misali Miyar Lahadi',
      pkg_day:'Wace rana', pkg_time:'Wane lokaci', pkg_items:'Abin da ke ciki',
      pkg_start:'Fara wannan kunshin', pkg_active:'Kunshi mai aiki', pkg_stop:'Tsayar da kunshin',
      pkg_every:'Kowane', pkg_at:'da', pkg_none:'Babu kunshi tukuna',
      pkg_none_sub:'Kunshi da aka tsara yana da rahusa 9% kuma yana riƙe maka lokaci a ranakun cunkoso.',
      pkg_saving:'Rahusa 9% fiye da siya ɗaya ɗaya',

      orders_title:'Odarka', no_orders:'Babu oda tukuna',
      no_orders_sub:'Yi ɗaya ka gani yadda yake tafiya daga kasuwa zuwa ƙofarka.',
      ledger:'Littafin dubawa', delivered:'An kai', in_progress:'Yana kan hanya',
      flag_title:'Wani abu bai yi kyau ba?', flag_sub:'Danna sau ɗaya. Babu fom, babu hoto daga gare ka.',
      flag_cta:'Kai ƙara kan kaya', flagged_ok:'An karɓa. Za a kawo maye a tafiya ta gaba.',
      collect:'Karɓi makinka', in_this_order:'Abin da ke cikin oda', paid:'An biya',
      rider:'mai kaiwa', call_rider:'Kira mai kaiwa',

      me_title:'Ni', language:'Harshe', text_size:'Girman rubutu',
      text_normal:'Talakawa', text_large:'Babba', text_xlarge:'Mafi girma',
      my_orders:'Odata', my_packages:'Kunshina', guarantee:'Alkawarinmu',
      weeks_fresh:'makonni na sabo', points_worth:'Maki 100 = ₦100 ragi',
      redeem:'Yi amfani',
      g1:'Ana ɗaukar hoto kafin ya bar kasuwa', g1s:'Kowane kwando, da lokaci da sunan mai dubawa.',
      g2:'Danna sau ɗaya a maye gurbinsa', g2s:'Har ƙarfe 9 na daren gobe. Babu fom, babu jayayya.',
      g3:'Masu sayarwa biyu, ana ba su maki kowane mako', g3s:'Ya wuce 15% sau biyu, sai a cire shi.',
      lang_note:'Igbo, Hausa da Yoruba fassara ta farko ce — tana buƙatar duba daga masani.'
    },

    yo: {
      w_tagline:'Tòmátì mẹ́wàá. Mẹ́wàá tó dára.',
      w_sub:'Ọjà láti Wuse, a fi ọwọ́ yẹ̀ ẹ́ wò a sì ya fọ́tò rẹ̀ kí ó tó kúrò ní ibùdó.',
      w_lang:'Yan èdè rẹ',
      w_where:'Níbo ni kí a fi jíṣẹ́ sí?',
      w_start:'Bẹ̀rẹ̀ ríra',
      w_change:'O lè yí àwọn méjèèjì padà nígbà tó bá yá',
      min_title:'Ìwọ̀n ìbéèrè tí ó kéré jù',
      min_short:'Fi {X} kún un kí o tó sanwó',
      min_note:'Ìbéèrè bẹ̀rẹ̀ ní {MIN}. Ẹni tó ń fijíṣẹ́ kan, ìrìn kan — agbọ̀n kékeré ná owó ìfijíṣẹ́ ju iye rẹ̀ lọ.',
      nav_market:'Ọjà', nav_prices:'Owó', nav_list:'Àkọsílẹ̀ mi', nav_basket:'Agbọ̀n', nav_me:'Èmi',
      nav_demand:'Ohun tí a fẹ́', nav_pickups:'Gbígbà', nav_score:'Àmì', nav_payouts:'Ìsanwó',
      nav_today:'Lónìí', nav_vendors:'Atáwọn', nav_quality:'Dídára', nav_zones:'Agbègbè',
      search_ph:'Wá tòmátì, ugu, ẹja…',
      delivering_to:'à ń fi jíṣẹ́ lónìí', closes_in:'Ọjà tì fún ọ̀la ní',
      back:'Padà', done:'Ó parí', cancel:'Fagilé', confirm:'Fọwọ́ sí', add:'Fikun', added:'A ti fikun',
      yes:'Bẹ́ẹ̀ ni', no:'Bẹ́ẹ̀ kọ́', all:'Gbogbo rẹ̀', items:'ohun', week:'ọ̀sẹ̀', free:'Ọ̀fẹ́',

      streak_label:'Ọ̀sẹ̀ tuntun', streak_weeks:'ọ̀sẹ̀', points_label:'Àmì Kasua',
      cheaper_today:'Ó din owó lónìí', vs_last_week:'ní ìfiwéra ọ̀sẹ̀ tó kọjá',
      usual_title:'Ohun tí o máa ń rà', usual_cta:'Ìtẹ̀ kan',
      todays_market:'Ọjà òní',
      promo_eyebrow:'Àpò tí a ṣètò', promo_title:'Dáwọ́ ríra ohun mẹ́rin kan náà léraléra',
      promo_sub:'Ọjọ́ kan, àkókò kan, ní ọ̀sẹ̀ kọ̀ọ̀kan.', promo_cta:'Kọ́ ọ',
      checked_at:'A ti yẹ̀ ẹ́ wò', track_order:'Tọpa ìbéèrè rẹ',

      prices_title:'Pátákó owó', prices_sub:'A ń ṣàtúnṣe rẹ̀ ní àárọ̀ kọ̀ọ̀kan kí ó tó aago méje, a sì tì í dé òpin ọjọ́.',
      price_up:'ó gòkè', price_down:'ó sọ̀kalẹ̀', price_held:'kò yípadà',
      why_moved:'Ìdí tí ó fi yípadà', biggest_falls:'Èyí tó sọ̀kalẹ̀ jù', biggest_rises:'Èyí tó gòkè jù',
      price_locked:'Ó tì dé àárọ̀ ọ̀la', last_12:'Ọ̀sẹ̀ méjìlá sẹ́yìn',

      list_title:'Kọ àkọsílẹ̀ mi', list_intro:'Kọ àkọsílẹ̀ rẹ bí ìwọ ṣe máa sọ ọ́, tàbí fi fọ́tò èyí tí a kọ ránṣẹ́. A ó wá wọn ní ọjà òní.',
      list_ph:'àpẹẹrẹ agbọ̀n tòmátì 2, ugu kan, ata, ẹja',
      list_type:'Kọ ọ́', list_photo:'Fi fọ́tò ránṣẹ́', list_build:'Kọ àkọsílẹ̀ mi',
      list_found:'A rí i', list_missing:'Kò sí nínú àkọsílẹ̀ wa', list_addall:'Fi gbogbo rẹ̀ sínú agbọ̀n',
      list_empty:'Kọ nǹkan kan kọ́kọ́', list_photo_note:'Kíka fọ́tò jẹ́ àfarawé nínú demo yìí.',
      list_reading:'À ń ka àkọsílẹ̀ rẹ…',

      basket_title:'Agbọ̀n rẹ', basket_empty:'Kò sí nǹkan níbí síbẹ̀',
      basket_empty_sub:'Fi nǹkan kún un láti ọjà òní, yóò farahàn níbí.',
      browse:'Wo ọjà', subtotal:'Àpapọ̀ àkọ́kọ́', delivery:'Ìfijíṣẹ́', total:'Àpapọ̀',
      checkout:'Sanwó', earns:'Wàá rí', place_order:'Ra báyìí',
      deliver_to:'Fi jíṣẹ́ sí', payment:'Ìsanwó', when:'Ìgbà wo ni kí ó dé?',
      pay_transfer:'Ìfiránṣẹ́ owó báǹkì', pay_card:'Káàdì', pay_cash:'Sanwó nígbà ìfijíṣẹ́',
      pay_transfer_sub:'A ó fi àkántì hàn lẹ́yìn tí o bá fọwọ́ sí', pay_card_sub:'Káàdì tó parí ní 4417',
      pay_cash_sub:'Fún ẹni tó ń fijíṣẹ́ ní owó',
      approve_debit:'Fọwọ́ sí ìsanwó', approve_sub:'Ìwọ ni ó fọwọ́ sí owó kọ̀ọ̀kan kí a tó gbà á.',
      demo_no_charge:'Demo — a kò gba owó kankan',

      today:'Lónìí', tomorrow:'Ọ̀la', slot_morning:'Àárọ̀', slot_afternoon:'Ọ̀sán',
      slot_evening:'Ìrọ̀lẹ́', slot_morning_t:'8 – 11 àárọ̀', slot_afternoon_t:'12 – 3 ọ̀sán',
      slot_evening_t:'4 – 7 ìrọ̀lẹ́', pick_day:'Yan ọjọ́', pick_time:'Yan àkókò',
      arriving:'Ó ń bọ̀', scheduled_for:'A ṣètò fún',

      pkg_title:'Àpò tí a ṣètò', pkg_sub:'Yan ohun tí yóò dé, ọjọ́ tí yóò dé, àti àkókò rẹ̀. Yóò máa tún ṣẹlẹ̀ ní ọ̀sẹ̀ kọ̀ọ̀kan títí wàá fi dá a dúró.',
      pkg_build:'Kọ́ tìrẹ', pkg_name:'Sọ àpò yìí ní orúkọ', pkg_name_ph:'àpẹẹrẹ Ọbẹ̀ Ọjọ́ Àìkú',
      pkg_day:'Ọjọ́ wo', pkg_time:'Àkókò wo', pkg_items:'Ohun tí ó wà nínú rẹ̀',
      pkg_start:'Bẹ̀rẹ̀ àpò yìí', pkg_active:'Àpò tó ń ṣiṣẹ́', pkg_stop:'Dá àpò dúró',
      pkg_every:'Ní gbogbo', pkg_at:'ní', pkg_none:'Kò sí àpò síbẹ̀',
      pkg_none_sub:'Àpò tí a ṣètò din owó ní 9% ó sì dì àkókò rẹ mú ní ọjọ́ tí ọjà pọ̀.',
      pkg_saving:'Ó din owó ní 9% ju ríra ọ̀kọ̀ọ̀kan',

      orders_title:'Ìbéèrè', no_orders:'Kò sí ìbéèrè síbẹ̀',
      no_orders_sub:'Ra ọ̀kan kí o sì wo bí ó ṣe ń rìn láti ọjà dé ẹnu ọ̀nà rẹ.',
      ledger:'Ìwé àyẹ̀wò', delivered:'A ti fijíṣẹ́', in_progress:'Ó wà lọ́nà',
      flag_title:'Ǹjẹ́ nǹkan kan kò dára?', flag_sub:'Ìtẹ̀ kan. Kò sí fọ́ọ̀mù, kò sí fọ́tò láti ọ̀dọ̀ rẹ.',
      flag_cta:'Ròyìn ohun kan', flagged_ok:'A ti gbà á. Ohun tuntun yóò dé ní ìrìn tó ń bọ̀.',
      collect:'Gba àmì rẹ', in_this_order:'Ohun tó wà nínú rẹ̀', paid:'A ti san',
      rider:'ẹni tó ń fijíṣẹ́', call_rider:'Pe ẹni tó ń fijíṣẹ́',

      me_title:'Èmi', language:'Èdè', text_size:'Ìwọ̀n ìkọ̀wé',
      text_normal:'Déédéé', text_large:'Ńlá', text_xlarge:'Tó tóbi jù',
      my_orders:'Ìbéèrè mi', my_packages:'Àpò mi', guarantee:'Ìlérí wa',
      weeks_fresh:'ọ̀sẹ̀ tuntun', points_worth:'Àmì 100 = ₦100 ìdínkù',
      redeem:'Lò ó',
      g1:'A ya fọ́tò rẹ̀ kí ó tó kúrò', g1s:'Agbọ̀n kọ̀ọ̀kan, pẹ̀lú àkókò àti orúkọ ní ibùdó.',
      g2:'Ìtẹ̀ kan láti rọ́pò rẹ̀', g2s:'Títí di aago mẹ́sàn-án alẹ́ ọ̀la. Kò sí fọ́ọ̀mù, kò sí ìjà.',
      g3:'Atáwọn méjì, a ń fún wọn ní àmì lọ́sọ̀ọ̀sẹ̀', g3s:'Bí ó bá kọjá 15% lẹ́ẹ̀mejì, a ó yọ ibùdó náà kúrò.',
      lang_note:'Igbo, Hausa àti Yorùbá jẹ́ ìtumọ̀ àkọ́kọ́ — ó nílò àyẹ̀wò ọ̀dọ̀ ẹni tí ó sọ èdè náà.'
    }
  };

  var current = 'en';

  function setLang(id) {
    if (DICT[id]) { current = id; try { localStorage.setItem('kasua-lang', id); } catch (e) {} }
    return current;
  }
  function getLang() { return current; }
  function t(key) {
    var d = DICT[current];
    if (d && d[key] != null) return d[key];
    return DICT.en[key] != null ? DICT.en[key] : key;
  }

  try { var saved = localStorage.getItem('kasua-lang'); if (saved && DICT[saved]) current = saved; } catch (e) {}

  root.KL = { LANGS: LANGS, t: t, setLang: setLang, getLang: getLang, dict: DICT };
})(window);
