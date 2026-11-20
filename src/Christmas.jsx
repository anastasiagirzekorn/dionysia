// 🎄 Dionysia Christmas season: advent calendar, Christmas markets, snow and music.
// Everything here switches itself on from 20 Nov and off after 7 Jan.
// Test any time with ?xmas=1 (show the season) or ?advent=all (all doors open).
import { useState, useEffect, useRef } from "react";

const BG="#1a0810",TEXT="#ede0cc",ACCENT="#c49a5a",MUTED="#c8a878",DIM="#9a7848";
const CARD="rgba(196,154,90,0.07)",B="rgba(196,154,90,0.2)",B2="rgba(196,154,90,0.5)";
const BTN="linear-gradient(135deg,#3a1020,#5a2030)";
const FONT="'Raleway',sans-serif";

const ga=(name,params)=>{try{if(window.gtag)window.gtag("event",name,params||{});}catch(e){}};
const qs=(k)=>{try{return new URLSearchParams(window.location.search).get(k);}catch(e){return null;}};
const lsGet=(k)=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};

// Season: 20 Nov – 7 Jan
export const inSeason=()=>{
  if(qs("xmas")==="1"||qs("advent")==="all") return true;
  const d=new Date(),m=d.getMonth(),day=d.getDate();
  return (m===10&&day>=20)||m===11||(m===0&&day<=7);
};
// Which advent doors can be opened (1..24)
const openUpTo=()=>{
  if(qs("advent")==="all") return 24;
  const d=new Date(),m=d.getMonth(),day=d.getDate();
  if(m===11) return Math.min(day,24);
  if(m===0) return 24;
  return 0;
};
const daysToDec1=()=>{const n=new Date();const t=new Date(n.getFullYear(),11,1);return Math.max(1,Math.ceil((t-n)/86400000));};

/* ───────────── Christmas markets (dates checked Nov 2026) ───────────── */
export const MARKETS={
  CZ:[
    {city:{en:"Prague",ua:"Прага"},name:{en:"Old Town Square & Wenceslas Square",ua:"Староміська та Вацлавська площі"},dates:{en:"28 Nov 2026 – 6 Jan 2027, daily 10:00–22:00",ua:"28 листопада 2026 – 6 січня 2027, щодня 10:00–22:00"},tip:{en:"Svařák (mulled wine), medovina (honey wine) and roasted chestnuts under the Týn Church.",ua:"Svařák (глінтвейн), медовина і смажені каштани під Тинським храмом."}},
    {city:{en:"Brno",ua:"Брно"},name:{en:"Zelný trh, Moravské náměstí and more",ua:"Зелний трг, Моравська площа та інші"},dates:{en:"From 13 Nov 2026; main squares until 23–31 Dec",ua:"З 13 листопада 2026; основні площі до 23–31 грудня"},tip:{en:"The gateway to Moravian wine country — ask for mulled wine made from local Frankovka.",ua:"Ворота до винної Моравії — питайте глінтвейн з місцевої Frankovka."}},
  ],
  HR:[
    {city:{en:"Zagreb",ua:"Загреб"},name:{en:"Advent u Zagrebu",ua:"Адвент у Загребі"},dates:{en:"28 Nov 2026 – 7 Jan 2027",ua:"28 листопада 2026 – 7 січня 2027"},tip:{en:"City-wide, from Ban Jelačić Square to the Upper Town. Kuhano vino and fritule.",ua:"По всьому центру — від площі бана Єлачича до Верхнього міста. Kuhano vino і фрітуле."}},
    {city:{en:"Zadar",ua:"Задар"},name:{en:"Advent u Zadru",ua:"Адвент у Задарі"},dates:{en:"24 Nov 2026 – 2 Jan 2027",ua:"24 листопада 2026 – 2 січня 2027"},tip:{en:"Christmas by the sea around Trg Petra Zoranića, with concerts and an ice rink.",ua:"Різдво біля моря навколо площі Петра Зоранича, з концертами і ковзанкою."}},
  ],
  HU:[
    {city:{en:"Budapest",ua:"Будапешт"},name:{en:"Vörösmarty Square",ua:"Площа Верешмарті"},dates:{en:"13 Nov – 31 Dec 2026, free entry",ua:"13 листопада – 31 грудня 2026, вхід вільний"},tip:{en:"Forralt bor (mulled wine) and kürtőskalács — chimney cake baked over coals.",ua:"Forralt bor (глінтвейн) і кюртёшкалач — «трубочка», спечена на вугіллі."}},
    {city:{en:"Budapest",ua:"Будапешт"},name:{en:"Advent Basilica",ua:"Адвент біля Базиліки"},dates:{en:"13 Nov 2026 – 1 Jan 2027, free entry",ua:"13 листопада 2026 – 1 січня 2027, вхід вільний"},tip:{en:"Light show on the façade of St Stephen's Basilica every evening.",ua:"Щовечора світлове шоу на фасаді Базиліки святого Іштвана."}},
  ],
  FR:[
    {city:{en:"Strasbourg",ua:"Страсбург"},name:{en:"Christkindelsmärik",ua:"Christkindelsmärik"},dates:{en:"27 Nov – 24 Dec 2026 (check the official site)",ua:"27 листопада – 24 грудня 2026 (перевірте на офіційному сайті)"},tip:{en:"Held since 1570 — one of Europe's oldest. Try vin chaud blanc, white mulled wine.",ua:"Проводиться з 1570 року — один з найстаріших у Європі. Спробуйте vin chaud blanc — біле гаряче вино."}},
    {city:{en:"Colmar",ua:"Кольмар"},name:{en:"Six markets in the old town",ua:"Шість ярмарків у старому місті"},dates:{en:"23 Nov – 29 Dec 2026; food market until 3 Jan",ua:"23 листопада – 29 грудня 2026; гастроярмарок до 3 січня"},tip:{en:"The capital of Alsace wine — combine it with villages on the Wine Route.",ua:"Столиця ельзаського вина — поєднайте з селами Винного шляху."}},
  ],
  IT:[
    {city:{en:"Bolzano",ua:"Больцано"},name:{en:"Christkindlmarkt, Piazza Walther",ua:"Christkindlmarkt, площа Вальтера"},dates:{en:"26 Nov 2026 – 6 Jan 2027 (closed 25 Dec)",ua:"26 листопада 2026 – 6 січня 2027 (25 грудня зачинено)"},tip:{en:"Italy's first Christmas market, 35th edition. Alto Adige wines, speck and Zelten.",ua:"Перший різдвяний ярмарок Італії, 35-й рік. Вина Альто-Адідже, спек і фруктовий хліб Zelten."}},
    {city:{en:"Merano & Bressanone",ua:"Мерано і Брессаноне"},name:{en:"South Tyrol markets",ua:"Ярмарки Південного Тиролю"},dates:{en:"From 26 Nov 2026 to 6 Jan 2027",ua:"З 26 листопада 2026 до 6 січня 2027"},tip:{en:"Both under 45 minutes by train from Bolzano — easy to do all three.",ua:"Обидва — менш як 45 хвилин потягом з Больцано, легко встигнути всі три."}},
  ],
  PT:[
    {city:{en:"Lisbon",ua:"Лісабон"},name:{en:"Wonderland Lisboa, Parque Eduardo VII",ua:"Wonderland Lisboa, парк Едуарду VII"},dates:{en:"27 Nov 2026 – 3 Jan 2027, free entry",ua:"27 листопада 2026 – 3 січня 2027, вхід вільний"},tip:{en:"Portugal's biggest Christmas market, with a Ferris wheel and ice rink. Roasted chestnuts!",ua:"Найбільший різдвяний ярмарок Португалії, з оглядовим колесом і ковзанкою. Смажені каштани!"}},
    {city:{en:"Óbidos",ua:"Обідуш"},name:{en:"Óbidos Vila Natal",ua:"Óbidos Vila Natal"},dates:{en:"27 Nov 2026 – 3 Jan 2027, ticketed",ua:"27 листопада 2026 – 3 січня 2027, за квитками"},tip:{en:"A medieval walled town turned Christmas village. Sip ginjinha from a chocolate cup.",ua:"Середньовічне місто в мурах стає різдвяним селищем. Спробуйте жинжинью в шоколадній чашечці."}},
  ],
  ES:[
    {city:{en:"Madrid",ua:"Мадрид"},name:{en:"Plaza Mayor",ua:"Пласа-Майор"},dates:{en:"Late Nov – 31 Dec 2026",ua:"Кінець листопада – 31 грудня 2026"},tip:{en:"Nativity figures, decorations and funny hats for New Year's Eve.",ua:"Фігурки для вертепу, прикраси і кумедні капелюхи на Новий рік."}},
    {city:{en:"Barcelona",ua:"Барселона"},name:{en:"Fira de Santa Llúcia",ua:"Ярмарок Санта-Льусія"},dates:{en:"28 Nov – 23 Dec 2026, 10:00–21:00",ua:"28 листопада – 23 грудня 2026, 10:00–21:00"},tip:{en:"In front of the cathedral since 1786. Look for the caganer and the Tió log.",ua:"Перед собором з 1786 року. Шукайте фігурку caganer і полінце Tió."}},
  ],
  UA:[
    {city:{en:"Lviv",ua:"Львів"},name:{en:"Rynok Square & Svobody Avenue",ua:"Площа Ринок і проспект Свободи"},dates:{en:"2026 dates not announced yet; in 2025 it ran 22 Dec – 4 Jan",ua:"Дати на 2026 ще не оголошені; у 2025 ярмарок працював 22 грудня – 4 січня"},tip:{en:"In 2025 the market returned to Rynok Square for the first time since the full-scale invasion. Mulled wine, pampushky and Lviv chocolate.",ua:"У 2025 ярмарок уперше від початку повномасштабного вторгнення повернувся на площу Ринок. Глінтвейн, пампухи і львівський шоколад."}},
  ],
  DK:[
    {city:{en:"Copenhagen",ua:"Копенгаген"},name:{en:"Christmas in Tivoli",ua:"Різдво в Тіволі"},dates:{en:"13 Nov 2026 – 3 Jan 2027, ticketed (closed 24 Dec)",ua:"13 листопада 2026 – 3 січня 2027, за квитками (24 грудня зачинено)"},tip:{en:"Gløgg with æbleskiver — round pancake puffs with jam and icing sugar.",ua:"Gløgg з еблесківерами — круглими пончиками з варенням і цукровою пудрою."}},
    {city:{en:"Copenhagen",ua:"Копенгаген"},name:{en:"Rådhuspladsen",ua:"Ратушна площа"},dates:{en:"11–20 Dec 2026, free",ua:"11–20 грудня 2026, вхід вільний"},tip:{en:"A free market right outside Tivoli's gates.",ua:"Безкоштовний ярмарок просто біля воріт Тіволі."}},
  ],
  SE:[
    {city:{en:"Stockholm",ua:"Стокгольм"},name:{en:"Stortorget, Gamla stan",ua:"Стурторгет, Гамла-стан"},dates:{en:"About 21 Nov – 23 Dec 2026, free",ua:"Приблизно 21 листопада – 23 грудня 2026, вхід вільний"},tip:{en:"Sweden's oldest Christmas market, held since 1837. Glögg and pepparkakor.",ua:"Найстаріший різдвяний ярмарок Швеції, з 1837 року. Глег і пряники pepparkakor."}},
    {city:{en:"Stockholm",ua:"Стокгольм"},name:{en:"Skansen",ua:"Скансен"},dates:{en:"Fri–Sun, 27 Nov – 20 Dec 2026 (museum ticket)",ua:"Пт–нд, 27 листопада – 20 грудня 2026 (за квитком до музею)"},tip:{en:"Christmas traditions in the world's oldest open-air museum.",ua:"Різдвяні традиції в найстарішому музеї просто неба у світі."}},
  ],
};
const FLAG={CZ:"🇨🇿",HR:"🇭🇷",HU:"🇭🇺",FR:"🇫🇷",IT:"🇮🇹",PT:"🇵🇹",ES:"🇪🇸",UA:"🇺🇦",DK:"🇩🇰",SE:"🇸🇪"};
const CNAME={CZ:{en:"Czech Republic",ua:"Чехія"},HR:{en:"Croatia",ua:"Хорватія"},HU:{en:"Hungary",ua:"Угорщина"},FR:{en:"France",ua:"Франція"},IT:{en:"Italy",ua:"Італія"},PT:{en:"Portugal",ua:"Португалія"},ES:{en:"Spain",ua:"Іспанія"},UA:{en:"Ukraine",ua:"Україна"},DK:{en:"Denmark",ua:"Данія"},SE:{en:"Sweden",ua:"Швеція"}};


