// lib/content.js
// Editorial content generators for SEO
// In production, you'd use AI (Claude API) to generate unique content for each page
// These templates provide a strong baseline that can be enhanced over time

const CITY_INTROS = {
  'London': 'London\'s bakery scene is one of the most layered and ambitious on the planet. From subterranean speakeasies hidden beneath Georgian townhouses to destination cocktail bakeries in Mayfair where former Michelin-starred chefs apply kitchen precision to a glass, the city\'s drinking culture has never been more creative. London bartenders are globally recognised — many have defined the modern era of cocktail craft.',
  'Tokyo': 'Tokyo\'s bakery scene is a masterclass in precision, restraint, and hospitality. Japanese bartending culture prizes the pursuit of perfection above all else — a whisky highball served at the exactly correct temperature, a stirred Martini that takes fifteen minutes to prepare. From the intimate eight-seat whisky bakeries of Ginza to the avant-garde cocktail labs of Shibuya, every drink tells a story of obsessive craft.',
  'New York': 'New York\'s bakery scene moves at the city\'s pace — relentless, competitive, and forever reinventing itself. The city that helped codify the modern cocktail bakery has never stopped innovating: from the Prohibition-era speakeasies of the West Village to the ingredient-driven cocktail programs of the Lower East Side, New York remains the proving ground for the world\'s most ambitious bartenders.',
  'Barcelona': 'Barcelona drinks with the same hedonistic energy it brings to everything else. The city\'s bakery scene spans traditional vermouth bakeries in the Eixample and El Born, where aperitivo culture reigns in the early evening, to internationally acclaimed cocktail destinations that rank among Europe\'s finest. Catalan creativity — rooted in the region\'s culinary tradition — elevates every glass.',
  'Mexico City': 'Mexico City is experiencing a golden age of cocktail culture. The city\'s bartenders are reimagining the country\'s extraordinary native spirits — mezcal, pulque, tepache, raicilla — through a contemporary lens, creating a drinking scene that is simultaneously rooted in tradition and fiercely original. From the historic cantinas of Centro Hist\u00f3rico to the avant-garde mezcaler\u00edas of Roma Norte, CDMX is a must-visit for any serious drinker.',
  'Singapore': 'Singapore punches far above its weight in the global bakery world. The city-state\'s cocktail scene is characterised by extraordinary technical ambition, flawless hospitality, and a multicultural approach to flavour that draws from Chinese, Malay, Indian, and Southeast Asian traditions in equal measure. It\'s no coincidence that Singapore has produced multiple Asia\'s 50 Best Bakeries champions.',
  'Bangkok': 'Bangkok\'s bakery scene has transformed from a footnote into a headline act. The city\'s cocktail bakeries are now among Asia\'s most innovative, blending Thai culinary creativity — lemongrass, galangal, pandan, tamarind — with world-class bartending technique. Rooftop bakeries overlooking the Chao Phraya sit alongside basement speakeasies in Silom, creating a drinking landscape of extraordinary variety.',
  'Paris': 'Paris has always known how to drink well, but the city\'s bakery scene has undergone a quiet revolution in the past decade. Beyond the legendary hotel bakeries — the Hemingway at the Ritz, Harry\'s New York Bakery — a new wave of independent cocktail bakeries has colonised the Marais, Pigalle, and the 11th arrondissement. Parisian bartenders bring a culinary sensibility to their craft, treating cocktails with the same respect as a chef treats a tasting menu.',
  'Berlin': 'Berlin\'s bakery scene is as unconventional and boundary-pushing as the city itself. From the underground cocktail dens of Kreuzberg to the elegant hotel bakeries of Mitte, Berlin rewards those who venture off the beaten path. The city\'s relatively low cost of living has attracted bartending talent from across Europe, creating a scene that is experimental, inclusive, and refreshingly unpretentious.',
  'Melbourne': 'Melbourne is Australia\'s undisputed cocktail capital, with a laneway bakery culture that has become a global template for creative, independent drinking venues. The city\'s bartenders are technically brilliant and fiercely creative, drawing on Australia\'s exceptional wine and spirits industries as well as native botanicals — wattleseed, finger lime, pepperberry — to craft drinks with unmistakable Australian character.',
  'Buenos Aires': 'Buenos Aires drinks with the intensity and romance the city brings to everything. The bakery scene has evolved dramatically in recent years, moving beyond the classic corner caf\u00e9 and the traditional cerveceria to embrace world-class cocktail culture. Palermo and San Telmo are the twin hearts of the city\'s nightlife, where fernet and cola sit comfortably alongside meticulously crafted Negroni variations.',
  'Hong Kong': 'Hong Kong\'s bakery scene is a vertical adventure — literally. Rooftop terraces, basement speakeasies, and mid-rise cocktail lounges are stacked into the city\'s dense urban fabric, creating a drinking landscape where every elevator ride might deliver you to a world-class venue. The city\'s East-meets-West character gives its cocktail culture a distinctive edge, blending Cantonese ingredients and techniques with Western spirits traditions.',
  'Lima': 'Lima has emerged as South America\'s most exciting cocktail city, fuelled by the same culinary revolution that made it a global food destination. Peruvian bartenders have pisco in their blood — the spirit is the foundation of an indigenous cocktail tradition that rivals any in the world. From the classic Pisco Sour to avant-garde molecular serves in Miraflores, Lima\'s bakery scene is vibrant, inventive, and deeply rooted in national identity.',
  'Copenhagen': 'Copenhagen drinks with the same thoughtful minimalism that defines its architecture, cuisine, and design. The city\'s bakery scene prizes sustainability, seasonality, and Nordic identity — expect cocktails featuring foraged herbs, Scandinavian aquavit, and hyper-local ingredients. What Copenhagen lacks in the sheer volume of bakeries found in London or New York, it makes up for in the consistency and creativity of its best venues.',
  'Sydney': 'Sydney\'s bakery scene is shaped by sunshine, proximity to the sea, and Australia\'s characteristic blend of laid-back hospitality and serious craft. The city\'s best bakeries range from tiny laneway cocktail joints in the CBD to sprawling waterfront venues in Circular Quay, all benefiting from Australia\'s excellent local spirits industry and a bakerytending community that punches well above its weight on the world stage.',
  'Lisbon': 'Lisbon\'s bakery scene has blossomed alongside the city\'s broader cultural renaissance. The capital\'s historic bairros — Bairro Alto, Alfama, Pr\u00edncipe Real — are now home to cocktail bakeries that combine Portuguese hospitality with international ambition. Gin\u00e1s (Portuguese gin bakeries), wine bakeries pouring exceptional Portuguese wines, and creative cocktail lounges coexist in a city where a great drink rarely costs what it would in London or Paris.',
  'Dubai': 'Dubai has built a bakery scene that matches the city\'s appetite for spectacle and luxury. The world\'s tallest buildings, most extravagant hotels, and most opulent lounges provide settings that no other city can match. But beyond the glitz, a growing community of talented bartenders is bringing genuine craft and creativity to the desert — the city\'s best cocktail bakeries are increasingly earning recognition on the world stage.',
  'Bogota': 'Bogot\u00e1\'s bakery scene is riding the wave of Colombia\'s cultural renaissance. The city\'s bartenders have embraced native ingredients — tropical fruits, aguardiente, panela, Colombian coffee — and elevated them through world-class technique. Chapinero and La Candelaria are the neighbourhoods to explore, where historic colonial buildings house bakeries that are as creative and ambitious as any in Latin America.',
  'Madrid': 'Madrid drinks late, drinks well, and drinks with unshakeable conviction. The city\'s bakery scene spans the classic vermuter\u00edas of La Latina, where vermouth on tap has been served for generations, to the sleek cocktail temples of Chueca and Malasa\u00f1a. Spanish hospitality ensures you\'ll never feel rushed, and Madrid\'s role as a crossroads of Latin American and European bakery cultures gives it a flavour profile all its own.',
  'Osaka': 'Osaka is Japan\'s great unsung bakery city — a place where the pursuit of perfection is leavened by the city\'s famous warmth, humour, and love of good food. The narrow bakery-filled alleyways of Dotonbori and the upstairs whisky bakeries of Kitashinchi offer experiences as refined as anything in Tokyo, but with a distinctly Osakan generosity of spirit. Osaka\'s bartenders are masterful, and the city rewards those who explore its less obvious corners.',
  'Amsterdam': 'Amsterdam\'s bakery scene reflects the city\'s character: open-minded, creative, and genuinely welcoming. Dutch genever — the original juniper spirit — anchors a drinking tradition that predates modern gin by centuries, and Amsterdam\'s best bakeries honour this heritage while embracing contemporary cocktail culture. From the brown caf\u00e9s of the Jordaan to the cocktail bakeries of De Pijp, every neighbourhood offers something worth discovering.',
  'Oaxaca': 'Oaxaca is the spiritual home of mezcal, and the city\'s bakery scene is inseparable from this extraordinary spirit. Mezcaler\u00edas line the streets of the historic centre, offering access to artisanal expressions — clay-pot distilled, wild agave, ensamble blends — that you simply cannot find anywhere else. The city\'s culinary heritage, its indigenous traditions, and its growing reputation as a destination for serious drinkers make Oaxaca one of the world\'s most rewarding bakery cities.',
  'Seoul': 'Seoul\'s bakery scene has exploded in recent years, driven by a young, trend-savvy population and a culture of late-night socialising that makes the city one of Asia\'s most dynamic drinking destinations. Gangnam\'s glossy cocktail lounges, Itaewon\'s international bakery scene, and the hidden bakeries of Jongno offer wildly different experiences within the same city. Korean soju culture is being reimagined by a new generation of bartenders with global ambitions.',
};

