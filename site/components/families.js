const { renderCards } = require('./catalogue');

const loxGroups = [
  { title: 'Persistence & data formats', slugs: ['loxdb', 'loxdb-pro', 'loxdust', 'loxc'] },
  { title: 'Recovery & operational state', slugs: ['loxboot', 'loxseq', 'loxguard', 'loxperm', 'loxalarm'] },
  { title: 'Resource policy & processing', slugs: ['loxbudget', 'loxsort'] }
];

function renderLoxProducts(products) {
  const bySlug = new Map(products.map(product => [product.slug, product]));
  const grouped = new Set();
  return loxGroups.map(group => {
    const items = group.slugs.map(slug => bySlug.get(slug)).filter(Boolean);
    items.forEach(product => grouped.add(product.slug));
    if (!items.length) return '';
    return `<section class="ds-family-group"><div class="ds-section-heading"><div><span class="ds-section-index">${String(loxGroups.indexOf(group) + 1).padStart(2, '0')} / LOX DOMAIN</span><h3>${group.title}</h3></div></div><div class="ds-catalogue-grid">${renderCards(items)}</div></section>`;
  }).join('\n');
}

const microCore = ['microfsm','microres','microconf','microlog','microsh','microcbor','micoring','microtimer','microbus'];
const microAdditional = ['micronet','microboot','microflash','microhealth','microassert','microcrypt','microdh','microtest','microwdt','microota'];

function renderMicroSection(products, slugs) {
  const bySlug = new Map(products.map(product => [product.slug, product]));
  return `<div class="ds-catalogue-grid">${renderCards(slugs.map(slug => bySlug.get(slug)).filter(Boolean))}</div>`;
}

const independentGroups = [
  { title: 'Persistent data & formats', slugs: ['iotspool','ironfamily-fileengine','num8','nvlog'] },
  { title: 'Communication & update transport', slugs: ['umesh','num8-lup'] },
  { title: 'Execution & runtime systems', slugs: ['basalt-net','nexum','implicitnet'] },
  { title: 'Research & simulation', slugs: ['compost'] },
  { title: 'Diagnostics, safety & utilities', slugs: ['cguard','defer','mcu-malloc-tracker','panicdump','safemath'] }
];

function renderIndependentProducts(products) {
  const bySlug = new Map(products.map(product => [product.slug, product]));
  return independentGroups.map((group, index) => {
    const items = group.slugs.map(slug => bySlug.get(slug)).filter(Boolean);
    if (!items.length) return '';
    return `<section class="ds-family-group"><div class="ds-section-heading"><div><span class="ds-section-index">${String(index + 1).padStart(2, '0')} / SYSTEM DOMAIN</span><h3>${group.title}</h3></div></div><div class="ds-catalogue-grid">${renderCards(items)}</div></section>`;
  }).join('\n');
}

module.exports = { microCore, microAdditional, renderIndependentProducts, renderLoxProducts, renderMicroSection };