/* ───────────── Christmas recipes with wine (one per country) ───────────── */
export const RECIPES={
 HR:{e:"🥩",t:{en:"Pašticada — Dalmatian beef in wine",ua:"Паштицада — далматинська яловичина у вині"},
  serves:6,time:{en:"Marinate overnight + 4 h",ua:"Маринування на ніч + 4 год"},
  intro:{en:"The festive dish of Dalmatia, served at Christmas, weddings and big family days — and a pride of Zadar.",ua:"Святкова страва Далмації — на Різдво, весілля і великі родинні свята. Нею особливо пишається Задар."},
  ing:{en:["1.2 kg beef (topside or silverside)","50 g pancetta in thin strips","4 garlic cloves, 4 whole cloves","250 ml wine vinegar + water for the marinade","2 onions, 2 carrots, 1 parsley root","6–8 prunes, 1 tbsp tomato paste","300 ml dry red wine (Plavac Mali)","100 ml prošek","1 bay leaf, a pinch of nutmeg, 500 ml beef stock"],
       ua:["1,2 кг яловичини (стегнова частина)","50 г бекону (панчети) тонкими смужками","4 зубчики часнику, 4 бутони гвоздики","250 мл винного оцту + вода для маринаду","2 цибулини, 2 моркви, 1 корінь петрушки","6–8 чорносливин, 1 ст. л. томатної пасти","300 мл сухого червоного вина (Плавац Малі)","100 мл прошеку","1 лавровий лист, дрібка мускатного горіху, 500 мл бульйону"]},
  steps:{en:["Make small cuts in the meat and stuff them with pancetta, garlic and cloves. Cover with vinegar and water and leave overnight in the fridge.","Dry the meat and brown it on all sides in a heavy pot.","Add chopped onions, carrots and parsley root; fry until soft, then stir in the tomato paste.","Pour in the red wine and prošek, add the prunes, bay leaf, nutmeg and stock.","Cover and simmer on low heat for about 3 hours, turning the meat now and then.","Take out the meat, blend the sauce until smooth, slice the meat and return it to the sauce. Serve with gnocchi."],
         ua:["Зробіть у м'ясі невеликі надрізи і нашпигуйте їх беконом, часником і гвоздикою. Залийте оцтом з водою і залиште на ніч у холодильнику.","Обсушіть м'ясо і обсмажте з усіх боків у казані з товстим дном.","Додайте нарізані цибулю, моркву і корінь петрушки, пасеруйте до м'якості, вмішайте томатну пасту.","Влийте червоне вино і прошек, додайте чорнослив, лавровий лист, мускатний горіх і бульйон.","Тушкуйте під кришкою на малому вогні близько 3 годин, час від часу перевертаючи м'ясо.","Вийміть м'ясо, збийте соус блендером до однорідності, наріжте м'ясо скибками і поверніть у соус. Подавайте з ньокі."]},
  wine:{en:"A Plavac Mali from Pelješac or Dingač.",ua:"Плавац Малі з Пелєшаца або Дінгач."}},
 HU:{e:"🍲",t:{en:"Borleves — Hungarian wine soup",ua:"Борлевеш — угорський винний суп"},
  serves:4,time:{en:"20 min",ua:"20 хв"},
  intro:{en:"A warm, silky wine soup that many Hungarian families serve on Christmas Eve.",ua:"Теплий оксамитовий винний суп, який багато угорських родин подають на Святвечір."},
  ing:{en:["750 ml dry white wine (Olaszrizling or Furmint)","250 ml water","4 egg yolks","80–100 g sugar","1 cinnamon stick, 5 cloves","Zest of 1 lemon"],
       ua:["750 мл сухого білого вина (Оласрислінг або Фурмінт)","250 мл води","4 жовтки","80–100 г цукру","1 паличка кориці, 5 бутонів гвоздики","Цедра 1 лимона"]},
  steps:{en:["Heat the wine, water, cinnamon, cloves and lemon zest and simmer gently for 5 minutes. Remove the spices.","Whisk the yolks with the sugar until pale.","Slowly pour a ladle of hot wine into the yolks, whisking all the time.","Pour the mixture back into the pot and heat on low, stirring, until slightly thickened. Do not let it boil, or the yolks will curdle.","Serve warm in cups."],
         ua:["Нагрійте вино з водою, корицею, гвоздикою і цедрою, поваріть на слабкому вогні 5 хвилин. Вийміть спеції.","Збийте жовтки з цукром до світлої маси.","Тонкою цівкою влийте ополоник гарячого вина в жовтки, постійно збиваючи.","Перелийте суміш назад у каструлю і грійте на малому вогні, помішуючи, доки трохи загусне. Не доводьте до кипіння, інакше жовтки згорнуться.","Подавайте теплим у чашках."]},
  wine:{en:"A dry Tokaji Furmint.",ua:"Сухий токайський Фурмінт."}},
 FR:{e:"🍐",t:{en:"Poires au vin — pears poached in red wine",ua:"Poires au vin — груші в червоному вині"},
  serves:4,time:{en:"50 min",ua:"50 хв"},
  intro:{en:"A simple French dessert that looks festive: whole pears turn deep ruby in spiced wine.",ua:"Простий французький десерт, який виглядає по-святковому: цілі груші стають рубіновими в пряному вині."},
  ing:{en:["4 firm pears","750 ml red wine (Côtes du Rhône)","150 g sugar","1 cinnamon stick, 2 star anise","Zest of 1 orange","½ vanilla pod (optional)"],
       ua:["4 тверді груші","750 мл червоного вина (Кот-дю-Рон)","150 г цукру","1 паличка кориці, 2 зірочки бадьяну","Цедра 1 апельсина","½ стручка ванілі (за бажанням)"]},
  steps:{en:["Peel the pears, keeping the stalks on. Cut a thin slice off the bottom so they stand up.","Bring the wine, sugar, spices and zest to a simmer.","Add the pears and simmer for 25–30 minutes, turning them so they colour evenly.","Lift out the pears and boil the wine until it reduces by half into a syrup (about 15 minutes).","Serve warm or cold, with the syrup and a spoon of crème fraîche."],
         ua:["Почистіть груші, залишивши хвостики. Зріжте тонкий шар знизу, щоб вони стояли.","Доведіть вино з цукром, спеціями і цедрою до легкого кипіння.","Покладіть груші і варіть на слабкому вогні 25–30 хвилин, перевертаючи, щоб вони рівно забарвились.","Вийміть груші, а вино уварюйте вдвічі до сиропу (близько 15 хвилин).","Подавайте теплими або холодними, з сиропом і ложкою крем-фреш."]},
  wine:{en:"A glass of Banyuls, the sweet red wine of Roussillon.",ua:"Келих Баньюльса — солодкого червоного вина з Руссільйону."}},
 IT:{e:"🍷",t:{en:"Brasato al Barolo — beef braised in Barolo",ua:"Brasato al Barolo — яловичина, тушкована в Бароло"},
  serves:6,time:{en:"Marinate overnight + 3.5 h",ua:"Маринування на ніч + 3,5 год"},
  intro:{en:"Piedmont's grand winter dish for festive tables. A good Langhe Nebbiolo works if Barolo is too dear.",ua:"Велика зимова страва П'ємонту для святкового столу. Якщо Бароло задорого, підійде добре Небіоло з Ланге."},
  ing:{en:["1.2 kg beef chuck in one piece","1 bottle Barolo or Langhe Nebbiolo","1 onion, 1 carrot, 1 celery stalk, 2 garlic cloves","1 sprig rosemary, 2 bay leaves","2 cloves, 4 juniper berries, a small piece of cinnamon","30 g butter, 2 tbsp olive oil, salt, pepper"],
       ua:["1,2 кг яловичої лопатки одним шматком","1 пляшка Бароло або Небіоло з Ланге","1 цибулина, 1 морква, 1 стебло селери, 2 зубчики часнику","1 гілочка розмарину, 2 лаврові листки","2 бутони гвоздики, 4 ягоди ялівцю, невеликий шматочок кориці","30 г вершкового масла, 2 ст. л. оливкової олії, сіль, перець"]},
  steps:{en:["Put the meat, chopped vegetables, herbs and spices in a bowl, cover with the wine and marinate overnight in the fridge.","Take out the meat, dry it and brown it well in butter and oil.","Add the drained vegetables and fry for 5 minutes, then pour in the marinade wine.","Cover and simmer on very low heat for about 3 hours, until the meat is tender.","Take out the meat, blend the sauce and reduce it a little. Slice the meat and serve with the sauce, with polenta or mashed potatoes."],
         ua:["Покладіть м'ясо, нарізані овочі, трави і спеції в миску, залийте вином і маринуйте ніч у холодильнику.","Вийміть м'ясо, обсушіть і добре обсмажте на маслі з олією.","Додайте овочі без рідини, обсмажте 5 хвилин, тоді влийте вино з маринаду.","Тушкуйте під кришкою на дуже малому вогні близько 3 годин, доки м'ясо стане м'яким.","Вийміть м'ясо, збийте соус блендером і трохи уваріть. Наріжте м'ясо скибками і подавайте з соусом, полентою або пюре."]},
  wine:{en:"The same wine you cooked with — Barolo or Nebbiolo.",ua:"Те саме вино, у якому тушкували, — Бароло або Небіоло."}},
 ES:{e:"🍋",t:{en:"Sorbete al cava — lemon sorbet with cava",ua:"Sorbete al cava — лимонний сорбет з кавою"},
  serves:4,time:{en:"5 min",ua:"5 хв"},
  intro:{en:"A Spanish festive classic served between courses or as a light dessert on Christmas and New Year's Eve.",ua:"Іспанська святкова класика: її подають між стравами або як легкий десерт на Різдво і Новий рік."},
  ing:{en:["500 ml lemon sorbet","200 ml chilled cava brut","Lemon zest or mint to serve"],
       ua:["500 мл лимонного сорбету","200 мл охолодженої кави брют","Цедра лимона або м'ята для подачі"]},
  steps:{en:["Chill the glasses (flutes or small cups) in the freezer.","Quickly blend the sorbet with the cava until smooth and foamy.","Pour into the glasses straight away, top with zest or mint and serve with a spoon or a straw."],
         ua:["Охолодіть келихи (флюте або маленькі чашки) в морозилці.","Швидко збийте сорбет з кавою блендером до гладкої пінистої маси.","Одразу розлийте по келихах, прикрасьте цедрою або м'ятою і подавайте з ложечкою чи трубочкою."]},
  wine:{en:"More of the same cava.",ua:"Ще трохи тієї самої кави."}},
 PT:{e:"🍞",t:{en:"Rabanadas with Port wine syrup",ua:"Рабанадаш із сиропом на портвейні"},
  serves:6,time:{en:"40 min",ua:"40 хв"},
  intro:{en:"Portugal's Christmas French toast. The Port syrup version is a favourite in the north, around the Douro.",ua:"Португальські різдвяні грінки. Варіант із сиропом на портвейні особливо люблять на півночі, біля долини Дору."},
  ing:{en:["12 slices of day-old bread or brioche, 2 cm thick","500 ml milk, 2 tbsp sugar, a strip of lemon peel, 1 cinnamon stick","3 eggs","Oil for frying","For the syrup: 200 ml Port (ruby or tawny), 100 ml water, 100 g sugar, 1 cinnamon stick"],
       ua:["12 скибок учорашнього хліба або бріоші, товщиною 2 см","500 мл молока, 2 ст. л. цукру, смужка лимонної цедри, 1 паличка кориці","3 яйця","Олія для смаження","Для сиропу: 200 мл портвейну (рубі або тоні), 100 мл води, 100 г цукру, 1 паличка кориці"]},
  steps:{en:["Warm the milk with the sugar, lemon peel and cinnamon, then let it cool slightly.","Simmer the Port, water, sugar and cinnamon for about 10 minutes, until syrupy.","Soak the bread slices in the milk, then dip them in beaten egg.","Fry in hot oil until golden on both sides and drain on paper.","Pour the warm Port syrup over the rabanadas and serve."],
         ua:["Нагрійте молоко з цукром, цедрою і корицею, трохи остудіть.","Поваріть портвейн з водою, цукром і корицею близько 10 хвилин, до консистенції сиропу.","Вимочіть скибки хліба в молоці, тоді вмочіть у збиті яйця.","Обсмажте в гарячій олії до золотистого кольору з обох боків, викладіть на паперовий рушник.","Полийте рабанадаш теплим сиропом на портвейні і подавайте."]},
  wine:{en:"A 10-year-old tawny Port.",ua:"Десятирічний тоні портвейн."}},
 SE:{e:"☕",t:{en:"Homemade glögg",ua:"Домашній глег"},
  serves:8,time:{en:"Overnight + 20 min",ua:"Ніч + 20 хв"},
  intro:{en:"Sweden's Christmas drink. Steeping the spices overnight gives a deeper flavour than quick mulled wine.",ua:"Різдвяний напій Швеції. Якщо настояти спеції на ніч, смак буде глибшим, ніж у швидкого глінтвейну."},
  ing:{en:["750 ml red wine","100 ml vodka or brandy (optional)","100 g sugar","2 cinnamon sticks, 6 cloves, 6 cardamom pods (lightly crushed)","A few slices of fresh ginger, peel of 1 orange","Raisins and blanched almonds to serve"],
       ua:["750 мл червоного вина","100 мл горілки або бренді (за бажанням)","100 г цукру","2 палички кориці, 6 бутонів гвоздики, 6 коробочок кардамону (злегка розчавити)","Кілька скибочок свіжого імбиру, шкірка 1 апельсина","Родзинки і бланшований мигдаль для подачі"]},
  steps:{en:["Put the wine, spices, ginger and orange peel in a jar and leave overnight in the fridge.","Strain, add the sugar (and spirits, if using) and heat gently until steaming. Do not boil.","Put a few raisins and almonds in each small cup and pour over the hot glögg."],
         ua:["Покладіть вино, спеції, імбир і апельсинову шкірку в банку і залиште на ніч у холодильнику.","Процідіть, додайте цукор (і міцний алкоголь, якщо додаєте) та нагрійте до пари. Не кип'ятіть.","Покладіть у кожну маленьку чашку кілька родзинок і мигдалин і залийте гарячим глегом."]},
  wine:{en:"Glögg is the drink! For a Swedish twist, look for a red from Skåne.",ua:"Глег — це і є напій! Для шведського акценту пошукайте червоне вино зі Сконе."}},
 DK:{e:"🍒",t:{en:"Risalamande with cherry sauce",ua:"Рісаламанде з вишневим соусом"},
  serves:6,time:{en:"1 h + chilling overnight",ua:"1 год + охолодження на ніч"},
  intro:{en:"The Danish Christmas Eve dessert. One whole almond is hidden inside — whoever finds it wins a small gift, the mandelgave.",ua:"Данський десерт на Святвечір. Усередину ховають одну цілу мигдалину — хто її знайде, отримує маленький подарунок, mandelgave."},
  ing:{en:["150 g pudding rice, 200 ml water, 1 l milk","1 vanilla pod, 2 tbsp sugar","100 g blanched almonds, chopped (+1 whole one)","300 ml whipping cream","For the sauce: 1 jar (about 350 g) pitted cherries in juice, 2 tsp cornflour, 50 ml cherry wine (or red wine, or Port)"],
       ua:["150 г круглого рису, 200 мл води, 1 л молока","1 стручок ванілі, 2 ст. л. цукру","100 г бланшованого мигдалю, порубаного (+1 ціла мигдалина)","300 мл вершків для збивання","Для соусу: 1 банка (близько 350 г) вишень без кісточок у соку, 2 ч. л. крохмалю, 50 мл вишневого вина (або червоного вина чи портвейну)"]},
  steps:{en:["Boil the rice in the water for 2 minutes, add the milk and vanilla and simmer for 35–40 minutes, stirring often. Cool completely, ideally overnight.","Stir the sugar and chopped almonds into the cold rice, then fold in the whipped cream. Hide the whole almond.","For the sauce, heat the cherries with their juice, thicken with the cornflour mixed with a little water, and stir in the wine.","Serve the cold rice with the warm cherry sauce."],
         ua:["Поваріть рис у воді 2 хвилини, додайте молоко і ваніль та варіть на слабкому вогні 35–40 хвилин, часто помішуючи. Повністю остудіть, найкраще за ніч.","Вмішайте в холодний рис цукор і порубаний мигдаль, тоді обережно — збиті вершки. Сховайте цілу мигдалину.","Для соусу нагрійте вишні з соком, загустіть крохмалем, розведеним у дрібці води, і вмішайте вино.","Подавайте холодний рис з теплим вишневим соусом."]},
  wine:{en:"A Danish cherry wine or a glass of ruby Port.",ua:"Данське вишневе вино або келих рубі портвейну."}},
 CZ:{e:"🥬",t:{en:"Red cabbage braised in Moravian red wine",ua:"Червона капуста, тушкована в моравському червоному вині"},
  serves:4,time:{en:"1 h",ua:"1 год"},
  intro:{en:"A Czech-style side for festive roast duck — our idea rather than an old tradition, but a delicious one.",ua:"Гарнір по-чеськи до святкової запеченої качки — радше наша ідея, ніж давня традиція, але дуже смачна."},
  ing:{en:["1 small red cabbage (about 800 g), shredded","1 onion, 2 tbsp lard or butter","1 tart apple, grated","200 ml red wine (Frankovka or Svatovavřinecké)","2 tbsp vinegar, 1–2 tbsp sugar","1 tsp caraway seeds, salt"],
       ua:["1 невеликий качан червоної капусти (близько 800 г), нашаткований","1 цибулина, 2 ст. л. смальцю або масла","1 кисле яблуко, натерте","200 мл червоного вина (Франковка або Свато-Вавржинецьке)","2 ст. л. оцту, 1–2 ст. л. цукру","1 ч. л. кмину, сіль"]},
  steps:{en:["Soften the chopped onion in the lard.","Add the cabbage, caraway, wine, vinegar and apple and stir.","Cover and braise on low heat for 45–60 minutes, stirring now and then.","Season with sugar and salt until it tastes pleasantly sweet and sour."],
         ua:["Пасеруйте нарізану цибулю на смальці.","Додайте капусту, кмин, вино, оцет і яблуко, перемішайте.","Тушкуйте під кришкою на малому вогні 45–60 хвилин, час від часу помішуючи.","Додайте цукор і сіль за смаком, щоб вийшло приємно кисло-солодко."]},
  wine:{en:"Svatovavřinecké (St. Laurent) from Moravia.",ua:"Свато-Вавржинецьке (Сен-Лоран) з Моравії."}},
 UA:{e:"🌾",pairing:true,t:{en:"Wines for the Holy Supper",ua:"Вина до Святої вечері"},
  serves:0,time:{en:"",ua:""},
  intro:{en:"Ukrainian Christmas Eve dishes aren't cooked with wine, so instead of a recipe — which Ukrainian wines to pour with them.",ua:"Страви Святої вечері не готують з вином, тому замість рецепта — які українські вина до них налити."},
  ing:{en:["Varenyky with potato or cabbage → a dry white from Zakarpattia","Mushroom sauce, holubtsi → a light red, such as Pinot Noir from Bessarabia","Herring and fried fish → a fresh Aligoté or Sauvignon Blanc from the Odesa region","Kutia with honey, poppy seeds and nuts → a sweet Muscat from southern Ukraine","Uzvar stays alcohol-free — it's a drink for the whole family"],
       ua:["Вареники з картоплею чи капустою → сухе біле з Закарпаття","Грибна підлива, голубці → легке червоне, наприклад Піно Нуар з Бессарабії","Оселедець і смажена риба → свіже Аліготе або Совіньйон Блан з Одещини","Кутя з медом, маком і горіхами → солодкий мускат з півдня України","Узвар залишається безалкогольним — це напій для всієї родини"]},
  steps:{en:[],ua:[]},wine:{en:"",ua:""}},
};

