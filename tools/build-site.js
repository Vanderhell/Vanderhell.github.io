/*
 * Static site build entry point.
 * Product-page HTML lives under site/products; catalogue metadata is separate.
 * Pages are copied into the GitHub Pages URL layout without a runtime backend.
 */
const fs = require('node:fs');
const path = require('node:path');
const { buildSitemap } = require('../site/core/sitemap');
const { renderCatalogue } = require('../site/components/catalogue');
const { microCore, microAdditional, renderIndependentProducts, renderLoxProducts, renderMicroSection } = require('../site/components/families');
const { writeSocialCards } = require('../site/components/social-cards');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'site');
const products = require('../site/catalogue/products.json');
const rootPages = ['index.html', 'all-projects.html', 'about.html', 'lox-family.html', 'micro-toolkit.html', 'axiom-one.html', 'beyond-lox.html'];
const repairEncoding = text => text
  .replaceAll('\u00e2\u20ac\u201d', '—').replaceAll('\u00e2\u20ac\u201c', '“').replaceAll('\u00e2\u20ac\u2122', '’')
  .replaceAll('\u00e2\u20ac\u00a6', '…').replaceAll('\u00e2\u20ac\u009d', '”')
  .replaceAll('\u00e2\u2020\u2019', '→').replaceAll('\u00e2\u2020\u2018', '↑')
  .replaceAll('\u00e2\u2020\u201c', '↓').replaceAll('\u00e2\u2020\u2122', '↗')
  .replaceAll('\u00e2\u2020\u201d', '↔')
  .replaceAll('\u00c2\u00b7', '·').replaceAll('\u00c2\u00a9', '©').replaceAll('\u00c2\u00b5', 'µ');
const ensureDir = directory => fs.mkdirSync(directory, { recursive: true });
const writeHtml = (file, html) => fs.writeFileSync(file, `${html.trimEnd()}\n`);
const addCatalogueCounts = html => html
  .replace(/(<span\b[^>]*data-catalogue-count[^>]*>)[\s\S]*?(<\/span>)/g, `$1${products.length}$2`)
  .replace(/<span\b([^>]*data-family-count="([^"]+)"[^>]*)>[\s\S]*?<\/span>/g, (_, attrs, family) => `<span${attrs}>${products.filter(product => product.family === family).length}</span>`);
const reviseNavigation = html => html
  .replaceAll('>Additional projects</a>', '>Independent Systems</a>')
  .replaceAll('>Beyond LOX</a>', '>Independent Systems</a>');
const productMetadata = (html, product) => {
  const title = `${product.name} — Vanderhell Development`;
  const image = `https://vanderhell.github.io/og/products/${product.slug}.svg`;
  return html
    .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?\s*>/i, `<meta property="og:title" content="${title}">`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/?\s*>/i, `<meta property="og:image" content="${image}"><meta property="og:image:alt" content="${title} social preview">`)
    .replace(/<meta name="twitter:card" content="[^"]*"\s*\/?\s*>/i, `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${image}"><meta name="twitter:image:alt" content="${title} social preview">`);
};

for (const page of rootPages) {
  const input = path.join(source, 'pages', page);
  if (!fs.existsSync(input)) throw new Error(`Missing page source: site/pages/${page}`);
  let html = fs.readFileSync(input, 'utf8');
  if (page === 'all-projects.html') {
    html = html.replaceAll('{{PRODUCT_COUNT}}', String(products.length));
    html = html.replace('<!--PRODUCT_CATALOGUE-->', renderCatalogue(products));
  }
  if (page === 'lox-family.html') html = html.replace('<!--LOX_PRODUCTS-->', renderLoxProducts(products.filter(product => product.family === 'LOX')));
  if (page === 'micro-toolkit.html') {
    html = html.replace('<!--MICRO_CORE-->', renderMicroSection(products, microCore));
    html = html.replace('<!--MICRO_ADDITIONAL-->', renderMicroSection(products, microAdditional));
  }
  if (page === 'beyond-lox.html') html = html.replace('<!--INDEPENDENT_GROUPS-->', renderIndependentProducts(products.filter(product => product.family === 'Additional projects')));
  if (page === 'all-projects.html') {
    html = html.replace(/\b\d+(?= public repository projects?)/g, String(products.length));
    html = html.replace(/project catalogue of \d+ public projects?/i, `project catalogue of ${products.length} public projects`);
  }
  html = repairEncoding(reviseNavigation(addCatalogueCounts(html)));
  writeHtml(path.join(root, page), html);
}

const outputProducts = path.join(root, 'projects');
ensureDir(outputProducts);
for (const product of products) {
  const input = path.join(source, 'products', `${product.slug}.html`);
  if (!fs.existsSync(input)) throw new Error(`Missing product page module: site/products/${product.slug}.html`);
  writeHtml(path.join(outputProducts, `${product.slug}.html`), repairEncoding(reviseNavigation(addCatalogueCounts(productMetadata(fs.readFileSync(input, 'utf8'), product)))));
}

writeSocialCards(products, root);
fs.writeFileSync(path.join(root, 'sitemap.xml'), buildSitemap(products));
fs.writeFileSync(path.join(root, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://vanderhell.github.io/sitemap.xml\n');
console.log(`Built ${rootPages.length} site pages and ${products.length} product pages.`);
