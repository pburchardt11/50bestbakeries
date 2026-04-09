// app/blog/[slug]/page.js
// Blog post page — editorial stubs. Replace with longer-form content later.

import { notFound } from 'next/navigation';
import { JsonLd } from '../../../lib/schema';
import { articleSchema, breadcrumbSchema, faqSchema } from '../../../lib/schema';
import ShareButton from '../../../components/ShareButton';

function stub(title, description, category, date, intro, sections) {
  const content = [
    `<p>${intro}</p>`,
    ...sections.map(([h, p]) => `<h2>${h}</h2><p>${p}</p>`),
  ].join('');
  return {
    title,
    description,
    publishedDate: date,
    modifiedDate: date,
    category,
    readTime: '6 min read',
    content,
  };
}

const POSTS = {
  'best-sourdough-bakeries-world': stub(
    'The Best Sourdough Bakeries in the World',
    'From Tartine in San Francisco to Hart Bageri in Copenhagen, the bakeries that defined the modern sourdough movement.',
    'Destinations',
    '2026-03-01',
    'The modern sourdough movement has transformed everyday bread in bakeries across the world. A handful of bakeries set the standard for naturally leavened, long-fermented, heritage-grain loaves — and their influence now reaches almost every serious bakery city.',
    [
      ['Tartine Bakery, San Francisco', "Chad Robertson's Mission district bakery is arguably the most influential sourdough bakery of the past twenty years. The country loaf — a high-hydration, well-fermented, deeply crusted miche — has become the template that bakers worldwide now measure themselves against."],
      ['Poilâne, Paris', "Apollonia Poilâne's Rue du Cherche-Midi bakery still bakes stone-ground wheat miches daily. The Poilâne loaf is a benchmark of traditional French country bread and is exported around the world."],
      ['Hart Bageri, Copenhagen', 'Richard Hart (formerly of Tartine) and René Redzepi founded Hart Bageri in Frederiksberg, and it has become the reference point for Danish sourdough. Long fermentation, heritage grains, and exceptional viennoiserie make it one of the defining bakeries of the decade.'],
      ['E5 Bakehouse, London', "Ben Mackinnon's London Fields bakery is the heart of London's sourdough scene. Organic flour, stone milling, and naturally leavened breads draw daily queues."],
    ]
  ),

  'patisserie-vs-boulangerie': stub(
    'Pâtisserie vs Boulangerie — What’s the Difference?',
    'Two of the most common French bakery terms, and the real distinction between them.',
    'Education',
    '2026-02-22',
    "If you've ever walked down a French street, you'll have seen both a boulangerie and a pâtisserie — sometimes right next to each other. The two categories are legally distinct in France, and the difference matters if you're trying to find the best bread versus the best pastry.",
    [
      ['Boulangerie', "A boulangerie is a bread bakery. By French law the title boulanger is only protected for bakers who make their bread on site from scratch, using unfrozen dough. Baguettes, pain de campagne, pain au levain, fougasse, and a rotating selection of specialty loaves are the core of a boulangerie's offering."],
      ['Pâtisserie', 'A pâtisserie specialises in fine pastries — éclairs, tarts, mille-feuille, macarons, petits fours, and seasonal cakes. The title pâtissier is also protected in France and requires formal training. Many pâtisseries also sell viennoiserie (croissants, pains au chocolat, brioche), since those are laminated pastries rather than bread.'],
      ['Boulangerie-Pâtisserie', 'In practice, most French neighbourhood bakeries are hybrid boulangerie-pâtisseries, selling both bread and pastries. The best are known for one or the other — there is a strong French tradition of travelling across a city for a specific loaf or a specific pâtissier’s tart.'],
    ]
  ),

  'best-croissants-world': stub(
    'Where to Find the Best Croissants in the World',
    'The bakeries that have made croissants a destination food — from Melbourne to Paris.',
    'Destinations',
    '2026-02-18',
    'The croissant has become a global object of obsession, and a small number of bakeries have pushed the laminated pastry to new heights. Below are a handful of the bakeries that consistently serve croissants worth travelling for.',
    [
      ['Lune Croissanterie, Melbourne', "Kate Reid's Fitzroy bakery is routinely described as home to the world's best croissant. Her obsession with technique — learned in a Formula 1 aerodynamics lab — shows in every fold and layer."],
      ['Du Pain et des Idées, Paris', "Christophe Vasseur's Rue Yves Toudic bakery in the 10th arrondissement is famous for its pain des amis and escargot pastries, but the croissants are equally exceptional."],
      ['Utopie, Paris', "Winner of the Meilleur Croissant de Paris in 2016, Utopie in the 11th arrondissement is one of the city's most creative and dependable boulangeries."],
      ['Pophams, London', "Islington's Pophams specialises in laminated pastry and is the place to try unusual savoury viennoiserie alongside the classics."],
    ]
  ),

  'what-is-a-viennoiserie': stub(
    'What Is a Viennoiserie? A Guide to Laminated Pastry',
    'The family of enriched, laminated pastries that sits between bread and pastry — and the bakeries that specialise in it.',
    'Education',
    '2026-02-12',
    'Viennoiserie is one of the most distinctive categories in the French bakery tradition. The word literally translates as "things in the style of Vienna" — a reference to the 19th-century Viennese bakers who introduced these pastries to Paris.',
    [
      ['What Counts as Viennoiserie', 'Viennoiserie is made from an enriched, often laminated dough — butter and milk are folded into the dough, giving the finished product a flakier, richer character than plain bread. Croissants, pains au chocolat, brioche, kouign-amann, chaussons aux pommes, and Danish pastries are all viennoiserie.'],
      ['Why It Matters', 'A great croissant is one of the most technically difficult things a bakery can produce. The lamination — folding butter into dough through multiple turns — must be done at the right temperature, and the final proof is notoriously fussy. Dedicated viennoiserie specialists have become destinations for travellers who care about laminated pastry as its own craft.'],
      ['Where to Go', "Melbourne's Lune Croissanterie, Copenhagen's Juno the Bakery, London's Pophams, and most serious Paris boulangeries are good places to start a viennoiserie deep-dive."],
    ]
  ),

  'beginners-guide-to-sourdough': stub(
    "A Beginner’s Guide to Sourdough Bread",
    "How to read a sourdough bakery’s display case — and what the vocabulary actually means.",
    'Education',
    '2026-02-04',
    "Sourdough has become the dominant style of modern artisan bread, but the vocabulary around it can be intimidating. Here’s a short guide to understanding what you're looking at.",
    [
      ['Naturally Leavened', 'A sourdough loaf is made without commercial yeast. Instead, a wild starter — a culture of wild yeasts and lactobacillus bacteria — raises the bread. Naturally leavened breads have more complex flavour, longer shelf life, and are often easier to digest than commercial yeasted breads.'],
      ['Long Ferment', 'Good sourdough typically ferments for 12–24+ hours. The long ferment develops gluten structure, flavour, and the open "alveolar" crumb inside the loaf. Short-cut sourdoughs exist but they taste noticeably flatter.'],
      ['Heritage Grains', 'Many modern artisan bakeries work with heritage or ancient wheat varieties — spelt, einkorn, emmer, Red Fife — that predate modern industrial wheat breeding. These grains tend to have more character and are often easier to digest.'],
    ]
  ),

  'beginners-guide-to-macarons': stub(
    "A Beginner’s Guide to Macarons",
    'What to look for in a real French macaron — and the bakeries that make them best.',
    'Education',
    '2026-01-28',
    "The French macaron — an almond-meringue sandwich cookie with a ganache or buttercream filling — is one of the most demanding things a pastry chef can make. Here's what to look for and where to find the best.",
    [
      ['Structure', 'A good macaron has a smooth domed top, a characteristic "foot" or ruffled base, and a slightly chewy interior with a delicate crispness on the outside. A hollow interior, cracked top, or lopsided shape are all signs of technical failure.'],
      ['Flavour', "The best macaron bakeries rotate seasonal flavours. Pierre Hermé's Ispahan (rose, lychee, raspberry) and Ladurée's rose-petal macaron are benchmark modern examples. Classics include pistachio, chocolate, salted caramel, and vanilla."],
      ['Where to Start', 'Pierre Hermé and Ladurée in Paris are the obvious first stops, but every major pastry city now has a serious macaron specialist. Look for a bakery where the macarons are made fresh and rotate in flavour through the year.'],
    ]
  ),

  'beginners-guide-to-bagels': stub(
    "A Beginner’s Guide to Bagels — New York, Montreal and Beyond",
    'The two great North American bagel traditions, and why they taste so different.',
    'Education',
    '2026-01-22',
    "North America has two great bagel traditions — New York and Montreal — and passionate adherents of each. Here's the difference, and how to spot a real hand-rolled bagel anywhere in the world.",
    [
      ['New York Bagels', "New York-style bagels are larger, with a puffier interior and a softer crust. They are boiled in plain water before baking, producing a shinier, chewier exterior. Cream cheese and lox is the classic pairing, and the best New York bagels are hand-rolled at places like Russ & Daughters and Ess-a-Bagel."],
      ['Montreal Bagels', 'Montreal-style bagels are smaller, denser, and slightly sweeter. They are boiled in honey-sweetened water and baked in wood-fired ovens, producing a more caramelised crust. Fairmount Bagel (since 1919) and St-Viateur Bagel (since 1957) are the defining Mile End bakeries of this tradition.'],
      ['Signs of a Real Bagel', "Hand-rolled, boiled before baking, and eaten the day they're made. Pre-packaged supermarket bagels that are baked directly from frozen dough are bagel-shaped bread rolls, not real bagels."],
    ]
  ),

  'beginners-guide-to-babka': stub(
    "A Beginner’s Guide to Babka",
    'The Eastern European chocolate-swirl bread that has become a global bakery obsession.',
    'Education',
    '2026-01-15',
    'Babka is a rich, enriched Jewish yeast bread typically filled with chocolate or cinnamon, twisted into a striking spiral pattern, and baked in a loaf tin. It has become one of the most exported pastries of the past decade.',
    [
      ['Origin', 'Babka originated in Eastern European Jewish communities as a way to use leftover challah dough. The chocolate version is the modern bestseller, but traditional fillings include cinnamon, poppy seed, and Nutella.'],
      ['Who Put It on the Map', "Uri Scheft's Lehamim Bakery in Tel Aviv is largely responsible for the modern global babka boom. His chocolate babka — with its laminated, pull-apart layers — inspired a wave of copycats in New York, London, and Paris."],
      ['Where to Try It', 'Lehamim (Tel Aviv), Breads Bakery (New York), and Marzipan Bakery (Jerusalem, for the rugelach cousin) are the three definitive destinations.'],
    ]
  ),

  'how-to-choose-bread': stub(
    'How to Choose a Great Loaf of Bread',
    'The signs of real artisan bread — from crust to crumb to weight in the hand.',
    'Education',
    '2026-01-08',
    "Walking into a good bakery can be overwhelming. Here's a short field guide to identifying a genuinely well-made loaf.",
    [
      ['Look at the Crust', 'A well-baked country loaf has a deeply coloured, blistered crust. Pale, uniformly golden loaves are usually under-baked. The crust should crackle slightly when you press it.'],
      ['Feel the Weight', 'Pick up the loaf. A well-made country bread should feel dense for its size — lots of flour and water have gone into it. Suspiciously light loaves often contain air rather than flavour.'],
      ['Listen and Cut', 'A fresh loaf should sound hollow when you tap the bottom. Inside, look for an open, irregular crumb with shiny walls — the sign of good fermentation and strong gluten development.'],
    ]
  ),

  'classic-pastries-guide': stub(
    'Classic Pastries Every Bakery Traveller Should Know',
    'A short glossary of essential European pastries, from sfogliatelle to kouign-amann.',
    'Education',
    '2026-01-02',
    "If you're travelling through European bakery cities, a small vocabulary of classic pastries goes a long way. Here are seven to know.",
    [
      ['Mille-feuille (France)', 'Three layers of puff pastry with pastry cream between, topped with icing. One of the most technically demanding classical French pastries.'],
      ['Kouign-amann (Brittany)', 'A laminated butter-and-sugar pastry from Brittany. The sugar caramelises as it bakes, producing a glossy, crunchy crust.'],
      ['Sfogliatelle (Naples)', 'A shell-shaped pastry with hundreds of flaky layers, filled with semolina and ricotta.'],
      ['Maritozzo (Rome)', 'A sweet brioche bun split and filled with whipped cream. A Roman breakfast classic.'],
      ['Pastel de nata (Portugal)', 'A Portuguese custard tart with a crisp, caramelised top. Born at the Jerónimos monastery and globally exported.'],
      ['Dobos torte (Hungary)', 'A five-layer sponge cake with chocolate buttercream and a hard caramel top. Invented in 1884 in Budapest.'],
      ['Sachertorte (Vienna)', 'A dense chocolate cake with a thin layer of apricot jam and a hard chocolate glaze. Invented at the Hotel Sacher in 1832.'],
    ]
  ),
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

        <nav style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid rgba(212,148,76,0.06)' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#4a4540', marginBottom: 12 }}>
            Related Reading
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(POSTS).filter(([s]) => s !== params.slug).slice(0, 6).map(([slug, p]) => (
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