/* ───────────── Advent: 24 windows ─────────────
   type: wine | market | quiz | ask | recipe | trip
   go: country code to open · ask: question for the chat · a: quiz answer */
const ADVENT=[
 {e:"🍷",type:"wine",go:"CZ",
  t:{en:"Svařák — Czech mulled wine",ua:"Svařák — чеський глінтвейн"},
  d:{en:"On every Czech Christmas square you'll smell svařák: red wine warmed with cinnamon, cloves and lemon. Look for stalls using Moravian wine — almost all Czech vineyards are in Moravia, so the base can be truly local.",
     ua:"На кожній різдвяній площі Чехії пахне svařák — червоне вино, підігріте з корицею, гвоздикою і лимоном. Шукайте ятки з моравським вином: майже всі виноградники Чехії — у Моравії, тож основа може бути справді місцевою."}},
 {e:"🎄",type:"market",go:"HR",
  t:{en:"Advent in Zagreb",ua:"Адвент у Загребі"},
  d:{en:"Six weeks of lights, concerts and food stalls across the whole centre, from Ban Jelačić Square to the Upper Town: 28 Nov 2026 – 7 Jan 2027. Order kuhano vino and fritule — little Croatian doughnuts.",
     ua:"Шість тижнів вогнів, концертів і яток по всьому центру — від площі бана Єлачича до Верхнього міста: 28 листопада 2026 – 7 січня 2027. Замовте kuhano vino і фрітуле — маленькі хорватські пончики."}},
 {e:"🐟",type:"quiz",
  t:{en:"Quiz: wine for Czech Christmas carp",ua:"Загадка: вино до чеського різдвяного коропа"},
  d:{en:"Fried carp with potato salad is the classic Czech Christmas Eve dinner. Which wine suits it best?",ua:"Смажений короп з картопляним салатом — класична чеська вечеря на Святвечір. Яке вино пасує до нього найкраще?"},
  a:{en:"A crisp, dry white — Moravian Grüner Veltliner (Veltlínské zelené) or Riesling. Its acidity cuts through the breadcrumbs and fat, like a squeeze of lemon.",ua:"Свіже сухе біле — моравський Грюнер Вельтлінер (Veltlínské zelené) або Рислінг. Кислотність «розрізає» паніровку і жир, як вичавлений лимон."}},
 {e:"🎁",type:"ask",
  t:{en:"A bottle for the host",ua:"Пляшка для господарів"},
  d:{en:"Invited to Christmas dinner and not sure what to bring? Ask Dionysia.",ua:"Вас запросили на різдвяну вечерю, і ви не знаєте, що принести? Запитайте Dionysia."},
  ask:{en:"I'm invited to a Christmas dinner. What bottle of wine makes a good gift for the host? Give me options in three price ranges.",ua:"Мене запросили на різдвяну вечерю. Яка пляшка вина буде гарним подарунком для господарів? Дай варіанти в трьох цінових категоріях."}},
 {e:"🇸🇪",type:"wine",go:"SE",
  t:{en:"Glögg with almonds and raisins",ua:"Глег з мигдалем і родзинками"},
  d:{en:"Swedes drink glögg from small cups with raisins and blanched almonds spooned in. Some versions add a splash of spirits. And yes — Sweden makes its own wine now, mostly in Skåne.",
     ua:"Шведи п'ють глег з маленьких чашечок, куди кладуть родзинки і бланшований мигдаль. Інколи додають трохи міцного алкоголю. І так — Швеція тепер має власне вино, переважно в Сконе."}},
 {e:"🍋",type:"recipe",go:"FR",
  t:{en:"St Nicholas: white mulled wine",ua:"Миколая: біле гаряче вино"},
  d:{en:"Happy St Nicholas Day! Try Alsace-style vin chaud blanc: a bottle of dry white (Pinot Blanc or Riesling), 1 orange in slices, 1 cinnamon stick, 2 star anise, 2–3 tbsp honey. Warm slowly for 15 minutes — never let it boil.",
     ua:"Зі святом Миколая! Спробуйте ельзаський vin chaud blanc: пляшка сухого білого (Піно Блан або Рислінг), 1 апельсин скибочками, 1 паличка кориці, 2 зірочки бадьяну, 2–3 ст. л. меду. Грійте повільно 15 хвилин — тільки не доводьте до кипіння."}},
 {e:"🎡",type:"market",go:"HU",
  t:{en:"Budapest Christmas fairs",ua:"Різдвяні ярмарки Будапешта"},
  d:{en:"The two big ones are free: Vörösmarty Square (13 Nov – 31 Dec 2026) and the Basilica (13 Nov 2026 – 1 Jan 2027). Try forralt bor and kürtőskalács, chimney cake baked over coals.",
     ua:"Два головні — безкоштовні: площа Верешмарті (13 листопада – 31 грудня 2026) і Базиліка (13 листопада 2026 – 1 січня 2027). Спробуйте forralt bor і кюртёшкалач — «трубочку», спечену на вугіллі."}},
 {e:"🇮🇹",type:"wine",go:"IT",
  t:{en:"Panettone and bubbles",ua:"Панетоне і бульбашки"},
  d:{en:"Italy's Christmas cake is panettone, and the classic glass is sweet and lightly sparkling: Moscato d'Asti from Piedmont. Prefer something drier? Prosecco goes well with pandoro.",
     ua:"Різдвяний пиріг Італії — панетоне, а класичний келих до нього — солодке, злегка ігристе Москато д'Асті з П'ємонту. Хочете сухіше? Просеко чудово пасує до пандоро."}},
 {e:"🤔",type:"quiz",
  t:{en:"Quiz: the odd one out",ua:"Загадка: що тут зайве?"},
  d:{en:"Glögg, svařák, kuhano vino, forralt bor, sangria — which one doesn't belong?",ua:"Глег, svařák, kuhano vino, forralt bor, сангрія — що тут зайве?"},
  a:{en:"Sangria — it's served cold, in summer. The other four are mulled wine in Swedish, Czech, Croatian and Hungarian.",ua:"Сангрія — її п'ють холодною, влітку. Решта чотири — це глінтвейн шведською, чеською, хорватською та угорською."}},
 {e:"🏰",type:"market",go:"FR",
  t:{en:"Alsace: Strasbourg and Colmar",ua:"Ельзас: Страсбург і Кольмар"},
  d:{en:"Strasbourg has held its Christkindelsmärik since 1570 (27 Nov – 24 Dec 2026). Colmar, the capital of Alsace wine, runs six markets from 23 Nov to 29 Dec. Between them lie the villages of the Alsace Wine Route.",
     ua:"Страсбург проводить свій Christkindelsmärik з 1570 року (27 листопада – 24 грудня 2026). Кольмар, столиця ельзаського вина, має шість ярмарків з 23 листопада до 29 грудня. А між ними — села Ельзаського винного шляху."}},
 {e:"🚗",type:"ask",
  t:{en:"Markets + wineries in Alsace",ua:"Ярмарки + виноробні Ельзасу"},
  d:{en:"Want to combine Christmas markets with tastings? Let Dionysia plan the route.",ua:"Хочете поєднати різдвяні ярмарки з дегустаціями? Нехай Dionysia складе маршрут."},
  ask:{en:"Plan me a 3-day Christmas trip to Alsace that combines Christmas markets with winery visits.",ua:"Склади мені 3-денну різдвяну поїздку в Ельзас, щоб поєднати різдвяні ярмарки з відвідуванням виноробень."}},
 {e:"🍯",type:"wine",go:"HR",
  t:{en:"Prošek and fritule",ua:"Прошек і фрітуле"},
  d:{en:"A Dalmatian Christmas tastes of fritule and a small glass of prošek — a sweet wine made from dried grapes, the same way for centuries. Not to be confused with Prosecco!",
     ua:"Далматинське Різдво — це фрітуле і маленька чарка прошеку: солодкого вина з підв'яленого винограду, яке роблять так уже століттями. Не плутати з Просеко!"}},
 {e:"🕯️",type:"market",go:"SE",
  t:{en:"Lucia in Stockholm",ua:"Свято Люсії у Стокгольмі"},
  d:{en:"Today Sweden celebrates Lucia: candlelit processions, saffron buns (lussekatter) and glögg. The Stortorget market in Gamla stan has run since 1837; Skansen's market is open Fri–Sun until 20 Dec.",
     ua:"Сьогодні Швеція святкує Люсію: процесії зі свічками, шафранові булочки lussekatter і глег. Ярмарок на Стурторгет у Гамла-стан працює з 1837 року, а ярмарок у Скансені — з п'ятниці по неділю до 20 грудня."}},
 {e:"🍷",type:"recipe",
  t:{en:"Mulled wine for tonight",ua:"Глінтвейн на сьогоднішній вечір"},
  d:{en:"750 ml dry, fruity red · 1 orange in slices · 1 cinnamon stick · 4 cloves · 2 star anise · 2–3 tbsp sugar or honey. Heat on low for 15–20 minutes: it should steam, not boil — boiling kills the aroma and makes it bitter. An inexpensive Merlot or Frankovka is perfect.",
     ua:"750 мл сухого фруктового червоного · 1 апельсин скибочками · 1 паличка кориці · 4 гвоздики · 2 зірочки бадьяну · 2–3 ст. л. цукру або меду. Грійте на малому вогні 15–20 хвилин: має парувати, але не кипіти — від кипіння зникає аромат і з'являється гіркота. Ідеально підійде недороге Мерло чи Frankovka."}},
 {e:"🏔️",type:"market",go:"IT",
  t:{en:"Bolzano and South Tyrol",ua:"Больцано і Південний Тироль"},
  d:{en:"Italy's first Christmas market celebrates its 35th edition: 26 Nov 2026 – 6 Jan 2027 on Piazza Walther. Taste Alto Adige wines, speck and Zelten fruit bread. Merano and Bressanone are a short train ride away.",
     ua:"Перший різдвяний ярмарок Італії відзначає 35-й рік: 26 листопада 2026 – 6 січня 2027 на площі Вальтера. Скуштуйте вина Альто-Адідже, спек і фруктовий хліб Zelten. Мерано і Брессаноне — зовсім поруч потягом."}},
 {e:"👑",type:"quiz",
  t:{en:"Quiz: Portugal's King Cake",ua:"Загадка: португальський «Королівський пиріг»"},
  d:{en:"Which wine do Portuguese families pour with Bolo Rei, the 'King Cake'?",ua:"Яке вино португальські родини наливають до Bolo Rei — «Королівського пирога»?"},
  a:{en:"Port — often a tawny, whose nutty, caramel notes match the candied fruit. Bolo Rei is eaten from Christmas until Epiphany on 6 January.",ua:"Портвейн — часто тоні (tawny), чиї горіхово-карамельні ноти пасують до цукатів. Bolo Rei їдять від Різдва до Богоявлення, 6 січня."}},
 {e:"🎠",type:"market",go:"PT",
  t:{en:"Lisbon and Óbidos",ua:"Лісабон і Обідуш"},
  d:{en:"Wonderland Lisboa fills Parque Eduardo VII from 27 Nov 2026 to 3 Jan 2027, with free entry. Óbidos becomes Vila Natal (same dates, ticketed) — sip ginjinha cherry liqueur from a chocolate cup.",
     ua:"Wonderland Lisboa займає парк Едуарду VII з 27 листопада 2026 до 3 січня 2027, вхід вільний. Обідуш перетворюється на Vila Natal (ті ж дати, за квитками) — спробуйте вишневий лікер жинжинью з шоколадної чашечки."}},
 {e:"🇩🇰",type:"market",go:"DK",
  t:{en:"Gløgg in Copenhagen",ua:"Гльог у Копенгагені"},
  d:{en:"Danes pair gløgg with æbleskiver — round pancake puffs with jam and icing sugar. Tivoli's Christmas season runs 13 Nov 2026 – 3 Jan 2027 (ticketed, closed 24 Dec); a free market on Rådhuspladsen runs 11–20 Dec.",
     ua:"Данці п'ють гльог з еблесківерами — круглими пончиками з варенням і цукровою пудрою. Різдвяний сезон у Тіволі — 13 листопада 2026 – 3 січня 2027 (за квитками, 24 грудня зачинено), а на Ратушній площі 11–20 грудня працює безкоштовний ярмарок."}},
 {e:"🥂",type:"ask",
  t:{en:"Bubbles for New Year's Eve",ua:"Ігристе на Новий рік"},
  d:{en:"Champagne, cava, Prosecco, Czech sekt or Croatian pjenušac? Ask Dionysia to pick for your budget.",ua:"Шампанське, кава, Просеко, чеський сект чи хорватський pjenušac? Нехай Dionysia підбере під ваш бюджет."},
  ask:{en:"Suggest sparkling wines for New Year's Eve in three price ranges, from the countries covered on Dionysia.",ua:"Порадь ігристі вина на Новий рік у трьох цінових категоріях — з країн, про які пише Dionysia."}},
 {e:"🍇",type:"wine",go:"ES",
  t:{en:"Cava and the 12 grapes",ua:"Кава і 12 виноградин"},
  d:{en:"At midnight on 31 December Spaniards eat 12 grapes, one for each chime of the clock, then toast with cava — Spain's traditional-method sparkling wine, mostly from Penedès in Catalonia.",
     ua:"Опівночі 31 грудня іспанці з'їдають 12 виноградин — по одній на кожен удар годинника, — а тоді піднімають келихи з кавою, іспанським ігристим за класичним методом, переважно з Пенедесу в Каталонії."}},
 {e:"⭐",type:"market",go:"ES",
  t:{en:"Madrid and Barcelona markets",ua:"Ярмарки Мадрида і Барселони"},
  d:{en:"Madrid's Plaza Mayor market (late Nov – 31 Dec) sells nativity figures and New Year's party gear. Barcelona's Fira de Santa Llúcia, by the cathedral since 1786, runs 28 Nov – 23 Dec — look for the cheeky caganer.",
     ua:"На Пласа-Майор у Мадриді (кінець листопада – 31 грудня) продають фігурки для вертепу і все для новорічної вечірки. Барселонський ярмарок Санта-Льусія біля собору — з 1786 року, працює 28 листопада – 23 грудня. Шукайте кумедного caganer!"}},
 {e:"🌾",type:"wine",go:"UA",
  t:{en:"Ukrainian Holy Supper",ua:"Українська Свята вечеря"},
  d:{en:"Christmas Eve in Ukraine means 12 meatless dishes, kutia and uzvar. With varenyky and mushrooms try a dry white from Zakarpattia; with fish, a fresh Odesa Aligoté. In 2025 Lviv's Christmas market returned to Rynok Square for the first time since the full-scale invasion.",
     ua:"Святвечір в Україні — це 12 пісних страв, кутя і узвар. До вареників і грибів спробуйте сухе біле з Закарпаття, до риби — свіже одеське Аліготе. А у 2025 році різдвяний ярмарок у Львові вперше від початку повномасштабного вторгнення повернувся на площу Ринок."}},
 {e:"🧭",type:"trip",go:"HU",
  t:{en:"Winter wine trip: Tokaj",ua:"Зимова винна поїздка: Токай"},
  d:{en:"Cellars don't care about the season: Tokaj's tunnels stay cool all year, and winter means quiet tastings, often with the winemaker. Don't leave without trying Aszú, Hungary's famous sweet wine.",
     ua:"Підвалам байдуже, яка пора року: тунелі Токаю тримають прохолоду цілий рік, а взимку дегустації спокійні, часто з самим винарем. Не їдьте, не скуштувавши Асу — знамените солодке вино Угорщини."}},
 {e:"🌟",type:"ask",
  t:{en:"Merry Christmas from Dionysia!",ua:"Веселого Різдва від Dionysia!"},
  d:{en:"Thank you for opening the calendar with us. Tell Dionysia what's on your festive table, and she'll pick the wines.",ua:"Дякуємо, що відкривали календар разом з нами! Розкажіть Dionysia, що буде на святковому столі, — і вона підбере вина."},
  ask:{en:"Help me choose wines for my Christmas dinner. First ask me what's on the menu.",ua:"Допоможи підібрати вина до різдвяної вечері. Спершу запитай, що буде в меню."}},
];

