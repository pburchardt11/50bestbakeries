// lib/content.js
// Editorial content generators for SEO.
// All copy is bakery-focused. Prior versions were fork residue from 50bestbar
// (cocktail/speakeasy vocabulary) and have been removed.

// ─── City Intros ───
// Hand-curated for major bakery cities. Everything else uses the template.
const CITY_INTROS = {
  'Paris': `Paris is the spiritual capital of bread and pastry. Generations of boulangers and pâtissiers have turned a loaf, a croissant, and a tart into art forms — and the city's quartiers still measure themselves by the quality of their neighbourhood boulangerie. From the legendary sourdough miches of Poilâne and Du Pain et des Idées to the hyper-modern viennoiserie of Mamiche and Utopie, and the fruit-sculpted pâtisseries of Cédric Grolet and Pierre Hermé, Paris remains the benchmark against which every other bakery city is measured.`,
  'London': `London's bakery scene has transformed over the past decade from a backdrop of chain cafés into one of the most ambitious bread cultures in the world. Long-ferment sourdough from bakeries like E5 Bakehouse and The Dusty Knuckle now sits alongside world-class doughnuts at Bread Ahead and laminated viennoiserie at Pophams. The influence of French, Italian, Middle Eastern, and Jewish baking traditions runs deep across the capital, creating a bakery landscape that is as global as the city itself.`,
  'New York': `New York is a bagel city, a rye city, and — increasingly — a laminated-pastry city. Dominique Ansel turned a pastry into a cultural moment with the Cronut, Levain cemented the oversized cookie as a pilgrimage food, and Sullivan Street Bakery rewrote the rules of no-knead bread. Around these landmarks is a denser map: Balthazar's brasserie loaves, Breads Bakery's chocolate babka, Russ & Daughters' bialys, and a growing constellation of Brooklyn sourdough bakeries. Few cities reward a dedicated bakery crawl as thoroughly.`,
  'Tokyo': `Tokyo takes the French boulangerie and sharpens it to Japanese specifications. The city is home to some of the most technically accomplished bakers outside of France — bakeries like Viron, Signifiant Signifié, and Gontran Cherrier's Shibuya flagship draw on French technique with an obsession for ingredient sourcing and execution that is distinctly Japanese. Add the country's own milk bread and an-pan traditions, an extraordinary density of pâtisseries, and a pastry culture that takes viennoiserie as seriously as kaiseki, and Tokyo becomes essential for any serious pastry traveller.`,
  'Copenhagen': `Copenhagen has reinvented the Nordic bakery. The city is now home to arguably the world's most influential cardamom bun (Juno the Bakery), some of its best sourdough (Hart Bageri, Mirabelle, Lille Bakery), and a rigorous focus on stone-milled, heritage-grain flours. The Noma-adjacent ecosystem has raised standards across the board, and today a visit to Copenhagen is as much about its bakeries as its restaurants.`,
  'Melbourne': `Melbourne has built a bakery culture that punches well above its weight. Lune Croissanterie alone has made the city a destination for croissant pilgrims, but the broader scene — Tivoli Road Bakery, Baker D. Chirico, Loafer Bread — is built on long-ferment sourdough, careful sourcing, and a café culture that treats the morning pastry with the same reverence as the morning coffee.`,
  'Lisbon': `Lisbon is the city of the pastel de nata. The custard tart has become a global export, and its two rival birthplaces — Pastéis de Belém (since 1837) and Manteigaria in Chiado — still draw daily queues. Beyond the nata, Lisbon's broader pastry culture runs deep, with Portuguese bolo-rei, pão-de-ló, and confeitaria traditions that predate almost every other European pastry city.`,
  'Vienna': `Vienna invented the coffee-house pastry culture that the rest of Europe spent centuries copying. Demel, Gerstner, and Aida still anchor a Konditorei tradition that stretches back to the imperial court, and the city's Kaffeehauskultur is recognised by UNESCO. Sachertorte, strudel, Kaisersemmel, and countless other Viennese specialities remain alive at the bakery counter, and a new generation of artisan bakeries like Joseph Brot and Öfferl is bringing long-ferment sourdough to the mix.`,
  'Barcelona': `Barcelona bakes with Mediterranean confidence. Catalan coca, ensaïmada from Mallorca, and the wood-oven breads of Forn Baluard in Barceloneta all have a place in daily life here, while Xavi Barriga's Turris has become one of Spain's defining artisan bakery chains. The city's proximity to excellent olive oil, almonds, citrus, and local grains gives its bakery culture a distinctly sun-drenched identity.`,
  'San Francisco': `San Francisco is the home of American sourdough. The microbial flora of the Bay Area gives local bread a character that bakers elsewhere spend years trying to replicate, and the city's flagship — Chad Robertson's Tartine — has taught a generation of bakers worldwide. Acme Bread in Berkeley supplies the Bay Area's best restaurants, and a dense ecosystem of neighbourhood bakeries keeps the tradition alive and evolving.`,
};

