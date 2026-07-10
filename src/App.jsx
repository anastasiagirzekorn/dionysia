import { useState, useRef, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";

const PROMPT = `You are Dionysia, an elegant wine travel assistant. Help travelers discover wine regions, routes, wineries, and tasting experiences worldwide. Speak in the language the user writes in. Be warm, sophisticated, specific.`;

const BG="#1a0810",TEXT="#ede0cc",ACCENT="#c49a5a",MUTED="#c8a878",DIM="#9a7848";
const CARD="rgba(196,154,90,0.07)",CARD2="rgba(196,154,90,0.13)";
const B="rgba(196,154,90,0.2)",B2="rgba(196,154,90,0.5)";
const BTN="linear-gradient(135deg,#3a1020,#5a2030)";

// Google Analytics helper — safe no-op if gtag isn't loaded yet
const gaEvent=(name,params)=>{try{if(typeof window!=="undefined"&&window.gtag){window.gtag("event",name,params||{});}}catch(e){}};

const CIMG={
HR:"https://images.unsplash.com/photo-1693149864297-e44de7849c51?auto=format&fit=crop&w=1200&q=80",
CZ:"https://images.unsplash.com/photo-1658052829392-fd70d474482c?auto=format&fit=crop&w=1200&q=80",
FR:"https://images.unsplash.com/photo-1602574923828-853dbbc27277?auto=format&fit=crop&w=1200&q=80",
IT:"https://images.unsplash.com/photo-1759062012196-ab43aef31a6f?auto=format&fit=crop&w=1200&q=80",
PT:"https://images.unsplash.com/photo-1638664370752-8188076afbab?auto=format&fit=crop&w=1200&q=80",
ES:"https://images.unsplash.com/photo-1628691826063-f9b73f6ce0bf?auto=format&fit=crop&w=1200&q=80",
UA:"https://images.unsplash.com/photo-1667152016525-9f64ddd33f7d?auto=format&fit=crop&w=1200&q=80",
};

// One distinct photo per route (same order as R[country] / RUA[country])
const RIMG={
HR:[
"https://images.unsplash.com/photo-1722100354846-bcbbf697a273?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1747514550264-6613b5afd177?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1553773077-91673524aafa?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1772982903110-d3ba2f38a134?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1661050422671-46dbd7926730?auto=format&fit=crop&w=1200&q=80",
],
CZ:[
"https://images.unsplash.com/photo-1658052829392-fd70d474482c?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1757862969163-57a9415523ed?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1493928847765-7796c605e694?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1605712406831-919abaf0cc70?auto=format&fit=crop&w=1200&q=80",
],
FR:[
"https://images.unsplash.com/photo-1755090249373-dfbf3a462f6c?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1704300815432-76952c1e3562?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1602574923828-853dbbc27277?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1768735584713-7e7eff5fdc34?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1723413516174-8a76575dccd1?auto=format&fit=crop&w=1200&q=80",
],
IT:[
"https://images.unsplash.com/photo-1759062012196-ab43aef31a6f?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1602491399262-55831860b387?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1675026922181-b30935570a78?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1573419020762-3af44eae75cf?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1725103895189-370086c7739f?auto=format&fit=crop&w=1200&q=80",
],
PT:[
"https://images.unsplash.com/photo-1638664370752-8188076afbab?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1680762134192-a1e0637defc7?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1724258778128-108e360ad82a?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1540308990836-5a7b1df6dc00?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1585173847038-1cfe1954c10a?auto=format&fit=crop&w=1200&q=80",
],
ES:[
"https://images.unsplash.com/photo-1628691826063-f9b73f6ce0bf?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1670691377549-155175463898?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1545797182-208561608a32?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1597241673028-8ee11ba6fe8c?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1773268083795-100b46354797?auto=format&fit=crop&w=1200&q=80",
],
UA:[
"https://images.unsplash.com/photo-1667152016525-9f64ddd33f7d?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1646171015962-cda7daa2800c?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1714384896548-4fb6839d2f08?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1653775173971-7b196e470787?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1680513079856-7867ad3f36f3?auto=format&fit=crop&w=1200&q=80",
"https://images.unsplash.com/photo-1663744952565-2618d51a4829?auto=format&fit=crop&w=1200&q=80",
],
};

// One distinct photo per popup region (same order as REG[country] / REGUA[country])
const GIMG={
HR:["https://images.unsplash.com/photo-1629277954843-a916d699d90e?auto=format&fit=crop&w=1200&q=80",RIMG.HR[1],RIMG.HR[0]],
CZ:[RIMG.CZ[2],RIMG.CZ[3],RIMG.CZ[1]],
FR:[RIMG.FR[0],RIMG.FR[2],RIMG.FR[1]],
IT:[RIMG.IT[0],RIMG.IT[1],RIMG.IT[2]],
PT:[RIMG.PT[0],RIMG.PT[1],RIMG.PT[2]],
ES:[RIMG.ES[0],RIMG.ES[1],RIMG.ES[3]],
UA:[RIMG.UA[0],RIMG.UA[1],RIMG.UA[2]],
};

const T={
en:{
tag:"Every glass is a new journey",
sub:"Explore wine routes, hidden vineyards, and unforgettable tasting experiences.",
choose:"Choose a destination",or:"OR ASK ANYTHING",chat:"Chat with Dionysia",
back:"Back",dest:"Destinations",fam:"Famous routes",hid:"Hidden gems",
bt:"Best time to visit",peak:"Peak",good:"Good",avoid:"Avoid",
ask:"Ask Dionysia",newc:"New chat",ph:"Ask about wine regions, routes...",
pour:"Pouring knowledge...",
welcome:"Welcome to Dionysia 🍷\n\nI'm your personal wine travel guide — here to help you discover iconic wine routes, hidden vineyards, and unforgettable tasting experiences.\n\nChoose a destination above, or ask me anything.",
wineries:"Region Wineries",visit:"Visit website",
},
ua:{
tag:"Кожен келих — це нова подорож",
sub:"Відкривай винні маршрути, приховані виноградники та незабутні дегустації.",
choose:"Оберіть напрямок",or:"АБО ЗАПИТАЙ БУДЬ-ЩО",chat:"Чат з Діонісією",
back:"Назад",dest:"Напрямки",fam:"Відомі маршрути",hid:"Приховані перлини",
bt:"Найкращий час",peak:"Пік",good:"Добре",avoid:"Уникай",
ask:"Запитати",newc:"Новий чат",ph:"Запитай про винні маршрути...",
pour:"Наливаємо знання...",
welcome:"Ласкаво просимо до Діонісії 🍷\n\nЯ твій особистий гід у світі винного туризму — допоможу відкрити знакові маршрути, приховані виноградники і незабутні дегустації.\n\nОбери напрямок вище або просто запитай.",
wineries:"Винарні регіону",visit:"Сайт",
},
};

const COUNTRIES=[
{code:"HR",name:"Croatia",flag:"🇭🇷",region:"Dalmatia · Istria · Pelješac"},
{code:"CZ",name:"Czech Republic",flag:"🇨🇿",region:"Moravia · Bohemia · Znojmo"},
{code:"FR",name:"France",flag:"🇫🇷",region:"Burgundy · Bordeaux · Alsace"},
{code:"IT",name:"Italy",flag:"🇮🇹",region:"Tuscany · Piedmont · Sicily"},
{code:"PT",name:"Portugal",flag:"🇵🇹",region:"Douro · Alentejo · Vinho Verde"},
{code:"ES",name:"Spain",flag:"🇪🇸",region:"Rioja · Ribera · Priorat"},
{code:"UA",name:"Ukraine",flag:"🇺🇦",region:"Zakarpattia · Odesa · Bessarabia"},
];

const R={
HR:[
{n:"Pelješac — Plavac Mali Route",s:"Ston · Orebić · Grgić · Matuško",d:"Croatia's most iconic wine route along a 65km Adriatic peninsula. Home to Dingač, the first Croatian protected wine designation.",h:false},
{n:"Istria — Malvazija & Teran",s:"Motovun · Kozlović · Meneghetti",d:"Often called the Tuscany of Croatia — rolling hills, truffle forests, medieval towns.",h:false},
{n:"Korčula & Hvar — Island Wines",s:"Lumbarda · Tomic Winery · Stari Grad",d:"Rare Grk and Pošip whites on Korčula, Plavac Mali on sun-drenched Hvar.",h:false},
{n:"Slavonia — Graševina Plains",s:"Kutjevo · Krauthaker · Enjingi",d:"Croatia's best-kept secret — continental plains producing rich Graševina whites. Kutjevo cellars date to 1232.",h:true},
{n:"Krk Island — Žlahtina White",s:"Vrbnik · Katunar Winery",d:"A grape found nowhere else in the world. The village of Vrbnik perches on a cliff above the Adriatic.",h:true},
],
CZ:[
{n:"Mikulov — Pálava Hills Route",s:"Mikulov · Valtice · Lednice · Sonberk",d:"The crown of Czech wine country. UNESCO Lednice-Valtice landscape with exceptional Pálava and Riesling.",h:false},
{n:"Znojmo — Šobes Vineyard",s:"Znojmo · Šobes · Lahofer Winery",d:"One of Europe's oldest vineyards in a dramatic river bend. Award-winning Lahofer has a wave-shaped building.",h:false},
{n:"Moravian Wine Trail",s:"Velké Bílovice · Bzenec · Mutěnice",d:"A 1,200km cycling network through ten wine sub-regions. August–October brings burčák along the route.",h:false},
{n:"Bohemia — Northernmost Wines",s:"Mělník · Litoměřice · Kutná Hora",d:"Only 4% of Czech wine comes from Bohemia. Mělník Castle has grown vines since the time of Charles IV.",h:true},
],
FR:[
{n:"Burgundy — Route des Grands Crus",s:"Dijon · Gevrey-Chambertin · Beaune",d:"60km of the world's most prestigious vineyards. Every village name is a world-famous appellation.",h:false},
{n:"Alsace Wine Route",s:"Strasbourg · Riquewihr · Colmar",d:"France's oldest wine route (1953), 180km through 70 fairytale villages with 51 Grand Cru vineyards.",h:false},
{n:"Bordeaux — Médoc & Saint-Émilion",s:"Médoc · Saint-Émilion · Sauternes",d:"The world's largest fine wine region — 6,000+ châteaux, 60 Grands Crus Classés.",h:false},
{n:"Jura — Vin Jaune & Wild Wines",s:"Arbois · Château-Chalon · Tissot",d:"France's most eccentric wine region. Vin Jaune aged 6 years — a 1774 bottle sold for €100,000.",h:true},
{n:"Northern Rhône — Syrah on Granite",s:"Cornas · Saint-Joseph · Hermitage",d:"Steep granite terraces producing Syrah of jaw-dropping intensity at a fraction of Burgundy prices.",h:true},
],
IT:[
{n:"Tuscany — Chianti Classico Route",s:"Florence · Greve in Chianti · Siena",d:"The Chiantigiana road between Florence and Siena is one of the most beautiful drives in the world.",h:false},
{n:"Piedmont — Barolo & Barbaresco",s:"Alba · Barolo · Barbaresco · Langhe",d:"UNESCO Heritage vineyard landscape at the foot of the Alps. Barolo pairs with white truffles in October.",h:false},
{n:"Sicily — Etna Volcano Route",s:"Etna · Palermo · Marsala · Pantelleria",d:"Ancient volcanic soils on Europe's largest active volcano produce Italy's most exciting wines.",h:false},
{n:"Valpolicella — Amarone Route",s:"Verona · Masi · Allegrini",d:"Amarone is made from grapes dried for months, concentrating flavors into wines of extraordinary power.",h:true},
{n:"Sardinia — Ancient Cannonau Vines",s:"Nuoro · Barbagia · Argiolas",d:"Cannonau grown on Italy's oldest vines, in villages where people routinely live past 100.",h:true},
],
PT:[
{n:"Douro Valley — UNESCO Port Wine Route",s:"Porto · Pinhão · Quinta do Crasto",d:"One of the world's most beautiful wine landscapes — terraced vineyards dropping to the Douro river.",h:false},
{n:"Alentejo — Sun-Baked Plains Route",s:"Évora · Reguengos de Monsaraz · Esporão",d:"Portugal's most productive wine region — vast cork oak plains and powerful Aragonez reds.",h:false},
{n:"Vinho Verde — Green Wine Route",s:"Braga · Guimarães · Lima Valley",d:"The northernmost wine route — light, slightly sparkling whites perfect for Atlantic seafood.",h:false},
{n:"Dão — Portugal's Hidden Burgundy",s:"Viseu · Quinta dos Roques · Alvaro Castro",d:"Tucked in granite mountains, Dão produces Portugal's most elegant reds at a fraction of Douro prices.",h:true},
{n:"Madeira — Wine That Ages Forever",s:"Funchal · Blandy's · Barbeito",d:"Madeira wine aged in heat for decades. A 200-year-old Madeira is still drinkable.",h:true},
],
ES:[
{n:"La Rioja — Tempranillo Wine Route",s:"Logroño · Haro · Laguardia · Riscal",d:"Spain's most famous wine region. Frank Gehry's Marqués de Riscal hotel is worth the trip alone.",h:false},
{n:"Ribera del Duero — Castilian Plateau",s:"Valladolid · Peñafiel · Vega Sicilia",d:"High-altitude vineyards producing Spain's most powerful Tempranillo. Vega Sicilia is Spain's greatest winery.",h:false},
{n:"Jerez — Sherry Triangle Route",s:"Jerez · Sanlúcar · González Byass",d:"Fino, Amontillado, Oloroso from sun-bleached albariza soils. The local tapas culture is legendary.",h:false},
{n:"Priorat — Black Slate & Garnacha",s:"Gratallops · Alvaro Palacios · Mas Doix",d:"One of only two Spanish DOCa regions. Llicorella slate forces vine roots 30m deep for remarkable concentration.",h:true},
{n:"Rías Baixas — Albariño on the Atlantic",s:"Pontevedra · Galicia · Martín Códax",d:"Spain's rainy northwestern corner produces the country's finest white wine — crisp, saline Albariño.",h:true},
],
UA:[
{n:"Zakarpattia — Carpathian Wine Route",s:"Chateau Chizay · Berehove · Uzhhorod",d:"Ukraine's most scenic wine region, bordering Hungary and Slovakia. Exceptional Blaufränkisch and Furmint.",h:false},
{n:"Odesa — Shabo & Fortress Route",s:"Shabo Winery · Bilhorod-Dnistrovskyi",d:"Founded 1822 by Swiss settlers. Underground cellar tours five levels deep and a Crystal Hall tasting room.",h:false},
{n:"Bessarabia — Lake Yalpuh Trail",s:"Villa Tinta · Kolonist · Bolgrad",d:"Beautiful route along Ukraine's largest natural lake with indigenous Odesa Black and Sukholymanske.",h:false},
{n:"Berehove — Family Cellars",s:"Parászka Estate · Sass K Winery",d:"Family-run cellars preserving Hungarian traditions. Parászka grows over 250 grape varieties.",h:true},
{n:"Iza Village — The Wine Village",s:"Iza · Khust · Synevyr",d:"Nearly every household makes homemade wine. Best visited in October during harvest season.",h:true},
{n:"Crimea — Massandra Imperial Cellars",s:"Massandra · Novy Svet · Koktebel",d:"Ukraine's occupied wine heritage. Massandra cellars hold over 1 million bottles including 19th century wines.",h:true},
],
};

const RUA={
HR:[
{n:"Pelješac — Plavac Mali Route",s:"Стон · Орбіч · Гргіч · Матушко",d:"Найіконічніший маршрут Хорватії вздовж 65км Адріатики. Дінгач — перше хорватське захищене найменування.",h:false},
{n:"Istria — Malvazija & Teran",s:"Мотовун · Козловіч · Менегетті",d:"Тоскана Хорватії — пагорби, трюфельні ліси, середньовічні містечка. Мальвазія і Теран.",h:false},
{n:"Korčula & Hvar — Island Wines",s:"Лумбарда · Томіч · Старий Град",d:"Рідкісний Грк і Пошіп на Корчулі, Плавац Малі на сонячному Хварі.",h:false},
{n:"Slavonia — Graševina Plains",s:"Кутьєво · Краутхакер · Єнджінгі",d:"Найбільший секрет Хорватії — континентальні рівнини з Грашевіна. Льохи Кутьєво з 1232 року.",h:true},
{n:"Krk Island — Žlahtina White",s:"Врбнік · Катунар",d:"Сорт винограду, якого немає більше ніде. Врбнік стоїть на скелі над Адріатикою.",h:true},
],
CZ:[
{n:"Mikulov — Pálava Hills Route",s:"Мікулов · Валтіце · Леднице · Сонберк",d:"Корона чеського виноробства. Ландшафт ЮНЕСКО Леднице-Валтіце з виключною Палавою і Рислінгом.",h:false},
{n:"Znojmo — Šobes Vineyard",s:"Зноймо · Шобес · Лагофер",d:"Один з найстаріших виноградників Європи. Лагофер — будівля у формі хвилі з оглядовою терасою.",h:false},
{n:"Moravian Wine Trail",s:"Велке Білович · Бженець · Мутєніце",d:"Мережа велодоріжок 1200км через десять субрегіонів. У серпні-жовтні вздовж маршруту продають молоде вино.",h:false},
{n:"Bohemia — Northernmost Wines",s:"Мельнік · Літомержіце · Кутна Гора",d:"Лише 4% чеського вина з Богемії. Замок Мельнік вирощує виноград з часів Карла IV.",h:true},
],
FR:[
{n:"Burgundy — Route des Grands Crus",s:"Діжон · Жевре-Шамбертен · Бон",d:"60км найпрестижніших виноградників світу. Кожна назва на знаку — всесвітньо відоме апеласьйон.",h:false},
{n:"Alsace Wine Route",s:"Страсбург · Рікевір · Кольмар",d:"Найстаріший маршрут Франції (1953), 180км через 70 казкових сіл з 51 виноградником Гран Крю.",h:false},
{n:"Bordeaux — Médoc & Saint-Émilion",s:"Медок · Сент-Еміліон · Сотерн",d:"Найбільший регіон тонких вин у світі — понад 6000 шато, 60 Гран Крю Класе.",h:false},
{n:"Jura — Vin Jaune & Wild Wines",s:"Арбуа · Шато-Шалон · Тіссо",d:"Найексцентричніший регіон Франції. Ван Жон витримується 6 років — пляшка 1774 пішла за 100,000 євро.",h:true},
{n:"Northern Rhône — Syrah on Granite",s:"Корна · Сен-Жозеф · Ерміта",d:"Круті гранітні тераси з вражаючим Сіра — за ціною нижчою ніж у Бургундії.",h:true},
],
IT:[
{n:"Tuscany — Chianti Classico Route",s:"Флоренція · Греве · Сієна · Монтальчіно",d:"Дорога К'янтіджана між Флоренцією і Сієною — одна з найгарніших у світі.",h:false},
{n:"Piedmont — Barolo & Barbaresco",s:"Альба · Бароло · Барбареско · Ланге",d:"Ландшафт ЮНЕСКО біля Альп. Бароло і білі трюфелі у жовтні — легендарне поєднання.",h:false},
{n:"Sicily — Etna Volcano Route",s:"Етна · Палермо · Марсала",d:"Давні вулканічні грунти Етни — найзбудливіші вина Італії з унікальним мінеральним характером.",h:false},
{n:"Valpolicella — Amarone Route",s:"Верона · Мазі · Аллегріні",d:"Амароне з підв'яленого винограду — вина надзвичайної концентрації та глибини.",h:true},
{n:"Sardinia — Ancient Cannonau Vines",s:"Нуоро · Барбаджа · Арджолас",d:"Каннонау на найстаріших лозах Італії, у селах де люди живуть понад 100 років.",h:true},
],
PT:[
{n:"Douro Valley — UNESCO Port Wine Route",s:"Порту · Піньян · Кінта до Красто",d:"Один з найкрасивіших ландшафтів — тераси виноградників над річкою Дору.",h:false},
{n:"Alentejo — Sun-Baked Plains Route",s:"Евора · Регенгош · Еспоран",d:"Найпродуктивніший регіон Португалії — пробкові діброви і потужні Арагонес.",h:false},
{n:"Vinho Verde — Green Wine Route",s:"Брага · Гімарайнш · Долина Ліма",d:"Найпівнічніший маршрут — легкі напівігристі білі ідеальні з морепродуктами.",h:false},
{n:"Dão — Portugal's Hidden Burgundy",s:"Візеу · Кінта дос Рокес · Алваро Кастро",d:"Прихована в гранітних горах, Дао виробляє найелегантніші червоні Португалії.",h:true},
{n:"Madeira — Wine That Ages Forever",s:"Фуншал · Бланді · Барбейто",d:"Мадейра витримується десятиліттями. 200-річна пляшка досі придатна до пиття.",h:true},
],
ES:[
{n:"La Rioja — Tempranillo Wine Route",s:"Логроньо · Аро · Лагуардія · Рискаль",d:"Найвідоміший регіон Іспанії. Готель Маркес де Рискаль від Геррі — окрема причина приїхати.",h:false},
{n:"Ribera del Duero — Castilian Plateau",s:"Вальядолід · Пеньяфьель · Вега Сіцілія",d:"Високогірне плато з наймогутнішим Темпраніо. Вега Сіцілія — найвеличніша виноробня Іспанії.",h:false},
{n:"Jerez — Sherry Triangle Route",s:"Херес · Санлукар · Гонсалес Біас",d:"Фіно, Амонтільядо, Олоросо з крейдяних грунтів. Культура тапас тут легендарна.",h:false},
{n:"Priorat — Black Slate & Garnacha",s:"Гратальопс · Альваро Палачос",d:"Один з двох іспанських DOCa. Чорний сланець змушує коріння лози сягати 30м вглиб.",h:true},
{n:"Rías Baixas — Albariño on the Atlantic",s:"Понтеведра · Галісія · Мартін Кодакс",d:"Дощовий північний захід виробляє найкраще біле Іспанії — свіжий солоний Альбаріньо.",h:true},
],
UA:[
{n:"Zakarpattia — Carpathian Wine Route",s:"Шато Чижай · Берегово · Ужгород",d:"Наймальовничіший регіон України на кордоні з Угорщиною і Словаччиною. Блауфренкіш і Фурмінт.",h:false},
{n:"Odesa — Shabo & Fortress Route",s:"Шабо · Білгород-Дністровський",d:"Засновано 1822 швейцарськими переселенцями. Підземні льохи на п'яти рівнях і Кришталева зала.",h:false},
{n:"Bessarabia — Lake Yalpuh Trail",s:"Вілла Тінта · Колоніст · Болград",d:"Маршрут вздовж найбільшого природного озера України з автохтонним Одеським чорним.",h:false},
{n:"Berehove — Family Cellars",s:"Маєток Парасько · Сасс К",d:"Сімейні льохи зі столітніми угорськими традиціями. Парасько вирощує понад 250 сортів.",h:true},
{n:"Iza Village — The Wine Village",s:"Іза · Хуст · Синевир",d:"Майже кожна родина виготовляє вино. Найкраще у жовтні під час збору врожаю.",h:true},
{n:"Crimea — Massandra Imperial Cellars",s:"Масандра · Новий Світ · Коктебель",d:"Окупована винна спадщина України. Льохи Масандри — понад мільйон пляшок включно з XIX ст.",h:true},
],
};

const BT={
HR:{peak:"Sep – Oct",good:"May – Jun · Jul (coast)",avoid:"Nov – Mar",tip:"Istria Wine & Walk festival — mid-October."},
CZ:{peak:"Aug – Sep",good:"May – Jun",avoid:"Dec – Mar",tip:"Aug–Nov is the only time burčák is legally sold."},
FR:{peak:"Sep – Oct",good:"May – Jun (fewer crowds)",avoid:"Jul – Aug (crowded)",tip:"Burgundy in October pairs perfectly with truffle season."},
IT:{peak:"Sep – Oct",good:"May – Jun",avoid:"Jul – Aug (heat)",tip:"Sicily harvests in August. October is truffle season in Piedmont."},
PT:{peak:"Mid-Sep – Oct",good:"Apr – Jun",avoid:"Jul – Aug (extreme heat)",tip:"Douro harvest — grapes still stomped by foot to music."},
ES:{peak:"Sep – Oct",good:"Apr – Jun",avoid:"Jul – Aug (30-38C)",tip:"Rioja Harvest Festival in September — traditional grape stomping."},
UA:{peak:"Sep – Oct",good:"May – Jun",avoid:"Dec – Feb",tip:"Iza village is best in October — every household opens its gates."},
};

const BTUA={
HR:{peak:"Вер – Жов",good:"Тра – Чер · Лип (узбережжя)",avoid:"Лис – Бер",tip:"Фестиваль Wine & Walk в Істрії — середина жовтня."},
CZ:{peak:"Сер – Вер",good:"Тра – Чер",avoid:"Гру – Бер",tip:"Сер-Лис — єдиний час коли законно продають молоде вино."},
FR:{peak:"Вер – Жов",good:"Тра – Чер (менше туристів)",avoid:"Лип – Сер (переповнено)",tip:"Бургундія у жовтні — сезон трюфелів."},
IT:{peak:"Вер – Жов",good:"Тра – Чер",avoid:"Лип – Сер (спека)",tip:"Сицилія збирає у серпні. Жовтень — трюфелі в П'ємонті."},
PT:{peak:"Сер вер – Жов",good:"Кві – Чер",avoid:"Лип – Сер (пекло)",tip:"Збір врожаю в Дору — виноград досі тиснуть ногами під музику."},
ES:{peak:"Вер – Жов",good:"Кві – Чер",avoid:"Лип – Сер (30-38C)",tip:"Фестиваль збору врожаю в Ріосі — традиційне топтання винограду."},
UA:{peak:"Вер – Жов",good:"Тра – Чер",avoid:"Гру – Лют",tip:"Іза найкраще у жовтні — кожна родина відкриває ворота."},
};

const REG={
HR:[
{n:"Dalmatia",d:"Sun-drenched coastal region along the Adriatic. Famous for bold Plavac Mali reds and crisp whites from Korčula island."},
{n:"Istria",d:"Croatia's 'Tuscany' — rolling hills, truffle forests and medieval towns. White Malvazija and earthy Teran dominate."},
{n:"Pelješac",d:"A 65km peninsula, home to Dingač — Croatia's first protected wine designation. Steep slopes concentrate powerful reds."},
],
CZ:[
{n:"Moravia",d:"Over 96% of Czech wine. Continental climate with warm summers and cool nights — ideal for aromatic whites."},
{n:"Bohemia",d:"Only 4% of Czech wine. Mělník Castle has grown vines since Charles IV in the 14th century."},
{n:"Znojmo",d:"Westernmost Moravian sub-region bordering Austria. Šobes — one of Europe's most beautifully situated vineyards."},
],
FR:[
{n:"Burgundy",d:"The world's most complex wine region — 1,200+ individual named plots, UNESCO World Heritage. Pinot Noir and Chardonnay at their pinnacle."},
{n:"Bordeaux",d:"World's largest fine wine region — 6,000+ châteaux. Cabernet on Médoc gravel; Merlot on Saint-Émilion limestone."},
{n:"Alsace",d:"France's most Germanic region, sheltered by the Vosges. 51 Grand Cru vineyards — Riesling, Gewürztraminer, Pinot Gris."},
],
IT:[
{n:"Tuscany",d:"Italy's most celebrated region — rolling hills, Sangiovese vines, and the Super Tuscans that broke all the rules."},
{n:"Piedmont",d:"The Burgundy of Italy — foggy valleys at the foot of the Alps. Barolo and Barbaresco, truffles in October."},
{n:"Sicily",d:"Italy's largest and most exciting region. Volcanic Etna soils and indigenous varieties transformed by a new generation."},
],
PT:[
{n:"Douro",d:"One of the world's oldest demarcated regions (1756). Terraced vineyards dropping to the Douro river. Birthplace of Port wine."},
{n:"Alentejo",d:"Vast sun-baked plateau — a third of Portugal. Cork oak plains and powerful Aragonez reds."},
{n:"Vinho Verde",d:"Portugal's largest region in the lush northwest. Light sparkling whites from Alvarinho — perfect with seafood."},
],
ES:[
{n:"Rioja",d:"Spain's most famous region, one of two with DOCa status. Tempranillo aged in oak — from fresh Joven to complex Gran Reserva."},
{n:"Ribera",d:"High-altitude plateau in Castile. Spain's most powerful Tempranillo. Home of Vega Sicilia, the country's greatest winery."},
{n:"Priorat",d:"Spain's other DOCa. Black slate forces vine roots 30m deep — mineral wines of extraordinary concentration."},
],
UA:[
{n:"Zakarpattia",d:"Ukraine's westernmost region bordering Hungary, Slovakia and Romania. Volcanic soils and Carpathian microclimate."},
{n:"Odesa",d:"Sunny Black Sea coast — wine produced here since ancient Greek colonists arrived 2,500 years ago."},
{n:"Bessarabia",d:"Southernmost Ukraine, bordering Romania and Moldova. Chernozem soils and indigenous Odesa Black grapes near Lake Yalpuh."},
],
};

const REGUA={
HR:[
{n:"Далмація",d:"Узбережний регіон вздовж Адріатики. Потужний Плавац Малі з Пелєшацу і свіжі білі з Корчули."},
{n:"Істрія",d:"Тоскана Хорватії — пагорби, трюфельні ліси, середньовічні містечка. Мальвазія і Теран."},
{n:"Пелєшац",d:"65км півострів, де народилося Дінгач — перше хорватське захищене найменування."},
],
CZ:[
{n:"Моравія",d:"Понад 96% чеського вина. Континентальний клімат ідеальний для ароматних білих сортів."},
{n:"Богемія",d:"Лише 4% вина. Замок Мельнік вирощує виноград з часів Карла IV у XIV столітті."},
{n:"Зноймо",d:"Найзахідніший субрегіон на кордоні з Австрією. Шобес — один з найкрасивіших виноградників Європи."},
],
FR:[
{n:"Бургундія",d:"Найскладніший регіон світу — понад 1200 іменованих ділянок, ЮНЕСКО. Піно Нуар і Шардоне на піку."},
{n:"Бордо",d:"Найбільший регіон тонких вин — понад 6000 шато. Каберне на гравії Медока, Мерло на вапняку."},
{n:"Ельзас",d:"Найгерманськіший регіон Франції. 51 виноградник Гран Крю — Рислінг, Гевюрцтрамінер, Піно Грі."},
],
IT:[
{n:"Тоскана",d:"Найвідоміший регіон Італії — пагорби, Санджовезе і Супер-Тоскани що зламали всі правила."},
{n:"П'ємонт",d:"Бургундія Італії — туманні долини біля Альп. Бароло і Барбареско, трюфелі у жовтні."},
{n:"Сицилія",d:"Найбільший і найзбудливіший регіон. Вулканічна Етна і автохтонні сорти змінили репутацію острова."},
],
PT:[
{n:"Дору",d:"Один з найстаріших демаркованих регіонів (1756). Тераси над річкою Дору. Батьківщина Портвейну."},
{n:"Алентежу",d:"Велике сонячне плато — третина Португалії. Пробкові діброви і потужні Арагонес."},
{n:"Vinho Verde",d:"Найбільший регіон Португалії на зеленій північ. Легкі напівігристі білі з Альваріньо."},
],
ES:[
{n:"Ріоха",d:"Найвідоміший регіон Іспанії, один з двох DOCa. Темпраніо витримане в дубі — від Хувен до Гран Резерва."},
{n:"Рібера",d:"Високогірне плато у Кастілії. Наймогутніший Темпраніо. Тут Вега Сіцілія — найвидатніша виноробня."},
{n:"Пріорат",d:"Другий іспанський DOCa. Чорний сланець змушує коріння сягати 30м — мінеральна концентрація."},
],
UA:[
{n:"Закарпаття",d:"Найзахідніший регіон України на кордоні з Угорщиною, Словаччиною і Румунією. Вулканічні грунти."},
{n:"Одеса",d:"Сонячне узбережжя Чорного моря — вино тут виробляють з часів давньогрецьких колоністів."},
{n:"Бессарабія",d:"Найпівденніший куточок України. Чорноземні грунти і автохтонний Одеський чорний біля озера Ялпуг."},
],
};

// Real wineries per region (same order as REG[country] / REGUA[country])
const WINERIES={
HR:[
[
{n:"Stina Winery",loc:"Bol, island of Brač",d:"Housed in a 1903 stone building on the seafront, growing indigenous Plavac Mali, Pošip and Vugava on extreme rocky terrain.",url:null},
{n:"Testament Winery",loc:"Vrgorac/Podgora area",d:"Ages some of its wine underwater in the Adriatic and pours tastings from a hillside room over its organic vineyard.",url:null},
{n:"Lacman Winery",loc:"Selca, Hvar island",d:"Family-run estate serving tastings on a wooden deck overlooking Stari Grad Bay.",url:null},
{n:"Crvik Winery",loc:"Hvar island",d:"Third-generation producer of 'Tesoro', a white made from the native Malvazija Dubrovačka grape.",url:null},
],
[
{n:"Kozlović Winery",loc:"Momjan",d:"Family-run since 1904 near the Slovenian border, celebrated for Malvazija Istarska, Teran and Muscat Momiano.",url:"https://www.kozlovic.hr/en/"},
{n:"Kabola Winery",loc:"Momjan",d:"Blends ancient qvevri (amphora) winemaking with Istrian terroir for standout Malvazija and Teran.",url:"https://www.kabola.hr"},
{n:"Benvenuti Winery",loc:"Kaldir, near Motovun",d:"The leading estate of the Motovun growing area, producing indigenous Istrian whites and reds.",url:null},
{n:"Meneghetti Wine Hotel & Winery",loc:"Bale",d:"A design-forward wine resort among vineyards and olive groves, pouring several styles of Malvazija.",url:"https://www.meneghetti.hr"},
],
[
{n:"Matuško Winery",loc:"Potomje",d:"A 2,000m² underground cellar drawing 50,000+ visitors a year for its Dingač-appellation Plavac Mali.",url:"https://matusko-vina.hr/en/"},
{n:"Bura-Mrgudić Winery",loc:"Potomje",d:"A small five-generation family estate hand-farming the steep Dingač and Postup slopes.",url:"https://mokalo.hr/en"},
{n:"Saints Hills Winery",loc:"Oskorušno",d:"A stone winery revived in 2011, working with star oenologist Michel Rolland on Dingač-appellation wines.",url:"https://saintshills.com/"},
{n:"Vinarija Miloš",loc:"Ponikve",d:"A historic multi-generation family estate whose Dingač and Postup wines are benchmarks of the appellation.",url:null},
],
],
CZ:[
[
{n:"Sonberk",loc:"Popice, near Mikulov",d:"A striking 2008 winery building with iconic views over the Pálava Hills.",url:"https://www.sonberk.cz/en/"},
{n:"Vinselekt Michlovský",loc:"Rakvice",d:"Farms 125 hectares across Velké Pavlovice and Mikulov and won the first-ever Czech Winery of the Year award.",url:"https://www.michlovsky.com/en/"},
{n:"Château Mělník (Lobkowicz)",loc:"Mělník",d:"The Lobkowicz family has held these vineyards since 1753; tour medieval cellars while tasting the signature 'Ludmila'.",url:"https://lobkowicz-melnik.cz/en/"},
{n:"Wine Salon of the Czech Republic",loc:"Valtice chateau cellars",d:"The country's official showcase, where the year's 100 best Czech and Moravian wines can be tasted together.",url:null},
],
[
{n:"Johann W",loc:"Třebívlice",d:"One of Bohemia's oldest wine estates, its label honoring Ulrike von Levetzow, the last love of the poet Goethe.",url:"https://johannw.com/en/"},
{n:"Porta Bohemica",loc:"Velké Žernoseky",d:"Established 2010 on volcanic hills of the Central Bohemian Uplands along the Elbe, specializing in dry whites.",url:null},
{n:"Vinařství Kraus",loc:"Mělník",d:"Founded by Prof. Vilém Kraus, regarded as the father of modern Czech winemaking.",url:null},
{n:"Chateau Mělník Winery",loc:"Mělník",d:"Farms 23 hectares across six vineyards for 30,000–40,000 bottles a year of Pinot Noir and Müller-Thurgau.",url:null},
],
[
{n:"Znovín Znojmo",loc:"Louka Monastery, Znojmo",d:"The country's largest wine producer, ageing near a million bottles in a former monastery's medieval cellars.",url:"https://www.znovin.cz"},
{n:"Lahofer Winery",loc:"Dobšice",d:"A wave-shaped modern winery with a hand-painted tasting-room mural and a rooftop terrace.",url:"https://www.lahofer.cz"},
{n:"Šobes Vineyard",loc:"bend of the Dyje River",d:"One of Central Europe's oldest and most acclaimed vineyard sites, its steep river-bend terraces prized for Riesling and Pálava.",url:null},
{n:"Vinné sklepy Šatov",loc:"Šatov, on the Austrian border",d:"A historic underground cellar complex showcasing Znojmo's Grüner Veltliner and Müller-Thurgau.",url:null},
],
],
FR:[
[
{n:"Château de Pommard",loc:"Pommard",d:"Built in 1726 and farmed biodynamically, one of the most-visited estates in the Côte-d'Or.",url:"https://www.chateaudepommard.com/"},
{n:"Domaine Faiveley",loc:"Nuits-Saint-Georges",d:"Family-owned since 1825 and the largest vineyard holder in the appellation, known for Premier Cru 'Les Saint-Georges'.",url:"https://domaine-faiveley.com/"},
{n:"Château de Meursault",loc:"Meursault",d:"Stone-vaulted cellars from the 12th, 14th and 16th centuries hold 800,000 bottles beneath the château.",url:"https://www.chateau-meursault.com/"},
{n:"Domaine Marquis d'Angerville",loc:"Volnay",d:"One of Volnay's oldest estates (first recorded 1507), famous for its Clos des Ducs monopole.",url:null},
],
[
{n:"Château Pichon Longueville Baron",loc:"Pauillac",d:"A Second Growth reopened to the public in 2023, offering by-appointment tours with vertical tastings.",url:"https://www.pichonbaron.com/"},
{n:"Château Smith Haut Lafitte",loc:"Martillac",d:"A Cru Classé estate known for its vineyard spa and art-and-nature tours.",url:"https://www.smith-haut-lafitte.com/"},
{n:"Château Palmer",loc:"Margaux-Cantenac",d:"A Third Growth behind a distinctive four-turreted château, fully biodynamic-certified since 2018.",url:"https://www.chateau-palmer.com/"},
{n:"Château Rieussec",loc:"Fargues, Sauternes",d:"A Premier Cru Classé Sauternes estate owned by the Rothschilds of Lafite, with guided cellar visits by appointment.",url:"https://www.lafite.com/domaines/rieussec/"},
],
[
{n:"Domaine Zind-Humbrecht",loc:"Turckheim",d:"Growing vines since 1620 and biodynamic since 1997, farming Grand Cru parcels in Rangen, Goldert, Hengst and Brand.",url:"https://www.zindhumbrecht.fr/"},
{n:"Domaine Weinbach",loc:"Kaysersberg",d:"Founded in 1612 by Capuchin monks at the foot of the Schlossberg Grand Cru, renowned for Riesling and Gewürztraminer.",url:"https://www.domaineweinbach.com/"},
{n:"Maison Trimbach",loc:"Ribeauvillé",d:"Producer of Clos Sainte-Hune, a tiny monopole considered one of the world's greatest dry Rieslings.",url:"https://www.trimbach.fr/"},
{n:"Domaine Marcel Deiss",loc:"Bergheim",d:"A biodynamic estate reviving 'complantation' — interplanting multiple grape varieties in a single Grand Cru parcel.",url:"https://www.marceldeiss.com/"},
],
],
IT:[
[
{n:"Castello di Ama",loc:"Gaiole in Chianti",d:"A 12th-century estate whose 1998 cellar restoration launched a contemporary art collection set among the vineyards.",url:"https://castellodiama.com/en/"},
{n:"Fontodi",loc:"Panzano in Chianti",d:"A certified-organic estate whose 100% Sangiovese 'Flaccianello' has repeatedly ranked among the world's top wines.",url:"https://www.fontodi.com/en/"},
{n:"Poliziano",loc:"Montepulciano",d:"A founding modern estate of Vino Nobile, farming 170 hectares organically around the local 'Prugnolo Gentile' clone.",url:"https://carlettipoliziano.com/en/"},
{n:"Tenuta San Guido (Sassicaia)",loc:"Bolgheri",d:"The original Super Tuscan estate that launched Bolgheri's wine revolution in the 1960s–70s.",url:null},
],
[
{n:"Marchesi di Barolo",loc:"Barolo",d:"The oldest, most historic Barolo producer, with underground cellars and guided Barolo and Barbaresco tastings.",url:"https://marchesibarolo.com/en/"},
{n:"Ceretto",loc:"Alba/Langhe",d:"Famous for the 'Cappella del Barolo', a deconsecrated church turned art landmark in the Brunate vineyard.",url:"https://www.ceretto.com"},
{n:"Vietti",loc:"Castiglione Falletto",d:"Created one of Barolo's first single-vineyard crus in the 1950s and Piedmont's first single-variety Roero Arneis.",url:"https://www.vietti.com/en/"},
{n:"Produttori del Barbaresco",loc:"Barbaresco",d:"A historic 1894 grower cooperative of 53 members working exclusively with Nebbiolo.",url:null},
],
[
{n:"Tenuta delle Terre Nere",loc:"Randazzo, Mount Etna",d:"Founded by a pioneer of modern Etna winemaking, first to bottle single-vineyard 'contrada' wines from the north slope.",url:"https://www.tenutaterrenere.com"},
{n:"Girolamo Russo",loc:"Passopisciaro, Mount Etna",d:"A 15-hectare estate at 650–780m altitude known for its single-vineyard 'Cru' bottlings.",url:"https://www.girolamorusso.it/?lang=en"},
{n:"Donnafugata",loc:"Marsala",d:"Family-owned for over a century, its 1851 cellars in a traditional Sicilian 'baglio' host tastings of native-grape wines.",url:"https://visit.donnafugata.it/en/"},
{n:"Florio",loc:"Marsala",d:"Founded 1832, the historic house behind fortified Marsala wine, with a private collection of 40,000+ historic bottles.",url:null},
],
],
PT:[
[
{n:"Quinta do Bomfim",loc:"Pinhão",d:"Dow's Port flagship estate, with a riverside 1896 lodge and lagares engineered to replicate foot-treading.",url:"https://www.symington.com/visitar/quinta-do-bomfim/"},
{n:"Quinta do Seixo (Sandeman)",loc:"Valença do Douro",d:"Sandeman's 100-hectare flagship, pairing an 18th-century manor with a hillside winery and robotic lagares.",url:"https://www.sandeman.com/port-wine/visit/quinta-do-seixo-douro/"},
{n:"Quinta das Carvalhas",loc:"near Pinhão",d:"Known as 'the image of the Douro' for its dramatic terraces and 360-degree views from the hilltop Casa Redonda.",url:null},
{n:"Quinta do Crasto",loc:"near Sabrosa",d:"Dry-stone terraces up to 400 years old hold vines as old as 90 years on steep schist slopes.",url:"https://www.quintadocrasto.wine/en/"},
],
[
{n:"Herdade do Esporão",loc:"Reguengos de Monsaraz",d:"Documented since the 13th century around a late-Gothic tower, certified as Portugal's first wine tourism destination.",url:"https://esporao.com/en"},
{n:"Adega da Cartuxa",loc:"Évora",d:"Run by a nonprofit foundation near UNESCO-listed Évora, producer of the acclaimed Pêra-Manca label.",url:"https://www.vinhosdoalentejo.pt/en/producers/fundacao-eugenio-de-almeida-adega-cartuxa/"},
{n:"Herdade Grande",loc:"Vidigueira",d:"A 350-hectare family estate combining vines and olive groves, offering a 'Vineyards & Vistas' tasting.",url:null},
{n:"Herdade dos Grous",loc:"near Albernoa",d:"A 1,000-hectare estate named for cranes nesting on its lake, combining vineyards, olive groves and a boutique hotel.",url:null},
],
[
{n:"Quinta de Soalheiro",loc:"Melgaço",d:"Planted the region's first mono-varietal Alvarinho vineyard in 1974, pioneering high-quality Alvarinho.",url:"https://soalheiro.com/en"},
{n:"Quinta da Aveleda",loc:"Penafiel",d:"Family-owned since 1870, famous for 8 hectares of gardens with free-roaming peacocks and a cellar built in 1850.",url:"https://aveleda.com/en/wine-tourism/quinta-da-aveleda"},
{n:"Quinta de Santa Cristina",loc:"Cabeceiras de Basto",d:"A hillside estate 400m up, with 30 hectares of vines overlooking the Tâmega river valley.",url:null},
{n:"Quinta de Lourosa",loc:"Paços de Ferreira area",d:"A highly rated family quinta popular for guided tours and tastings in the Sousa sub-region.",url:null},
],
],
ES:[
[
{n:"Bodegas Ysios",loc:"Laguardia",d:"Designed by Santiago Calatrava, its undulating cedar roofline mimics stacked barrels against the Sierra de Cantabria.",url:"https://bodegasysios.com/en/"},
{n:"Bodegas Marqués de Riscal",loc:"Elciego",d:"Home to Frank Gehry's titanium 'City of Wine' hotel beside the original 1860 bodega.",url:"https://www.marquesderiscal.com/en/the-marques-de-riscal-city-of-wine"},
{n:"Bodegas Muga",loc:"Haro",d:"Family-run since 1932 and the only Rioja estate that still makes its own oak barrels in-house.",url:"https://www.bodegasmuga.com/en/"},
{n:"Bodegas Baigorri",loc:"Samaniego",d:"A glass cube above ground conceals seven underground gravity-flow levels descending 32 meters.",url:"https://bodegasbaigorri.com/en/"},
],
[
{n:"Bodegas Vega Sicilia",loc:"Valbuena de Duero",d:"Spain's most legendary winery, founded 1864, producer of the iconic 'Único' reds.",url:"https://www.temposvegasicilia.com/en/terroirniveau1/4/ribera-del-duero"},
{n:"Bodegas Protos",loc:"Peñafiel",d:"A modern extension by Richard Rogers' firm, its terracotta vaults echoing the medieval castle above it.",url:"https://www.bodegasprotos.com/en/architecture/"},
{n:"Bodegas Emilio Moro",loc:"Pesquera de Duero",d:"A family winery on vines planted in 1932, known for the acclaimed 'Malleolus' label.",url:"https://www.emiliomoro.com/en/"},
{n:"Bodegas Arzuaga Navarro",loc:"Quintanilla de Onésimo",d:"Built around a 1,400-hectare estate, pairing vineyard tours with a Michelin-starred restaurant and spa.",url:"https://arzuaganavarro.com/"},
],
[
{n:"Clos Mogador",loc:"Gratallops",d:"Founded 1979 by one of the five founders of the 'Clos' movement that revived Priorat in the late 1980s.",url:null},
{n:"Celler Vall Llach",loc:"Porrera",d:"Co-founded by Catalan singer-songwriter Lluís Llach, with a museum-like tasting room over slate 'llicorella' terraces.",url:"https://www.vallllach.com/en/"},
{n:"Mas Doix",loc:"Poboleda",d:"Prized for a plot of 1902-planted Carignan vines and ~80-year-old Garnacha, farmed organically and biodynamically.",url:"https://masdoix.com/en/"},
{n:"Álvaro Palacios",loc:"Gratallops",d:"Founded 1989 by one of the 'Gratallops Five', producer of L'Ermita from Garnacha vines planted 1900–1940.",url:null},
],
],
UA:[
[
{n:"Chateau Chizay",loc:"Chizay valley, near Berehove",d:"Ukraine's first private winery, founded 1995 on a site with winemaking dating to the 13th century, with a wine museum and restaurant.",url:"https://chizay.com/en/"},
{n:"Parászka Family Cellar",loc:"village of Bene",d:"Run by two brothers cultivating up to 250 grape varieties, tasting in a century-old cave cellar dug by WWI POWs.",url:null},
{n:"Sass K. Winery",loc:"village of Kígyós (Zmiivka)",d:"A small organic winery on the volcanic Hazanéző hill, growing ~60 traditional Carpathian varieties.",url:null},
{n:"Leanka",loc:"Serednye",d:"One of the region's oldest wineries (1946), specializing in the indigenous Leanka grape native to the Carpathian Basin.",url:null},
],
[
{n:"Shabo Winery / Wine Culture Center",loc:"village of Shabo",d:"Founded 1822 by Swiss and French colonists, with 200-year-old cellars and a museum on 1,500 years of local winemaking.",url:"https://shabo.ua/en/"},
{n:"Guliev Wines",loc:"Sarata district",d:"Run by a fourth-generation Georgian winemaking family, with vines planted between the Black Sea coast and the Dniester estuary.",url:null},
{n:"Artwinery",loc:"relocated to Odesa oblast",d:"One of Europe's largest sparkling wine producers, which relocated its team and 9 million bottles west after its original cellars became a war zone.",url:"https://artwine.com/"},
{n:"Odessa Sparkling Wine Company",loc:"city of Odesa",d:"A historic sparkling-wine producer within the city, offering tours and tastings of traditional-method sparkling wines.",url:null},
],
[
{n:"Kolonist",loc:"Krynychne village, near Lake Yalpuh",d:"Founded 2005 by descendants of Bulgarian colonists, pioneering the revival of the indigenous Odesa Black grape.",url:"https://kolonist.com.ua/en/"},
{n:"Bolgrad Winery",loc:"town of Bolhrad",d:"A large-scale winery in a town founded by Bulgarian colonists in 1821, shaped by a Black Sea-influenced microclimate.",url:null},
{n:"Stoyanov Winery",loc:"city of Kiliya",d:"A family estate founded in 1991, at the southernmost tip of Ukrainian Bessarabia where the Danube meets the sea.",url:null},
{n:"Wintrest / PAVA",loc:"southern Odesa oblast",d:"A regional producer farming 650 hectares planted between 1998 and 2006.",url:null},
],
],
};

const WINERIESUA={
HR:[
[
{n:"Stina Winery",loc:"Бол, острів Брач",d:"Кам'яна будівля 1903 року на набережній, де вирощують автохтонні Плавац Малі, Пошип і Вугаву на крутих кам'янистих схилах.",url:null},
{n:"Testament Winery",loc:"район Врґорац/Подгора",d:"Витримує частину вина під водою Адріатики, дегустації проходять у залі на пагорбі над органічним виноградником.",url:null},
{n:"Lacman Winery",loc:"Сельца, острів Хвар",d:"Сімейна виноробня з дегустаціями на дерев'яній терасі з видом на затоку Старий Град.",url:null},
{n:"Crvik Winery",loc:"острів Хвар",d:"Виноробня у третьому поколінні, що виробляє біле 'Tesoro' з автохтонного сорту Мальвазія Дубровачка.",url:null},
],
[
{n:"Kozlović Winery",loc:"Мом'ян",d:"Сімейна виноробня з 1904 року біля кордону зі Словенією, відома Мальвазією Істарською, Тераном і Мускатом Мом'яно.",url:"https://www.kozlovic.hr/en/"},
{n:"Kabola Winery",loc:"Мом'ян",d:"Поєднує давнє виноробство в амфорах (квеврі) з істрійським теруаром для чудової Мальвазії і Терану.",url:"https://www.kabola.hr"},
{n:"Benvenuti Winery",loc:"Калдір, поблизу Мотовуна",d:"Провідна виноробня зони Мотовун, що виробляє автохтонні істрійські білі та червоні вина.",url:null},
{n:"Meneghetti Wine Hotel & Winery",loc:"Бале",d:"Стильний винний курорт серед виноградників і оливкових гаїв з кількома стилями Мальвазії.",url:"https://www.meneghetti.hr"},
],
[
{n:"Matuško Winery",loc:"Потомле",d:"Підземний льох 2000м², що приймає понад 50 000 відвідувачів на рік заради Плавац Малі апеласьйону Дінгач.",url:"https://matusko-vina.hr/en/"},
{n:"Bura-Mrgudić Winery",loc:"Потомле",d:"Невелика родинна виноробня у п'ятому поколінні, що вручну обробляє круті схили Дінгач і Поступ.",url:"https://mokalo.hr/en"},
{n:"Saints Hills Winery",loc:"Оскорушно",d:"Кам'яна виноробня, відроджена у 2011 році, що працює зі знаним ензологом Мішелем Ролланом над винами Дінгач.",url:"https://saintshills.com/"},
{n:"Vinarija Miloš",loc:"Понікве",d:"Історична родинна виноробня, чиї вина Дінгач і Поступ є еталоном апеласьйону.",url:null},
],
],
CZ:[
[
{n:"Sonberk",loc:"Попіце, поблизу Мікулова",d:"Вражаюча будівля виноробні 2008 року з культовим видом на пагорби Палави.",url:"https://www.sonberk.cz/en/"},
{n:"Vinselekt Michlovský",loc:"Раквіце",d:"Обробляє 125 гектарів у Велке Павловіце і Мікулові, перший лауреат премії 'Чеська виноробня року'.",url:"https://www.michlovsky.com/en/"},
{n:"Château Mělník (Lobkowicz)",loc:"Мельнік",d:"Родина Лобковіц володіє цими виноградниками з 1753 року; середньовічні льохи і фірмова 'Людмила'.",url:"https://lobkowicz-melnik.cz/en/"},
{n:"Wine Salon of the Czech Republic",loc:"льохи замку Валтіце",d:"Офіційна вітрина країни, де можна продегустувати 100 найкращих чеських і моравських вин року.",url:null},
],
[
{n:"Johann W",loc:"Тршебівліце",d:"Одна з найстаріших виноробень Богемії, назва на етикетці на честь Ульріки фон Левецов, останнього кохання Гете.",url:"https://johannw.com/en/"},
{n:"Porta Bohemica",loc:"Велке Жерносеки",d:"Заснована 2010 року на вулканічних пагорбах над Ельбою, спеціалізується на сухих білих винах.",url:null},
{n:"Vinařství Kraus",loc:"Мельнік",d:"Заснована професором Вілемом Краусом, якого вважають батьком сучасного чеського виноробства.",url:null},
{n:"Chateau Mělník Winery",loc:"Мельнік",d:"Обробляє 23 гектари на шести виноградниках, 30-40 тисяч пляшок Піно Нуар і Мюллер-Тургау щороку.",url:null},
],
[
{n:"Znovín Znojmo",loc:"монастир Лоука, Зноймо",d:"Найбільший виробник вина в країні, витримує майже мільйон пляшок у середньовічних льохах колишнього монастиря.",url:"https://www.znovin.cz"},
{n:"Lahofer Winery",loc:"Добшице",d:"Сучасна виноробня у формі хвилі з розписом на стелі дегустаційного залу і терасою на даху.",url:"https://www.lahofer.cz"},
{n:"Šobes Vineyard",loc:"закрут річки Дує",d:"Один з найстаріших і найвідоміших виноградників Центральної Європи на крутому річковому закруті, славиться Рислінгом і Палавою.",url:null},
{n:"Vinné sklepy Šatov",loc:"Шатов, на кордоні з Австрією",d:"Історичний комплекс підземних льохів, що представляє зноймівський Грюнер Вельтлінер і Мюллер-Тургау.",url:null},
],
],
FR:[
[
{n:"Château de Pommard",loc:"Поммар",d:"Збудований 1726 року, обробляється біодинамічно — одне з найвідвідуваніших господарств Кот-д'Ор.",url:"https://www.chateaudepommard.com/"},
{n:"Domaine Faiveley",loc:"Нюї-Сен-Жорж",d:"Родинне господарство з 1825 року і найбільший власник виноградників апеласьйону, відоме Пре'є Крю 'Les Saint-Georges'.",url:"https://domaine-faiveley.com/"},
{n:"Château de Meursault",loc:"Мерсо",d:"Склепінчасті льохи XII, XIV і XVI століть зберігають 800 000 пляшок під замком.",url:"https://www.chateau-meursault.com/"},
{n:"Domaine Marquis d'Angerville",loc:"Вольне",d:"Одне з найстаріших господарств Вольне (перша згадка 1507), відоме монопольною ділянкою Clos des Ducs.",url:null},
],
[
{n:"Château Pichon Longueville Baron",loc:"По-йак",d:"Друга категорія (Second Growth), знову відкрита для публіки у 2023 році — екскурсії за записом з вертикальними дегустаціями.",url:"https://www.pichonbaron.com/"},
{n:"Château Smith Haut Lafitte",loc:"Мартійак",d:"Господарство категорії Cru Classé, відоме винним спа та турами 'мистецтво і природа'.",url:"https://www.smith-haut-lafitte.com/"},
{n:"Château Palmer",loc:"Марго-Кантенак",d:"Третя категорія за характерним чотиривежевим замком, повністю біодинамічний сертифікат з 2018 року.",url:"https://www.chateau-palmer.com/"},
{n:"Château Rieussec",loc:"Фарг, Сотерн",d:"Перша категорія Сотерну, що належить Ротшильдам (Лафіт), з екскурсіями льохами за записом.",url:"https://www.lafite.com/domaines/rieussec/"},
],
[
{n:"Domaine Zind-Humbrecht",loc:"Тюркхайм",d:"Вирощує виноград з 1620 року, біодинамічне з 1997, ділянки Гран Крю в Рангені, Голдерті, Генгсті й Бранді.",url:"https://www.zindhumbrecht.fr/"},
{n:"Domaine Weinbach",loc:"Кайзерсберг",d:"Засноване 1612 року ченцями-капуцинами біля підніжжя Гран Крю Шлоссберг, славиться Рислінгом і Гевюрцтрамінером.",url:"https://www.domaineweinbach.com/"},
{n:"Maison Trimbach",loc:"Рібовіле",d:"Виробник Clos Sainte-Hune — крихітної монопольної ділянки, одного з найкращих сухих Рислінгів світу.",url:"https://www.trimbach.fr/"},
{n:"Domaine Marcel Deiss",loc:"Бергайм",d:"Біодинамічне господарство, що відроджує 'комплантацію' — спільну посадку кількох сортів на одній ділянці Гран Крю.",url:"https://www.marceldeiss.com/"},
],
],
IT:[
[
{n:"Castello di Ama",loc:"Гайоле-ін-К'янті",d:"Господарство XII століття, реставрація льохів 1998 року започаткувала колекцію сучасного мистецтва серед виноградників.",url:"https://castellodiama.com/en/"},
{n:"Fontodi",loc:"Панцано-ін-К'янті",d:"Органічне господарство, чиє 100% Санджовезе 'Flaccianello' неодноразово входило до топ вин світу.",url:"https://www.fontodi.com/en/"},
{n:"Poliziano",loc:"Монтепульчано",d:"Одне з засновників сучасного Vino Nobile, органічно обробляє 170 гектарів місцевого клону Прунйоло Джентіле.",url:"https://carlettipoliziano.com/en/"},
{n:"Tenuta San Guido (Sassicaia)",loc:"Больгері",d:"Оригінальне господарство Super Tuscan, що започаткувало винну революцію Больгері у 1960-70-х.",url:null},
],
[
{n:"Marchesi di Barolo",loc:"Бароло",d:"Найстаріший і найісторичніший виробник Бароло з підземними льохами і дегустаціями Бароло й Барбареско.",url:"https://marchesibarolo.com/en/"},
{n:"Ceretto",loc:"Альба/Ланге",d:"Відома 'Cappella del Barolo' — деконсекрованою церквою, перетвореною на мистецький об'єкт на виноградник Брунате.",url:"https://www.ceretto.com"},
{n:"Vietti",loc:"Кастільоне Фаллето",d:"Створила один з перших односортних крю Бароло у 1950-х і перший односортний П'ємонтський Роеро Арнейс.",url:"https://www.vietti.com/en/"},
{n:"Produttori del Barbaresco",loc:"Барбареско",d:"Історичний кооператив 1894 року з 53 виноградарів, що працюють виключно з сортом Неббіоло.",url:null},
],
[
{n:"Tenuta delle Terre Nere",loc:"Рандаццо, гора Етна",d:"Заснована піонером сучасного виноробства Етни, перша розлила односортні вина 'contrada' північного схилу.",url:"https://www.tenutaterrenere.com"},
{n:"Girolamo Russo",loc:"Пассопішаро, гора Етна",d:"Господарство на 15 гектарах на висоті 650-780м, відоме односортними розливами 'Cru'.",url:"https://www.girolamorusso.it/?lang=en"},
{n:"Donnafugata",loc:"Марсала",d:"Родинне господарство понад століття, льохи 1851 року в традиційному сицилійському 'baglio' з дегустаціями автохтонних сортів.",url:"https://visit.donnafugata.it/en/"},
{n:"Florio",loc:"Марсала",d:"Заснована 1832 року, історичний дім кріпленого вина Марсала з приватною колекцією понад 40 000 історичних пляшок.",url:null},
],
],
PT:[
[
{n:"Quinta do Bomfim",loc:"Піньян",d:"Флагманське господарство портвейну Dow's з прибережним льохом 1896 року і лагарами для імітації топтання ногами.",url:"https://www.symington.com/visitar/quinta-do-bomfim/"},
{n:"Quinta do Seixo (Sandeman)",loc:"Валенса-ду-Дору",d:"Флагман Sandeman на 100 гектарах, що поєднує садибу XVIII століття з винарнею на схилі й роботизованими лагарами.",url:"https://www.sandeman.com/port-wine/visit/quinta-do-seixo-douro/"},
{n:"Quinta das Carvalhas",loc:"поблизу Піньяна",d:"Відома як 'обличчя Дору' завдяки драматичним терасам і панорамі 360° з вершини Casa Redonda.",url:null},
{n:"Quinta do Crasto",loc:"поблизу Сабрози",d:"Сухі кам'яні тераси віком до 400 років тримають лози віком до 90 років на крутих сланцевих схилах.",url:"https://www.quintadocrasto.wine/en/"},
],
[
{n:"Herdade do Esporão",loc:"Регенгош-де-Монсараш",d:"Задокументоване з XIII століття навколо пізньоготичної вежі, перший сертифікований об'єкт винного туризму Португалії.",url:"https://esporao.com/en"},
{n:"Adega da Cartuxa",loc:"Евора",d:"Керується некомерційним фондом біля Евори зі списку ЮНЕСКО, виробник знаменитого Pêra-Manca.",url:"https://www.vinhosdoalentejo.pt/en/producers/fundacao-eugenio-de-almeida-adega-cartuxa/"},
{n:"Herdade Grande",loc:"Відігейра",d:"Родинне господарство на 350 гектарах, що поєднує виноградники й оливкові гаї, дегустація 'Vineyards & Vistas'.",url:null},
{n:"Herdade dos Grous",loc:"поблизу Альберноа",d:"Господарство на 1000 гектарів, назване на честь журавлів на озері, поєднує виноградники, оливки й бутік-готель.",url:null},
],
[
{n:"Quinta de Soalheiro",loc:"Мелгасу",d:"Перший односортний виноградник Альваріньйо в регіоні (1974), піонер якісного Альваріньйо.",url:"https://soalheiro.com/en"},
{n:"Quinta da Aveleda",loc:"Пенафіел",d:"Родинне господарство з 1870 року, відоме садами на 8 гектарах з вільними павичами і льохом 1850 року.",url:"https://aveleda.com/en/wine-tourism/quinta-da-aveleda"},
{n:"Quinta de Santa Cristina",loc:"Кабесейраш-де-Башту",d:"Господарство на пагорбі на висоті 400м з 30 гектарами виноградників над долиною річки Тамега.",url:null},
{n:"Quinta de Lourosa",loc:"район Пасуш-де-Феррейра",d:"Високо оцінена родинна кінта, популярна завдяки екскурсіям і дегустаціям у субрегіоні Соуза.",url:null},
],
],
ES:[
[
{n:"Bodegas Ysios",loc:"Лагуардія",d:"Спроєктована Сантьяго Калатравою, хвиляста дахова конструкція з кедра імітує складені бочки на тлі гір Сьєрра-де-Кантабрія.",url:"https://bodegasysios.com/en/"},
{n:"Bodegas Marqués de Riscal",loc:"Ельсьєго",d:"Дім титанового готелю 'Місто вина' Френка Гері поруч з оригінальною бодегою 1860 року.",url:"https://www.marquesderiscal.com/en/the-marques-de-riscal-city-of-wine"},
{n:"Bodegas Muga",loc:"Аро",d:"Родинна виноробня з 1932 року, єдина в Ріосі, що досі виготовляє власні дубові бочки.",url:"https://www.bodegasmuga.com/en/"},
{n:"Bodegas Baigorri",loc:"Саманьєго",d:"Скляний куб над землею приховує сім підземних гравітаційних рівнів на глибині 32 метри.",url:"https://bodegasbaigorri.com/en/"},
],
[
{n:"Bodegas Vega Sicilia",loc:"Вальбуена-де-Дуеро",d:"Найлегендарніша виноробня Іспанії, заснована 1864 року, виробник культового 'Único'.",url:"https://www.temposvegasicilia.com/en/terroirniveau1/4/ribera-del-duero"},
{n:"Bodegas Protos",loc:"Пеньяфьєль",d:"Сучасне розширення від бюро Річарда Роджерса, теракотові склепіння повторюють силует середньовічного замку над ним.",url:"https://www.bodegasprotos.com/en/architecture/"},
{n:"Bodegas Emilio Moro",loc:"Пескера-де-Дуеро",d:"Родинна виноробня на лозах, посаджених 1932 року, відома знаменитою лінійкою 'Malleolus'.",url:"https://www.emiliomoro.com/en/"},
{n:"Bodegas Arzuaga Navarro",loc:"Кінтанілья-де-Онесімо",d:"Побудована навколо маєтку на 1400 гектарів, поєднує тури виноградником з рестораном на зірку Мішлен і спа.",url:"https://arzuaganavarro.com/"},
],
[
{n:"Clos Mogador",loc:"Граталопс",d:"Засноване 1979 року одним із п'яти засновників руху 'Clos', що відродив Пріорат наприкінці 1980-х.",url:null},
{n:"Celler Vall Llach",loc:"Поррера",d:"Співзасноване каталонським співаком Люїсом Льяком, дегустаційний зал-музей над сланцевими терасами 'льїкорелья'.",url:"https://www.vallllach.com/en/"},
{n:"Mas Doix",loc:"Побледа",d:"Відома ділянкою лоз Каріньєни, посаджених 1902 року, і Гарначею віком близько 80 років, органічне й біодинамічне господарство.",url:"https://masdoix.com/en/"},
{n:"Álvaro Palacios",loc:"Граталопс",d:"Засноване 1989 року одним з 'п'яти з Граталопса', виробник L'Ermita з лоз Гарначі, посаджених 1900-1940 років.",url:null},
],
],
UA:[
[
{n:"Шато Чижай",loc:"долина Чижай, поблизу Берегового",d:"Перша приватна виноробня України, заснована 1995 року на місці виноробства з XIII століття, з винним музеєм і рестораном.",url:"https://chizay.com/en/"},
{n:"Родинний льох Парасько",loc:"село Бене",d:"Два брати вирощують до 250 сортів винограду, дегустації у столітньому печерному льоху, викопаному полоненими Першої світової.",url:null},
{n:"Виноробня Sass K.",loc:"село Кігьош (Зміївка)",d:"Невелика органічна виноробня на вулканічному пагорбі Хазанезе, вирощує близько 60 традиційних карпатських сортів.",url:null},
{n:"Leanka",loc:"Середнє",d:"Одна з найстаріших виноробень регіону (1946), спеціалізується на автохтонному сорті Леанка, рідному для Карпатського басейну.",url:null},
],
[
{n:"Шабо / Центр винної культури",loc:"село Шабо",d:"Засноване 1822 року швейцарськими і французькими переселенцями, льохи вік 200 років і музей 1500-річної історії виноробства.",url:"https://shabo.ua/en/"},
{n:"Guliev Wines",loc:"Саратський район",d:"Родина грузинських виноробів у четвертому поколінні, лози посаджені між узбережжям Чорного моря й Дністровським лиманом.",url:null},
{n:"Artwinery",loc:"перенесено до Одеської області",d:"Один з найбільших виробників ігристого вина в Європі, що переніс команду і 9 мільйонів пляшок на захід після того, як оригінальні льохи опинилися в зоні бойових дій.",url:"https://artwine.com/"},
{n:"Odessa Sparkling Wine Company",loc:"місто Одеса",d:"Історичний виробник ігристого вина в межах міста, пропонує екскурсії та дегустації традиційним методом.",url:null},
],
[
{n:"Kolonist",loc:"село Криничне, біля озера Ялпуг",d:"Засноване 2005 року нащадками болгарських переселенців, відроджує автохтонний сорт Одеський чорний.",url:"https://kolonist.com.ua/en/"},
{n:"Болградський завод виноробний",loc:"місто Болград",d:"Велика виноробня в місті, заснованому болгарськими переселенцями 1821 року, формується мікрокліматом Чорного моря.",url:null},
{n:"Виноробня Стоянова",loc:"місто Кілія",d:"Родинне господарство, засноване 1991 року, на найпівденнішій точці української Бессарабії, де Дунай зустрічається з морем.",url:null},
{n:"Wintrest / PAVA",loc:"південь Одеської області",d:"Регіональний виробник, що обробляє 650 гектарів, посаджених у 1998-2006 роках.",url:null},
],
],
};

function Popup({item,img,onClose,onWineries,label}) {
if (!item) return null;
return (
<div onClick={onClose} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(10,4,8,0.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
<div onClick={e=>e.stopPropagation()} style={{background:BG,border:"1px solid rgba(196,154,90,0.35)",borderRadius:16,maxWidth:480,width:"100%",position:"relative",overflow:"hidden"}}>
{img&&<div style={{height:260,backgroundImage:"url("+img+")",backgroundSize:"cover",backgroundPosition:"center"}}/>}
<button onClick={onClose} style={{position:"absolute",top:14,right:16,background:img?"rgba(10,4,8,0.55)":"none",border:"none",color:img?TEXT:ACCENT,cursor:"pointer",fontSize:22,lineHeight:1,borderRadius:"50%",width:32,height:32}}>x</button>
<div style={{padding:"28px 26px"}}>
<div style={{fontSize:21,fontWeight:700,color:TEXT,marginBottom:6}}>{item.n}</div>
<div style={{width:40,height:1,background:"linear-gradient(90deg,"+ACCENT+",transparent)",marginBottom:14}}/>
<div style={{fontSize:15,color:MUTED,lineHeight:1.8,fontWeight:500}}>{item.d}</div>
{onWineries&&(
<button onClick={onWineries}
style={{marginTop:18,width:"100%",padding:"11px",background:"rgba(196,154,90,0.12)",border:"1px solid "+B2,borderRadius:10,color:TEXT,fontSize:14,fontFamily:"'Raleway',sans-serif",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}
onMouseOver={e=>{e.currentTarget.style.background="rgba(196,154,90,0.22)";}}
onMouseOut={e=>{e.currentTarget.style.background="rgba(196,154,90,0.12)";}}
>🍇 {label} →</button>
)}
</div>
</div>
</div>
);
}

function WineryCard({w,onAsk,label,visitLabel}) {
const [hov,setHov]=useState(false);
return (
<div onMouseOver={()=>setHov(true)} onMouseOut={()=>setHov(false)}
style={{background:hov?CARD2:CARD,border:"1px solid "+(hov?B2:B),borderRadius:12,marginBottom:16,transition:"all 0.2s",padding:"14px 18px 16px"}}>
<div style={{fontSize:16,fontWeight:600,color:TEXT,marginBottom:4}}>{w.n}</div>
<div style={{fontSize:12,color:ACCENT,letterSpacing:"0.08em",marginBottom:10,textTransform:"uppercase",fontWeight:500}}>{w.loc}</div>
<div style={{fontSize:14,color:MUTED,lineHeight:1.75,marginBottom:12,fontWeight:500}}>{w.d}</div>
<div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
{w.url&&(
<a href={w.url} target="_blank" rel="noopener noreferrer"
style={{background:"none",border:"1px solid "+B,borderRadius:20,padding:"6px 14px",color:ACCENT,fontSize:13,fontFamily:"'Raleway',sans-serif",fontWeight:500,cursor:"pointer",textDecoration:"none",transition:"all 0.2s"}}
onMouseOver={e=>{e.currentTarget.style.borderColor=B2;e.currentTarget.style.color=TEXT;}}
onMouseOut={e=>{e.currentTarget.style.borderColor=B;e.currentTarget.style.color=ACCENT;}}
>{visitLabel} ↗</a>
)}
<button onClick={()=>{gaEvent("ask_winery",{winery_name:w.n});onAsk("Tell me more about "+w.n+" in "+w.loc+". What should I know before visiting?");}}
style={{background:"none",border:"1px solid "+B,borderRadius:20,padding:"6px 14px",color:ACCENT,fontSize:13,fontFamily:"'Raleway',sans-serif",fontWeight:500,cursor:"pointer",transition:"all 0.2s"}}
onMouseOver={e=>{e.currentTarget.style.borderColor=B2;e.currentTarget.style.color=TEXT;}}
onMouseOut={e=>{e.currentTarget.style.borderColor=B;e.currentTarget.style.color=ACCENT;}}
>{label} →</button>
</div>
</div>
);
}

function Card({route,label,onAsk,img}) {
const [hov,setHov]=useState(false);
return (
<div onMouseOver={()=>setHov(true)} onMouseOut={()=>setHov(false)}
style={{background:hov?CARD2:CARD,border:"1px solid "+(hov?B2:B),borderRadius:12,marginBottom:16,overflow:"hidden",transition:"all 0.2s"}}>
{img?
<div style={{height:220,backgroundImage:"url("+img+")",backgroundSize:"cover",backgroundPosition:"center",transition:"transform 0.3s",transform:hov?"scale(1.04)":"scale(1)"}}/>
:<div style={{height:3,background:"linear-gradient(90deg,#7a1830,"+ACCENT+",transparent)"}}/>}
<div style={{padding:"14px 18px 16px"}}>
<div style={{fontSize:16,fontWeight:600,color:TEXT,marginBottom:4}}>{route.n}</div>
<div style={{fontSize:12,color:ACCENT,letterSpacing:"0.08em",marginBottom:10,textTransform:"uppercase",fontWeight:500}}>{route.s}</div>
<div style={{fontSize:14,color:MUTED,lineHeight:1.75,marginBottom:12,fontWeight:500}}>{route.d}</div>
<button onClick={()=>{gaEvent("ask_route",{route_name:route.n});onAsk("Tell me more about "+route.n+". What should I know before visiting?");}}
style={{background:"none",border:"1px solid "+B,borderRadius:20,padding:"6px 14px",color:ACCENT,fontSize:13,fontFamily:"'Raleway',sans-serif",fontWeight:500,cursor:"pointer",transition:"all 0.2s"}}
onMouseOver={e=>{e.currentTarget.style.borderColor=B2;e.currentTarget.style.color=TEXT;}}
onMouseOut={e=>{e.currentTarget.style.borderColor=B;e.currentTarget.style.color=ACCENT;}}
>{label} →</button>
</div>
</div>
);
}

export default function App() {
const [lang,setLang]=useState("en");
const t=T[lang];
const [msgs,setMsgs]=useState([{role:"assistant",content:T.en.welcome}]);
const [inp,setInp]=useState("");
const [load,setLoad]=useState(false);
const [country,setCountry]=useState(null);
const [view,setView]=useState("home");
const [tab,setTab]=useState("famous");
const [popup,setPopup]=useState(null);
const [wineryIdx,setWineryIdx]=useState(null);
const endRef=useRef(null);

useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,load]);

// Track virtual pageviews per screen so GA4 shows time-on-page and exit page per section
useEffect(()=>{
let path="/",title="Home";
if(view==="country"&&country){path="/country/"+country.code;title="Country – "+country.name;}
else if(view==="wineries"&&country){path="/country/"+country.code+"/wineries/"+wineryIdx;title="Wineries – "+country.name;}
else if(view==="chat"){path=country?("/country/"+country.code+"/chat"):"/chat";title="Chat";}
gaEvent("page_view",{page_path:path,page_title:title,page_location:(typeof window!=="undefined"?window.location.origin:"")+path});
},[view,country,wineryIdx]);

const send=async(text)=>{
const ut=text||inp.trim();
if(!ut||load) return;
setInp("");setView("chat");
const nm=[...msgs,{role:"user",content:ut}];
setMsgs(nm);setLoad(true);
try {
const res=await fetch("/api/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({model:"claude-sonnet-5",max_tokens:1000,system:PROMPT,messages:nm}),
});
const data=await res.json();
setMsgs([...nm,{role:"assistant",content:data.content?.[0]?.text||"Something went wrong."}]);
} catch {
setMsgs([...nm,{role:"assistant",content:"Something went wrong — please try again 🍷"}]);
}
setLoad(false);
};

const onKey=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};
const home=()=>{setView("home");setCountry(null);};
const routes=(lang==="ua"?RUA:R)[country?.code]||[];
const bt=(lang==="ua"?BTUA:BT)[country?.code];
const regs=(lang==="ua"?REGUA:REG)[country?.code]||[];
const shown=routes.filter(r=>tab==="famous"?!r.h:r.h);
const wineryList=wineryIdx!=null?((lang==="ua"?WINERIESUA:WINERIES)[country?.code]?.[wineryIdx]||[]):[];

