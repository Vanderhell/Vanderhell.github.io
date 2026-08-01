# Vanderhell GitHub Pages portfolio

Static HTML/CSS/JavaScript portfolio for the LOX family, Micro-toolkit and
independent Vanderhell projects. Product copy is maintained in
`tools/build-site.js` and generated into `index.html` and `projects/*.html`.

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

Claims were derived from the local repositories' README files, public headers,
documentation, examples, tests, build files, licenses, release notes, platform
adapters and evidence matrices. `projects/loxc.html` intentionally carries no
technical claims because a public local source repository was unavailable.
THENG is not published because its public GitHub Pages evidence was not present.