// ─── Country Intros ───
// Hand-curated for major baking countries; everything else uses the template.
const COUNTRY_INTROS = {
  'France': `France is the global reference for bread and pastry. The country's boulangerie and pâtisserie traditions have shaped every serious bakery city on earth, and the baguette, the croissant, the pain au chocolat, the éclair, and the macaron all trace their definitive forms back here. A French town is still measured by the quality of its boulanger and pâtissier, and the annual Meilleur Croissant and Meilleure Baguette competitions remain national news.`,
  'United States': `The United States is a patchwork of baking traditions. Jewish bagels and rye in New York, Portuguese malasadas in Hawaii, German stollen in Texas Hill Country, French pastry in San Francisco, and an ever-expanding artisan sourdough movement across every major city. American bakers — Chad Robertson, Jim Lahey, Dominique Ansel, Connie McDonald — have exported techniques and concepts that are now standard in bakeries worldwide.`,
  'United Kingdom': `The UK's bakery scene has undergone a quiet revolution. Beyond the Great British staples — crumpets, Eccles cakes, scones, pork pies — a new generation of artisan bakeries has re-established long-ferment sourdough, laminated viennoiserie, and heritage grains as core parts of British food culture. London leads the way, but serious bakeries can now be found from Edinburgh to Bristol to Margate.`,
  'Japan': `Japan's bakery culture combines a deep, century-old tradition of Western-style bakeries (yōshoku) with a modern wave of French-trained bakers who apply Japanese precision to every step of the process. Melon pan, an-pan, and milk bread sit alongside some of the world's best croissants and country loaves. In Tokyo alone, the density and quality of independent bakeries rivals any European capital.`,
  'Italy': `Italy's bread culture is regional and ancient. Pane di Altamura, ciabatta, focaccia di Recco, sfogliatelle, maritozzi, cornetti, panettone — every region has its signature form. Milanese pasticcerie like Marchesi and Cova have been turning out classical pastries since the early 19th century, and artisan bakeries like Princi and Forno Roscioli have exported Italian style to London, New York, and beyond.`,
  'Germany': `Germany has one of the deepest bread cultures on earth. The country counts more than 3,000 registered bread varieties, and German-style rye, pumpernickel, Vollkornbrot, and laugengebäck (pretzels, Laugenbrötchen) are central to daily life. Konditorei traditions produce stollen, Baumkuchen, and Bienenstich at a level unmatched elsewhere, and an emerging wave of artisan bakeries like Zeit für Brot and Domberger Brot-Werk is applying long-ferment sourdough techniques to heritage grains.`,
  'Austria': `Austria's pastry tradition is inseparable from its café culture. Sachertorte, Apfelstrudel, Kaiserschmarrn, Mohnzelten, Kaisersemmel, and Mozartkugel are all Austrian inventions. Viennese Konditoreien like Demel and Gerstner have been serving the imperial court and its descendants since the 18th century, and UNESCO has recognised the country's coffee-house culture as intangible heritage.`,
  'Denmark': `Denmark gave the world the wienerbrød, known internationally as the "Danish pastry". Copenhagen's modern bakery scene — Juno the Bakery, Hart Bageri, Mirabelle, Lille Bakery — has made the city one of the most influential bakery destinations of the past decade, pairing long-ferment sourdough with Nordic heritage grains and world-class viennoiserie.`,
  'Spain': `Spain's bakery culture is shaped by regional tradition — Mallorcan ensaïmada, Catalan coca, Basque gâteau, Madrileño napolitana, and Andalusian roscos — and by a proud artisan bread revival in Barcelona, Madrid, and the Basque Country. Historic pastelerías like La Mallorquina in Madrid (since 1894) still anchor the country's pastry identity.`,
  'Portugal': `Portugal is custard-tart country. The pastel de nata, born at the Jerónimos monastery in Belém and still made there daily since 1837, has become a global phenomenon, and dozens of Lisbon bakeries build their identity around it. Beyond the nata, Portuguese confeitaria traditions include bolo rei, pão de ló, and queijadas, and historic houses like Confeitaria Nacional (since 1829) continue to serve them.`,
  'Mexico': `Mexican pan dulce — conchas, cuernos, orejas, polvorones, and dozens of regional variations — is one of the most distinctive and underrated bakery traditions in the world. Modern Mexico City bakeries like Panadería Rosetta have reinterpreted the concha and elevated it onto international pastry lists, while historic houses like Pastelería Ideal have been producing rosca de reyes and wedding cakes since the 1920s.`,
  'Turkey': `Turkey's bakery culture bridges Europe and Asia. Simit, the sesame-covered ring, is a daily ritual; baklava, made with Gaziantep pistachios, is arguably the world's most refined phyllo pastry. Historic houses like Hafız Mustafa (since 1864) and Karaköy Güllüoğlu (since 1820) are pilgrimage sites for anyone serious about Ottoman pastry.`,
  'Argentina': `Argentina has a distinctive panadería culture inherited from Italian and French immigrants — medialunas, facturas, chipá, and a deep bread tradition are daily fare across Buenos Aires. French-style boulangeries like Pani in Palermo and L'Épi in Recoleta have brought contemporary French technique to a country that already takes bread seriously.`,
  'Brazil': `Brazil's pão francês (everyday short baguette) is the foundation of daily bakery life, supplied by thousands of neighbourhood padarias across the country. São Paulo's artisan bakery scene has matured into something internationally significant, with Atelier do Pão, Patisserie Douce France, and newer natural-leaven shops driving a heritage-grain movement.`,
  'Australia': `Australia's bakery scene is young, ambitious, and built on café culture. Melbourne's Lune Croissanterie has become a global benchmark for laminated pastry, while Sydney's Bourke Street Bakery and Brickfields have set the standard for Australian sourdough. The country's excellent wheat, dairy, and native ingredients feed a bakery culture that is increasingly recognised worldwide.`,
  'Singapore': `Singapore's bakery scene reflects its multicultural DNA. Tiong Bahru Bakery's French-trained viennoiserie sits next to Peranakan cake shops, traditional Chinese egg-tart bakeries, Malay kueh stalls, and Indian sweet shops. The density of high-quality baking in a small city-state is remarkable, and the top venues regularly draw regional food tourists.`,
  'Vietnam': `Vietnam's bánh mì is one of the most beloved bakery products in the world — a French baguette remade with Vietnamese flour, eaten filled with herbs, pâté, and grilled meat. Hoi An's Bánh Mì Phượng became world-famous after Anthony Bourdain's endorsement, and the country's bakery culture retains deep French-colonial roots alongside its own identity.`,
  'India': `India's modern patisserie scene has grown rapidly. Mumbai's Theobroma has become the country's pastry standard-bearer since 2004, while historic colonial bakeries like Flurys in Kolkata (since 1927) keep an earlier tradition alive. Cities across the country now host French-trained bakers alongside traditional Indian mithai shops.`,
  'Iceland': `Iceland has one of the most underrated small-country bakery cultures in the world. Reykjavík's Brauð & Co and Sandholt have become international destinations for Icelandic rye, viennoiserie, and naturally leavened breads. Given the country's small population, the quality and density of serious bakeries per capita is remarkable.`,
  'Hungary': `Hungary's cukrászda (pastry house) tradition is inseparable from its coffee-house culture. Café Gerbeaud (since 1858), Auguszt (since 1870), and Ruszwurm (since 1827) still serve Dobos torte, krémes, and Eszterházy cake in the rooms where they were invented.`,
  'Switzerland': `Switzerland's pastry houses have served Luxemburgerli, Zürcher Leckerli, and the finest pralines for nearly two centuries. Zurich's Sprüngli (since 1836) and Honold (since 1905) are historic landmarks, and a new wave of artisan bakeries like John Baker is bringing organic sourdough to the Alpine bread tradition.`,
  'Belgium': `Belgium is the home of speculoos, waffles, and an exceptional chocolate and pastry tradition. Historic houses like Maison Dandoy in Brussels (since 1829) still make speculoos by hand, and an emerging wave of artisan bakeries across Brussels, Antwerp, and Ghent is reviving long-ferment sourdough in a country already famous for its food culture.`,
  'South Korea': `South Korea's bakery scene has grown at extraordinary speed. Paris Baguette and Tous Les Jours have become dominant domestic chains, while independent bakeries and concept-driven pastry spaces like Nudake in Seoul are now on international radar. Korean-French pastry is one of the fastest-evolving bakery cultures in the world.`,
  'Israel': `Israel's bakery culture sits at the crossroads of Ashkenazi, Sephardi, Mizrahi, and Palestinian baking traditions. Tel Aviv's Lehamim Bakery, founded by Uri Scheft, has exported Israeli-style chocolate babka around the world, and Jerusalem's Marzipan Bakery at the Mahane Yehuda market is a pilgrimage site for rugelach.`,
};

