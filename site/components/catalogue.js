const areas = require('../catalogue/engineering-areas.json');

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const slug = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const familyNames = {
  'LOX': 'LOX',
  'Micro-toolkit': 'Micro Toolkit',
  'Axiom One primitives': 'Axiom One',
  'Additional projects': 'Independent Systems'
};
const productAreas = Object.fromEntries(Object.entries(areas).flatMap(([key, area]) => area.products.map(product => [product, key])));

function areaTags(product) {
  return Object.entries(areas).filter(([, area]) => area.products.includes(product.slug)).map(([key, area]) => ({ key, label: area.label }));
}

function renderProductCard(product) {
  const tags = areaTags(product);
  const tagsText = tags.map(tag => tag.key).join(' ');
  const statusClass = slug(product.status);
  return `<article class="ds-catalogue-item" data-project-card data-family="${escapeHtml(product.family)}" data-status="${escapeHtml(product.status)}" data-language="${escapeHtml(product.language)}" data-areas="${escapeHtml(tagsText)}">
    <div class="ds-catalogue-top"><span class="ds-catalogue-family">${escapeHtml(familyNames[product.family] || product.family)}</span><span class="ds-catalogue-status ${statusClass}">${escapeHtml(product.status)}${product.version ? ` · ${escapeHtml(product.version)}` : ''}</span></div>
    <h3><a href="projects/${escapeHtml(product.slug)}.html">${escapeHtml(product.name)}</a></h3>
    <p>${escapeHtml(product.description)}</p>
    <div class="ds-catalogue-meta"><span>${escapeHtml(product.language)}</span><span>${escapeHtml(product.license)}</span></div>
    <div class="ds-catalogue-tags">${tags.map(tag => `<span>${escapeHtml(tag.label)}</span>`).join('')}</div>
    <a class="ds-catalogue-open" href="projects/${escapeHtml(product.slug)}.html">Product details <span aria-hidden="true">↗</span></a>
  </article>`;
}

function renderOption(value, label) {
  return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
}

function renderCatalogue(products) {
  const families = [...new Set(products.map(product => product.family))].sort();
  const statuses = [...new Set(products.map(product => product.status))].sort();
  const languages = [...new Set(products.map(product => product.language))].sort();
  const areaOptions = Object.entries(areas).map(([key, area]) => renderOption(key, area.label)).join('');
  const cards = [...products].sort((a, b) => a.name.localeCompare(b.name)).map(renderProductCard).join('\n');
  return `<div class="ds-catalogue-controls" aria-label="Filter product catalogue">
    <label class="ds-catalogue-search">Search products <input id="project-search" type="search" placeholder="Name, capability, language, area…" autocomplete="off"></label>
    <label>Family <select data-filter="family"><option value="">All families</option>${families.map(family => renderOption(family, familyNames[family] || family)).join('')}</select></label>
    <label>Status <select data-filter="status"><option value="">All statuses</option>${statuses.map(status => renderOption(status, status)).join('')}</select></label>
    <label>Language / runtime <select data-filter="language"><option value="">All languages</option>${languages.map(language => renderOption(language, language)).join('')}</select></label>
    <label>Engineering area <select data-filter="areas"><option value="">All areas</option>${areaOptions}</select></label>
    <button type="button" class="ds-filter-reset" data-filter-reset>Reset filters</button>
  </div>
  <p class="ds-results" role="status" aria-live="polite"><strong data-result-count>${products.length}</strong> of ${products.length} products</p>
  <div class="ds-catalogue-grid">${cards}</div>
  <p class="empty" hidden>No products match these filters.</p>`;
}

function renderCards(products) {
  return [...products].sort((a, b) => a.name.localeCompare(b.name)).map(renderProductCard).join('\n');
}

module.exports = { areas, areaTags, familyNames, productAreas, renderCatalogue, renderProductCard, renderCards };
