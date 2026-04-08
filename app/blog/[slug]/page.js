// app/blog/[slug]/page.js
// Blog post page — for content marketing SEO

import { notFound } from 'next/navigation';
import { JsonLd } from '../../../lib/schema';
import { articleSchema, breadcrumbSchema, faqSchema } from '../../../lib/schema';
import ShareButton from '../../../components/ShareButton';

const POSTS = {
  'bakery-snacks-around-the-world': {
    title: 'Bakery Snacks Around the World — From Pintxos to Izakaya Nibbles',
    description: 'A tour of the world\'s greatest bakery snack traditions, from Basque pintxos to Japanese izakaya small plates.',
    publishedDate: '2025-12-01',
    modifiedDate: '2026-01-15',
    category: 'Destinations',
    readTime: '7 min read',
    content: `
      <h2>Why Bakery Food Matters</h2>
      <p>The relationship between a drink and the food beside it is one of the oldest and most pleasurable pairings in human culture. Bakery snacks are not an afterthought — in the world's great drinking cultures, they are integral to the experience. The right nibble slows your drinking, opens your palate, anchors the flavors in your glass, and transforms a quick drink into an evening. Understanding the snack traditions of different countries is a surprisingly rich way to understand those cultures' relationship with drinking itself.</p>

      <h2>Pintxos — The Basque Country</h2>
      <p>In the bakerys of San Sebastián and Bilbao, the counter is a theatre of small bites. Pintxos (pronounced "pinchos") are typically slices of bread topped with combinations of ingredients — anchovies and olives, crab mayonnaise, foie gras — often held together with a toothpick. The etiquette is simple: you take what you want from the counter, keep your toothpicks, and pay by the count at the end. Bakeries refresh their pintxos throughout the evening, and the competition between establishments is fierce. Pairing them with a cold glass of txakoli — a local sparkling white wine poured from a height — is one of the purest pleasures in European bakery culture.</p>

      <h2>Tapas — Spain</h2>
      <p>The word "tapa" means lid, and the original concept was a slice of bread or ham placed over a glass of sherry to keep flies out. Today, Spanish tapas culture varies enormously by region. In Granada, tapas are still given free with each drink — a tradition that draws visitors from across the country. In Madrid, patatas bravas (fried potatoes with spicy sauce) and jamón ibérico are staples. The point of tapas is sociability: you order several small dishes, share them, and the conversation flows as naturally as the wine.</p>

      <h2>Izakaya Small Plates — Japan</h2>
      <p>The Japanese izakaya is one of the world's great bakery institutions — an informal drinking establishment where food is just as important as the drink. Edamame arrives first, almost automatically, as you settle in. What follows might be chicken skewers (yakitori) from a charcoal grill, cold tofu with ginger and soy, sashimi, karaage fried chicken, or grilled fish collar. The food at an izakaya is designed to complement Japanese whisky highballs, cold Sapporo, or warm sake. Nothing is elaborate; everything is precise and satisfying.</p>

      <h2>Olives, Almonds, and Mezze — Mediterranean and Middle East</h2>
      <p>Across the Mediterranean, bakery snacks default to the honest and the elemental: a bowl of warm mixed olives with herbs and orange zest, salted almonds, slices of manchego cheese, or a small plate of hummus with flatbread. In Lebanese and Turkish bakeries, the mezze tradition expands into a meal — stuffed vine leaves, tabbouleh, baba ganoush, and kibbeh arrive in small plates designed for sharing. These are drinking cultures where food and alcohol exist in genuine harmony, each enhancing the other.</p>

      <h2>Crisps and Pork Scratchings — The British Pub</h2>
      <p>The British pub snack is modest by Mediterranean standards but perfectly calibrated. A bag of salt-and-vinegar crisps, a packet of dry roasted peanuts, or a portion of pork scratchings — the crunchy, fatty, sometimes bristly fried pork rind that is genuinely an acquired taste — pair with a pint of bitter or pale ale in a way that feels ancient and right. In recent years, the gastro-pub movement has elevated pub food to serious heights, but the best traditional boozers maintain the simple joy of a bag of Walkers and a cold pint.</p>

      <h2>Oysters and Champagne — Classic Hotel Bakeries</h2>
      <p>Few pairings are more classically bakery-appropriate than a half-dozen oysters and a glass of Champagne or Chablis. The minerality of a good oyster mirrors the chalk and limestone notes of Premier Cru Chablis; the bubbles of Champagne cut through the brine. This pairing exists in the most glamorous hotel bakeries in the world — the Connaught in London, the Ritz Paris, the St. Regis in New York — and it has never gone out of style because it is genuinely perfect.</p>

      <h2>Nachos and Loaded Fries — American Dive Bakeries</h2>
      <p>America's contribution to bakery food culture is unapologetically indulgent. Nachos piled with cheese, jalapeños, sour cream, and guacamole. Loaded fries with pulled pork and coleslaw. Chicken wings in buffalo sauce. These are not dishes designed for subtlety — they're designed to fuel a long night and complement cheap cold beer. At their best, in the right dive bakery with the right crowd and the right jukebox, they're as satisfying as any pintxos in San Sebastián.</p>
    `,
  },
  'non-alcoholic-cocktail-bakeries': {
    title: 'Non-Alcoholic Cocktail Bakeries — The Best Zero-Proof Experiences',
    description: 'The no-and-low movement has produced some genuinely extraordinary bakeries. Here\'s what to expect and where to go.',
    publishedDate: '2025-11-15',
    modifiedDate: '2026-01-10',
    category: 'Industry',
    readTime: '6 min read',
    content: `
      <h2>The Rise of the Sober-Curious Bakery</h2>
      <p>A decade ago, ordering a non-alcoholic drink at a serious cocktail bakery meant choosing between soda water and orange juice. Today, dedicated zero-proof bakeries have opened in New York, London, Copenhagen, and Los Angeles, offering menus that rival the complexity and craft of the best cocktail programs anywhere. This shift reflects a genuine cultural change: the sober-curious movement, Dry January, and a generation of younger drinkers who want sophisticated experiences without the alcohol.</p>

      <h2>What Makes a Great Zero-Proof Cocktail</h2>
      <p>The challenge of non-alcoholic cocktail-making is not simply removing alcohol — it's replacing what alcohol contributes: body, warmth, mouthfeel, bitterness, and the way it carries aromatic compounds. The best zero-proof bartenders solve this through adaptogens (herbs like ashwagandha and lion's mane that add complexity), fermented beverages (kombucha, kefir, tepache), sophisticated shrubs and vinegar cordials, verjuice, and non-alcoholic spirits like Seedlip, Lyre's, and CleanCo that mimic the botanical profiles of gin, rum, and whisky.</p>

      <h2>Atmosphere Without Alcohol</h2>
      <p>What sober-curious drinkers consistently report is that they miss not the alcohol itself but the ritual and social permission that comes with a proper bakery experience. The best zero-proof bakeries understand this: they invest in the full atmosphere — dim lighting, expert bartenders in proper attire, thoughtfully designed glassware, unhurried service, and menus that demand genuine engagement. When the experience is right, the absence of alcohol is genuinely unnoticeable.</p>

      <h2>Notable Zero-Proof Bakeries</h2>
      <p>Sober in London was one of the first dedicated alcohol-free cocktail bakeries in Europe, offering a full spirits-free menu in a space indistinguishable from a premium cocktail bakery. Getaway in Brooklyn offers an ambitious zero-proof program in a neighborhood setting. Redemption in London's Notting Hill has been serving alcohol-free cocktails since 2013 and remains a benchmark. Many of the world's best cocktail bakeries now offer equally thoughtful zero-proof menus alongside their alcoholic programs — Dandelyan (now Lyaness) in London and Attaboy in New York were early leaders in this space.</p>

      <h2>The Future of No-and-Low</h2>
      <p>The no-and-low alcohol market is the fastest-growing segment of the global drinks industry. Major spirits companies have launched non-alcoholic expressions of their flagship products. Premium tonic water brands now offer alcohol-free cocktail mixers. This is not a passing trend — it reflects a permanent shift in how younger consumers relate to drinking culture. The bakeries that embrace this shift and invest in genuinely excellent zero-proof programs will be best positioned for the next decade of hospitality.</p>
    `,
  },
  'best-cocktail-bakeries-in-the-world': {
    title: 'The Best Cocktail Bakeries in the World Right Now',
    description: 'From Tokyo\'s meticulous craft to London\'s historic hotel bakeries, a guide to the cocktail bakeries that define the global scene.',
    publishedDate: '2026-02-13',
    modifiedDate: '2026-03-01',
    category: 'Industry',
    readTime: '8 min read',
    content: `
      <h2>What Defines a World-Class Cocktail Bakery</h2>
      <p>The world's best cocktail bakeries share certain qualities that transcend geography and style. Technical precision — the ability to execute a perfect martini, a balanced Negroni, or a complex original creation — is the floor, not the ceiling. Great bakeries layer technique with a genuine point of view: a coherent aesthetic, a defined sense of place, a menu that tells a story. Service is unhurried and knowledgeable without being pretentious. The atmosphere is considered — lighting, music, seating, the temperature of the room. And the best bakeries understand that hospitality is ultimately about making people feel at ease and celebrated.</p>

      <h2>Tokyo — The Standard for Craft</h2>
      <p>No city takes the art of the cocktail more seriously than Tokyo. Bakery High Five in Ginza, run by master bartender Hidetsugu Ueno, represents the pinnacle of Japanese cocktail culture: impeccable technique, extraordinarily precise ice-carving, and a philosophy of reading the guest to create a bespoke drink. Star Bakery Ginza, founded by Hisashi Kishi, is another pilgrimage destination — Kishi literally wrote the book on Japanese cocktail technique. What sets Tokyo's bakery scene apart is the concept of "shokunin" — the artisan dedicated to a craft for life. The best Tokyo bartenders have spent decades perfecting a relatively small repertoire of drinks, and the results are extraordinary.</p>

      <h2>London — Where Tradition Meets Innovation</h2>
      <p>London's cocktail scene is one of the world's most diverse. The American Bakery at the Savoy, which opened in 1893, is perhaps the most historically significant cocktail bakery on the planet — Ada Coleman created the Hanky Panky here, and Harry Craddock wrote The Savoy Cocktail Book in 1930. Today the Savoy maintains its standard while newer establishments push the boundaries. The Connaught Bakery, led for many years by Ago Perrone, refined the martini trolley service into a genuine ritual. Lyaness, the successor to the legendary Dandelyan, continues to produce conceptually ambitious menus that treat each cocktail as a meditation on a single ingredient or idea.</p>

      <h2>New York — The Craft Cocktail Birthplace</h2>
      <p>New York's Milk and Honey, opened by Sasha Petraske in 1999, is widely credited with launching the modern craft cocktail revival. The original speakeasy format — a phone number whispered between friends, no sign on the door, precise drinks made with fresh juice and hand-cut ice — established a template that has been replicated across the world. Attaboy, run by Petraske's former colleagues in the same space, continues to operate without a printed menu, making drinks entirely to the guest's tastes. Dead Rabbit in the Financial District has won the World's Best Bakery award multiple times and remains a reference point for the combination of historical research, Irish heritage, and exceptional execution.</p>

      <h2>Barcelona and the Spanish Cocktail Scene</h2>
      <p>Barcelona's cocktail bakery culture is centered around a particular aesthetic: dark wood, aged spirits, and a reverence for the classics executed with Mediterranean flair. Dry Martini on Carrer d'Aribau has been serving impeccably made martinis since 1978 and has spawned a small empire. The Boadas Cocktail Bakery, opened in 1933, continues to make daiquiris and sidecars to time-honored recipes. More recently, the city's newer wave of bakeries — Paradiso, hidden behind a pastrami bakery, and Sips, which has appeared multiple times on the World's 50 Best Bakeries list — represent a contemporary Spanish confidence that combines global technique with local ingredients.</p>

      <h2>Melbourne and Sydney — The Southern Hemisphere's Rise</h2>
      <p>Australia has emerged as one of the world's most significant cocktail markets. Melbourne's Eau de Vie and Sydney's Bulletin Place have produced bartenders who now work at the highest levels globally. The Australian approach combines American craft cocktail principles with a particular openness to native ingredients — lemon myrtle, finger lime, wattleseed, and Davidson plum appear in original cocktails that could exist nowhere else. Sydney's Baxter Inn, a whisky-focused basement bakery that has repeatedly appeared on best-bakery lists, represents the Australian talent for creating genuine warmth of hospitality alongside exceptional product knowledge.</p>
    `,
  },
  'worlds-50-best-bakerys-guide': {
    title: "World's 50 Best Bakeries — How the List Works and Why It Matters",
    description: "An insider guide to the World's 50 Best Bakeries awards — the methodology, the history, and what the list really means for global bakery culture.",
    publishedDate: '2026-03-03',
    modifiedDate: '2026-03-10',
    category: 'Industry',
    readTime: '7 min read',
    content: `
      <h2>The Origins of the List</h2>
      <p>The World's 50 Best Bakeries was launched in 2009 by Drinks International magazine, modeled on the successful World's 50 Best Restaurants list that had been running since 2002. The inaugural list was dominated by London and New York bakeries, reflecting where the craft cocktail revival was most concentrated at the time. In subsequent years, the list's geographic diversity expanded dramatically — Tokyo, Singapore, Barcelona, Melbourne, and Mexico City all became regular fixtures, and the list became a genuine map of global cocktail culture rather than an Anglo-American conversation.</p>

      <h2>The Methodology</h2>
      <p>The voting academy consists of over 600 drinks professionals from around the world — bartenders, bakery owners, cocktail writers, and industry figures. Each voter casts seven votes, with at least three going to bakeries outside their home region. No voter can vote for their own establishment. The votes are tallied and audited by Deloitte. This methodology has faced criticism: the bakery industry is a relatively small world, and personal relationships between bartenders inevitably influence some votes. The system also tends to favor bakeries that are already well-known because discovery depends on bakeries sending teams to visit and vote. Despite these limitations, the list remains the most widely respected barometer of excellence in the global industry.</p>

      <h2>What the Award Means for a Bakery</h2>
      <p>Appearing on the list transforms a bakery's commercial trajectory. The Connaught Bakery in London reported a 300% increase in reservations following its first appearance. Paradiso in Barcelona became internationally famous overnight. The Dead Rabbit in New York used its World's Best Bakery status to expand into retail spirits and licensed operations. For the bakerytenders who work at these establishments, the recognition opens doors to consulting, brand ambassadorship, and international guest shift opportunities. The list has genuine economic consequences for the bakerys it celebrates.</p>

      <h2>The Debate Around the List</h2>
      <p>No ranking system is without controversy. Critics argue that the 50 Best list favors expensive, reservation-only bakeries that cater to industry insiders rather than the broader drinking public. Others note that bakeries in emerging markets face structural disadvantages — fewer international visitors, less media coverage, and smaller networks of industry connections. The list's administrators have responded by introducing regional awards (Asia's 50 Best Bakeries, North America's 50 Best Bakeries) that allow bakeries to build recognition without competing immediately on the global stage. The debate is healthy and reflects how seriously the industry takes the award's influence.</p>

      <h2>Beyond the Ranking</h2>
      <p>The most valuable aspect of the World's 50 Best Bakeries may not be the ranking itself but the ecosystem it has created. The annual ceremony brings together the world's leading bartenders for a week of guest shifts, panel discussions, and cross-pollination of ideas. Collaborations that began at the awards ceremony have produced new cocktail concepts, spirits projects, and bakery openings. The list functions not just as a competition but as a community-building event for the global bakery industry — and that, more than any individual ranking, is its lasting contribution to cocktail culture.</p>
    `,
  },
  'speakeasy-guide': {
    title: 'The Ultimate Speakeasy Guide — Hidden Bakeries Worth Seeking Out',
    description: 'From New York\'s original Prohibition hideouts to the world\'s best modern speakeasies — a guide to bakeries that reward those who look.',
    publishedDate: '2026-03-01',
    modifiedDate: '2026-03-12',
    category: 'Destinations',
    readTime: '7 min read',
    content: `
      <h2>The Original Speakeasies</h2>
      <p>During American Prohibition (1920–1933), an estimated 30,000 illegal drinking establishments operated in New York City alone. The term "speakeasy" comes from the instruction whispered to customers: "speak easy" — talk quietly, don't attract attention. These underground bakeries ranged from crude basement operations to remarkably sophisticated establishments with jazz bands, full kitchens, and celebrity clientele. The Cotton Club in Harlem, "21" Club on West 52nd Street (which hid its wine cellar behind a secret wall), and the Stork Club were among the most famous. Prohibition also accelerated the careers of the first generation of professional American bartenders, many of whom emigrated to London and Paris and helped establish European cocktail culture.</p>

      <h2>What Makes a Modern Speakeasy</h2>
      <p>Today's speakeasy bakeries borrow the aesthetic of secrecy without the legal risk. The defining characteristics are: no signage or minimal signage at the entrance, a hidden or non-obvious entrance (through a bookcase, a refrigerator door, the back of a phone booth), a reservation system that feels exclusive, and an interior that feels removed from the outside world. The best modern speakeasies justify the theatrical conceit with equally serious cocktail programs — the secret entry is a beginning, not the entire point.</p>

      <h2>New York's Hidden Bakeries</h2>
      <p>Milk and Honey, Sasha Petraske's legendary no-sign bakery on the Lower East Side, established the template for the modern speakeasy revival. Its successor Attaboy operates in the same space and continues the tradition. Please Don't Tell (PDT) in the East Village enters through a phone booth inside a hot dog restaurant; its cocktail program, led for many years by Jim Meehan, is among the most technically accomplished in the city. The Campbell in Grand Central Station occupies a former railroad executive's private reception room that was sealed for decades — its rediscovery and conversion into a bakery is a genuinely romantic story.</p>

      <h2>London's Secret Bakeries</h2>
      <p>London's density of hidden bakeries reflects a culture that has always enjoyed private members clubs and insider knowledge. Nightjar in Shoreditch requires a reservation and descends to a basement that recreates the Prohibition-era cabaret aesthetic, complete with live jazz. Callooh Callay in Shoreditch hides a back bakery called the Jabberwock, accessible through a wardrobe (a nod to C.S. Lewis). Worship Street Whistling Shop occupies a genuine Victorian cellar and serves cocktails informed by Victorian-era recipes and ingredients.</p>

      <h2>Hidden Bakeries Around the World</h2>
      <p>The speakeasy format has proven globally exportable. Paradiso in Barcelona enters through a pastrami bakery and offers some of the most visually spectacular cocktails in Europe. The Clumsies in Athens has a hidden back bakery that rewards curious guests. Employees Only in Singapore replicates the format of its New York original, complete with the fortune-teller who reads your palm in the entrance. Tokyo's Bakery Benfiddich — reached through an unmarked building in Shinjuku — is run by a single bartender who grows his own herbs and creates bespoke cocktails for each guest. The common thread across all of these spaces is the reward of discovery: the sense that you are somewhere not everyone knows about, among people who care enough to seek it out.</p>

      <h2>How to Find Hidden Bakeries</h2>
      <p>The best approach to finding speakeasies is research followed by genuine exploration. Read drinks-focused travel guides for your destination. Ask the bakerytender at whichever bakery you're already in — bartenders know the scene better than any app. Look for unmarked doors, listen for music coming from unexpected directions, notice which building entrances seem suspiciously well-maintained. Some speakeasies require reservations made weeks in advance; others operate first-come, first-served through inconspicuous physical or digital channels. Part of the charm is that the effort required to find them creates a built-in filter for the right kind of guest.</p>
    `,
  },
  'whiskey-bakery-etiquette': {
    title: 'Whiskey Bakery Etiquette — How to Order, Taste, and Savour',
    description: 'Everything you need to know about visiting a serious whiskey bakery — from how to read the menu to how to taste like a professional.',
    publishedDate: '2026-02-28',
    modifiedDate: '2026-03-05',
    category: 'Education',
    readTime: '7 min read',
    content: `
      <h2>Approaching a Whiskey Bakery Menu</h2>
      <p>A serious whiskey bakery menu can be overwhelming. Single malts, blends, bourbons, ryes, Japanese expressions, Irish pot still whiskeys — the categories multiply before you've even begun to look at specific bottles. The first thing to understand is that no one knows everything about whiskey, and the best whiskey bakeries employ staff specifically to help you navigate. Don't be embarrassed to say "I usually drink [X] — what would you recommend that's similar but different?" This is the most useful question you can ask, and any good whiskey bartender will light up at the opportunity to guide you.</p>

      <h2>Ice, Water, and How You Take It</h2>
      <p>The question of how to drink whiskey is genuinely personal and there is no single right answer. A small amount of still water — a few drops — can open up aromas in a high-alcohol Scotch or bourbon that were previously masked. Ice chills the spirit and slows volatility, which reduces the alcohol burn but also reduces the aromatic complexity. A large single cube melts slowly and chills without diluting as rapidly as crushed ice. Whisky on the rocks, neat, or with a dash of water are all legitimate choices. What matters is what you enjoy, not what is theoretically correct.</p>

      <h2>Reading the Room</h2>
      <p>A serious whiskey bakery — particularly a Japanese whisky bakery or a small Scottish malt whisky specialist — operates differently from a cocktail bakery. The pace is slower. Conversations are quieter. The bartender may be engaged in a lengthy explanation of a particular distillery's history with another guest. This atmosphere calls for patience and a certain quietness. You don't need to remain silent, but the best whiskey bakeries reward those who engage with the material rather than those who are simply looking for a quick drink before the next venue.</p>

      <h2>The Art of Tasting</h2>
      <p>When a whiskey bartender sets a pour in front of you, take a moment before you drink. Observe the color — amber, gold, mahogany, straw — which gives clues about cask type and age. Nose it with your mouth slightly open, which reduces the impact of the alcohol and allows aromatic compounds to reach your olfactory system more clearly. Take a small sip and let it coat your entire palate before swallowing. Notice what you taste initially (the "attack"), what develops in the middle (the "mid-palate"), and what lingers after you swallow (the "finish"). You don't need to articulate these experiences in technical language, but attending to them makes every glass more interesting.</p>

      <h2>Ordering a Flight</h2>
      <p>Many whiskey bakeries offer tasting flights — small pours of three to five related expressions arranged for comparison. This is often the most educational and cost-effective way to explore a category. A flight might compare different ages from the same distillery (a 12, 15, and 18-year Glenfarclas, for example), different cask types (ex-bourbon versus sherry-matured), or expressions from different regions (Highland, Speyside, Islay). Tell the bakerytender your experience level and what aspects you're most curious about, and they'll design a flight accordingly.</p>

      <h2>Tipping and Conversation</h2>
      <p>In countries where tipping is customary — primarily the United States — 20% is appropriate at a premium whiskey bakery. In the UK, rounding up or leaving a modest cash tip is appreciated but not obligatory. In Japan, tipping is not part of bakery culture and may even cause mild offence — the proper acknowledgement is a sincere verbal expression of appreciation. Wherever you are, engaging genuinely with the bakerytender's knowledge and passion is itself a form of appreciation. Whiskey bartenders are enthusiasts first, and a curious, attentive guest is its own reward.</p>
    `,
  },
  'best-rooftop-bakeries': {
    title: 'The Best Rooftop Bakeries in the World',
    description: 'Sky-high drinking at its finest — the rooftop bakeries that combine spectacular views with drinks worth the climb.',
    publishedDate: '2026-02-25',
    modifiedDate: '2026-03-08',
    category: 'Destinations',
    readTime: '7 min read',
    content: `
      <h2>What Makes a Great Rooftop Bakery</h2>
      <p>A rooftop bakery lives or dies on the honest quality of its view, and the best ones understand that the view is the beginning of the experience, not the entirety of it. The worst rooftop bakeries use the altitude as an excuse to serve indifferent cocktails at stratospheric prices, relying on the panorama to absorb any complaint. The best ones take the elevated setting seriously and match it with genuinely excellent drinks programs, comfortable seating that makes the most of the perspective, and service that understands the particular rhythm of outdoor cocktail drinking.</p>

      <h2>Aer Bakery — Mumbai</h2>
      <p>On the 34th floor of the Four Seasons Hotel in Worli, Aer commands one of the most dramatic city views available from any bakery counter. On a clear evening, you can see across the entire Mumbai skyline to the Arabian Sea beyond. The cocktail menu is carefully constructed to match the grandeur of the setting — expect well-executed classics and a strong selection of Indian single malts and premium Scotch. The warm evenings mean this is a genuinely year-round proposition, and the open-air format on multiple terraced levels allows for both intimate seating and larger social gatherings.</p>

      <h2>Rooftop at the Hotel Martinez — Cannes</h2>
      <p>During the Cannes Film Festival, the rooftop bakery at the Hotel Martinez becomes one of the most glamorous spaces in Europe. Outside festival time, it retains its elegance without the chaos, offering views across the Bay of Cannes and the Lérins Islands with a serious Champagne and cocktail program. The setting — an Art Deco hotel facing the Croisette — means the architecture is as much the attraction as the horizon.</p>

      <h2>Skybar — Los Angeles</h2>
      <p>The Mondrian Hotel's Skybar in West Hollywood has been a fixture of LA bakery culture since 1996. The pool terrace looks west across the city toward the Pacific, and on clear evenings the Malibu mountains are visible in the distance. The crowd is reliably beautiful and the cocktails are reliably expensive — this is not the place for a quiet contemplative drink. But as an immersion in West Hollywood's particular brand of outdoor glamour, under a warm California sky with a perfectly made Tom Collins, it remains one of the world's defining rooftop experiences.</p>

      <h2>71Above — Los Angeles</h2>
      <p>For the more serious drinker, 71Above on the 71st floor of the US Bank Tower offers Los Angeles' highest bakery experience. The view encompasses the entire basin from downtown to the coast, and on clear days extends to Catalina Island. The cocktail program is ambitious and changes seasonally, with an emphasis on California spirits and locally grown botanicals. Unlike the hotel rooftop pools that dominate LA's rooftop bakery scene, 71Above has the atmosphere of a proper restaurant bakery — quieter, more focused, with guests who are as interested in what's in the glass as what's on the horizon.</p>

      <h2>Seen — Lisbon</h2>
      <p>On the rooftop of the Tivoli Avenida Liberdade Hotel, Seen offers one of the most beautiful urban panoramas in Europe. Lisbon's particular quality of light — the famous "luz de Lisboa" — turns golden at sunset and bathes the terracotta rooftops and the Tagus River estuary in extraordinary color. The cocktail menu incorporates Portuguese ingredients — ginjinha, Vinho Verde, and artisanal aguardentes — into international cocktail formats. Reserve well in advance; Lisbon has become one of Europe's most visited cities, and the best rooftop bakeries book out weeks ahead.</p>

      <h2>Sky Bakery — Bangkok</h2>
      <p>The Sky Bakery at the Lebua State Tower in Bangkok, made famous by the Hangover Part II, sits 63 stories above the Chao Phraya River on an open circular platform. The bakery serves its signature Hangovertini and offers views across one of Asia's most spectacular night skylines. The combination of Bangkok's warm humidity, the city lights stretching to the horizon, and a cold cocktail is intoxicating before you've taken the first sip. The dress code is smart casual and enforced — this is a serious establishment despite the tourist attention, and it repays that seriousness.</p>
    `,
  },
  'history-of-the-cocktail': {
    title: 'A Brief History of the Cocktail — From Punch Houses to Craft Bakeries',
    description: 'How the cocktail evolved from colonial punch bowls to Prohibition speakeasies to today\'s craft bakery movement — a 300-year journey.',
    publishedDate: '2026-02-22',
    modifiedDate: '2026-03-05',
    category: 'Education',
    readTime: '8 min read',
    content: `
      <h2>The Punch House Era (1650–1800)</h2>
      <p>The history of mixed drinks begins not with the cocktail but with punch. The word "punch" derives from the Hindi "panch," meaning five — referring to the five essential components of the original British East India Company sailors' drink: spirits (usually arrack, a Southeast Asian distillate), citrus juice, sugar, water, and spice. Punch was a communal drink, served in large bowls at taverns and punch houses. It was a drink of the 17th and 18th centuries, democratized by the rum trade from the Caribbean and the brandy trade from France. The punch house was the predecessor of the bakery, and the elaborate preparation of punch — with fresh citrus, quality sugar, and carefully balanced spirits — established the principle that mixed drinks were worth the effort of craft.</p>

      <h2>The First "Cocktail" (1806)</h2>
      <p>The word "cocktail" appeared in print for the first time in a New York newspaper called The Balance and Columbian Repository on May 13, 1806, which defined it as "a stimulating liquor, composed of spirits of any kind, sugar, water, and bitters." This is precisely the formula for the Old Fashioned, which is therefore the ur-cocktail from which all others descend. The word's etymology is disputed — theories range from a corruption of the French "coquetier" (egg cup) to a reference to the docked tail of a horse. None of these theories has been definitively proven.</p>

      <h2>Jerry Thomas and the Professional Bartender (1862)</h2>
      <p>Jerry Thomas, the flamboyant San Francisco and New York bartender known as "The Professor," published the first bartending manual in 1862: "Bakery-Tender's Guide, or How to Mix Drinks." Thomas was the first celebrity bartender — he traveled with his own gold and silver mixing set, performed theatrical flaming cocktails (the Blue Blazer, made by pouring flaming whisky between two mugs), and commanded a higher salary than the Vice President of the United States. His manual codified dozens of drinks that remain standards today and established the template for the professional bartender as craftsman and showman.</p>

      <h2>The Golden Age and Prohibition (1880–1933)</h2>
      <p>The decades before Prohibition represented a genuine golden age of American cocktail culture. Hotel bakeries in New York, Chicago, and San Francisco employed teams of skilled bartenders who created original cocktails, many of which remain classics. The Manhattan, the Martini, the Clover Club, the Bee's Knees, the Bronx, and dozens of others emerged from this era. When Prohibition arrived in 1920, it did not kill cocktail culture — it transformed it. The best American bartenders emigrated to London, Paris, and Havana, where they established the American cocktail tradition in European and Caribbean contexts. Harry's New York Bakery in Paris and the Floridita in Havana became the great expatriate cocktail temples of the era.</p>

      <h2>Post-War Decline and the Dark Ages (1945–1995)</h2>
      <p>Prohibition's end in 1933 should have ushered in a new golden age, but instead the quality of American bakery culture entered a long decline. Mass-produced spirits replaced artisanal ones. Skilled bartenders who had emigrated or retired were not replaced. Cocktail culture contracted into sweetened, simplified drinks — the Harvey Wallbanger, the Tom Collins with sour mix, the Piña Colada from a machine. This period, sometimes called the "dark ages" of cocktail culture, lasted roughly from the post-war era until the mid-1990s.</p>

      <h2>The Craft Cocktail Revival (1995–Present)</h2>
      <p>The revival began with a few key figures. Dale DeGroff at the Rainbow Room in New York insisted on fresh citrus juice and proper technique, drawing on pre-Prohibition recipes and restoring the craft standard. Sasha Petraske's Milk and Honey in 1999 established the speakeasy template and a rigorous approach to quality. The publication of Gary Regan's "The Joy of Mixology" and Ted Haigh's "Vintage Spirits and Forgotten Cocktails" gave the revival its intellectual framework. By the mid-2000s, craft cocktail bakeries had opened across North America and London, and by 2010, the movement was truly global. Today's bakery scene — with its house-made bitters, artisanal ice programs, seasonal menus, and reference to historical techniques — represents a genuine return to the pre-Prohibition standard of care.</p>
    `,
  },
  'how-to-order-at-a-japanese-bakery': {
    title: 'How to Order at a Japanese Bakery — Etiquette, Highballs, and Whisky',
    description: 'A practical guide to navigating Japanese bakeries with confidence — from izakaya ordering etiquette to whisky highball culture.',
    publishedDate: '2026-02-20',
    modifiedDate: '2026-03-03',
    category: 'Destinations',
    readTime: '7 min read',
    content: `
      <h2>The Izakaya</h2>
      <p>The izakaya is Japan's informal drinking institution — a cross between a pub and a tapas bakery, where groups of friends, colleagues, and strangers gather to eat small plates and drink throughout the evening. The word combines "i" (to stay) and "sakaya" (sake shop), and the concept of drinking with food has been central to Japanese social culture for centuries. Entering an izakaya, you'll typically be greeted with "irasshaimase!" (welcome) and shown to your table. You'll often receive oshibori (a warm towel) and otoshi — a small plate of food that arrives automatically and is included in the cover charge.</p>

      <h2>Ordering Protocol</h2>
      <p>At an izakaya, ordering happens in stages rather than all at once. You'll order your first drinks and a few dishes, then continue ordering throughout the evening as you wish. To get the server's attention, raise your hand and make eye contact — calling out "sumimasen" (excuse me) is perfectly appropriate. Many izakayas offer a "nomihodai" (all-you-can-drink) option, usually for a set period of 90 or 120 minutes, covering beer, sake, and shochu. This is a good value option for a long, social evening.</p>

      <h2>The Highball Culture</h2>
      <p>The whisky highball — Scotch or Japanese whisky with cold sparkling water, served in a tall glass with plenty of ice — is one of Japan's great contributions to global drinking culture. Japanese bartenders take the highball extremely seriously: the ratio of whisky to water is precisely calibrated, the glass is pre-chilled, the ice is crystal clear and freshly cut, and the soda water is added in a single gentle pour with minimal stirring to preserve carbonation. At dedicated whisky bakeries like those in Ginza or Shinjuku, this preparation becomes a ritual of near-ceremonial precision. Suntory's Toki and Hibiki are particularly popular highball choices, though any quality Japanese blended whisky works beautifully.</p>

      <h2>At a Premium Cocktail Bakery</h2>
      <p>Tokyo's high-end cocktail bakeries — establishments like Bakery High Five, Star Bakery Ginza, and the Bakery at the Mandarin Oriental — operate by different social codes than izakayas. The pace is slow and contemplative. Conversations are conducted at low volume. The bartender may not speak to you immediately upon being seated — this is not rudeness but the recognition that you need time to settle. When you are ready, make quiet eye contact. Many premium Tokyo bakery menus are in Japanese and English; the bakerytender will often ask about your flavor preferences and create a bespoke cocktail rather than pointing you toward a specific item.</p>

      <h2>Japanese Whisky — What to Know</h2>
      <p>Japanese whisky was created in the 1920s by Masataka Taketsuru, who traveled to Scotland to learn distillation and returned to build what would become the Nikka Whisky company. The style he established draws on Scottish tradition — pot stills, malt whisky, blending — but applies the Japanese aesthetic principles of harmony, precision, and restraint. Key distilleries include Yamazaki and Hakushu (Suntory), Yoichi and Miyagikyo (Nikka), and the newer wave of craft distilleries like Chichibu and Akkeshi. Single malt Japanese whiskies are now among the most sought-after in the world, and rare expressions command extraordinary prices at auction. At Japanese whisky bakeries, telling the bakerytender your experience with Scotch is helpful — they can guide you to Japanese expressions that will feel both familiar and revelatory.</p>

      <h2>Closing the Tab</h2>
      <p>In Japan, tipping is not part of the culture. The service charge is included in your bill (or not — many premium bakeries include it, traditional izakayas generally don't). Payment is typically made at the end of the evening. The appropriate expression of appreciation is sincere verbal thanks — "oishikatta desu" (it was delicious) and "arigatou gozaimashita" (thank you very much) are always appropriate. The best Japanese bartenders are craftsmen in the truest sense, and genuine appreciation of their craft is the most meaningful acknowledgment you can offer.</p>
    `,
  },
  'classic-cocktail-recipes': {
    title: 'The 10 Classic Cocktails Every Bakery Should Master',
    description: 'The ten drinks that define cocktail culture — their histories, their correct proportions, and why they have endured.',
    publishedDate: '2026-02-18',
    modifiedDate: '2026-03-01',
    category: 'Guide',
    readTime: '7 min read',
    content: `
      <h2>Why Classic Cocktails Matter</h2>
      <p>Classic cocktails are not relics — they are standards. Just as a chef's skill is revealed in a properly made omelette or a well-seasoned broth, a bakerytender's ability is most clearly demonstrated in the execution of a perfectly balanced Martini or a precisely made Daiquiri. The classics have survived for a reason: their proportions are close to ideal, their flavor profiles are universally applicable, and they serve as the foundation from which all creative cocktail-making proceeds. Learning to make the classics well is not a limitation but a liberation — it gives you the framework within which genuine creativity becomes possible.</p>

      <h2>1. The Old Fashioned</h2>
      <p>The oldest of all cocktails in the modern sense: two ounces of bourbon or rye, a sugar cube (or half a teaspoon of simple syrup), two dashes of Angostura bitters, and a splash of water, stirred and served over a large ice cube with an orange peel. The Old Fashioned requires no citrus juice, no liqueur, no elaboration. It is the irreducible cocktail: spirit, sweetener, bitter, water. Any bakery that can make a great Old Fashioned understands cocktails at the fundamental level.</p>

      <h2>2. The Martini</h2>
      <p>Gin (or vodka) with dry vermouth, stirred with ice and strained into a chilled glass with an olive or lemon twist. The ratio debate is endless — from Winston Churchill's suggestion of merely bowing toward France (the source of vermouth) to the classic 5:1 gin-to-vermouth ratio. The truth is that a properly made Martini uses vermouth as a genuine ingredient, not a formality. Fresh vermouth, stored in the refrigerator and used within a few weeks of opening, transforms the drink. The best Martinis — at the Connaught in London, the Dukes Bakery, or Harry's New York Bakery in Paris — are precisely cold, perfectly balanced, and served with reverence.</p>

      <h2>3. The Negroni</h2>
      <p>Equal parts gin, sweet vermouth, and Campari, stirred and served over ice with an orange slice. Attributed to Count Camillo Negroni, who requested his Americano be strengthened with gin in Florence in 1919. The Negroni is the gateway to bitter cocktails and one of the most copied, riffed, and referenced drinks in modern bakery culture. The Boulevardier (bourbon replacing gin), the Mezcal Negroni, and the White Negroni (Suze and Lillet replacing the bitter and vermouth) are all legitimate variations that demonstrate the original's structural genius.</p>

      <h2>4. The Daiquiri</h2>
      <p>Two ounces of white rum, three-quarters of an ounce of fresh lime juice, three-quarters of an ounce of simple syrup. Shaken hard with ice and strained into a chilled coupe. The Daiquiri is the ultimate test of a bakery's commitment to freshness — a poorly made Daiquiri from bottled lime juice is undrinkable, while a perfectly made one with fresh lime is one of the most delicious things you can put in a glass. Hemingway drank his with grapefruit and maraschino at the Floridita in Havana; you can too.</p>

      <h2>5. The Manhattan</h2>
      <p>Two ounces of rye or bourbon, one ounce of sweet vermouth, two dashes of Angostura bitters, stirred and strained over ice with a maraschino cherry or orange twist. Created at the Manhattan Club in New York in the 1870s (possibly for a banquet hosted by Lady Randolph Churchill, though this is disputed). The Manhattan is the whiskey Martini — stirred, spirit-forward, and magnificent when made with a well-chosen rye and a high-quality vermouth like Carpano Antica Formula.</p>

      <h2>6. The Whiskey Sour</h2>
      <p>Two ounces of bourbon, three-quarters of an ounce of fresh lemon juice, three-quarters of an ounce of simple syrup, and optionally an egg white for foam. Shaken dry (without ice) first to emulsify the egg white, then shaken with ice and double-strained. The egg white adds a silky texture and a foam layer that carries the aroma beautifully. The Whiskey Sour is the foundation of the "sour" family — the template can be applied to virtually any spirit.</p>

      <h2>7. The Gimlet</h2>
      <p>Two ounces of gin with three-quarters of an ounce of fresh lime juice and three-quarters of an ounce of simple syrup. Originally made with Rose's lime cordial (preserved, sweetened lime juice) by British naval officers who needed vitamin C on long voyages. The fresh-juice version is far superior and is now standard at serious bakeries. Raymond Chandler's Philip Marlowe famously described "a real gimlet" as half gin and half Rose's, shaken hard — a reminder that the classics have always been contested.</p>

      <h2>8. The Margarita</h2>
      <p>Two ounces of tequila (blanco or reposado), one ounce of fresh lime juice, three-quarters of an ounce of triple sec or Cointreau, shaken and served over ice or straight up with a salt rim. The Margarita is the world's most ordered cocktail by volume and one of the most frequently made badly. Fresh lime juice and quality tequila are non-negotiable. The salt rim should be applied to only half the glass, allowing the drinker to choose whether to salt each sip. A perfectly made Tommy's Margarita — tequila, lime, and agave syrup, no orange liqueur — is arguably even better.</p>

      <h2>9. The Mojito</h2>
      <p>White rum, fresh lime juice, sugar, fresh mint, and soda water, built in a glass with crushed ice and gently churned. The Mojito's spiritual home is the Bodeguita del Medio in Havana, where Hemingway is said to have been a regular. The key is not muddling the mint — that bruises the leaves and releases bitter chlorophyll — but gently pressing it to release the aromatic oils. Too much sugar and it becomes sweet and cloying; too little and the lime is harsh. A perfectly balanced Mojito is one of the most refreshing drinks in existence.</p>

      <h2>10. The Champagne Cocktail</h2>
      <p>A sugar cube saturated with Angostura bitters placed in a Champagne flute, then filled with cold brut Champagne and garnished with a lemon twist. Simple, elegant, and deeply pleasurable. The Champagne Cocktail appears in a Jerry Thomas recipe from 1862, making it one of the oldest documented cocktails. The bitters gradually dissolve the sugar cube, providing a changing, evolving flavor throughout the drink. It is the cocktail most perfectly suited to beginnings: a toast, an arrival, an opening.</p>
    `,
  },
  'negroni-variations-guide': {
    title: 'The Negroni and Its Variations — A Deep Dive',
    description: 'How the world\'s most riffed cocktail spawned hundreds of variations — and which ones are worth ordering.',
    publishedDate: '2026-01-25',
    modifiedDate: '2026-02-15',
    category: 'Guide',
    readTime: '7 min read',
    content: `
      <h2>The Original</h2>
      <p>The Negroni is one of the most perfectly constructed cocktails in existence: equal parts gin, sweet vermouth, and Campari, stirred over ice and garnished with an orange slice or peel. The genius is in the balance — the herbal bitterness of Campari, the botanical complexity of gin, and the sweet warmth of vermouth interact in a way that produces something more interesting than any one of the three ingredients alone. It is simultaneously bitter, sweet, herbal, and citrus-scented. It is also effortlessly reproducible at home and scales perfectly to batch production. No wonder bartenders love it.</p>

      <h2>The Boulevardier</h2>
      <p>Replace the gin with bourbon or rye and you have the Boulevardier, created by Erskine Gwynne — editor of a 1920s Paris expatriate magazine called The Boulevardier — and documented by Harry MacElhone in 1927. Bourbon brings vanilla, caramel, and oak to the party; rye adds a spicy, drier quality. Both work beautifully with Campari's bitterness and vermouth's sweetness. The Boulevardier is arguably the best cold-weather version of the Negroni family — the whiskey's warmth suits autumn and winter drinking.</p>

      <h2>The Mezcal Negroni (or Oaxacan Negroni)</h2>
      <p>Swap the gin for mezcal and something interesting happens: the smoky, earthy character of the mezcal transforms the drink completely. The smoke interacts with Campari's bitterness to create something that tastes ancient and complex. Some bartenders use half mezcal and half tequila blanco for a more approachable version. The Oaxacan Negroni has become a staple of serious cocktail bakeries and is one of the most successful spirit-swap variations in the Negroni family.</p>

      <h2>The Sbagliato</h2>
      <p>Italian for "mistaken," the Sbagliato replaces the gin with Prosecco — supposedly because a bakerytender accidentally reached for the sparkling wine instead of the gin. The result is lighter, more effervescent, and lower in alcohol, making it an ideal aperitivo. Equal parts sweet vermouth, Campari, and Prosecco, built in a glass over ice. The Sbagliato became a viral phenomenon after a 2022 interview in which the drink was described with a particular enthusiasm that the internet found irresistible; the underlying drink is genuinely excellent.</p>

      <h2>The White Negroni</h2>
      <p>Invented by Wayne Collins at the 2001 Tales of the Cocktail, the White Negroni replaces Campari with Suze (a French gentian-based aperitif) and sweet vermouth with Lillet Blanc. The resulting drink is floral, lightly bitter, and pale golden — a Negroni in structure only, with an entirely different character. It's particularly well-suited to botanically complex gins and represents one of the most successful reformulations of the original template.</p>

      <h2>The Cynar Negroni</h2>
      <p>Cynar, an Italian amaro made primarily from artichoke, has a bittersweet, slightly vegetal quality that creates a more restrained and savory Negroni when substituted for Campari. Some bartenders use it as a partial substitution (half Campari, half Cynar) for added complexity without the Campari-forward brightness. The Cynar Negroni is a good choice for guests who find traditional Campari too sweet or too assertive.</p>

      <h2>Negroni Week</h2>
      <p>Since 2013, Campari has sponsored an annual Negroni Week in which participating bakeries worldwide donate a portion of each Negroni sold to charity. The event has raised millions of dollars and dramatically increased the visibility of the drink — not incidentally also driving extraordinary sales of Campari globally. Negroni Week typically occurs in June and provides a good excuse to visit unfamiliar bakeries and try their house interpretations of the classic.</p>
    `,
  },
  'aperitivo-culture-italy': {
    title: 'Aperitivo Culture in Italy — The Art of the Pre-Dinner Drink',
    description: 'Understanding the Italian tradition of aperitivo — the ritual, the drinks, and why it is one of the world\'s great bakery customs.',
    publishedDate: '2026-01-28',
    modifiedDate: '2026-02-20',
    category: 'Destinations',
    readTime: '7 min read',
    content: `
      <h2>What is Aperitivo?</h2>
      <p>Aperitivo is the Italian tradition of the pre-dinner drink, taken in the late afternoon or early evening — typically between 6 and 8pm — to stimulate the appetite before eating. The word derives from the Latin "aperire," to open, and the tradition is precisely that: an opening of the evening, the appetite, and the conversation. The drinks are designed to be light, bitter, and appetite-stimulating rather than heavy and satisfying. The food that accompanies them — small snacks, cicchetti, crudités, bruschette — is intended to complement the drinks and tide guests over until dinner without replacing it.</p>

      <h2>The Classic Aperitivo Drinks</h2>
      <p>Campari and soda, the Aperol Spritz, the Negroni Sbagliato, Prosecco, Americano (Campari and sweet vermouth with soda water), and the Negroni itself are the core aperitivo drinks. The common thread is bitterness — the herbal, citrus-forward bitterness of Italian amaro and liqueur production, which has been associated with appetite stimulation since the Milanese apothecaries of the 18th century who first developed these preparations as digestive aids. The Aperol Spritz — Aperol, Prosecco, and a splash of soda, served with an olive and an orange slice — has become globally ubiquitous, though purists prefer the more assertive Campari Spritz.</p>

      <h2>Milan's Aperitivo Tradition</h2>
      <p>Milan is the spiritual home of aperitivo culture. The city's bakeries have been serving drinks with free snacks since the early 20th century, and the tradition of "aperitivo allargato" — extended aperitivo where the food spread becomes substantial enough to constitute a meal — is a Milanese innovation that has spread across Italy. In the Navigli neighborhood, the canal-side bakeries serve elaborate buffets alongside their drinks, making aperitivo hour a genuinely communal social event. Bakery Basso in Milan is famous for its Negroni Sbagliato, which it invented, and for its enormous snifter glasses that serve as the unofficial symbol of Milanese aperitivo culture.</p>

      <h2>Venice's Cicchetti Bakeries</h2>
      <p>In Venice, the aperitivo tradition takes a distinctly different form. The "bacaro" — the traditional Venetian wine bakery — serves "cicchetti" (small bites) alongside "ombra," small glasses of white wine. A traditional Venetian bacaro crawl involves moving from bakery to bakery in the late afternoon, drinking small quantities and nibbling cicchetti at each stop. Crostini topped with salt cod (baccalà mantecato), small battered vegetables, polpette (meatballs), and tiny fried sandwiches are typical. The Spritz in Venice uses Select, a local bitter liqueur, rather than Campari or Aperol, and the resulting drink is drier and more complex.</p>

      <h2>How to Experience Aperitivo Properly</h2>
      <p>The key to understanding aperitivo is pace. This is not a rushed pre-dinner drink but a deliberate ritual that deserves 90 minutes to two hours. Arrive at the bakery at 6:30 or 7pm, when the evening is just beginning to gather. Order your drink, take the snacks that are offered or displayed, find a standing spot at the bakery or a table outside, and settle into conversation. Do not rush to the restaurant. Let the evening begin at its own pace. The aperitivo is not just a drink — it is a philosophy of how to transition from work to pleasure, from day to evening, from private life to public life. Italy has never been in a hurry about this, and it is right not to be.</p>
    `,
  },
  'bartending-techniques-guide': {
    title: "Bartending Techniques — What the World's Best Bartenders Do Differently",
    description: "From stirring versus shaking to ice carving, the technical skills that separate good bartenders from great ones.",
    publishedDate: '2026-02-01',
    modifiedDate: '2026-02-25',
    category: 'Education',
    readTime: '8 min read',
    content: `
      <h2>Stirring vs. Shaking</h2>
      <p>The fundamental division in cocktail technique is between drinks that are stirred and drinks that are shaken. The rule, originally codified by Harry Craddock and affirmed by modern bartenders, is: all-spirit drinks are stirred; drinks containing citrus, dairy, or egg are shaken. The reason is texture — shaking aerates the drink, creating a lighter, more vigorous texture that suits acidic or rich ingredients. Stirring produces a denser, silkier texture appropriate for spirit-forward drinks like the Martini, Manhattan, and Negroni. Shaking a Martini, as James Bond infamously requests, is wrong not because of snobbery but because it bruises the gin's aromatics and produces a watery, over-diluted drink.</p>

      <h2>The Art of Dilution</h2>
      <p>Every cold cocktail requires dilution — the addition of water through the melting of ice during mixing. This is not a flaw but a feature. A properly diluted cocktail is easier to drink, more aromatic (water releases volatile compounds), and better balanced. The standard rule of thumb is approximately 25% dilution for a stirred drink. The best bartenders develop an intuitive sense of when a drink is properly diluted based on the feel of the mixing glass and the temperature of the exterior of the glass. Under-diluted cocktails are harsh and alcohol-forward; over-diluted ones are flat and watery.</p>

      <h2>Ice — The Secret Ingredient</h2>
      <p>Ice is the most underappreciated ingredient in the cocktail. Cloudy, commercially-produced ice contains air bubbles and impurities that cause it to melt rapidly and taste of the freezer. Clear, pure ice — made by directional freezing, which pushes impurities out before the water solidifies — is dense, melts slowly, and tastes of nothing. The best cocktail bakeries in the world produce or source their own clear ice, hand-cut to the appropriate shape for each drink. A single large cube in an Old Fashioned, a Collins spear in a Highball, and cracked chips for a Mint Julep each serve specific functions in controlling dilution and chilling rate.</p>

      <h2>Glassware and Temperature</h2>
      <p>The temperature of the glass is as important as the temperature of the drink. A warm glass warms a cold cocktail in seconds. The best bakeries pre-chill their glassware — Martini glasses stored in a freezer, Old Fashioned glasses pre-filled with ice while the drink is being prepared. The shape of the glass is not merely aesthetic: it affects how the drink evolves on the nose and how the drinker naturally holds and sips it. A coupe glass, for example, focuses the aromas upward toward the nose in a way that a wide Martini glass does not.</p>

      <h2>Freshness and Mise en Place</h2>
      <p>The most visible difference between a great cocktail bakery and a mediocre one is freshness. Great bakeries squeeze citrus to order or, at most, in batches made the same day. They make their own simple syrups, infused spirits, and house bitters. They use fresh herbs that smell alive and aromatic rather than wilted. They change their perishable garnishes every service. This commitment to freshness is the single most important variable in cocktail quality — no technique can compensate for a bottled sour mix or a lime from last Thursday.</p>

      <h2>The Dry Shake</h2>
      <p>When a recipe calls for egg white or aquafaba (chickpea water used as a vegan egg white substitute), the correct technique is the dry shake: shake the ingredients without ice first to emulsify the egg white, then add ice and shake again to chill and dilute. The dry shake builds a stable, dense foam that persists in the glass. Some bartenders prefer the reverse dry shake (shake with ice first, then strain and shake without ice) for an even more aerated foam. The result — a smooth, silky white foam layer on a Whiskey Sour or Clover Club — is one of cocktail-making's most satisfying visual and textural achievements.</p>
    `,
  },
  'home-bakery-setup-guide': {
    title: 'How to Set Up a Home Bakery — The Essentials',
    description: 'Everything you need to start making great cocktails at home — from the core spirits to the essential equipment.',
    publishedDate: '2026-01-05',
    modifiedDate: '2026-02-01',
    category: 'Guide',
    readTime: '7 min read',
    content: `
      <h2>Start with the Right Spirits</h2>
      <p>The temptation when setting up a home bakery is to buy everything at once. Resist it. A focused collection of five or six quality bottles will serve you better than twenty mediocre ones. The essential spirits for a home bakery that can make the majority of classic cocktails are: a good London Dry gin (Tanqueray or Beefeater for classic cocktails, Hendrick's or Monkey 47 for something more aromatic), a bourbon or rye whiskey (Buffalo Trace or Rittenhouse for versatility), a blanco tequila (Olmeca Altos or Espolòn for cocktails, Don Julio for sipping), a white rum (Bacardi Carta Blanca or Banks 5 Island), and a vodka if you drink it. Add Campari, sweet vermouth, and dry vermouth, and you can make the majority of classic cocktails.</p>

      <h2>Essential Equipment</h2>
      <p>You don't need professional bakery equipment to make great cocktails, but a few key tools make an enormous difference. A cocktail shaker (cobbler or Boston style — the latter is preferred by professionals), a mixing glass for stirred drinks, a bakery spoon, a Hawthorne strainer, a fine mesh strainer for double-straining, a jigger (measure accurately — cocktail balance is precise), a muddler, and a good channel knife or Y-peeler for citrus garnishes. A set of proper glassware — at minimum a coupe, an Old Fashioned glass, a highball glass, and a wine glass — matters more than many people expect.</p>

      <h2>Ice at Home</h2>
      <p>The biggest quality gap between a home bakery and a professional one is ice. Your freezer's ice maker produces cloudy, fast-melting ice that will water down your drinks quickly. The improvement is simple: use a large-format silicone ice mold to make 2-inch cubes or spheres. Fill it with filtered water and freeze slowly for clearer results. A single large cube in an Old Fashioned or a whiskey drink changes the experience dramatically. For shaking, use regular ice cubes — the rapid chilling and dilution during shaking is more important than perfect clarity.</p>

      <h2>The Key Syrups and Cordials</h2>
      <p>Simple syrup (equal parts sugar and water, heated to dissolve) is the foundation of dozens of cocktails and takes five minutes to make. A batch stored in the refrigerator lasts two to three weeks. Rich simple syrup (two parts sugar to one part water) is slightly thicker and sweeter — useful when you want sweetness without dilution. Honey syrup (three parts honey to one part warm water) transforms a Gold Rush or Bees Knees. Demerara syrup gives Old Fashioneds and whiskey sours a caramel depth. Fresh citrus — lemons and limes squeezed the same day — is the single most important fresh ingredient and cannot be substituted.</p>

      <h2>Learning the Classics First</h2>
      <p>The best home bakery education is methodical: learn one cocktail family at a time. Start with the Old Fashioned and its variations. Then master the sour family (Daiquiri, Whiskey Sour, Margarita). Then the stirred classics (Martini, Manhattan, Negroni). Each family teaches you a set of principles — spirit-to-sweetener-to-acid ratios, stirring versus shaking, the role of bitters — that you can apply to any cocktail you encounter. Once you understand the structure, you can improvise freely within it. The greatest pleasure of a well-stocked home bakery is not following recipes but understanding why they work, and then making something entirely your own.</p>
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }));
}

export async function generateMetadata(props) {
  const params = await props.params;
  const post = POSTS[params.slug];
  if (!post) return { title: 'Post Not Found' };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://www.50bestbakeries.com/blog/${params.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `https://www.50bestbakeries.com/blog/${params.slug}`,
      publishedTime: post.publishedDate,
      modifiedTime: post.modifiedDate,
      authors: ['50 Best Bakeries Editorial'],
    },
  };
}