const TB=(active)=>({
flex:1,padding:"10px 8px",
background:active?"rgba(196,154,90,0.2)":"transparent",
border:"1px solid "+(active?"rgba(196,154,90,0.45)":B),
borderRadius:8,cursor:"pointer",
color:active?TEXT:DIM,
fontSize:13,fontFamily:"'Raleway',sans-serif",
fontWeight:active?600:400,transition:"all 0.2s",
});

return (
<div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",fontFamily:"'Raleway',sans-serif",WebkitFontSmoothing:"antialiased"}}>
<div style={{position:"fixed",inset:0,zIndex:0,background:"radial-gradient(ellipse at 20% 50%,rgba(160,30,50,0.08) 0%,transparent 60%)",pointerEvents:"none"}}/>

{/* Header */}
<div style={{width:"100%",maxWidth:700,padding:"28px 24px 16px",textAlign:"center",zIndex:1,position:"relative"}}>
<button onClick={()=>setLang(lang==="en"?"ua":"en")}
style={{position:"absolute",right:24,top:32,background:"none",border:"1px solid "+B,borderRadius:20,padding:"5px 14px",color:ACCENT,fontSize:12,fontFamily:"'Raleway',sans-serif",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}
onMouseOver={e=>{e.currentTarget.style.borderColor=B2;e.currentTarget.style.color=TEXT;}}
onMouseOut={e=>{e.currentTarget.style.borderColor=B;e.currentTarget.style.color=ACCENT;}}
>{lang==="en"?"UA":"EN"}</button>
<div onClick={home} style={{cursor:"pointer",display:"inline-block"}}>
<h1 style={{fontSize:"clamp(26px,5vw,38px)",fontWeight:700,color:TEXT,letterSpacing:"0.16em",margin:0,textTransform:"uppercase"}}>🍷 Dionysia</h1>
<p style={{color:MUTED,fontSize:12,letterSpacing:"0.28em",textTransform:"uppercase",margin:"5px 0 0",fontWeight:400}}>{t.tag}</p>
</div>
<div style={{width:50,height:1,background:"linear-gradient(90deg,transparent,"+ACCENT+",transparent)",margin:"14px auto 0"}}/>
</div>

{/* Content */}
<div style={{width:"100%",maxWidth:700,flex:1,padding:"0 16px 16px",zIndex:1}}>

{view==="home"&&(
<div>
<p style={{textAlign:"center",color:MUTED,fontSize:15,fontStyle:"italic",lineHeight:1.85,margin:"8px 0 24px",fontWeight:400}}>{t.sub}</p>
<p style={{color:DIM,fontSize:12,letterSpacing:"0.3em",textTransform:"uppercase",textAlign:"center",marginBottom:14,fontWeight:600}}>{t.choose}</p>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:28}}>
{COUNTRIES.map(c=>(
<button key={c.code} onClick={()=>{gaEvent("select_country",{country_name:c.name});setCountry(c);setTab("famous");setView("country");}}
style={{backgroundImage:"linear-gradient(180deg,rgba(26,8,16,0.05) 0%,rgba(26,8,16,0.1) 45%,rgba(26,8,16,0.55) 75%,rgba(26,8,16,0.92) 100%),url("+CIMG[c.code]+")",backgroundSize:"cover",backgroundPosition:"center",border:"1px solid "+B,borderRadius:14,padding:"20px 16px",cursor:"pointer",textAlign:"center",color:TEXT,transition:"all 0.2s",minHeight:230,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}
onMouseOver={e=>{e.currentTarget.style.borderColor=B2;e.currentTarget.style.transform="scale(1.02)";}}
onMouseOut={e=>{e.currentTarget.style.borderColor=B;e.currentTarget.style.transform="scale(1)";}}
>
<div style={{fontSize:36,marginBottom:8,filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.6))"}}>{c.flag}</div>
<div style={{fontSize:18,fontWeight:700,textShadow:"0 1px 4px rgba(0,0,0,0.7)"}}>{c.name}</div>
<div style={{fontSize:13,color:"#e0c8a8",marginTop:6,lineHeight:1.4,textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{c.region}</div>
</button>
))}
</div>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
<div style={{flex:1,height:1,background:B}}/>
<span style={{color:DIM,fontSize:12,letterSpacing:"0.2em",fontWeight:600}}>{t.or}</span>
<div style={{flex:1,height:1,background:B}}/>
</div>
<button onClick={()=>setView("chat")}
style={{width:"100%",padding:"13px",background:"transparent",border:"1px solid "+B,borderRadius:12,color:MUTED,fontSize:14,fontFamily:"'Raleway',sans-serif",fontWeight:500,cursor:"pointer",transition:"all 0.2s"}}
onMouseOver={e=>{e.currentTarget.style.borderColor=B2;e.currentTarget.style.color=TEXT;}}
onMouseOut={e=>{e.currentTarget.style.borderColor=B;e.currentTarget.style.color=MUTED;}}
>💬 {t.chat}</button>
</div>
)}

{view==="country"&&country&&(
<div>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
<button onClick={home} style={{background:"none",border:"none",color:ACCENT,cursor:"pointer",fontSize:13,padding:0,fontFamily:"'Raleway',sans-serif"}}>← {t.back}</button>
<div style={{flex:1,textAlign:"center"}}>
<span style={{fontSize:26}}>{country.flag}</span>
<span style={{fontSize:22,color:TEXT,marginLeft:10,fontWeight:600}}>{country.name}</span>
</div>
</div>

{/* Region chips */}
{regs.length>0&&(
<div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:20}}>
{regs.map((r,i)=>(
<span key={i} onClick={()=>{gaEvent("view_region",{region_name:r.n,country_name:country?.name});setPopup(r);}}
style={{fontSize:13,color:ACCENT,border:"1px solid rgba(196,154,90,0.3)",borderRadius:20,padding:"5px 14px",cursor:"pointer",transition:"all 0.2s",fontFamily:"'Raleway',sans-serif",fontWeight:500}}
onMouseOver={e=>{e.currentTarget.style.background="rgba(196,154,90,0.15)";e.currentTarget.style.borderColor=B2;}}
onMouseOut={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(196,154,90,0.3)";}}
>{r.n} ⓘ</span>
))}
</div>
)}

{/* Best time */}
{bt&&(
<div style={{background:"rgba(196,154,90,0.06)",border:"1px solid rgba(196,154,90,0.18)",borderRadius:12,padding:"16px 18px",marginBottom:20}}>
<div style={{fontSize:12,color:DIM,letterSpacing:"0.25em",textTransform:"uppercase",fontWeight:600,marginBottom:12}}>📅 {t.bt}</div>
<div style={{display:"flex",flexDirection:"column",gap:7}}>
<div style={{display:"flex",gap:10}}><span style={{fontSize:12,color:ACCENT,fontWeight:600,minWidth:52}}>{t.peak}</span><span style={{fontSize:14,color:TEXT,fontWeight:500}}>{bt.peak}</span></div>
<div style={{display:"flex",gap:10}}><span style={{fontSize:12,color:"#a0b890",fontWeight:600,minWidth:52}}>{t.good}</span><span style={{fontSize:14,color:MUTED}}>{bt.good}</span></div>
<div style={{display:"flex",gap:10}}><span style={{fontSize:12,color:"#a08090",fontWeight:600,minWidth:52}}>{t.avoid}</span><span style={{fontSize:14,color:MUTED}}>{bt.avoid}</span></div>
<div style={{borderTop:"1px solid rgba(196,154,90,0.15)",marginTop:6,paddingTop:10,fontSize:13,color:MUTED,lineHeight:1.7,fontStyle:"italic"}}>{bt.tip}</div>
</div>
</div>
)}

<div style={{display:"flex",gap:8,marginBottom:18}}>
<button style={TB(tab==="famous")} onClick={()=>setTab("famous")}>🗺️ {t.fam}</button>
<button style={TB(tab==="hidden")} onClick={()=>setTab("hidden")}>💎 {t.hid}</button>
</div>
{shown.map((r,i)=><Card key={i} route={r} label={t.ask} onAsk={send} img={RIMG[country.code]?.[routes.indexOf(r)]||CIMG[country.code]}/>)}
<div style={{display:"flex",alignItems:"center",gap:12,margin:"8px 0 14px"}}>
<div style={{flex:1,height:1,background:B}}/>
<span style={{color:DIM,fontSize:12,letterSpacing:"0.2em",fontWeight:600}}>{t.or}</span>
<div style={{flex:1,height:1,background:B}}/>
</div>
</div>
)}

{view==="wineries"&&country&&wineryIdx!=null&&(
<div>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
<button onClick={()=>setView("country")} style={{background:"none",border:"none",color:ACCENT,cursor:"pointer",fontSize:13,padding:0,fontFamily:"'Raleway',sans-serif"}}>← {country.name}</button>
<div style={{flex:1,textAlign:"center"}}>
<span style={{fontSize:22,color:TEXT,fontWeight:600}}>{regs[wineryIdx]?.n}</span>
</div>
</div>
{wineryList.map((w,i)=><WineryCard key={i} w={w} onAsk={send} label={t.ask} visitLabel={t.visit}/>)}
</div>
)}

{view==="chat"&&(
<div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:8}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<button onClick={()=>setView(country?"country":"home")} style={{background:"none",border:"none",color:ACCENT,cursor:"pointer",fontSize:13,padding:0,fontFamily:"'Raleway',sans-serif"}}>
← {country?country.name:t.dest}
</button>
<button onClick={()=>setMsgs([{role:"assistant",content:t.welcome}])}
style={{background:"none",border:"1px solid "+B,borderRadius:20,padding:"5px 12px",color:DIM,fontSize:12,fontFamily:"'Raleway',sans-serif",fontWeight:500,cursor:"pointer",transition:"all 0.2s"}}
onMouseOver={e=>{e.currentTarget.style.borderColor=B2;e.currentTarget.style.color=MUTED;}}
onMouseOut={e=>{e.currentTarget.style.borderColor=B;e.currentTarget.style.color=DIM;}}
>↺ {t.newc}</button>
</div>
<div style={{height:8}}/>
{msgs.map((m,i)=>(
<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
<div style={{maxWidth:"82%",padding:"13px 18px",borderRadius:m.role==="user"?"20px 20px 4px 20px":"20px 20px 20px 4px",background:m.role==="user"?BTN:CARD,border:m.role==="user"?"none":"1px solid "+B,color:m.role==="user"?TEXT:MUTED,fontSize:15,lineHeight:1.78,whiteSpace:"pre-wrap",fontWeight:500}}>{m.content}</div>
</div>
))}
{load&&(
<div style={{display:"flex",justifyContent:"flex-start"}}>
<div style={{padding:"14px 20px",borderRadius:"20px 20px 20px 4px",background:CARD,border:"1px solid "+B,display:"flex",alignItems:"center",gap:12}}>
<svg width="24" height="34" viewBox="0 0 24 34" fill="none">
<defs><clipPath id="gc"><path d="M5 3 Q4 9 4 13 Q4 20 12 23 Q20 20 20 13 Q20 9 19 3 Z"/></clipPath></defs>
<path d="M5 2 Q3 9 3 13 Q3 21 12 24 Q21 21 21 13 Q21 9 19 2 Z" fill="none" stroke="#c49a5a" strokeWidth="1.2"/>
<line x1="12" y1="24" x2="12" y2="30" stroke="#c49a5a" strokeWidth="1.2"/>
<line x1="7" y1="30" x2="17" y2="30" stroke="#c49a5a" strokeWidth="1.2"/>
<g clipPath="url(#gc)"><rect className="wf" x="0" y="0" width="24" height="26" fill="#7a1830" opacity="0.8"/></g>
</svg>
<span style={{fontSize:13,color:MUTED,fontWeight:500}}>{t.pour}</span>
</div>
</div>
)}
<div ref={endRef}/>
</div>
)}
</div>

{/* Input */}
<div style={{width:"100%",maxWidth:700,padding:"12px 16px 20px",position:"sticky",bottom:0,background:"linear-gradient(transparent,"+BG+" 30%)",zIndex:2}}>
<div style={{display:"flex",gap:10,background:CARD,border:"1px solid rgba(196,154,90,0.25)",borderRadius:28,padding:"8px 8px 8px 20px",alignItems:"flex-end"}}>
<textarea value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={onKey}
placeholder={t.ph} rows={1}
style={{flex:1,background:"none",border:"none",outline:"none",color:TEXT,fontSize:15,fontFamily:"'Raleway',sans-serif",resize:"none",lineHeight:1.5,padding:"6px 0",caretColor:ACCENT,fontWeight:500}}
/>
<button onClick={()=>send()} disabled={!inp.trim()||load}
style={{width:40,height:40,borderRadius:"50%",background:inp.trim()&&!load?BTN:"rgba(196,154,90,0.15)",border:"none",cursor:inp.trim()&&!load?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",color:TEXT,fontSize:18,transition:"all 0.2s",flexShrink:0}}
>↑</button>
</div>
</div>

<Popup item={popup} img={popup&&country?(GIMG[country.code]?.[regs.indexOf(popup)]||CIMG[country.code]):null} onClose={()=>setPopup(null)} label={t.wineries}
onWineries={popup&&country?()=>{const idx=regs.indexOf(popup);gaEvent("view_wineries",{region_name:popup.n,country_name:country.name});setWineryIdx(idx);setView("wineries");setPopup(null);}:null}/>
<Analytics />

<style>{`
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap');
@keyframes wf{0%{transform:translateY(26px)}50%{transform:translateY(8px)}75%{transform:translateY(10px)}100%{transform:translateY(8px)}}
.wf{animation:wf 2s ease-in-out infinite}
textarea::placeholder{color:#5a3838;font-family:'Raleway',sans-serif}
*{box-sizing:border-box;-webkit-font-smoothing:antialiased}
`}</style>
</div>
);
}
