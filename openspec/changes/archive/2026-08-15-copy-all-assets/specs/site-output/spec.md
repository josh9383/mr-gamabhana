# site-output Specification

## MODIFIED Requirements

### Requirement: [REQ-SO-007: Static assets copied to site]
The build SHALL copy `theme/style.css`, `theme/app.js`, and the complete contents of the `theme/assets/` directory into `site/assets/` so all pages reference assets from the generated site. Every file present in `theme/assets/` SHALL be copied; the build SHALL NOT require an explicit list of asset filenames.

#### Scenario: Assets are available in site
- **WHEN** the build completes
- **THEN** `site/assets/style.css`, `site/assets/app.js`, `site/assets/minisearch.min.js`, and `site/assets/card-fallback.png` exist
- **AND** every generated HTML page references them via the site's `base_url`

#### Scenario: Tom Select assets are copied
- **WHEN** the build completes
- **THEN** `site/assets/tom-select.min.js` and `site/assets/tom-select.bootstrap5.min.css` exist alongside the other static assets

#### Scenario: Whole assets folder is copied
- **WHEN** the build completes
- **THEN** every file present in `theme/assets/` exists in `site/assets/`
- **AND** adding a new file to `theme/assets/` does not require a `build.py` change to ship it

#### Scenario: Logo assets are copied
- **WHEN** the build completes
- **THEN** `site/assets/logo_color.png`, `site/assets/logo_dark.png`, and `site/assets/logo_light.png` exist
- **AND** the home page navbar brand referencing `assets/{{ site.logo }}` resolves
