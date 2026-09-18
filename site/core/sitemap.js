const base = 'https://vanderhell.github.io/';
const fixedPages = ['', 'lox-family.html', 'micro-toolkit.html', 'axiom-one.html', 'beyond-lox.html', 'all-projects.html', 'about.html'];

function buildSitemap(products) {
  const urls = [...fixedPages, ...products.map(product => `projects/${product.slug}.html`)];
  const unique = [...new Set(urls)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${unique.map(url => `<url><loc>${base}${url}</loc></url>`).join('')}</urlset>\n`;
}

module.exports = { buildSitemap };
