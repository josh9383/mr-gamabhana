# site-output Delta

## MODIFIED Requirements

### Requirement: [REQ-SO-009: Self-contained output artifacts]
Every generated artifact SHALL be entirely self-contained with no shared runtime cross-dependencies: each page SHALL reference only assets under the site's own `base_url` path, and no page SHALL depend on another page's file at runtime. The theme stylesheet and Bootstrap script SHALL be loaded from the URLs resolved by the build from `site.json` (see REQ-SO-011) and MAY reference external CDN links.

#### Scenario: Pages are atomic and self-contained
- **WHEN** any generated page is hosted standalone under its `base_url`
- **THEN** it renders correctly using only its own markup, `site/assets/style.css`, and `site/assets/app.js`

#### Scenario: Theme assets may be external
- **WHEN** a page is generated with a `theme_stylesheet` configured as a full external URL
- **THEN** the page references that URL directly
- **AND** no copy of the theme stylesheet is required under `site/assets/`

## ADDED Requirements

### Requirement: [REQ-SO-011: Theme stylesheet and script links]
The build SHALL inject the resolved theme stylesheet and Bootstrap script URLs into every generated HTML page: the stylesheet as a `<link rel="stylesheet">` in the `<head>` and the script as a `<script>` element before the closing `</body>`. The URLs SHALL come from the `theme_stylesheet` and `bootstrap_script` fields of `content/site.json`; when a field is absent or empty, the build SHALL use its default constants (Bootswatch Vapor CSS and Bootstrap JS bundle via jsDelivr).

#### Scenario: Configured theme URLs are injected
- **WHEN** `content/site.json` sets non-empty `theme_stylesheet` and `bootstrap_script` values
- **THEN** every generated HTML page contains those exact URLs as a stylesheet link and a script element

#### Scenario: Defaults applied when fields are absent
- **WHEN** `content/site.json` omits both theme fields
- **THEN** every generated HTML page links to the default Bootswatch Vapor stylesheet and the default Bootstrap JS bundle

#### Scenario: Local stylesheet still loaded
- **WHEN** any HTML page is generated
- **THEN** it loads the theme stylesheet followed by the site's own `assets/style.css`