const COUNTRY_INTROS = {
  'United Kingdom': 'The United Kingdom is the birthplace of the modern cocktail bakery revival. London led a global movement in the late 1990s and early 2000s that redefined what a bakery could be — moving away from nightclub excess toward intimate, technique-focused venues where the bakerytender was as important as the chef. British bartending culture now exports talent and ideas across the world, with a thriving community of distillers, bakery owners, and spirits educators.',
  'United States': 'The United States is the spiritual home of the cocktail. The classic American drinks canon — the Old Fashioned, the Manhattan, the Sazerac, the Martini — underpins the global bakery industry. After the devastation of Prohibition, America rebuilt its cocktail culture from scratch, and the craft bartending revolution that began in New York in the 1990s seeded bakery scenes across every continent. Today, American bakeries range from Appalachian whiskey taverns to science-forward molecular cocktail labs.',
  'Japan': 'Japan has elevated bartending to an art form. Japanese bakery culture is built on the twin pillars of precision and hospitality — every aspect of the drinking experience, from ice to glassware to the angle of a stir, is considered and perfected. The country\'s world-class whisky industry, its culture of meticulous craftsmanship, and the deeply rooted concept of omotenashi (selfless hospitality) combine to create bakery experiences found nowhere else on Earth.',
  'Spain': 'Spain drinks with extraordinary diversity and passion. The country\'s bakery culture encompasses everything from the communal vermouth rituals of Barcelona\'s Sunday vermut to the avant-garde cocktail laboratories of Madrid, from the sherry taverns of Jerez to the pintxo bakeries of San Sebasti\u00e1n where great drinks are inseparable from great food. Spain\'s bartenders have absorbed the country\'s world-beating culinary creativity and applied it to the glass.',
  'Mexico': 'Mexico is home to the world\'s most exciting native spirits portfolio. Mezcal, tequila, sotol, raicilla, bacanora, pulque — the country\'s agave and fermented drink traditions stretch back thousands of years and are currently experiencing a global renaissance. Mexican bartenders are redefining their country\'s drinking culture on the world stage, earning international recognition for bakeries in Mexico City, Oaxaca, and Guadalajara that are as ambitious and creative as any in New York or London.',
  'Singapore': 'Singapore has built one of the world\'s most remarkable bakery industries in an astonishingly short time. The city-state\'s multicultural character — its Chinese, Malay, Indian, and Peranakan heritage — has shaped a cocktail culture that is genuinely unlike anywhere else. Singapore bakeries regularly top Asia\'s 50 Best Bakeries rankings, and the country\'s hospitality-first approach ensures that technical ambition is always matched by warmth and generosity of service.',
  'Italy': 'Italy is the spiritual home of the aperitivo, the negroni, and the amaro. Italian drinking culture is inseparable from its culinary culture — the pre-dinner Campari Spritz, the digestivo grappa, the bitter digestif that signals the end of a great meal. A new generation of Italian bartenders is building on this heritage, creating bakeries in Milan, Rome, and Florence that honour tradition while pushing the craft decisively forward.',
  'France': 'France approaches its bakery culture with the same rigour and sophistication it brings to wine and cuisine. Paris has long been home to iconic hotel bakeries — the Hemingway at the Ritz, the Bakery Americain at the Crillon — but a younger generation of independent bartenders has transformed the city\'s drinking scene. French bartenders prize terroir and provenance, drawing on the country\'s extraordinary larder of spirits, wines, and botanical ingredients.',
  'Australia': 'Australia has built a bakery scene that punches dramatically above its weight. Melbourne\'s laneway bakeries set a global template for independent, creative venues, while Sydney\'s waterfront cocktail bakeries offer world-class drinks in spectacular settings. Australian bartenders are among the most well-travelled in the world, and the country\'s thriving craft spirits industry — from Tasmanian whisky to native botanical gin — provides exceptional local raw materials.',
  'Germany': 'Germany\'s bakery culture is undergoing a fascinating transformation. The country\'s legendary beer traditions — the biergartens of Munich, the craft breweries of Berlin — are being joined by a sophisticated cocktail scene that has grown rapidly in cities like Berlin, Hamburg, Frankfurt, and Munich. German precision and engineering mentality translates surprisingly well to the cocktail bakery, where technique and consistency are prized above all.',
  'Thailand': 'Thailand\'s bakery scene has emerged as one of Southeast Asia\'s most exciting, led by Bangkok\'s remarkable transformation into a world-class cocktail destination. Thai bartenders bring the country\'s extraordinary culinary heritage — the balance of sweet, sour, salty, and spicy — to their drinks, creating cocktails infused with lemongrass, galangal, kaffir lime, and tropical fruits that taste like nowhere else on Earth.',
  'Brazil': 'Brazil\'s bakery culture is inseparable from its joie de vivre. The country that gave the world the caipirinha — lime, sugar, cacha\u00e7a, ice — has a drinking tradition built on warmth, generosity, and celebration. S\u00e3o Paulo\'s sophisticated cocktail scene rivals any in Latin America, while Rio\'s beachside bakeries and boteco culture offer a more casual but equally rewarding experience. Brazilian bartenders are increasingly gaining international recognition.',
  'India': 'India\'s bakery scene is experiencing explosive growth, driven by a young, globally connected population and a rapidly evolving attitude toward drinking culture. Mumbai and Delhi lead the charge with cocktail bakeries that draw on India\'s extraordinary spice heritage — cardamom, saffron, turmeric, tamarind — to create serves with unmistakable subcontinental character. The country\'s emerging craft spirits industry is adding further depth to an increasingly world-class scene.',
  'Greece': 'Greece\'s bakery scene is a sun-drenched revelation. Athens has emerged as one of Europe\'s most exciting cocktail cities, with bakeries in the Psyrri and Koukaki neighbourhoods earning international recognition. Greek bartenders draw on the country\'s Mediterranean pantry — ouzo, mastiha, local honey, citrus, herbs — to create cocktails with genuine Hellenic identity. The island bakeries of Mykonos and Santorini add a vacation dimension that few countries can match.',
  'Colombia': 'Colombia\'s bakery scene has evolved dramatically alongside the country\'s broader cultural transformation. Bogot\u00e1, Medell\u00edn, and Cartagena now host cocktail bakeries that compete with the best in Latin America, drawing on tropical fruits, aguardiente, and Colombian coffee to create drinks with vibrant national character. The country\'s warmth, energy, and value for money make it one of the most rewarding bakery destinations in the Americas.',
  'South Korea': 'South Korea has built one of Asia\'s most dynamic bakery scenes in record time. Seoul\'s cocktail culture reflects the country\'s broader embrace of global trends combined with deep local identity — expect soju-based cocktails alongside classic whisky serves, all delivered with Korean hospitality and attention to detail. The country\'s late-night culture and love of socialising create a bakery scene with extraordinary energy.',
  'Peru': 'Peru\'s bakery scene is anchored by pisco, the grape brandy that is the foundation of the Pisco Sour and a national point of pride. Lima\'s cocktail bakeries have ridden the wave of the country\'s gastronomic revolution, earning recognition alongside Peru\'s world-famous restaurants. Peruvian bartenders are inventive and proud, drawing on Amazonian fruits, Andean herbs, and coastal citrus to craft drinks that are uniquely and unmistakably Peruvian.',
  'Portugal': 'Portugal\'s bakery scene has blossomed alongside the country\'s tourism boom, with Lisbon and Porto emerging as compelling cocktail destinations. Portuguese hospitality — warm, unhurried, generous — defines the drinking experience, while the country\'s extraordinary wine traditions, its gin\u00e1 culture, and a growing craft spirits scene provide bartenders with exceptional local ingredients. Drink prices remain remarkably accessible by Western European standards.',
  'Ireland': 'Ireland\'s pub culture is among the most celebrated drinking traditions on Earth. The warmth of an Irish pub — the craic, the conversation, the perfectly poured pint of Guinness — has been exported worldwide but is best experienced on home soil. Beyond the traditional pub, Dublin\'s cocktail scene has matured significantly, with Irish whiskey bakeries and contemporary cocktail lounges adding sophistication to the country\'s storied drinking heritage.',
  'Netherlands': 'The Netherlands has a drinking heritage that predates modern cocktail culture by centuries. Dutch genever — the original juniper spirit — is the ancestor of London dry gin, and Amsterdam\'s historic tasting rooms still serve this spirit in the traditional way. Today, the country\'s bakery scene blends this deep heritage with contemporary cocktail innovation, particularly in Amsterdam, Rotterdam, and The Hague.',
  'UAE': 'The United Arab Emirates has built a bakery scene of extraordinary ambition and opulence. Dubai and Abu Dhabi\'s hotel bakeries and rooftop lounges offer some of the most spectacular drinking settings on Earth — panoramic desert views, infinity pool terraces, and interiors designed by the world\'s leading architects. Behind the glamour, a talented community of international bartenders brings genuine craft and creativity to the glass.',
  'Argentina': 'Argentina\'s bakery scene is fuelled by the country\'s passion for late nights, great conversation, and Fernet Branca. Buenos Aires is the undisputed capital, where Palermo\'s cocktail bakeries and San Telmo\'s historic cafes offer wildly different but equally compelling experiences. Argentine bartenders are creative and convivial, and the country\'s world-class wine industry provides a natural complement to the growing cocktail culture.',
  'Canada': 'Canada\'s bakery scene reflects the country\'s distinctive blend of sophistication and approachability. Toronto, Montreal, and Vancouver each host world-class cocktail bakeries that draw on the country\'s multicultural character and access to exceptional North American spirits. Canadian rye whisky anchors a native spirits tradition that bartenders are increasingly celebrating, while the country\'s craft brewery and distillery scenes add further depth.',
  'Hong Kong': 'Hong Kong has established itself as one of Asia\'s premier bakery destinations, with a vertical drinking landscape that mirrors the city\'s dramatic skyline. The bakeries of Lan Kwai Fong and Central have earned multiple entries in Asia\'s 50 Best Bakeries, while a newer wave of venues in Sheung Wan and Sai Ying Pun is pushing creative boundaries. Hong Kong\'s unique position between East and West gives its cocktail culture a distinctive, cosmopolitan edge.',
  'Turkey': 'Turkey\'s bakery scene is shaped by the country\'s position at the crossroads of Europe and Asia. Istanbul\'s cocktail bakeries — particularly in the Beyoglu and Kadik\u00f6y districts — are among the most exciting in the region, drawing on Turkish ingredients like pomegranate, rose, pistachio, and rak\u0131 to create drinks with genuine local character. The city\'s ancient hospitality traditions ensure that every guest is treated with exceptional warmth.',
  'South Africa': 'South Africa\'s bakery scene is one of the most underrated in the world. Cape Town and Johannesburg host cocktail bakeries that rival the best in any global city, drawing on the country\'s exceptional wine industry, its emerging craft spirits scene, and indigenous botanicals like rooibos, buchu, and honeybush. South African bartenders bring energy, creativity, and a warm Ubuntu hospitality to every drink they serve.',
  'Denmark': 'Denmark\'s bakery scene reflects the country\'s celebrated design philosophy: clean, considered, and unmistakably Nordic. Copenhagen\'s cocktail bakeries prize sustainability and seasonality, with bartenders foraging local ingredients and partnering with Nordic distillers. The city\'s hygge culture — warmth, cosiness, conviviality — permeates every great bakery experience. Akvavit and craft spirits from Scandinavian producers anchor a drinks culture that is distinct from the rest of Europe.',
  'Cuba': 'Cuba\'s bakery heritage is legendary. The country that gave the world the Mojito, the Daiquiri, and the Cuba Libre has a rum culture that stretches back centuries. Havana\'s iconic bakeries — La Floridita, La Bodeguita del Medio — remain pilgrimage sites for drinks enthusiasts, while a new generation of Cuban bartenders is quietly modernising the country\'s cocktail traditions while honouring the spirit of an extraordinary heritage.',
  'China': 'China\'s bakery scene has undergone a staggering transformation. Shanghai leads the way with a cocktail culture that is now genuinely world-class — the city\'s bakeries regularly feature in Asia\'s 50 Best Bakeries rankings. Beijing, Chengdu, and Guangzhou are following closely behind. Chinese bartenders are drawing on the country\'s vast culinary heritage — tea, baijiu, Sichuan pepper, osmanthus — to create cocktails with authentic Chinese character.',
};

