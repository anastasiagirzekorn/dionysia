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

function Popup({item,img,onClose}) {
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
</div>
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
const endRef=useRef(null);

useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,load]);

// Track virtual pageviews per screen so GA4 shows time-on-page and exit page per section
useEffect(()=>{
let path="/",title="Home";
if(view==="country"&&country){path="/country/"+country.code;title="Country – "+country.name;}
else if(view==="chat"){path=country?("/country/"+country.code+"/chat"):"/chat";title="Chat";}
gaEvent("page_view",{page_path:path,page_title:title,page_location:(typeof window!=="undefined"?window.location.origin:"")+path});
},[view,country]);

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

<Popup item={popup} img={popup&&country?(GIMG[country.code]?.[regs.indexOf(popup)]||CIMG[country.code]):null} onClose={()=>setPopup(null)}/>
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