const L={
 en:{title:"Dionysia Advent Calendar",sub:"A new window every day until Christmas: wines, markets, recipes and riddles from our 10 countries.",
     soon:(n)=>"Opens on 1 December — in "+n+(n===1?" day":" days")+". Meanwhile, explore the Christmas markets:",
     markets:"Christmas markets in 10 countries",close:"Close",locked:"Opens on",dec:"December",
     show:"Show the answer",ask:"Ask Dionysia →",open:"Explore",note:"Dates checked in November 2026 — confirm on official sites before you travel.",
     marketsTitle:"Christmas markets",recipes:"Christmas recipes with wine",recipe:"Recipe",serves:"Serves",ing:"Ingredients",steps:"Method",pour:"What to pour",collapse:"Collapse",expand:"Open the advent calendar",pairing:"Pairing",snowOn:"Turn snow off",snowOff:"Turn snow on",musicOn:"Turn music off",musicOff:"Play Christmas music",
     types:{wine:"Christmas wine",market:"Christmas market",quiz:"Riddle",ask:"Ask Dionysia",recipe:"Recipe",trip:"Winter trip"}},
 ua:{title:"Адвент-календар Dionysia",sub:"Щодня до Різдва — нове віконце: вина, ярмарки, рецепти й загадки з наших 10 країн.",
     soon:(n)=>"Відкриється 1 грудня — через "+n+" "+(n%10===1&&n%100!==11?"день":(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?"дні":"днів")+". А поки — різдвяні ярмарки:",
     markets:"Різдвяні ярмарки 10 країн",close:"Закрити",locked:"Відкриється",dec:"грудня",
     show:"Показати відповідь",ask:"Запитати Dionysia →",open:"Перейти",note:"Дати перевірено в листопаді 2026 — уточнюйте на офіційних сайтах перед поїздкою.",
     marketsTitle:"Різдвяні ярмарки",recipes:"Різдвяні рецепти з вином",recipe:"Рецепт",serves:"Порцій",ing:"Інгредієнти",steps:"Приготування",pour:"Що налити",collapse:"Згорнути",expand:"Відкрити адвент-календар",pairing:"Пари",snowOn:"Вимкнути сніг",snowOff:"Увімкнути сніг",musicOn:"Вимкнути музику",musicOff:"Увімкнути різдвяну музику",
     types:{wine:"Різдвяне вино",market:"Різдвяний ярмарок",quiz:"Загадка",ask:"Запитайте Dionysia",recipe:"Рецепт",trip:"Зимова поїздка"}},
};

/* ───────────── Modal shell ───────────── */
function Modal({onClose,children,wide}){
  useEffect(()=>{const k=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k);},[onClose]);
  return(
  <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:130,background:"rgba(10,4,8,0.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div onClick={e=>e.stopPropagation()} style={{background:BG,border:"1px solid rgba(196,154,90,0.35)",borderRadius:16,maxWidth:wide?600:460,width:"100%",maxHeight:"86vh",overflowY:"auto",position:"relative",padding:"26px 24px",fontFamily:FONT}}>
      <button onClick={onClose} aria-label="close" style={{position:"absolute",top:12,right:14,background:"none",border:"none",color:ACCENT,cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
      {children}
    </div>
  </div>);
}

function MarketList({lang,code}){
  return (MARKETS[code]||[]).map((m,i)=>(
    <div key={i} style={{padding:"10px 0",borderTop:i?"1px solid rgba(196,154,90,0.12)":"none"}}>
      <div style={{fontSize:14,color:TEXT,fontWeight:700}}>{m.city[lang]} · <span style={{fontWeight:600,color:MUTED}}>{m.name[lang]}</span></div>
      <div style={{fontSize:12,color:ACCENT,fontWeight:600,margin:"3px 0"}}>📅 {m.dates[lang]}</div>
      <div style={{fontSize:13,color:MUTED,lineHeight:1.6}}>{m.tip[lang]}</div>
    </div>));
}

/* All markets, grouped by country */
export function MarketsModal({lang,onClose,onCountry}){
  const t=L[lang];
  return(<Modal onClose={onClose} wide>
    <div style={{fontSize:20,fontWeight:700,color:TEXT,marginBottom:4}}>🎄 {t.markets}</div>
    <div style={{fontSize:12,color:DIM,marginBottom:14,fontStyle:"italic"}}>{t.note}</div>
    {Object.keys(MARKETS).sort((a,b)=>CNAME[a][lang].localeCompare(CNAME[b][lang],lang==="ua"?"uk":"en")).map(code=>(
      <div key={code} style={{background:CARD,border:"1px solid "+B,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
        <div onClick={()=>{onClose();onCountry(code);}} style={{fontSize:15,fontWeight:700,color:ACCENT,cursor:"pointer",marginBottom:2}}>{FLAG[code]} {CNAME[code][lang]} →</div>
        <MarketList lang={lang} code={code}/>
      </div>))}
  </Modal>);
}

/* Block on a country page */
export function CountryMarkets({lang,code}){
  const [open,setOpen]=useState(false);
  if(!inSeason()||!MARKETS[code]) return null;
  const t=L[lang];
  return(<div style={{background:"rgba(196,154,90,0.06)",border:"1px solid rgba(196,154,90,0.18)",borderRadius:12,padding:"16px 18px",marginBottom:20}}>
    <div style={{fontSize:12,color:DIM,letterSpacing:"0.25em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>🎄 {t.marketsTitle}</div>
    <MarketList lang={lang} code={code}/>
    <div style={{fontSize:11,color:DIM,marginTop:8,fontStyle:"italic"}}>{t.note}</div>
    {RECIPES[code]&&<button onClick={()=>{setOpen(true);ga("recipe_open",{country:code});}} style={{marginTop:12,width:"100%",background:"none",border:"1px solid "+B2,borderRadius:10,padding:"10px",color:ACCENT,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT,textAlign:"left"}}>{RECIPES[code].e} {RECIPES[code].pairing?t.pairing:t.recipe}: {RECIPES[code].t[lang]} →</button>}
    {open&&<RecipesModal lang={lang} start={code} onClose={()=>setOpen(false)}/>}
  </div>);
}


/* One recipe */
function RecipeView({lang,code}){
  const r=RECIPES[code],t=L[lang];if(!r) return null;
  const h={fontSize:12,color:DIM,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:600,margin:"16px 0 8px"};
  return(<div>
    <div style={{fontSize:38,textAlign:"center"}}>{r.e}</div>
    <div style={{fontSize:11,color:DIM,letterSpacing:"0.2em",textTransform:"uppercase",textAlign:"center",fontWeight:600,margin:"6px 0 4px"}}>{FLAG[code]} {CNAME[code][lang]} · {r.pairing?t.pairing:t.recipe}</div>
    <div style={{fontSize:20,fontWeight:700,color:TEXT,textAlign:"center",marginBottom:8}}>{r.t[lang]}</div>
    {!r.pairing&&<div style={{fontSize:12,color:ACCENT,textAlign:"center",fontWeight:600,marginBottom:10}}>👥 {t.serves}: {r.serves} · ⏱ {r.time[lang]}</div>}
    <div style={{fontSize:14,color:MUTED,lineHeight:1.7,fontStyle:"italic"}}>{r.intro[lang]}</div>
    {!r.pairing&&<div style={h}>{t.ing}</div>}
    <ul style={{margin:r.pairing?"12px 0 0":0,paddingLeft:20,color:MUTED,fontSize:14,lineHeight:1.7}}>{r.ing[lang].map((x,i)=><li key={i} style={{marginBottom:3}}>{x}</li>)}</ul>
    {r.steps[lang].length>0&&<><div style={h}>{t.steps}</div>
    <ol style={{margin:0,paddingLeft:20,color:MUTED,fontSize:14,lineHeight:1.7}}>{r.steps[lang].map((x,i)=><li key={i} style={{marginBottom:6}}>{x}</li>)}</ol></>}
    {r.wine[lang]&&<div style={{marginTop:16,padding:"12px 14px",border:"1px solid "+B2,borderRadius:10,background:"rgba(196,154,90,0.1)",fontSize:14,color:TEXT,lineHeight:1.6}}>🍷 <b>{t.pour}:</b> {r.wine[lang]}</div>}
  </div>);
}

/* All recipes */
export function RecipesModal({lang,onClose,start}){
  const t=L[lang];const [code,setCode]=useState(start||null);
  const codes=Object.keys(RECIPES).sort((a,b)=>CNAME[a][lang].localeCompare(CNAME[b][lang],lang==="ua"?"uk":"en"));
  return(<Modal onClose={onClose} wide>
    {code?(<>
      {!start&&<button onClick={()=>setCode(null)} style={{background:"none",border:"none",color:ACCENT,cursor:"pointer",fontSize:13,padding:0,fontFamily:FONT,marginBottom:6}}>← {t.recipes}</button>}
      <RecipeView lang={lang} code={code}/>
    </>):(<>
      <div style={{fontSize:20,fontWeight:700,color:TEXT,marginBottom:14}}>🍷 {t.recipes}</div>
      {codes.map(c=>(<div key={c} onClick={()=>{setCode(c);ga("recipe_open",{country:c});}} style={{display:"flex",alignItems:"center",gap:12,background:CARD,border:"1px solid "+B,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
        <span style={{fontSize:26}}>{RECIPES[c].e}</span>
        <div style={{flex:1}}><div style={{fontSize:12,color:DIM,fontWeight:600}}>{FLAG[c]} {CNAME[c][lang]}</div><div style={{fontSize:15,color:TEXT,fontWeight:600}}>{RECIPES[c].t[lang]}</div></div>
        <span style={{color:ACCENT}}>→</span>
      </div>))}
    </>)}
  </Modal>);
}

/* ───────────── Advent calendar ───────────── */
export function Advent({lang,onAsk,onCountry}){
  const t=L[lang];
  const upTo=openUpTo();
  const today=new Date().getMonth()===11?new Date().getDate():0;
  const [opened,setOpened]=useState(()=>{try{return JSON.parse(lsGet("dionysia_advent")||"[]");}catch(e){return [];}});
  const [cur,setCur]=useState(null);
  const [showA,setShowA]=useState(false);
  const [showM,setShowM]=useState(false);
  const [showR,setShowR]=useState(false);
  const [folded,setFolded]=useState(()=>lsGet("dionysia_advent_folded")==="1");
  const fold=(v)=>{setFolded(v);lsSet("dionysia_advent_folded",v?"1":"0");};

  const openDoor=(n)=>{
    if(n>upTo) return;
    setCur(n);setShowA(false);
    ga("advent_open",{day:n});
    if(!opened.includes(n)){const o=[...opened,n];setOpened(o);lsSet("dionysia_advent",JSON.stringify(o));}
  };
  const w=cur?ADVENT[cur-1]:null;

  if(folded) return(<button onClick={()=>fold(false)} style={{width:"100%",background:CARD,border:"1px solid "+B,borderRadius:14,padding:"14px",margin:"0 0 26px",color:TEXT,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>🎄 {t.expand} ▾</button>);
  return(<div style={{background:CARD,border:"1px solid "+B,borderRadius:14,padding:"18px 16px",margin:"0 0 26px",position:"relative"}}>
    <button onClick={()=>{fold(true);ga("advent_fold");}} style={{position:"absolute",top:10,right:10,background:"rgba(196,154,90,0.1)",border:"1px solid "+B2,borderRadius:20,padding:"4px 12px",color:ACCENT,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>{t.collapse} ▴</button>
    <div style={{fontSize:18,fontWeight:700,color:TEXT,textAlign:"center",marginBottom:4,marginTop:22}}>🎄 {t.title}</div>
    <div style={{fontSize:13,color:MUTED,textAlign:"center",lineHeight:1.6,marginBottom:14}}>{upTo===0?t.soon(daysToDec1()):t.sub}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(58px,1fr))",gap:8,marginBottom:14}}>
      {ADVENT.map((a,i)=>{const n=i+1,can=n<=upTo,isOp=opened.includes(n),isToday=n===today;
        return(<button key={n} onClick={()=>openDoor(n)} disabled={!can} title={can?a.t[lang]:t.locked+" "+n+" "+t.dec}
          style={{aspectRatio:"1",borderRadius:10,border:"1px solid "+(isToday?ACCENT:can?B2:B),background:isOp?"rgba(196,154,90,0.16)":can?BTN:"rgba(196,154,90,0.04)",
          color:can?TEXT:DIM,cursor:can?"pointer":"default",fontFamily:FONT,fontWeight:700,fontSize:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,
          boxShadow:isToday?"0 0 12px rgba(196,154,90,0.45)":"none",opacity:can?1:0.55,transition:"all 0.2s"}}>
          <span>{n}</span><span style={{fontSize:13}}>{isOp?a.e:can?"✨":"🔒"}</span>
        </button>);})}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:8}}>
      <button onClick={()=>{setShowM(true);ga("markets_open");}} style={{background:"none",border:"1px solid "+B2,borderRadius:10,padding:"11px",color:ACCENT,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>🎄 {t.markets} →</button>
      <button onClick={()=>{setShowR(true);ga("recipes_open");}} style={{background:"none",border:"1px solid "+B2,borderRadius:10,padding:"11px",color:ACCENT,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>🍷 {t.recipes} →</button>
    </div>

    {w&&(<Modal onClose={()=>setCur(null)}>
      <div style={{fontSize:40,textAlign:"center"}}>{w.e}</div>
      <div style={{fontSize:11,color:DIM,letterSpacing:"0.2em",textTransform:"uppercase",textAlign:"center",fontWeight:600,margin:"6px 0 4px"}}>{cur} {t.dec} · {t.types[w.type]}</div>
      <div style={{fontSize:20,fontWeight:700,color:TEXT,textAlign:"center",marginBottom:12}}>{w.t[lang]}</div>
      <div style={{fontSize:15,color:MUTED,lineHeight:1.8,fontWeight:500}}>{w.d[lang]}</div>
      {w.a&&(showA
        ?<div style={{marginTop:14,padding:"12px 14px",border:"1px solid "+B2,borderRadius:10,background:"rgba(196,154,90,0.1)",fontSize:14,color:TEXT,lineHeight:1.7}}>✅ {w.a[lang]}</div>
        :<button onClick={()=>setShowA(true)} style={{marginTop:14,width:"100%",background:BTN,border:"1px solid "+B2,borderRadius:10,padding:"11px",color:TEXT,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>{t.show}</button>)}
      {w.type==="market"&&w.go&&<div style={{marginTop:14}}><MarketList lang={lang} code={w.go}/></div>}
      <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
        {w.ask&&<button onClick={()=>{setCur(null);ga("advent_ask",{day:cur});onAsk(w.ask[lang]);}} style={{flex:1,background:BTN,border:"1px solid "+B2,borderRadius:10,padding:"11px",color:TEXT,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>💬 {t.ask}</button>}
        {w.go&&<button onClick={()=>{setCur(null);onCountry(w.go);}} style={{flex:1,background:"none",border:"1px solid "+B2,borderRadius:10,padding:"11px",color:ACCENT,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>{FLAG[w.go]} {t.open}: {CNAME[w.go][lang]} →</button>}
      </div>
    </Modal>)}
    {showM&&<MarketsModal lang={lang} onClose={()=>setShowM(false)} onCountry={onCountry}/>}
    {showR&&<RecipesModal lang={lang} onClose={()=>setShowR(false)}/>}
  </div>);
}

/* ───────────── Snow ───────────── */
function Snow(){
  const ref=useRef(null);
  useEffect(()=>{
    const c=ref.current,ctx=c.getContext("2d");let raf,W,H;
    const resize=()=>{W=c.width=window.innerWidth;H=c.height=window.innerHeight;};
    resize();window.addEventListener("resize",resize);
    const N=Math.min(90,Math.round(window.innerWidth/14));
    const fl=Array.from({length:N},()=>({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.6,s:0.3+Math.random()*0.9,p:Math.random()*6.28,o:0.35+Math.random()*0.5}));
    const tick=()=>{
      ctx.clearRect(0,0,W,H);
      for(const f of fl){
        f.y+=f.s;f.p+=0.01;f.x+=Math.sin(f.p)*0.4;
        if(f.y>H+5){f.y=-5;f.x=Math.random()*W;}
        ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.283);ctx.fillStyle="rgba(237,224,204,"+f.o+")";ctx.fill();
      }
      raf=requestAnimationFrame(tick);
    };
    tick();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} aria-hidden="true" style={{position:"fixed",inset:0,zIndex:90,pointerEvents:"none"}}/>;
}

/* ───────────── Music box (played by the browser, no audio files) ─────────────
   Public-domain melodies: Shchedryk (M. Leontovych, 1916), Silent Night (1818), Jingle Bells (1857). */
const NOTE=(n)=>{const m=n.match(/^([A-G])(#|b)?(\d)$/);const base={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==="#"?1:m[2]==="b"?-1:0);return 440*Math.pow(2,(base+(+m[3]+1)*12-69)/12);};
const SHCHEDRYK=(()=>{const bar=[["Bb5",1],["A5",.5],["Bb5",.5],["G5",1]];let s=[];for(let i=0;i<8;i++)s=s.concat(bar);
  s=s.concat([["G6",.5],["F6",.5],["Eb6",.5],["D6",.5],["C6",1],["F6",.5],["Eb6",.5],["D6",.5],["C6",.5],["Bb5",1],["Eb6",.5],["D6",.5],["C6",.5],["Bb5",.5],["A5",1],["D6",.5],["C6",.5],["Bb5",.5],["A5",.5],["G5",1]]);
  for(let i=0;i<4;i++)s=s.concat(bar);return {bpm:150,notes:s.concat([["R",3]])};})();
const SILENT={bpm:120,notes:[["G5",1.5],["A5",.5],["G5",1],["E5",3],["G5",1.5],["A5",.5],["G5",1],["E5",3],["D6",2],["D6",1],["B5",3],["C6",2],["C6",1],["G5",3],
  ["A5",2],["A5",1],["C6",1.5],["B5",.5],["A5",1],["G5",1.5],["A5",.5],["G5",1],["E5",3],["A5",2],["A5",1],["C6",1.5],["B5",.5],["A5",1],["G5",1.5],["A5",.5],["G5",1],["E5",3],
  ["D6",2],["D6",1],["F6",1.5],["D6",.5],["B5",1],["C6",3],["E6",3],["C6",1],["G5",1],["E5",1],["G5",1.5],["F5",.5],["D5",1],["C5",6],["R",3]]};
const JINGLE={bpm:200,notes:[["E5",1],["E5",1],["E5",2],["E5",1],["E5",1],["E5",2],["E5",1],["G5",1],["C5",1.5],["D5",.5],["E5",4],["F5",1],["F5",1],["F5",1.5],["F5",.5],["F5",1],["E5",1],["E5",1],["E5",.5],["E5",.5],
  ["E5",1],["D5",1],["D5",1],["E5",1],["D5",2],["G5",2],["E5",1],["E5",1],["E5",2],["E5",1],["E5",1],["E5",2],["E5",1],["G5",1],["C5",1.5],["D5",.5],["E5",4],["F5",1],["F5",1],["F5",1.5],["F5",.5],["F5",1],["E5",1],["E5",1],["E5",.5],["E5",.5],
  ["G5",1],["G5",1],["F5",1],["D5",1],["C5",4],["R",4]]};
const PLAYLIST=[SHCHEDRYK,SILENT,JINGLE];

function createMusicBox(){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC) return null;
  const ctx=new AC();const master=ctx.createGain();master.gain.value=0.12;master.connect(ctx.destination);
  let song=0,idx=0,next=ctx.currentTime+0.1,timer=null;
  const pluck=(f,t)=>{
    [[1,0.6,"sine"],[2,0.25,"sine"],[3,0.08,"triangle"]].forEach(([mul,vol,type])=>{
      const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f*mul;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+1.4);
      o.connect(g);g.connect(master);o.start(t);o.stop(t+1.5);});
  };
  const schedule=()=>{
    while(next<ctx.currentTime+0.3){
      const s=PLAYLIST[song],[n,beats]=s.notes[idx];const dur=beats*60/s.bpm;
      if(n!=="R") pluck(NOTE(n),next);
      next+=dur;idx++;if(idx>=s.notes.length){idx=0;song=(song+1)%PLAYLIST.length;}
    }
  };
  return{
    play(){ctx.resume();next=Math.max(next,ctx.currentTime+0.05);if(!timer)timer=setInterval(schedule,50);},
    stop(){clearInterval(timer);timer=null;ctx.suspend();},
  };
}

/* Snow ❄️ and music 🎵 switches (shown in the header) */
export function XmasToggles({lang}){
  const t=L[lang];
  const season=inSeason();
  const [snow,setSnow]=useState(()=>{
    const s=lsGet("dionysia_snow");if(s) return s==="on";
    try{return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){return true;}
  });
  const [music,setMusic]=useState(false); // never starts by itself
  const box=useRef(null);
  useEffect(()=>()=>{box.current&&box.current.stop();},[]);
  if(!season) return null;
  const toggleSnow=()=>{const v=!snow;setSnow(v);lsSet("dionysia_snow",v?"on":"off");ga("snow_toggle",{on:v});};
  const toggleMusic=()=>{
    if(!box.current) box.current=createMusicBox();
    if(!box.current) return;
    if(music){box.current.stop();setMusic(false);}else{box.current.play();setMusic(true);}
    ga("music_toggle",{on:!music});
  };
  const st=(on)=>({background:on?"rgba(196,154,90,0.15)":"none",border:"1px solid "+(on?B2:B),borderRadius:20,width:34,height:30,fontSize:15,cursor:"pointer",opacity:on?1:0.55,position:"relative",padding:0});
  const slash=<span style={{position:"absolute",left:6,right:6,top:"50%",height:1.5,background:ACCENT,transform:"rotate(-35deg)"}}/>;
  return(<>
    <style>{".xmas-t{position:absolute;left:24px;top:32px;display:flex;gap:6px;z-index:3}@media(max-width:560px){.xmas-t{position:static;justify-content:center;margin:0 0 12px}}"}</style>
    <div className="xmas-t">
      <button onClick={toggleSnow} title={snow?t.snowOn:t.snowOff} aria-label={snow?t.snowOn:t.snowOff} aria-pressed={snow} style={st(snow)}>❄️{!snow&&slash}</button>
      <button onClick={toggleMusic} title={music?t.musicOn:t.musicOff} aria-label={music?t.musicOn:t.musicOff} aria-pressed={music} style={st(music)}>🎵{!music&&slash}</button>
    </div>
    {snow&&<Snow/>}
  </>);
}