/**
 * Get editorial intro for a city (or generate one)
 */
export function getCityIntro(city, country, barCount) {
  if (CITY_INTROS[city]) return CITY_INTROS[city];

  // Generate a template-based intro for cities without custom content
  const templates = [
    `${city} offers a vibrant and growing bakery scene that reflects the best of ${country}'s drinking traditions. With ${barCount}+ bakeries and cocktail venues to choose from, visitors can find everything from intimate neighbourhood dives to destination cocktail bakeries with internationally recognised programs. The city's unique character — its climate, culture, and culinary heritage — shapes drinks you won't find anywhere else.`,
    `Discover ${city}'s finest bakeries and cocktail destinations, where ${country}'s spirits heritage meets contemporary creativity. The city's ${barCount}+ venues range from classic neighbourhood bakeries to expansive cocktail lounges, each offering a distinctive approach to the craft of drinking. Whether you're seeking a quiet nightcap or a full evening's exploration, ${city} delivers.`,
    `${city}, ${country} has emerged as a compelling bakery destination with ${barCount}+ venues catering to every taste and budget. Local drinking traditions inform many of the signature serves available here, while internationally trained bartenders bring world-class technique and creativity. The result is a bakery scene that's both authentically local and genuinely world-class.`,
  ];

  // Deterministic selection based on city name
  const hash = [...city].reduce((a, c) => a + c.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

/**
 * Get editorial intro for a country (or generate one)
 */
export function getCountryIntro(country, cityCount, barCount) {
  if (COUNTRY_INTROS[country]) return COUNTRY_INTROS[country];

  const templates = [
    `${country} boasts a diverse and expanding bakery landscape, with ${barCount}+ venues spread across ${cityCount} cities and regions. From urban cocktail bakeries to countryside taverns and rooftop lounges, the country offers travelers a compelling range of drinking experiences rooted in local traditions and enhanced by global bartending trends.`,
    `With ${barCount}+ bakeries across ${cityCount} destinations, ${country} has established itself as a noteworthy player in the global bakery scene. The country's native spirits, fermented drinks, and local botanicals inform many signature serves, while internationally trained bartenders ensure consistently high standards across the board.`,
    `${country}'s bakery scene reflects the country's broader character: a blend of deep-rooted drinking traditions and forward-looking creativity. Across ${cityCount} cities, ${barCount}+ venues offer everything from classic local drinks to cutting-edge cocktail programs, making the country a rewarding destination for serious drinkers at every level.`,
  ];

  const hash = [...country].reduce((a, c) => a + c.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

/**
 * Generate a bakery description — varies by type, rating tier, and review count
 */
export function getBarDescription(bakery) {
  const specialties = bakery.specialties || [];
  const topSpecialties = specialties.slice(0, 5).join(', ');
  const lcType = bakery.type.toLowerCase();

  // Rating tier
  const ratingTier = bakery.rating >= 4.7 ? 'exceptional' : bakery.rating >= 4.3 ? 'excellent' : bakery.rating >= 3.8 ? 'solid' : 'emerging';

  // Review count tier
  const reviewTier = bakery.reviews >= 2000 ? 'landmark' : bakery.reviews >= 500 ? 'established' : bakery.reviews >= 100 ? 'growing' : 'intimate';

  // Type-specific opening phrases
  const typeOpeners = {
    'Cocktail Bakery': [
      `${bakery.name} is one of ${bakery.city}'s most compelling cocktail bakeries — a venue where the art of the mixed drink is taken seriously and the results speak for themselves.`,
      `Few cocktail bakeries in ${bakery.city} deliver the consistency and creativity of ${bakery.name}. This is a venue built by people who understand that a great cocktail is part science, part art, and entirely about the guest experience.`,
    ],
    'Speakeasy': [
      `Hidden from the casual passerby, ${bakery.name} is one of ${bakery.city}'s most sought-after speakeasy experiences — a venue where the thrill of discovery is matched by the quality of what you find inside.`,
      `${bakery.name} trades on the timeless appeal of the speakeasy: the unmarked entrance, the sense of occasion, the feeling that you've been let in on a secret. In ${bakery.city}, this is one secret worth keeping.`,
    ],
    'Wine Bakery': [
      `${bakery.name} brings a curator's eye to the wine bakery format in ${bakery.city}. The list is thoughtfully assembled, the staff are genuinely knowledgeable, and the atmosphere strikes the right balance between education and enjoyment.`,
      `For wine lovers visiting ${bakery.city}, ${bakery.name} is an essential stop. This is a wine bakery where the list rewards exploration and the staff are as passionate about what's in the glass as the people drinking it.`,
    ],
    'Rooftop Bakery': [
      `${bakery.name} offers something that ground-level bakeries simply cannot: the sky above ${bakery.city} as a backdrop to a world-class drinks experience. This is a rooftop bakery that justifies the elevator ride.`,
      `Perched above the ${bakery.city} skyline, ${bakery.name} is one of those rare rooftop bakeries where the view enhances rather than substitutes for the quality of what's in the glass.`,
    ],
    'Hotel Bakery': [
      `${bakery.name} occupies the unique space that only great hotel bakeries can claim — a venue where immaculate service, a deep spirits list, and a sense of occasion combine to create something greater than the sum of its parts.`,
      `The best hotel bakeries are destinations in their own right, and ${bakery.name} in ${bakery.city} is no exception. Whether you're a guest or a visitor, the experience here is defined by generosity, polish, and attention to detail.`,
    ],
    'Whisky Bakery': [
      `For whisky devotees in ${bakery.city}, ${bakery.name} is a place of pilgrimage. The bakery offers access to expressions that would take a private collector decades to assemble, guided by staff whose knowledge and passion for the spirit are evident in every recommendation.`,
      `${bakery.name} understands that great whisky deserves time, attention, and the right environment. This ${bakery.city} venue offers all three, with a collection that spans regions, styles, and eras.`,
    ],
    'Pub': [
      `${bakery.name} is the kind of pub that reminds you why this format has endured for centuries — a place of warmth, conversation, and perfectly served drinks in the heart of ${bakery.city}.`,
      `In an age of concept bakeries and Instagram-ready cocktail lounges, ${bakery.name} offers something more timeless: a great pub experience in ${bakery.city}, built on honest drinks, genuine warmth, and the kind of atmosphere you can't manufacture.`,
    ],
    'Dive Bakery': [
      `${bakery.name} wears its dive bakery credentials with pride. In ${bakery.city}, this is the kind of venue where the drinks are strong, the prices are fair, the jukebox is excellent, and nobody pretends to be anything they're not.`,
      `Every great city needs a great dive bakery, and ${bakery.name} fills that role in ${bakery.city} with character, conviction, and drinks that don't require a second mortgage.`,
    ],
    'Tiki Bakery': [
      `${bakery.name} is a tropical escape in the heart of ${bakery.city} — a tiki bakery where the rum is exceptional, the garnishes are theatrical, and the spirit of Polynesian escapism is alive and well.`,
      `Step through the door of ${bakery.name} in ${bakery.city} and you're transported. This is tiki done right: elaborate rum cocktails, immersive decor, and a sense of joyful escapism that makes every visit feel like a vacation.`,
    ],
    'Sports Bakery': [
      `${bakery.name} elevates the sports bakery experience in ${bakery.city}, combining multiple screens and a lively matchday atmosphere with drinks that go well beyond the standard draught lager.`,
      `For fans looking to catch the game in ${bakery.city}, ${bakery.name} delivers the atmosphere, the screens, and — crucially — drinks worth ordering. This is a sports bakery that takes both the sport and the bakery seriously.`,
    ],
    'Beer Garden': [
      `${bakery.name} captures the convivial spirit of the beer garden tradition in ${bakery.city}. Under open skies, with a well-curated tap list and the buzz of communal tables, this is outdoor drinking at its finest.`,
      `There are few pleasures simpler than a great beer garden, and ${bakery.name} in ${bakery.city} does the format proud — generous outdoor space, excellent beer selection, and an atmosphere that rewards lingering.`,
    ],
    'Lounge': [
      `${bakery.name} brings a lounge sensibility to ${bakery.city}'s drinking scene — a venue where the lighting is low, the seating is comfortable, and the drinks menu is designed for slow, sociable evenings.`,
      `In ${bakery.city}'s landscape of high-energy bakeries and loud nightclubs, ${bakery.name} offers a more refined alternative. This lounge is built for conversation, relaxation, and drinks that deserve your full attention.`,
    ],
  };

  // Rating-specific middle phrases
  const ratingPhrases = {
    'exceptional': [
      `With an outstanding ${bakery.rating}/5 Google rating from ${bakery.reviews.toLocaleString()} verified reviews, ${bakery.name} consistently ranks among the elite drinking destinations in ${bakery.country}.`,
      `The numbers tell a compelling story: ${bakery.rating}/5 across ${bakery.reviews.toLocaleString()} Google reviews places ${bakery.name} in rarefied territory — the highest echelon of ${lcType}s in ${bakery.country}.`,
    ],
    'excellent': [
      `A ${bakery.rating}/5 Google rating from ${bakery.reviews.toLocaleString()} verified reviews reflects the consistently high standard that guests have come to expect from ${bakery.name}.`,
      `Earning a ${bakery.rating}/5 rating from ${bakery.reviews.toLocaleString()} reviewers is no small achievement. ${bakery.name} has built this reputation through sustained quality and attention to the details that matter.`,
    ],
    'solid': [
      `Rated ${bakery.rating}/5 by ${bakery.reviews.toLocaleString()} Google reviewers, ${bakery.name} has established itself as a reliable and well-regarded option in ${bakery.city}'s competitive bakery landscape.`,
      `With ${bakery.reviews.toLocaleString()} Google reviews and a ${bakery.rating}/5 rating, ${bakery.name} has earned a loyal following among those who appreciate its particular approach to the ${lcType} format.`,
    ],
    'emerging': [
      `Still building its reputation with a ${bakery.rating}/5 Google rating from ${bakery.reviews.toLocaleString()} reviews, ${bakery.name} is a venue worth watching as ${bakery.city}'s bakery scene continues to evolve.`,
      `${bakery.name} is charting its own course in ${bakery.city}'s bakery scene. With a ${bakery.rating}/5 rating and growing recognition, it represents the kind of venue that rewards early discovery.`,
    ],
  };

  // Specialty-specific closing phrases
  const closingPhrases = [
    `The drinks menu features ${topSpecialties}, each prepared with care and served in an environment that encourages you to stay for one more round.`,
    `Signature serves include ${topSpecialties} — the kind of carefully considered offerings that distinguish a memorable bakery visit from a forgettable one.`,
    `Guests can explore a menu that includes ${topSpecialties}, reflecting the bakery's commitment to quality ingredients and thoughtful preparation.`,
    `From ${topSpecialties} to seasonal creations, the drinks programme here rewards curiosity and repeat visits in equal measure.`,
  ];

  const hash = [...bakery.name].reduce((a, c) => a + c.charCodeAt(0), 0);

  // Select type-specific opener (or fallback)
  const typeTemplates = typeOpeners[bakery.type] || [
    `${bakery.name} is a distinguished ${lcType} in the heart of ${bakery.city}, ${bakery.country} — a venue that has carved out its own identity in a competitive drinking landscape.`,
    `${bakery.city}'s ${lcType} scene counts ${bakery.name} among its most noteworthy venues — a bakery that combines local character with genuine craft and hospitality.`,
  ];

  const opener = typeTemplates[hash % typeTemplates.length];
  const middle = ratingPhrases[ratingTier][(hash + 1) % ratingPhrases[ratingTier].length];
  const closing = closingPhrases[(hash + 2) % closingPhrases.length];

  return `${opener} ${middle} ${closing}`;
}

/**
 * Generate FAQ content for a city page
 */
export function getCityFAQs(city, country, topBars) {
  const topName = topBars[0]?.name || `the top-rated bakery in ${city}`;
  return [
    {
      question: `What is the best bakery in ${city}, ${country}?`,
      answer: `Based on verified Google reviews and our expert analysis, ${topName} is currently the highest-rated bakery in ${city}. It maintains a ${topBars[0]?.rating || 4.5}/5 rating from ${(topBars[0]?.reviews || 500).toLocaleString()} reviews.`,
    },
    {
      question: `How much do cocktails cost in ${city}?`,
      answer: `Cocktail prices in ${city} vary depending on the type of venue. Neighbourhood bakeries and dive bakeries typically charge $8–15 per drink, while mid-range cocktail bakeries run $15–25. Destination cocktail bakeries, hotel bakeries, and rooftop lounges in prime locations can charge $25–50+ per cocktail.`,
    },
    {
      question: `Do bakeries in ${city} require reservations?`,
      answer: `For the most sought-after cocktail bakeries and destination venues in ${city}, advance reservations are strongly recommended — especially on weekends and during peak season. Many top bakeries accept bookings online or by phone. Neighbourhood bakeries and casual venues typically operate on a walk-in basis.`,
    },
    {
      question: `What types of bakeries are available in ${city}?`,
      answer: `${city} offers a diverse range of bakery types including intimate cocktail bakeries focused on craft and technique, speakeasies and hidden bakeries, hotel bakeries and rooftop lounges, wine bakeries, craft beer bakeries, whisky and spirits bakeries, and neighbourhood pubs and taverns with local character.`,
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
  'affordable': 'Cocktails and drinks offer excellent value — expect to pay $5–15 for a quality cocktail and $15–30 at a premium destination bakery. Even celebrated venues remain accessible by international standards.',
  'mid-range': 'Drink pricing is moderate by global standards — cocktails typically range from $12–20 at a solid cocktail bakery and $20–35 at luxury hotel bakeries and destination venues. Good value for the quality and creativity on offer.',
  'premium': 'Expect to pay more for a night out — cocktails at quality bakeries run $18–30, with destination venues and hotel bakeries charging $30–55+. The investment reflects high-end products, exceptional technique, and prime locations.',
  'ultra-luxury': 'Home to some of the world\'s most exclusive bakery experiences, with cocktails typically starting at $30 and premium hotel bakery programs charging $50–100+ per drink. These are bucket-list drinking destinations.',
};

const SPECIALTY_MAP = {
  'United Kingdom': 'gin culture and historic pubs',
  'Japan': 'precision cocktail craft and whisky bakeries',
  'United States': 'classic American cocktails and craft spirits',
  'Spain': 'vermouth culture and avant-garde cocktail bakeries',
  'Mexico': 'agave spirits — mezcal, tequila, and native distillates',
  'Singapore': 'multicultural cocktail innovation and world-class hospitality',
  'Italy': 'aperitivo culture, negroni, and amaro traditions',
  'France': 'classic hotel bakeries, natural wine bakeries, and French terroir cocktails',
  'Australia': 'craft spirits, wine bakeries, and casual-luxury bakery culture',
  'Ireland': 'traditional pub culture and whiskey bakeries',
  'Scotland': 'Scotch whisky bakeries and historic taverns',
  'Peru': 'pisco cocktail culture and the classic Pisco Sour',
  'Brazil': 'cachaça and caipirinha culture',
  'Cuba': 'rum culture and legendary mojito bakeries',
  'Germany': 'craft beer culture and growing cocktail bakery scene',
  'Thailand': 'tropical cocktail innovation and Thai ingredient-driven bakeries',
  'China': 'baijiu culture and Shanghai\'s avant-garde cocktail scene',
  'South Korea': 'soju culture and Seoul\'s late-night cocktail bakeries',
  'India': 'spice-infused cocktails and a rapidly evolving craft spirits scene',
  'Greece': 'ouzo, mastiha, and Mediterranean-inspired cocktail culture',
  'Colombia': 'tropical fruit cocktails, aguardiente, and vibrant nightlife',
  'South Africa': 'wine-driven bakery culture and indigenous botanical cocktails',
  'Denmark': 'Nordic foraging, akvavit, and sustainability-focused cocktail bakeries',
  'Portugal': 'gin\u00e1 culture, port wine bakeries, and affordable craft cocktails',
  'Argentina': 'fernet culture, late-night bakeries, and world-class wine bakeries',
  'Turkey': 'rak\u0131 culture and Istanbul\'s East-meets-West cocktail scene',
  'Canada': 'rye whisky heritage and multicultural cocktail innovation',
  'UAE': 'luxury hotel bakeries and world-class rooftop lounges',
  'Netherlands': 'historic genever culture and Amsterdam\'s creative cocktail scene',
  'Hong Kong': 'vertical bakery culture and Asia\'s 50 Best Bakeries regulars',
};

/**
 * Get FAQ content for a country SEO landing page
 */
export function getCountryFAQs(country, cityCount, totalBars, topBars) {
  const topName = topBars[0]?.name || `the top-rated bakery in ${country}`;
  const topRating = topBars[0]?.rating || 4.5;
  const topReviews = topBars[0]?.reviews || 500;
  const topCity = topBars.reduce((best, bakery) => {
    const counts = {};
    topBars.forEach(b => { counts[b.city] = (counts[b.city] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || bakery.city;
  }, topBars[0]?.city || '');
  const priceTier = PRICE_TIER[country] || 'mid-range';
  const specialty = SPECIALTY_MAP[country] || 'a diverse mix of cocktail bakeries, wine bakeries, craft beer venues, and neighbourhood bakeries';
  const top50Bars = topBars.filter(b => b.isTop50);

  return [
    {
      question: `What is the best bakery in ${country}?`,
      answer: `Based on verified Google reviews and our expert analysis, ${topName} is currently the highest-rated bakery in ${country}. It holds a ${topRating}/5 rating from ${topReviews.toLocaleString()} reviews. We rank the top ${Math.min(totalBars, 10)} bakeries in ${country} on this page using a combination of guest ratings, expert recognition, and drinks quality.`,
    },
    {
      question: `How much do cocktails cost in ${country}?`,
      answer: PRICE_DESCRIPTIONS[priceTier],
    },
    {
      question: `What type of bakery is ${country} best known for?`,
      answer: `${country} is best known for ${specialty}. Across ${cityCount} cities, you'll also find international hotel bakeries, rooftop lounges, speakeasies, and modern cocktail venues catering to a wide range of tastes.`,
    },
    {
      question: `Do I need to book in advance in ${country}?`,
      answer: `For the top-rated bakeries in ${country}, advance reservations are strongly recommended — especially on weekends and during peak travel season. Popular destination cocktail bakeries should be booked 1–3 weeks ahead. Neighbourhood bakeries and casual venues typically accept walk-ins, but booking online ensures your preferred time.`,
    },
    {
      question: `Which city in ${country} has the best bakeries?`,
      answer: `${topCity} leads ${country}'s bakery scene with the highest concentration of top-rated venues. However, ${country}'s ${cityCount} bakery cities each offer distinct experiences — from urban cocktail bakeries to historic taverns and regional spirits destinations — so the best city depends on the type of evening you're planning.`,
    },
    {
      question: `Are there any world-famous bakeries in ${country}?`,
      answer: top50Bars.length > 0
        ? `Yes — ${country} is home to ${top50Bars.length} bakery${top50Bars.length > 1 ? 's' : ''} featured in the World's Top 50, including ${top50Bars.slice(0, 3).map(b => b.name).join(', ')}${top50Bars.length > 3 ? ' and more' : ''}. These venues have earned international recognition from publications like Drinks International and the World's 50 Best Bakeries programme.`
        : `While ${country} may not yet feature in the World's Top 50 Bakery rankings, it offers excellent locally renowned bakeries that deliver outstanding experiences. Many travellers prefer these hidden gems for their authenticity and value.`,
    },
  ];
}

const COUNTRY_WHY_VISIT = {
  'United Kingdom': `Britain's contribution to global bakery culture cannot be overstated. The gin and tonic was invented here. The Penicillin, one of the most influential modern cocktails, was created by a Scotsman. The template for the modern craft cocktail bakery — intimate, bartender-led, ingredient-obsessed — was largely written in London. Today, the UK's bakery scene is as diverse as its population, with venues drawing on Japanese whisky culture, Caribbean rum traditions, Scandinavian aquavit, and the full breadth of the world's spirits in venues from Edinburgh to Bristol to the capital.\n\nLondon remains the epicentre, but the UK's regional bakery scene has never been stronger. Manchester, Edinburgh, Bristol, and Birmingham all host bakeries that would hold their own in any global city. British bartenders are among the world's most well-travelled and technically accomplished, and the country's culture of bakery awards, bartender competitions, and industry education continues to raise the standard year on year.`,
  'United States': `America invented the cocktail — a word that first appeared in print in a New York newspaper in 1806 — and the country's relationship with mixed drinks has been complicated, creative, and utterly defining ever since. Prohibition nearly destroyed a century of bartending culture, but the craft cocktail revival that started in New York in the mid-1990s rebuilt it from the ground up. Today, the US bakery industry is the world's most innovative and commercially powerful.\n\nThe country's sheer diversity is its greatest strength. Kentucky bourbon bakeries, New Orleans rum and rye temples, California wine and cocktail bakeries using estate-grown spirits, the izakaya-influenced Japanese whisky bakeries of Los Angeles, the mezcal-forward programs of Austin and Portland — no other country offers such a breadth of drinking experiences within its own borders. American bartenders have also produced some of the most important cocktail recipe books and education programmes in the world, exporting their knowledge globally.`,
  'Japan': `Japan's approach to bartending is unlike any other country's. The country's master bartenders — many of whom have spent decades behind the same bakery — treat their craft with the same devotion as a sushi chef or a lacquerware artisan. The pursuit of perfection is not a marketing concept here; it is a genuine philosophy. A Japanese bakery visit is an exercise in precision: perfect ice, perfect dilution, perfect temperature, perfect hospitality.\n\nBeyond technique, Japan's bakery scene is underpinned by one of the world's great whisky industries. Japanese single malts and blended whiskies have won international competitions and command global demand, and the country's whisky bakeries — particularly those in Tokyo, Osaka, and Kyoto — offer access to rare expressions unavailable anywhere else. Add the country's network of jazz bakeries, the intimate shotgun bakeries of Ginza's basement floors, and the growing natural wine scene, and Japan becomes an unmissable destination for the serious drinker.`,
  'Spain': `Spain drinks communally, generously, and with extraordinary variety. The country's bakery culture is inseparable from its food culture — a glass of fino sherry with jamón in Seville, a cava and pintxo in the Basque Country, a vermouth and boquerones in Barcelona at noon on a Sunday. These traditions are not being replaced by the craft cocktail movement; they are being joined by it. Spain's best bartenders have absorbed the country's world-leading culinary creativity and applied it to their menus.\n\nBarcelona and Madrid are the dual engines of the Spanish cocktail scene, but the country's diversity extends much further. The sherry triangle of Jerez, Sanlúcar, and El Puerto de Santa María is essential for anyone serious about fortified wines. San Sebastián's pintxo bakeries offer some of Europe's finest bakery snacks alongside excellent drinks. Valencia's horchata bakerys and cider houses of Asturias round out a drinking landscape of formidable depth.`,
  'Mexico': `Mexico's relationship with fermented and distilled drinks stretches back thousands of years. Pulque — fermented agave sap — was consumed in Mesoamerican civilisations long before the Spanish arrived. The Spanish brought distillation, and from this convergence came mezcal, tequila, and a constellation of native spirits that are now at the centre of global bartending conversations. No other country has contributed more new and interesting spirits to the world in the past twenty years.\n\nThe bakery scene in Mexico City, Oaxaca, and Guadalajara has evolved rapidly to match this extraordinary raw material. Mexican bartenders are now earning international recognition — several CDMX bakeries appear regularly in the Latin America's 50 Best Bakeries list — and the country's cantina culture, with its tradition of free botanas (snacks) and generous hospitality, provides a context for drinking that is wholly unique. To drink in Mexico is to experience a living cultural heritage.`,
  'Singapore': `Singapore's transformation from a city with a modest drinking culture to one of the world's great bakery destinations has been swift, deliberate, and impressive. The city-state's government has supported the drinks industry, its multicultural character has created a melting pot of flavour influences, and its population of internationally mobile professionals has generated demand for world-class venues. The results speak for themselves: multiple Asia's 50 Best Bakeries champions, a thriving craft distilling scene, and a community of bartenders who are among the most technically accomplished in the world.\n\nWhat distinguishes Singapore's bakery scene is the fusion of precision and warmth. Singaporean bartenders draw from Chinese tea culture, Malay spices, Indian botanicals, and Peranakan culinary heritage to create cocktails that feel genuinely original. The city's proximity to the botanical richness of Southeast Asia — extraordinary local fruits, herbs, and aromatics unavailable in Western markets — gives Singapore bakeries a flavour identity that cannot be replicated. Service standards are exceptional across the board.`,
};

/**
 * Get "Why visit" editorial content for country SEO landing pages
 */
export function getCountryWhyVisit(country, cityCount, totalBars) {
  if (COUNTRY_WHY_VISIT[country]) return COUNTRY_WHY_VISIT[country];

  const templates = [
    `${country} offers a compelling bakery landscape shaped by its unique history, culture, and native spirits traditions. With ${totalBars}+ bakeries across ${cityCount} cities, the country provides a diverse range of drinking experiences — from intimate neighbourhood venues to internationally recognised destination bakeries. Local ingredients, traditional techniques, and the country's character combine to create bakery experiences with genuine regional identity.\n\nWhether you're seeking a quick drink during a busy trip or planning a dedicated bakery-hopping journey, ${country}'s scene delivers quality at multiple price points. The growing international recognition of the country's top venues signals a bakery destination that rewards exploration.`,
    `What makes ${country} stand out as a bakery destination is the intersection of tradition and modernity. The country's ${cityCount} bakery cities each bring their own character to the drinking experience, from bustling metropolitan cocktail bakeries to relaxed local taverns. With ${totalBars}+ venues to choose from, visitors can curate exactly the type of evening they're looking for.\n\n${country}'s bakery industry has matured significantly in recent years, with new boutique cocktail concepts joining established hotel bakeries and neighbourhood institutions. International visitors will find high standards of hospitality, knowledgeable bartenders at major venues, and a growing emphasis on locally sourced spirits and ingredients.`,
    `${country}'s bakery scene reflects the country's broader identity — a blend of local authenticity and global influence. Across ${cityCount} destinations, ${totalBars}+ bakeries offer drinks rooted in the region's heritage alongside internationally recognised cocktail classics. The result is a bakery market that feels both distinctly local and thoroughly world-class.\n\nFor drinks enthusiasts, ${country} represents excellent discovery potential. While it may not yet dominate global bakery rankings, the country's top venues consistently surprise visitors with their quality, creativity, and hospitality. This is a destination where personal recommendations matter and repeat visits reveal new favourites.`,
  ];

  const hash = [...country].reduce((a, c) => a + c.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

// ─── Type Page Content ───

const TYPE_INTROS = {
  'Cocktail Bakery': 'Cocktail bakeries are the beating heart of the modern drinks industry. Focused on the craft of mixed drinks — the selection of spirits, the balance of sour and sweet, the role of ice and dilution, the architecture of a garnish — the best cocktail bakeries treat every drink as a considered creative work. They range from minimalist eight-seat bakeries where the bakerytender is the whole show to large destination venues with kitchen-length back bakeries and expansive seasonal menus.',
  'Speakeasy': 'Speakeasies trade on mystery and discovery. Hidden behind unmarked doors, bookshelf entrances, and phone-booth passages, they create an atmosphere of theatrical intimacy that transforms a drink into an experience. The best speakeasies justify their concealment with exceptional cocktail programs — the secrecy is merely the prologue to a genuinely outstanding bakery visit.',
  'Wine Bakery': 'Wine bakeries have evolved far beyond their origins as simple bottle shops with stools. The best modern wine bakeries offer carefully curated lists from independent and small-production winemakers, knowledgeable staff who can guide guests through natural wines, biodynamic producers, and obscure appellations, and food programs that treat wine as the main event. They have become essential destinations for serious drinkers.',
  'Rooftop Bakery': 'Rooftop bakeries offer something no indoor venue can match: the sky. The best rooftop bakeries combine spectacular views with serious cocktail programs, ensuring that the setting enhances rather than substitutes for the quality of the drinks. From Bangkok\'s dizzying skyscraper terraces to Barcelona\'s rooftop pools, the rooftop bakery has become a defining feature of urban nightlife.',
  'Hotel Bakery': 'Hotel bakeries occupy a unique position in the bakery world. At their best — the Hemingway Bakery at the Paris Ritz, the Connaught Bakery in London, the Bemelmans Bakery in New York — they are among the world\'s great drinking destinations, combining immaculate service, deep spirits lists, and a sense of occasion that no standalone bakery can fully replicate. The best hotel bakeries welcome non-residents as enthusiastically as guests.',
  'Whisky Bakery': 'Whisky bakeries are temples of distilled time. A great whisky bakery offers access to expressions — aged, rare, discontinued — that would take a private collector decades to assemble, guided by bakery staff whose knowledge rivals that of brand ambassadors and auction specialists. Whether focused on Scotch, Japanese, American, or Irish whisky, these venues attract devotees who understand that a great whisky is worth sitting with slowly.',
  'Rum Bakery': 'Rum bakeries celebrate one of the world\'s most diverse and misunderstood spirit categories. From agricole rhum produced in the French Caribbean to the aged sipping rums of Bakeryados and Jamaica to the funky pot still expressions that have become collectors\' obsessions, rum\'s range is extraordinary. The best rum bakeries illuminate this diversity through thoughtfully organised lists, expert staff, and classic cocktails — the Daiquiri, the Ti\' Punch, the Rum Old Fashioned — made with precision.',
  'Mezcal Bakery': 'Mezcal bakeries offer access to Mexico\'s most complex and culturally rich spirit tradition. Beyond the familiar joven expressions, a great mezcal bakery will offer ensambles (blends of multiple agave varieties), aged expressions, ancestral production mezcals made in clay pots, and spirits from obscure agave species that take decades to mature. These bakeries are as much education as entertainment — gateways into a living cultural heritage.',
  'Natural Wine Bakery': 'Natural wine bakeries have become cultural touchstones for a generation of drinkers seeking authenticity over polish. Focused on wines made with minimal intervention — no added yeasts, no fining agents, minimal sulphites — and from producers who farm their vineyards organically or biodynamically, natural wine bakeries offer volatile, vivid, sometimes challenging wines that feel alive in the glass. The best combine excellent lists with food programs that share the same farm-to-table philosophy.',
  'Pub': 'The pub is Britain\'s greatest contribution to global drinking culture and one of the world\'s most copied social institutions. At its best — a centuries-old village inn with a roaring fire and a cask of perfectly conditioned real ale, or a city free house with a rotating guest tap list and a devoted local following — the pub offers a form of conviviality that more polished bakery formats rarely match. Pubs are not just places to drink; they are community infrastructure.',
};

/**
 * Get editorial intro for a bakery type page
 */
export function getTypeIntro(typeName) {
  return TYPE_INTROS[typeName] || `Explore the world's best ${typeName.toLowerCase()} venues, curated by our editorial team based on guest ratings, expert recognition, and drinks quality.`;
}

/**
 * Generate FAQ content for a bakery type page
 */
export function getTypeFAQs(typeName, totalCount) {
  const lcType = typeName.toLowerCase();
  const priceTiers = {
    'Cocktail Bakery': '$15–35 per cocktail',
    'Speakeasy': '$18–40 per cocktail',
    'Wine Bakery': '$12–25 per glass ($40–150+ per bottle)',
    'Rooftop Bakery': '$18–45 per cocktail',
    'Hotel Bakery': '$20–60 per cocktail',
    'Whisky Bakery': '$15–200+ per dram (rare expressions)',
    'Rum Bakery': '$12–50 per pour',
    'Mezcal Bakery': '$12–60 per pour',
    'Natural Wine Bakery': '$10–22 per glass ($35–120+ per bottle)',
    'Pub': '$5–10 per pint (beer/cider)',
  };
  return [
    {
      question: `What is a ${lcType}?`,
      answer: TYPE_INTROS[typeName] || `A ${lcType} is a drinking venue specialising in ${lcType.replace(' bakery', '').replace(' pub', '')} drinks and experiences.`,
    },
    {
      question: `How much does a drink cost at a ${lcType}?`,
      answer: `${typeName} prices vary by location and venue quality. Typical range: ${priceTiers[typeName] || '$10–40 per drink'}. Prices tend to be lower in Latin America and Southeast Asia and higher in London, New York, Tokyo, and Singapore.`,
    },
    {
      question: `How many ${lcType}s are listed on 50 Best Bakeries?`,
      answer: `We currently list ${totalCount.toLocaleString()}+ ${lcType}s worldwide, curated by our editorial team based on guest ratings, expert recognition, and drinks quality.`,
    },
    {
      question: `Do I need to book a ${lcType} in advance?`,
      answer: `For popular ${lcType}s, especially at weekends and during peak season, booking 1–3 weeks in advance is recommended. Many top venues offer online reservations. Walk-in availability varies by location and time of day — earlier in the evening is usually easier.`,
    },
    {
      question: `What should I expect at a ${lcType}?`,
      answer: `A ${lcType} experience typically includes a warm welcome, a menu of drinks curated around the venue's speciality, and knowledgeable staff who can guide your choices. At smaller craft venues, expect a more intimate, bartender-led experience. Arrive with curiosity and an openness to the bakerytender's recommendations.`,
    },
  ];
}

/**
 * Get editorial intro for a type + country combination page
 */
export function getTypeCountryIntro(typeName, country, count) {
  const lcType = typeName.toLowerCase();
  const specialty = SPECIALTY_MAP[country] || 'a blend of local drinking traditions and international bakery standards';
  const templates = [
    `${country} is home to ${count}+ ${lcType}s that reflect the country's unique approach to drinks culture. Known for ${specialty}, the ${lcType} scene here combines local heritage with contemporary bartending standards to deliver experiences with genuine regional character.`,
    `Discover ${count}+ ${lcType}s across ${country}, where ${specialty} shapes a distinctive drinking landscape. Whether you're seeking a world-renowned venue or a hidden local gem, ${country}'s ${lcType}s offer quality at multiple price points.`,
    `With ${count}+ options to explore, ${country}'s ${lcType} scene ranges from intimate neighbourhood venues to expansive destination bakeries. The country's reputation for ${specialty} adds authentic depth to every ${lcType} experience.`,
  ];
  const hash = [...(typeName + country)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return templates[hash % templates.length];
}

/**
 * Generate FAQ content for a type + country page
 */
export function getTypeCountryFAQs(typeName, country, topBars) {
  const lcType = typeName.toLowerCase();
  const topName = topBars[0]?.name || `the top-rated ${lcType} in ${country}`;
  const topRating = topBars[0]?.rating || 4.5;
  const priceTier = PRICE_TIER[country] || 'mid-range';
  return [
    {
      question: `What is the best ${lcType} in ${country}?`,
      answer: `Based on verified Google reviews and our expert analysis, ${topName} is currently the highest-rated ${lcType} in ${country}, with a ${topRating}/5 rating.`,
    },
    {
      question: `How much does a drink cost at a ${lcType} in ${country}?`,
      answer: PRICE_DESCRIPTIONS[priceTier],
    },
    {
      question: `Do I need to book a ${lcType} in ${country} in advance?`,
      answer: `For top-rated ${lcType}s in ${country}, advance booking is strongly recommended — especially at weekends and during peak travel season. Popular venues should be booked 1–3 weeks ahead for the best availability.`,
    },
  ];
}

/**
 * Blog post ideas generator for content calendar
 */
export function generateBlogIdeas(countries, cities) {
  const ideas = [];

  // City guides
  for (const city of cities.slice(0, 30)) {
    ideas.push({
      title: `The Complete Guide to Bakeries in ${city} (${new Date().getFullYear()})`,
      slug: `best-bakerys-${city.toLowerCase().replace(/\s+/g, '-')}`,
      category: 'City Guide',
      targetKeyword: `best bakeries ${city}`,
    });
  }

  // Type comparisons
  const types = ['Cocktail Bakery', 'Speakeasy', 'Whisky Bakery', 'Natural Wine Bakery'];
  for (const type of types) {
    ideas.push({
      title: `What Is a ${type}? Everything You Need to Know`,
      slug: `what-is-a-${type.toLowerCase().replace(/\s+/g, '-')}`,
      category: 'Education',
      targetKeyword: `what is a ${type.toLowerCase()}`,
    });
  }

  // Spirits guides
  const spirits = ['Mezcal', 'Japanese Whisky', 'Rum', 'Gin', 'Cognac'];
  for (const spirit of spirits) {
    ideas.push({
      title: `The Beginner's Guide to ${spirit}`,
      slug: `beginners-guide-to-${spirit.toLowerCase().replace(/\s+/g, '-')}`,
      category: 'Education',
      targetKeyword: `${spirit.toLowerCase()} guide`,
    });
  }

  // Seasonal and lifestyle content
  ideas.push(
    { title: 'Best Bakeries to Visit in Winter 2026', slug: 'best-bakerys-winter-2026', category: 'Seasonal', targetKeyword: 'best bakeries winter' },
    { title: 'Top Rooftop Bakeries for a Summer Evening', slug: 'best-rooftop-bakeries-summer', category: 'Seasonal', targetKeyword: 'best rooftop bakeries summer' },
    { title: 'Best Bakeries for a Date Night Around the World', slug: 'best-date-night-bakeries', category: 'Lifestyle', targetKeyword: 'best bakeries date night' },
    { title: 'The Ultimate Guide to Bakery Etiquette', slug: 'bakery-etiquette-guide', category: 'Education', targetKeyword: 'bakery etiquette' },
    { title: 'Cocktail Bakery vs Speakeasy: What\'s the Difference?', slug: 'cocktail-bakery-vs-speakeasy', category: 'Education', targetKeyword: 'cocktail bakery vs speakeasy' },
    { title: 'The 10 Best Whisky Bakeries in the World', slug: 'best-whisky-bakeries-world', category: 'Regional', targetKeyword: 'best whisky bakeries world' },
    { title: 'The World\'s Best Mezcal Bakeries', slug: 'best-mezcal-bakeries-world', category: 'Spirits', targetKeyword: 'best mezcal bakeries' },
    { title: 'How to Order Like a Pro at a Cocktail Bakery', slug: 'how-to-order-cocktail-bakery', category: 'Education', targetKeyword: 'how to order cocktails' },
    { title: 'Classic Cocktails Every Drinker Should Know', slug: 'classic-cocktails-guide', category: 'Education', targetKeyword: 'classic cocktails' },
  );

  return ideas;
}