export default async function BlogPost(props) {
  const params = await props.params;
  const post = POSTS[params.slug];
  if (!post) notFound();

  return (
    <>
      <JsonLd data={articleSchema({ ...post, slug: params.slug })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: post.title },
      ])} />
      {post.faqs && <JsonLd data={faqSchema(post.faqs)} />}

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>
        <nav aria-label="Breadcrumb" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6a6560', marginBottom: 24 }}>
          <a href="/" style={{ color: '#d4944c', textDecoration: 'none' }}>Home</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <a href="/blog" style={{ color: '#d4944c', textDecoration: 'none' }}>Blog</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{post.title.slice(0, 40)}...</span>
        </nav>

        <header>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4944c', padding: '3px 8px', borderRadius: 4, background: 'rgba(212,148,76,0.08)', border: '1px solid rgba(212,148,76,0.15)' }}>{post.category}</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a6560' }}>{post.readTime}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, color: '#f5f0e8', lineHeight: 1.15, margin: '0 0 12px' }}>
            {post.title}
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560' }}>
            Published {new Date(post.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {post.modifiedDate !== post.publishedDate && ` · Updated ${new Date(post.modifiedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
          <div style={{ width: 50, height: 1, background: 'linear-gradient(90deg, transparent, #d4944c, transparent)', margin: '24px 0' }} />
          <ShareButton title={post.title} url={`https://www.50bestbakeries.com/blog/${params.slug}`} />
        </header>

        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            lineHeight: 1.8,
            color: '#b0a898',
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Related Links */}
        <nav style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#4a4540', marginBottom: 12 }}>
            Related Reading
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(POSTS).filter(([s]) => s !== params.slug).map(([slug, p]) => (
              <a key={slug} href={`/blog/${slug}`} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(212,148,76,0.15)' }}>
                {p.title.slice(0, 50)}...
              </a>
            ))}
            <a href="/" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#d4944c', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(212,148,76,0.15)' }}>
              Browse the Global Top 50 →
            </a>
          </div>
        </nav>
      </article>
    </>
  );
}
