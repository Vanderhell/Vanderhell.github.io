# Vanderhell Development product site

Static HTML/CSS/JavaScript product site for the LOX family, Micro Toolkit,
Axiom One and independent Vanderhell systems.

## Site architecture

- `site/catalogue/products.json` contains shared catalogue metadata: identity,
  family, status, runtime, repository, concise description and tags.
- `site/products/<slug>.html` is the source page for that product URL. The
  product owns its information architecture and technical narrative; the
  generator does not infer product bodies from catalogue fields.
- `site/pages/` contains the homepage, catalogue, family and about page sources.
- `site/components/` contains catalogue/family discovery composition and the
  product-specific SVG social-card generator. Product body sections remain in
  their individual page sources.
- `site/core/` contains shared static build helpers.
- `assets/site.css` composes the compatibility sheet with the maintained
  design-system modules in `assets/css/` (tokens, primitives, product systems,
  motion and responsive rules).
- `tools/build-site.js` emits normal GitHub Pages HTML and a catalogue-derived
  sitemap. `tools/check-site.js` checks generated output against the catalogue.

Catalogue metadata is shared. Product-page content is intentionally
product-specific. Do not create universal generated product prose. To add a
product, add its metadata to the catalogue and author its page in
`site/products/<slug>.html`, then run the build and checker.

Product-specific detail pages are being migrated one at a time from repository
evidence. Bespoke pages currently cover IronFamily.FileEngine, LOX DB, LOX DB Pro,
Basalt.NET, Nexum, Axiom One, LOX Boot, ImplicitNet, µMesh, Compost, panicdump
safemath, LOX Budget, LOX Sequence, LOX Perm, LOX Alarm and LOX Guard. The
other 31 catalogue pages still need their own architecture and evidence review.
Normal builds no longer depend on
`tools/legacy-build-site.js`.

## Local preview

1. Regenerate the site after content changes:

   ```powershell
   node tools/build-site.js
   ```

2. Start any static HTTP server from the repository root, for example:

   ```powershell
   python -m http.server 8080
   ```

3. Open `http://localhost:8080/`. Opening HTML directly also works for the core
   content, but an HTTP server is recommended for realistic browser checks.

No build framework, database, backend, or runtime dependency is required by the
deployed site.

## Google Analytics

The site is safe with analytics disabled. To enable GA4, set
`window.LOX_ANALYTICS_ID` in `analytics-config.js` to the real `G-...`
measurement ID. Do not edit `assets/analytics.js`.

Tracked events: `github_click`, `quickstart_click`, `commercial_licensing`,
`copy_code`, `use_filter`, `run_demo`, and `docs_open`.

## Content evidence

Claims in audited pages were checked against the corresponding public repositories' README files, public headers,
documentation, examples, tests, build files, licenses, release notes, platform
adapters and evidence matrices. `projects/loxc.html` intentionally carries no
technical claims because a public local source repository was unavailable.
THENG is not published because its public GitHub Pages evidence was not present.
