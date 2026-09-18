const path = require('node:path');
const fs = require('node:fs');
const areas = require('../catalogue/engineering-areas.json');

const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' })[c]);
const familyTone = family => family === 'LOX' ? '#48c9e0' : family === 'Micro-toolkit' ? '#8ed8b8' : family === 'Axiom One primitives' ? '#bdadff' : '#64b7ff';

function renderSocialCard(product, root) {
  const area = Object.entries(areas).find(([, value]) => value.products.includes(product.slug));
  const label = area?.[1].label || 'Systems software';
  const hue = familyTone(product.family);
  const name = escape(product.name);
  const description = escape(product.description.length > 112 ? `${product.description.slice(0, 109)}…` : product.description);
  const descriptionLines = description.split(/\s+/).reduce((lines, word) => {
    const last = lines.length - 1;
    if (last < 0 || `${lines[last]} ${word}`.trim().length > 68) lines.push(word);
    else lines[last] = `${lines[last]} ${word}`.trim();
    return lines;
  }, []).slice(0, 2).map((line, index) => `<tspan x="82" dy="${index ? 30 : 0}">${line}</tspan>`).join('');
  const family = escape(product.family);
  const seed = product.slug.split('').reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const nodes = Array.from({ length: 5 }, (_, i) => {
    const x = 510 + i * 67;
    const y = 190 + ((seed >>> (i * 3)) % 3) * 74;
    return { x, y };
  });
  const routes = nodes.slice(1).map((node, i) => `<path d="M${nodes[i].x} ${nodes[i].y} C${nodes[i].x + 35} ${nodes[i].y},${node.x - 35} ${node.y},${node.x} ${node.y}"/>`).join('');
  const marks = nodes.map((node, i) => `<g><circle cx="${node.x}" cy="${node.y}" r="${i === 2 ? 11 : 7}"/><text x="${node.x}" y="${node.y + 27}">${i === 2 ? escape(label.toUpperCase().slice(0, 12)) : `0${i + 1}`}</text></g>`).join('');
  const motif = {
    'storage-persistence': `<g fill="#0c2336" stroke="${hue}" stroke-width="2"><rect x="525" y="172" width="230" height="56"/><rect x="550" y="246" width="230" height="56"/><rect x="575" y="320" width="230" height="56"/></g><g fill="#dceaf0" font-family="monospace" font-size="12"><text x="550" y="205">STATE / OBJECTS</text><text x="575" y="279">JOURNAL / FORMAT</text><text x="600" y="353">MEDIA / CHECKPOINT</text></g>` ,
    'recovery-lifecycle': `<g fill="#0c2336" stroke="${hue}" stroke-width="2"><rect x="530" y="210" width="145" height="100"/><rect x="760" y="210" width="145" height="100"/></g><g fill="#f2f8fb" font-family="monospace" text-anchor="middle"><text x="602" y="250">STATE A</text><text x="602" y="278">VALID</text><text x="832" y="250">STATE B</text><text x="832" y="278">PENDING</text></g><path d="M675 245h85m0 30H675" fill="none" stroke="${hue}" stroke-width="3"/><path d="M750 236l12 9-12 9M685 266l-12 9 12 9" fill="none" stroke="${hue}" stroke-width="2"/>`,
    'diagnostics': `<path d="M500 282h70l24-72 36 147 35-112 31 52h185" fill="none" stroke="${hue}" stroke-width="4"/><g fill="#0c2336" stroke="${hue}" stroke-width="2"><circle cx="570" cy="282" r="8"/><circle cx="670" cy="357" r="8"/><circle cx="766" cy="297" r="8"/><circle cx="881" cy="297" r="8"/></g><text x="605" y="420" fill="#9fb7c6" font-family="monospace" font-size="12">CAPTURE · RETAIN · DECODE</text>`,
    'communication': `<g fill="none" stroke="${hue}" stroke-width="2" opacity=".78">${routes}</g><g fill="#0c2336" stroke="${hue}" stroke-width="2" font-family="monospace" text-anchor="middle">${marks}</g>`,
    'deterministic-control': `<g fill="#0c2336" stroke="${hue}" stroke-width="2">${Array.from({length:9},(_,i)=>`<rect x="540" y="190" width="54" height="54" transform="translate(${(i%3)*72} ${Math.floor(i/3)*72})"/>`).join('')}</g><path d="M560 380h198m-18-18 18 18-18 18" fill="none" stroke="${hue}" stroke-width="3"/><text x="620" y="420" fill="#9fb7c6" font-family="monospace" font-size="12">EXPLICIT STATE → RESULT</text>`,
    'runtime-infrastructure': `<g fill="#0c2336" stroke="${hue}" stroke-width="2"><rect x="500" y="250" width="125" height="76"/><rect x="685" y="250" width="125" height="76"/><rect x="870" y="250" width="125" height="76"/></g><g fill="#f2f8fb" font-family="monospace" font-size="12" text-anchor="middle"><text x="562" y="294">INPUT</text><text x="747" y="294">RUNTIME</text><text x="932" y="294">RESULT</text></g><path d="M625 288h60m125 0h60" stroke="${hue}" stroke-width="3"/>`,
    'data-formats': `<g fill="#0c2336" stroke="${hue}" stroke-width="2"><rect x="555" y="185" width="280" height="58"/><rect x="555" y="255" width="280" height="58"/><rect x="555" y="325" width="280" height="58"/></g><g fill="#f2f8fb" font-family="monospace" font-size="12"><text x="580" y="220">HEADER / VERSION</text><text x="580" y="290">FIELDS / PAYLOAD</text><text x="580" y="360">VALIDATION / EVIDENCE</text></g>`,
    'embedded-utilities': `<g fill="#0c2336" stroke="${hue}" stroke-width="2">${Array.from({length:12},(_,i)=>`<rect x="550" y="180" width="55" height="55" transform="translate(${(i%4)*72} ${Math.floor(i/4)*72})"/>`).join('')}</g><text x="550" y="420" fill="#9fb7c6" font-family="monospace" font-size="12">SMALL · BOUNDED · COMPOSABLE</text>`
  }[area?.[0]] || `<g fill="none" stroke="${hue}" stroke-width="2">${routes}</g><g fill="#0c2336" stroke="${hue}" stroke-width="2">${marks}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc"><title id="title">${name} · Vanderhell Development</title><desc id="desc">${description}</desc><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#071522"/><stop offset="1" stop-color="#102e46"/></linearGradient><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#8db5c8" stroke-opacity=".08"/></pattern></defs><rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#grid)"/><circle cx="170" cy="170" r="235" fill="${hue}" opacity=".07"/><g>${motif}</g><text x="80" y="88" fill="${hue}" font-family="monospace" font-size="19" letter-spacing="3">VANDERHELL DEVELOPMENT</text><text x="80" y="280" fill="#f2f8fb" font-family="system-ui,sans-serif" font-size="58" font-weight="700">${name}</text><text x="82" y="334" fill="#9fb7c6" font-family="monospace" font-size="16" letter-spacing="2">${family.toUpperCase()} · ${escape(label.toUpperCase())}</text><text x="82" y="395" fill="#d1dfe6" font-family="system-ui,sans-serif" font-size="21">${descriptionLines}</text><text x="82" y="570" fill="#7894a7" font-family="monospace" font-size="15">${escape(product.language)} · ${escape(product.status)} · TECHNICAL PRODUCT</text><path d="M80 118H1120" stroke="${hue}" stroke-opacity=".45"/><path d="M80 535H1120" stroke="#91a9b8" stroke-opacity=".25"/></svg>`;
}

function writeSocialCards(products, root) {
  const dir = path.join(root, 'og', 'products');
  fs.mkdirSync(dir, { recursive: true });
  for (const product of products) fs.writeFileSync(path.join(dir, `${product.slug}.svg`), renderSocialCard(product, root));
}

module.exports = { renderSocialCard, writeSocialCards };
