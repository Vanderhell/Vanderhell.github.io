const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const products = require('../site/catalogue/products.json');
const areas = require('../site/catalogue/engineering-areas.json');
const fixedPages = ['index.html', 'all-projects.html', 'about.html', 'lox-family.html', 'micro-toolkit.html', 'axiom-one.html', 'beyond-lox.html'];
const errors = [];
const slugs = new Set();

for (const [index, product] of products.entries()) {
  const label = `catalogue entry ${index + 1}${product.slug ? ` (${product.slug})` : ''}`;
  for (const key of ['slug', 'name', 'family', 'status', 'language', 'license', 'repository', 'description']) {
    if (typeof product[key] !== 'string' || !product[key].trim()) errors.push(`${label}: missing or invalid ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug || '')) errors.push(`${label}: malformed slug`);
  if (slugs.has(product.slug)) errors.push(`duplicate catalogue slug: ${product.slug}`);
  slugs.add(product.slug);
  if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(product.repository || '')) errors.push(`${label}: invalid repository URL`);
  if (!Array.isArray(product.tags) || product.tags.some(tag => typeof tag !== 'string' || !tag.trim())) errors.push(`${label}: malformed tags`);
}

const expected = [...fixedPages, ...products.map(product => `projects/${product.slug}.html`)];
const areaSlugs = new Set();
for (const [key, area] of Object.entries(areas)) {
  if (!area.label || !Array.isArray(area.products)) errors.push(`malformed engineering area: ${key}`);
  for (const slug of area.products || []) {
    if (!slugs.has(slug)) errors.push(`engineering area ${key} references unknown product: ${slug}`);
    areaSlugs.add(slug);
  }
}
for (const product of products) if (!areaSlugs.has(product.slug)) errors.push(`product has no engineering-area classification: ${product.slug}`);
const generatedProducts = fs.readdirSync(path.join(root, 'projects')).filter(file => file.endsWith('.html')).sort();
const expectedProducts = products.map(product => `${product.slug}.html`).sort();
if (JSON.stringify(generatedProducts) !== JSON.stringify(expectedProducts)) errors.push('catalogue/product mismatch: generated product pages differ from catalogue');

let checked = 0;
for (const rel of expected) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) { errors.push(`missing generated page: ${rel}`); continue; }
  checked++;
  const html = fs.readFileSync(file, 'utf8');
  if (/<!--(?:PRODUCT_CATALOGUE|MICRO_CORE|MICRO_ADDITIONAL|LOX_PRODUCTS|INDEPENDENT_GROUPS)-->/i.test(html)) errors.push(`${rel}: unresolved build marker`);
  if (rel.startsWith('projects/')) {
    const product = products.find(item => `projects/${item.slug}.html` === rel);
    if (product) {
      const card = path.join(root, 'og', 'products', `${product.slug}.svg`);
      if (!fs.existsSync(card)) errors.push(`${rel}: missing product social card`);
      if (!html.includes(`og/products/${product.slug}.svg`)) errors.push(`${rel}: missing product-specific social image metadata`);
      if (!html.includes(product.repository)) errors.push(`${rel}: missing repository link`);
      if (!html.includes(`<title>${product.name} — Vanderhell Development</title>`)) errors.push(`${rel}: product title metadata does not match catalogue identity`);
      if (!html.includes(`https://vanderhell.github.io/projects/${product.slug}.html`)) errors.push(`${rel}: canonical URL does not preserve product path`);
    }
  }
  for (const required of ['<title>', 'name="description"', 'rel="canonical"', 'property="og:title"', 'name="twitter:card"', 'id="main"']) {
    if (!html.includes(required)) errors.push(`${rel}: missing ${required}`);
  }
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${rel}: missing page title`);
  if (!/<meta name="description" content="[^"]+"/i.test(html)) errors.push(`${rel}: missing meta description`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  if (!canonical || !canonical.startsWith('https://vanderhell.github.io/')) errors.push(`${rel}: missing or invalid canonical URL`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const repeated = ids.find((id, index) => ids.indexOf(id) !== index);
  if (repeated) errors.push(`${rel}: duplicate id "${repeated}"`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const ref = match[1];
    if (/^(?:https?:|mailto:|data:|javascript:|tel:)/i.test(ref)) continue;
    const [rawTarget, hash] = ref.split('#');
    const target = rawTarget.replace(/\?.*$/, '');
    const resolved = path.resolve(path.dirname(file), target || path.basename(file));
    if (target && !fs.existsSync(resolved)) errors.push(`${rel}: broken internal URL ${ref}`);
    if (hash) {
      const targetHtml = target && fs.existsSync(resolved) && resolved.endsWith('.html') ? fs.readFileSync(resolved, 'utf8') : html;
      const escaped = hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`\\bid=["']${escaped}["']`).test(targetHtml)) errors.push(`${rel}: missing anchor ${ref}`);
    }
  }
  const h1 = (html.match(/<h1\b/gi) || []).length;
  if (h1 !== 1) errors.push(`${rel}: expected one h1, found ${h1}`);
}

const cataloguePage = fs.readFileSync(path.join(root, 'all-projects.html'), 'utf8');
if (!new RegExp(`data-catalogue-count[^>]*>${products.length}<`, 'i').test(cataloguePage)) errors.push('stale project count in catalogue page');
if ((cataloguePage.match(/<article class="ds-catalogue-item" data-project-card/g) || []).length !== products.length) errors.push('catalogue page card count mismatch');
for (const field of ['family', 'status', 'language', 'areas']) if (!cataloguePage.includes(`data-filter="${field}"`)) errors.push(`catalogue page missing ${field} filter`);
const familyPages = { 'LOX': 'lox-family.html', 'Micro-toolkit': 'micro-toolkit.html', 'Axiom One primitives': 'axiom-one.html', 'Additional projects': 'beyond-lox.html' };
for (const [family, pageName] of Object.entries(familyPages)) {
  const page = fs.readFileSync(path.join(root, pageName), 'utf8');
  const expectedCount = products.filter(product => product.family === family).length;
  if (!new RegExp(`data-family-count="${family}"[^>]*>${expectedCount}<`).test(page)) errors.push(`stale or missing family count for ${family}`);
}
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const product of products) if (!sitemap.includes(`projects/${product.slug}.html`)) errors.push(`sitemap missing product: ${product.slug}`);
if ((sitemap.match(/<url>/g) || []).length !== new Set([...fixedPages, ...products.map(product => `projects/${product.slug}.html`)]).size) errors.push('sitemap URL count mismatch');

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${checked} generated HTML pages; catalogue, URLs, metadata, IDs and sitemap verified.`);