// ─── Public API ───

export function getCityIntro(city, country, barCount) {
  if (CITY_INTROS[city]) return CITY_INTROS[city];
  const templates = [
    `${city} has a bakery scene that blends ${country}'s regional traditions with contemporary artisan technique. With ${barCount}+ bakeries spanning historic neighbourhood counters, French-style boulangeries, and specialist pastry shops, the city offers a full cross-section of ${country}'s bread and pastry culture.`,
    `From heritage bakeries serving generations of families to a new wave of sourdough and viennoiserie specialists, ${city}'s ${barCount}+ bakeries cover everything that ${country}'s bread culture is known for. Expect strong local traditions alongside internationally influenced technique.`,
    `${city}, ${country} is a rewarding city for anyone who takes bread and pastry seriously. ${barCount}+ bakeries range from historic institutions to modern artisan shops, all shaped by the city's local flour, climate, and food heritage.`,
  ];
  const hash = [...city].reduce((a, c) => a + c.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

export function getCountryIntro(country, cityCount, barCount) {
  if (COUNTRY_INTROS[country]) return COUNTRY_INTROS[country];
  const templates = [
    `${country}'s bakery culture is built on local grains, regional traditions, and an evolving wave of artisan bakers. Across ${cityCount} cities, ${barCount}+ bakeries cover everything from everyday neighbourhood bread counters to specialist patisseries and modern sourdough shops. Local specialities sit alongside international techniques, giving travellers a rich cross-section to explore.`,
    `With ${barCount}+ bakeries across ${cityCount} cities, ${country} offers travellers and food lovers a wide range of bread and pastry experiences. Expect a mix of historic bakeries rooted in local tradition and newer artisan shops applying long-ferment techniques, heritage grains, and international influences.`,
    `${country}'s bakery scene reflects both its regional food traditions and the global movement toward long-ferment, heritage-grain baking. Across ${cityCount} cities, ${barCount}+ bakeries range from legacy neighbourhood institutions to ambitious modern pastry shops, offering travellers a genuinely diverse set of stops.`,
  ];
  const hash = [...country].reduce((a, c) => a + c.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

export function getBarDescription(bakery) {
  const specialties = bakery.specialties || [];
  const topSpecialties = specialties.slice(0, 5).join(', ');
  const type = bakery.type || 'Bakery';
  const ratingTier = bakery.rating >= 4.7 ? 'exceptional' : bakery.rating >= 4.3 ? 'excellent' : bakery.rating >= 3.8 ? 'solid' : 'emerging';
  const reviewTier = bakery.reviews >= 2000 ? 'landmark' : bakery.reviews >= 500 ? 'established' : bakery.reviews >= 100 ? 'growing' : 'intimate';

  const typeOpeners = {
    'Bakery': `${bakery.name} is one of ${bakery.city}'s well-regarded neighbourhood bakeries — a place built on the daily rhythm of fresh bread, pastries, and reliable quality.`,
    'Patisserie': `${bakery.name} is a destination pâtisserie in ${bakery.city}, where classical pastry technique meets careful attention to ingredients and presentation.`,
    'Boulangerie': `${bakery.name} is a French-style boulangerie in ${bakery.city}, built around long-ferment breads, careful lamination, and the baguette-and-croissant fundamentals.`,
    'Cafe Bakery': `${bakery.name} is a café-bakery in ${bakery.city} where breakfast pastries, sandwich breads, and good coffee all share the counter.`,
    'Artisan Bakery': `${bakery.name} is one of ${bakery.city}'s serious artisan bakeries — naturally leavened sourdough, heritage grains, and long ferments at the core of what they do.`,
    'Pastry Shop': `${bakery.name} is a dedicated pastry shop in ${bakery.city}, focused on seasonal fruit tarts, viennoiserie, and the kind of pastry detail that reveals careful training.`,
    'Viennoiserie': `${bakery.name} specialises in viennoiserie — croissants, pains au chocolat, brioche, and laminated doughs — in ${bakery.city}. A pilgrimage stop for morning-pastry lovers.`,
    'Bagel Shop': `${bakery.name} is a ${bakery.city} bagel shop where the bagels are hand-rolled and boiled the traditional way. Cream cheese, lox, and bialys round out the offering.`,
    'Bread Bakery': `${bakery.name} is a dedicated bread bakery in ${bakery.city}, focused on long-ferment sourdoughs, ryes, and country loaves from quality flour.`,
    'Macaron Shop': `${bakery.name} is a specialist macaron shop in ${bakery.city}, turning out the classic almond-meringue pastry in seasonal flavours.`,
    'Cake Shop': `${bakery.name} is a cake shop in ${bakery.city} known for celebration cakes, cupcakes, and careful decoration — the kind of place regulars order birthday cakes from year after year.`,
    'Donut Shop': `${bakery.name} is a dedicated donut shop in ${bakery.city}, ranging from classic glazed rings to seasonal filled varieties.`,
    'Croissanterie': `${bakery.name} is a croissanterie in ${bakery.city} — the kind of focused bakery that lives or dies by the quality of a single laminated pastry.`,
  };

  const ratingPhrases = {
    'exceptional': [
      `Rated ${bakery.rating}/5 across ${bakery.reviews.toLocaleString()} reviews, it's one of the city's most consistently praised bakeries.`,
      `With a rating of ${bakery.rating}/5 and ${bakery.reviews.toLocaleString()} reviews, it sits firmly in ${bakery.city}'s top tier.`,
    ],
    'excellent': [
      `${bakery.rating}/5 across ${bakery.reviews.toLocaleString()} reviews places it solidly among ${bakery.city}'s most respected bakeries.`,
      `A ${bakery.rating}/5 rating from ${bakery.reviews.toLocaleString()} reviews reflects a bakery that delivers on the fundamentals.`,
    ],
    'solid': [
      `Rated ${bakery.rating}/5 from ${bakery.reviews.toLocaleString()} reviews, it's a dependable local choice.`,
      `${bakery.rating}/5 from ${bakery.reviews.toLocaleString()} reviews — a bakery that regulars return to for the basics done well.`,
    ],
    'emerging': [
      `With ${bakery.reviews.toLocaleString()} reviews and a ${bakery.rating}/5 rating, it's still building its reputation.`,
      `Rated ${bakery.rating}/5 from ${bakery.reviews.toLocaleString()} reviews — a newer or lesser-known spot worth checking for yourself.`,
    ],
  };

  const closing = topSpecialties
    ? `Expect ${topSpecialties} at the counter.`
    : `Stop in for fresh bread, pastries, and whatever the day's bake brings out of the oven.`;

  const hash = [...(bakery.name + bakery.city)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const opener = typeOpeners[type] || typeOpeners['Bakery'];
  const middle = ratingPhrases[ratingTier][hash % ratingPhrases[ratingTier].length];
  return `${opener} ${middle} ${closing}`;
}

export function getCityFAQs(city, country, topBars) {
  const topName = topBars[0]?.name || `the top-rated bakery in ${city}`;
  return [
    {
      question: `What is the best bakery in ${city}, ${country}?`,
      answer: `Based on verified Google reviews and our editorial analysis, ${topName} is currently the highest-rated bakery in ${city}. It maintains a ${topBars[0]?.rating || 4.5}/5 rating from ${(topBars[0]?.reviews || 500).toLocaleString()} reviews.`,
    },
    {
      question: `When is the best time of day to visit a bakery in ${city}?`,
      answer: `For the freshest bread and viennoiserie, most ${city} bakeries are at their best shortly after opening — usually between 7am and 10am. Many bakeries sell through popular items by midday, so early visits are recommended for celebrated venues.`,
    },
    {
      question: `Do bakeries in ${city} take reservations?`,
      answer: `Most bakeries operate walk-in only. A small number of destination bakeries offer pre-orders for whole loaves, celebration cakes, or large pastry orders — it's worth checking the bakery's website or Instagram for advance-order options.`,
    },
    {
      question: `What types of bakeries are common in ${city}?`,
      answer: `${city} hosts a range of bakery types, typically including neighbourhood bread bakeries, French-style boulangeries, dedicated pâtisseries, artisan sourdough shops, viennoiserie specialists, and café bakeries that serve pastries alongside good coffee. The mix varies by neighbourhood.`,
    },
  ];
}

// ─── Country SEO Landing Page Content ───

const PRICE_TIER = {
  'Mexico': 'affordable', 'Thailand': 'affordable', 'Vietnam': 'affordable',
  'Colombia': 'affordable', 'Indonesia': 'affordable', 'India': 'affordable',
  'Morocco': 'affordable', 'Philippines': 'affordable',
  'United States': 'premium', 'United Kingdom': 'premium', 'France': 'premium',
  'Australia': 'premium', 'Japan': 'premium', 'Germany': 'premium', 'Singapore': 'premium',
  'Switzerland': 'ultra-luxury', 'UAE': 'ultra-luxury', 'Qatar': 'ultra-luxury',
  'Monaco': 'ultra-luxury',
};

const PRICE_DESCRIPTIONS = {
  'affordable': 'Bakery prices are very accessible — expect to pay $1–3 for a pastry or piece of bread and $4–10 for a loaf at even well-regarded bakeries.',
  'mid-range': 'Bakery pricing is moderate — individual pastries typically run $3–6 and a quality loaf of sourdough or country bread is around $6–12.',
  'premium': 'Bakery pricing runs higher — expect to pay $4–8 for a single pastry and $8–16 for a loaf at the best artisan bakeries. Destination bakeries and specialty shops can charge more.',
  'ultra-luxury': 'Expect top-tier pricing — $6–15 for signature pastries and $12–30+ for loaves at flagship bakeries. These are the country\'s highest-end bakery experiences.',
};

const SPECIALTY_MAP = {
  'France': 'boulangerie and pâtisserie — baguettes, croissants, pains au chocolat, éclairs, macarons, and tarts',
  'United States': 'an eclectic mix of American and immigrant traditions — New York bagels, rye, sourdough, Jewish babka, and modern laminated pastry',
  'United Kingdom': 'a mix of British classics (scones, Eccles cakes, pork pies, crumpets) and a strong artisan sourdough and viennoiserie revival',
  'Japan': 'precision French-style bakeries, milk bread, melon pan, an-pan, and an extraordinary pâtisserie scene',
  'Italy': 'regional breads (ciabatta, focaccia, pane di Altamura) and classical pasticceria (sfogliatelle, maritozzi, panettone, cornetti)',
  'Germany': 'one of the world\'s deepest bread cultures — ryes, pumpernickel, Vollkornbrot, and pretzels, plus a rich Konditorei tradition',
  'Austria': 'Viennese Konditorei culture — Sachertorte, Apfelstrudel, Kaisersemmel, and the imperial coffee-house pastry tradition',
  'Denmark': 'the wienerbrød (Danish pastry), cardamom buns, Nordic rye, and a modern sourdough and heritage-grain movement',
  'Spain': 'regional baking — ensaïmada, coca, napolitana, and a proud artisan bread revival',
  'Portugal': 'pastel de nata, bolo rei, and historic confeitaria traditions',
  'Mexico': 'pan dulce — conchas, cuernos, orejas, rosca de reyes, and a growing modern pastry scene',
  'Turkey': 'simit, baklava, pide, börek, and a deep Ottoman pastry heritage',
  'Argentina': 'medialunas, facturas, and French-and-Italian-inflected panadería culture',
  'Brazil': 'pão francês, brigadeiros, sonhos, and a maturing artisan sourdough scene',
  'Australia': 'world-class croissants, long-ferment sourdough, and a strong café-bakery culture',
  'Singapore': 'a multicultural mix of French-style bakeries, Peranakan pastry, Chinese egg tarts, and Indian sweets',
  'Vietnam': 'bánh mì, French-colonial baguette traditions, and pâté chaud',
  'India': 'a rapidly growing modern patisserie scene alongside historic colonial bakeries and traditional mithai',
  'Iceland': 'Icelandic rye, viennoiserie, and a remarkably dense modern sourdough scene for a small country',
  'Hungary': 'cukrászda culture — Dobos torte, krémes, Eszterházy cake, and historic coffee-house pastries',
  'Switzerland': 'Luxemburgerli, Zürcher Leckerli, Swiss chocolates, and a proud Konditorei tradition',
  'Belgium': 'speculoos, waffles, and a strong chocolate and pastry heritage',
  'South Korea': 'a rapidly evolving French-Korean patisserie scene and dominant national bakery chains',
  'Israel': 'babka, rugelach, bourekas, and a crossroads of Ashkenazi, Sephardi, Mizrahi, and Palestinian traditions',
  'Thailand': 'an emerging artisan bakery and viennoiserie scene built around imported French technique',
  'Netherlands': 'stroopwafels, Dutch apple pie, Vlaamsch Broodhuys stone-oven bread, and a strong historic bakery culture',
  'Canada': 'Montreal bagels, French-inflected Québécois pâtisserie, and a maturing artisan sourdough scene',
  'Sweden': 'cardamom and cinnamon buns, wienerbröd, and a clean Scandinavian bakery aesthetic',
  'Norway': 'skillingsboller, Norwegian rye, and an emerging organic long-ferment movement',
  'Finland': 'Runeberg torte, pulla, and historic Helsinki patisseries like Ekberg and Fazer',
};

export function getCountryFAQs(country, cityCount, totalBars, topBars) {
  const topName = topBars[0]?.name || `the top-rated bakery in ${country}`;
  const topRating = topBars[0]?.rating || 4.5;
  const topReviews = topBars[0]?.reviews || 500;
  const topCity = topBars[0]?.city || '';
  const priceTier = PRICE_TIER[country] || 'mid-range';
  const specialty = SPECIALTY_MAP[country] || 'a mix of local and international bakery traditions';
  const top50Bars = topBars.filter(b => b.isTop50);

  return [
    {
      question: `What is the best bakery in ${country}?`,
      answer: `Based on verified Google reviews and our editorial analysis, ${topName} is currently the highest-rated bakery in ${country}. It holds a ${topRating}/5 rating from ${topReviews.toLocaleString()} reviews. We rank the top ${Math.min(totalBars, 10)} bakeries in ${country} on this page by combining guest ratings, editorial recognition, and baking quality.`,
    },
    {
      question: `How much do bakery items cost in ${country}?`,
      answer: PRICE_DESCRIPTIONS[priceTier],
    },
    {
      question: `What type of baking is ${country} best known for?`,
      answer: `${country} is best known for ${specialty}. Across ${cityCount} cities, you'll also find neighbourhood bread bakeries, café-bakeries, and specialty pastry shops catering to a wide range of tastes.`,
    },
    {
      question: `When is the best time to visit a bakery in ${country}?`,
      answer: `For the freshest bread and viennoiserie, most ${country} bakeries are at their best shortly after opening — usually between 7am and 10am. Many sell through popular items by midday, so early visits are recommended for the most celebrated bakeries.`,
    },
    {
      question: `Which city in ${country} has the best bakeries?`,
      answer: `${topCity} leads ${country}'s bakery scene by editorial rankings and guest ratings. However, ${country}'s ${cityCount} bakery cities each offer distinct regional specialities, so the best city depends on which local traditions you're most interested in exploring.`,
    },
    {
      question: `Are there any world-famous bakeries in ${country}?`,
      answer: top50Bars.length > 0
        ? `Yes — ${country} is home to ${top50Bars.length} bakery${top50Bars.length > 1 ? 's' : ''} featured in our Top 50 Editorial list, including ${top50Bars.slice(0, 3).map(b => b.name).join(', ')}${top50Bars.length > 3 ? ' and more' : ''}.`
        : `${country} may not yet feature in our global Top 50 list, but it offers excellent locally renowned bakeries that deliver outstanding experiences. Many travellers prefer these for their authenticity and local character.`,
    },
  ];
}

// ─── "Why visit" landing content ───

const COUNTRY_WHY_VISIT = {};

export function getCountryWhyVisit(country, cityCount, totalBars) {
  if (COUNTRY_WHY_VISIT[country]) return COUNTRY_WHY_VISIT[country];
  const templates = [
    `${country}'s bakery scene rewards travellers who take their bread and pastry seriously. With ${totalBars}+ bakeries spread across ${cityCount} cities, the country offers everything from historic neighbourhood institutions to contemporary artisan shops applying long-ferment techniques and heritage grains. Local specialities provide a regional identity that chain bakeries cannot replicate.\n\nWhether you're planning a full bakery-hopping trip or simply looking for a great morning pastry on a city break, ${country}'s bakery landscape has matured enough to deliver consistent quality across a wide range of price points.`,
    `For food-curious travellers, ${country} offers a bakery culture shaped by its specific grains, climate, and regional traditions. ${cityCount} cities across the country each bring something distinctive, from everyday neighbourhood bread counters to specialty pastry shops. ${totalBars}+ bakeries give visitors plenty of room to explore beyond the obvious stops.\n\n${country}'s top bakeries increasingly draw international attention, and a visit can reveal the kind of quality that only comes from bakers working in their own tradition and context.`,
    `${country} is a rewarding stop for anyone interested in bread and pastry. Across ${cityCount} cities, ${totalBars}+ bakeries span everyday neighbourhood counters, dedicated pastry shops, viennoiserie specialists, and artisan sourdough bakeries. The country's flour, climate, and historic baking traditions all shape what ends up on the counter — an identity that travellers who look beyond cafés will appreciate.\n\nEven outside the best-known bakery cities, smaller towns often host destination-worthy bakeries that reflect a deep local baking culture.`,
  ];
  const hash = [...country].reduce((a, c) => a + c.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

// ─── Type Page Content ───

const TYPE_INTROS = {
  'Bakery': 'The neighbourhood bakery is the foundation of every bread culture. Whether serving a morning baguette, a wedding cake, or a weekly sourdough loaf, the best bakeries operate on a rhythm of daily bakes and loyal regulars. This category covers general bakeries that produce a full range of breads, pastries, and cakes.',
  'Patisserie': 'Pâtisseries focus on the classical repertoire of French and European pastry — éclairs, tarts, mille-feuille, petit fours, and seasonal desserts. The best are effectively small pastry studios, where every component is made in-house and where technique is on full display in the display case.',
  'Boulangerie': 'Boulangeries are dedicated bread bakeries in the French tradition. The baguette is the benchmark, but the best also produce pain au levain, pain de campagne, fougasse, and a rotating selection of specialty loaves using quality flour and long fermentation.',
  'Cafe Bakery': 'Café bakeries combine fresh in-house baking with good coffee and casual seating. Breakfast pastries, sandwich breads, and brunch plates are the draw, with the bakery side usually producing laminated pastries, quick breads, and morning buns for the café counter.',
  'Artisan Bakery': 'Artisan bakeries prioritise long-ferment sourdough, heritage grains, stone-milled flour, and small-batch production. This is where the modern bread movement lives — the category that rebuilt consumer expectations for what a loaf of bread should be.',
  'Pastry Shop': 'Pastry shops range from classical European houses to contemporary concept spaces. Expect viennoiserie, fruit tarts, chocolate desserts, seasonal specials, custom cakes, and careful display. The best are destinations as much for the presentation as the flavour.',
  'Viennoiserie': 'Viennoiserie — the category of laminated, enriched pastries that includes croissants, pains au chocolat, brioche, and kouign-amann — has become a specialty in its own right. Dedicated viennoiserie bakeries treat lamination as a craft discipline and often offer a tighter, more focused menu than a full boulangerie.',
  'Bagel Shop': 'Bagel shops, at their best, hand-roll and boil their bagels the traditional way. The New York and Montreal styles both have passionate adherents, and the best bagel shops serve their bagels with cream cheese, lox, and bialys alongside.',
  'Bread Bakery': 'Dedicated bread bakeries focus on loaves — sourdough, rye, country breads, multigrain, specialty miches — and skip the pastry counter entirely. The modern artisan bread movement is driven by bakeries in this category.',
  'Macaron Shop': 'Macaron shops specialise in the classic French almond-meringue sandwich pastry. The best offer a rotating seasonal menu of flavours alongside the classics, and often function as gift-shopping destinations as well as everyday pastry stops.',
  'Cake Shop': 'Cake shops are the destination for birthday, celebration, and wedding cakes. The best offer custom orders, regular display cakes by the slice, and a level of decoration that signals serious pastry training.',
  'Donut Shop': 'Dedicated donut shops range from classic glazed-ring counters to modern filled-and-glazed pastry houses. The best make their donuts fresh daily and rotate seasonal specials.',
  'Croissanterie': 'Croissanteries are bakeries built around the laminated pastry. The category has grown alongside the obsession with perfect croissants, and the best bakeries in this category live or die by the quality of a single product.',
};

export function getTypeIntro(typeName) {
  return TYPE_INTROS[typeName] || `Explore the world's best ${typeName.toLowerCase()} venues, curated by our editorial team based on guest ratings, editorial recognition, and baking quality.`;
}

export function getTypeFAQs(typeName, totalCount) {
  const lcType = typeName.toLowerCase();
  const priceTiers = {
    'Bakery': '$1–6 per pastry, $4–12 per loaf',
    'Patisserie': '$4–12 per pastry',
    'Boulangerie': '$1–4 per baguette, $6–14 per country loaf',
    'Cafe Bakery': '$3–8 per pastry, $5–15 per breakfast plate',
    'Artisan Bakery': '$6–16 per loaf, $4–10 per pastry',
    'Pastry Shop': '$4–12 per pastry',
    'Viennoiserie': '$3–8 per croissant, $5–12 per specialty pastry',
    'Bagel Shop': '$2–6 per bagel, $6–14 with lox and cream cheese',
    'Bread Bakery': '$6–16 per loaf',
    'Macaron Shop': '$2–5 per macaron, $15–35 per box of 6–12',
    'Cake Shop': '$4–10 per slice, $35–200+ for custom cakes',
    'Donut Shop': '$2–6 per donut',
    'Croissanterie': '$4–10 per croissant',
  };
  return [
    {
      question: `What is a ${lcType}?`,
      answer: TYPE_INTROS[typeName] || `A ${lcType} is a bakery specialising in ${lcType.replace(' bakery', '').replace(' shop', '')}.`,
    },
    {
      question: `How much does a ${lcType} item typically cost?`,
      answer: `${typeName} prices vary by location and venue quality. Typical range: ${priceTiers[typeName] || '$3–10 per item'}. Prices are lower in Latin America and Southeast Asia and higher in London, New York, Tokyo, and Singapore.`,
    },
    {
      question: `How many ${lcType}s are listed on 50 Best Bakeries?`,
      answer: `We currently list ${totalCount.toLocaleString()}+ ${lcType}s worldwide, curated by our editorial team based on guest ratings, editorial recognition, and baking quality.`,
    },
    {
      question: `When is the best time to visit a ${lcType}?`,
      answer: `Most ${lcType}s are at their best shortly after opening, when the morning bake is fresh. Popular items often sell through by midday, so early visits are recommended at celebrated venues.`,
    },
  ];
}

export function getTypeCountryIntro(typeName, country, count) {
  const lcType = typeName.toLowerCase();
  const specialty = SPECIALTY_MAP[country] || 'a blend of local baking traditions and international technique';
  const templates = [
    `${country} is home to ${count}+ ${lcType}s shaped by ${specialty}. The ${lcType} scene here reflects the country's broader baking heritage alongside modern artisan technique.`,
    `Discover ${count}+ ${lcType}s across ${country}, where ${specialty} informs the counter. The best of these bakeries sit alongside everyday neighbourhood venues worth exploring for travellers and locals alike.`,
    `With ${count}+ ${lcType}s to explore, ${country} offers a diverse cross-section of the category — ranging from intimate neighbourhood spots to destination bakeries — all shaped by ${specialty}.`,
  ];
  const hash = [...(typeName + country)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

export function getTypeCountryFAQs(typeName, country, topBars) {
  const lcType = typeName.toLowerCase();
  const topName = topBars[0]?.name || `the top-rated ${lcType} in ${country}`;
  const topRating = topBars[0]?.rating || 4.5;
  const priceTier = PRICE_TIER[country] || 'mid-range';
  return [
    {
      question: `What is the best ${lcType} in ${country}?`,
      answer: `Based on verified Google reviews and our editorial analysis, ${topName} is currently the highest-rated ${lcType} in ${country}, with a ${topRating}/5 rating.`,
    },
    {
      question: `How much does a ${lcType} item cost in ${country}?`,
      answer: PRICE_DESCRIPTIONS[priceTier],
    },
    {
      question: `When should I visit a ${lcType} in ${country}?`,
      answer: `For the freshest bread and pastries, most ${country} ${lcType}s are at their best shortly after opening — usually between 7am and 10am. Many popular items sell through by midday.`,
    },
  ];
}

export function generateBlogIdeas(countries, cities) {
  const ideas = [];
  for (const city of cities.slice(0, 30)) {
    ideas.push({
      title: `The Complete Guide to Bakeries in ${city} (${new Date().getFullYear()})`,
      slug: `best-bakeries-${city.toLowerCase().replace(/\s+/g, '-')}`,
      category: 'City Guide',
      targetKeyword: `best bakeries ${city}`,
    });
  }
  const types = ['Boulangerie', 'Patisserie', 'Artisan Bakery', 'Viennoiserie'];
  for (const type of types) {
    ideas.push({
      title: `What Is a ${type}? Everything You Need to Know`,
      slug: `what-is-a-${type.toLowerCase().replace(/\s+/g, '-')}`,
      category: 'Education',
      targetKeyword: `what is a ${type.toLowerCase()}`,
    });
  }
  const topics = ['Sourdough', 'Croissants', 'Bagels', 'Macarons', 'Babka'];
  for (const topic of topics) {
    ideas.push({
      title: `The Beginner's Guide to ${topic}`,
      slug: `beginners-guide-to-${topic.toLowerCase()}`,
      category: 'Education',
      targetKeyword: `${topic.toLowerCase()} guide`,
    });
  }
  ideas.push(
    { title: 'The Best Bakeries to Visit This Summer', slug: 'best-bakeries-summer', category: 'Seasonal', targetKeyword: 'best bakeries summer' },
    { title: 'Top Croissants Around the World', slug: 'best-croissants-world', category: 'Lifestyle', targetKeyword: 'best croissants world' },
    { title: 'Pâtisserie vs Boulangerie: What\'s the Difference?', slug: 'patisserie-vs-boulangerie', category: 'Education', targetKeyword: 'patisserie vs boulangerie' },
    { title: 'The 10 Best Sourdough Bakeries in the World', slug: 'best-sourdough-bakeries-world', category: 'Regional', targetKeyword: 'best sourdough bakeries' },
    { title: 'The World\'s Best Viennoiserie', slug: 'best-viennoiserie-world', category: 'Regional', targetKeyword: 'best viennoiserie world' },
    { title: 'How to Choose a Great Loaf of Bread', slug: 'how-to-choose-bread', category: 'Education', targetKeyword: 'how to choose bread' },
    { title: 'Classic Pastries Every Bakery Traveller Should Know', slug: 'classic-pastries-guide', category: 'Education', targetKeyword: 'classic pastries' },
  );
  return ideas;
}
