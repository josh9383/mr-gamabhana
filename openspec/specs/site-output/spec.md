# site-output Specification

## Purpose
TBD - created by archiving change establish-project-baseline. Update Purpose after archive.
## Requirements
### Requirement: [REQ-SO-001: Home page]
The build SHALL generate `site/index.html` from `templates/home.html.j2`, rendering the site title, description, a navbar with a search icon and search input, a facet drawer button, one facet panel container per `catalogues` type whose definition has `facet: true`, **a nav link per `catalogues` type whose definition has `menu: true` (labeled with the type's `title`, linking to `/{path_name}/`)**, and an always-visible results container for the client-side idea listing. The idea listing SHALL render in the page body outside any panel or drawer. The facet drawer button SHALL be hidden on extra-small and small screens (mobile-first) and visible from the medium breakpoint upward. The search experience SHALL operate over ideas, not idea sets. The search and facet drawer icons SHALL be Font Awesome icons loaded from the Font Awesome CDN stylesheet, not inline SVG markup.

#### Scenario: Home page is generated
- **WHEN** the build completes
- **THEN** `site/index.html` exists, contains the site title and description, and declares a canonical URL pointing at the site root

#### Scenario: Home page provides the idea search experience
- **WHEN** the home page is generated with `catalogues` marking `categories`, `concepts`, `props`, `standard`, and `subject` with `facet: true`
- **THEN** it contains a search input in the navbar, a facet drawer with panels for categories, concepts, props, standard, and subject, and an always-visible results container in the page body
- **AND** it references the site's own `assets/minisearch.min.js`, `assets/tom-select.min.js`, `assets/tom-select.bootstrap5.min.css`, and `assets/app.js`

#### Scenario: Idea listing is always visible
- **WHEN** the home page loads
- **THEN** the results container is in the page body outside the facet drawer and is not collapsed
- **AND** the listing can show every idea when no query or facet is active

#### Scenario: Facet drawer button is responsive
- **WHEN** the home page is generated
- **THEN** the facet drawer button is hidden on extra-small and small screens
- **AND** the facet drawer button is visible from the medium breakpoint upward

#### Scenario: Icons use Font Awesome
- **WHEN** the home page is generated
- **THEN** it loads the Font Awesome CDN stylesheet in the head
- **AND** the search and facet drawer icons are rendered with Font Awesome `<i>` classes instead of inline `<svg>` elements

#### Scenario: No ideaset facet panel
- **WHEN** the `catalogues` configuration sets `facet: false` for `ideasets`
- **THEN** the home page renders no facet panel for `ideasets`

### Requirement: [REQ-SO-003: Catalogue landing and individual pages]
The build SHALL generate a landing page at `site/{path}/index.html` and one individual page at `site/{path}/{slug}/index.html` only for the catalogue types declared as keys of the `catalogues` configuration, except the `ideasets` catalogue which SHALL generate only its landing page. Individual pages SHALL list the ideas belonging to that item and support client-side MiniSearch filtering. Every listed item SHALL be rendered as a standard Bootstrap card with the `card` and `catalogue-card` classes, containing an image cap, a `card-title`, a `card-text` description, and a `card-footer`. Landing-page cards SHALL show the item count in the footer; individual-page idea cards SHALL list in the footer badges linking to the individual catalogue pages of every catalogue type whose definition has `footer: true` (or the dedicated idea set page at `/ideasets/{slug}/` for idea set values).

#### Scenario: Catalogue pages are generated only for configured types
- **WHEN** the `catalogues` configuration lists only `categories`, `concepts`, and `props` and the build completes
- **THEN** `site/categories/`, `site/concepts/`, and `site/props/` each contain a landing page and one page per item
- **AND** `site/boards/`, `site/standards/`, and `site/subjects/` are not generated

#### Scenario: Idea cards adapt their footer
- **WHEN** a catalogue type's definition has `footer: false`
- **THEN** idea card footers do not link to that type's individual pages
- **AND** a type with `footer: true` (including `ideasets`) contributes badges linking to its individual pages

#### Scenario: Ideasets catalogue landing page
- **WHEN** the `catalogues` configuration includes `ideasets` and the build completes
- **THEN** `site/ideasets/index.html` exists, listing every idea set as a card linking to `/ideasets/{slug}/` with the member count in the footer
- **AND** no per-item catalogue page is generated under any `site/ideasets/{slug}/` path

### Requirement: [REQ-SO-005: Client-side index payload]
The build SHALL generate `site/meta.json` containing the `site` object, an `ideas` array (one record per idea carrying `id`, `title`, `description`, `url`, `board`, `standard`, `subject`, catalogue arrays with their slugs, `ideasets` with `ideaset_slugs`, and `image_urls`), and the `catalogues` for the active catalogue types. The `ideasets` index SHALL be removed from the payload. The payload SHALL be encoded as UTF-8 JSON with indentation.

#### Scenario: meta.json matches generated pages
- **WHEN** the build completes
- **THEN** `site/meta.json` exists, its `ideas` entries reference URLs that match generated idea pages, and its `catalogues` match the generated catalogue pages
- **AND** the payload contains no idea set index

### Requirement: [REQ-SO-006: Sitemap]
The build SHALL generate `site/sitemap.xml` listing the home URL, the ideas landing URL, every idea page URL, every idea set page URL, every active catalogue landing URL, and every individual catalogue page URL, each prefixed with the site's `base_url`. Ideaset page URLs SHALL be emitted from the idea set records exactly once; the catalogue loop SHALL NOT re-emit them for the `ideasets` catalogue.

#### Scenario: Sitemap covers generated pages
- **WHEN** the build completes
- **THEN** `site/sitemap.xml` contains a `<loc>` entry for every idea set page and every generated catalogue and idea page
- **AND** it contains no URLs for catalogue types that are not active

#### Scenario: Sitemap contains no duplicate ideaset URLs
- **WHEN** the `catalogues` configuration includes `ideasets` and the build completes
- **THEN** each idea set page URL appears exactly once in `site/sitemap.xml`

### Requirement: [REQ-SO-007: Static assets copied to site]
The build SHALL copy `theme/style.css`, `theme/app.js`, `theme/assets/minisearch.min.js`, `theme/assets/tom-select.min.js`, `theme/assets/tom-select.bootstrap5.min.css`, and `theme/assets/card-fallback.png` into `site/assets/` so all pages reference assets from the generated site.

#### Scenario: Assets are available in site
- **WHEN** the build completes
- **THEN** `site/assets/style.css`, `site/assets/app.js`, `site/assets/minisearch.min.js`, and `site/assets/card-fallback.png` exist
- **AND** every generated HTML page references them via the site's `base_url`

#### Scenario: Tom Select assets are copied
- **WHEN** the build completes
- **THEN** `site/assets/tom-select.min.js` and `site/assets/tom-select.bootstrap5.min.css` exist alongside the other static assets

### Requirement: [REQ-SO-008: SEO metadata on pages]
Generated HTML pages SHALL declare `lang` from the site language, a unique `<title>`, a `<meta name="description">`, and a self-referencing `<link rel="canonical">`. Idea and catalogue pages SHALL render a breadcrumb navigation.

#### Scenario: Pages expose SEO metadata
- **WHEN** any generated HTML page is inspected
- **THEN** it declares the site language, a title, a meta description, and a canonical URL matching its own location

### Requirement: [REQ-SO-009: Self-contained output artifacts]
Every generated artifact SHALL be entirely self-contained with no shared runtime cross-dependencies: each page SHALL reference only assets under the site's own `base_url` path, and no page SHALL depend on another page's file at runtime. The theme stylesheet and Bootstrap script SHALL be loaded from the URLs resolved by the build from `site.json` (see REQ-SO-011) and MAY reference external CDN links. The gamabhana phonetic widget script (see REQ-SO-012) SHALL be loaded from `https://www.gamabhana.com` and MAY be referenced on search pages.

#### Scenario: Pages are atomic and self-contained
- **WHEN** any generated page is hosted standalone under its `base_url`
- **THEN** it renders correctly using only its own markup, `site/assets/style.css`, and `site/assets/app.js`

#### Scenario: Theme assets may be external
- **WHEN** a page is generated with a `theme_stylesheet` configured as a full external URL
- **THEN** the page references that URL directly
- **AND** no copy of the theme stylesheet is required under `site/assets/`

#### Scenario: Phonetic widget may be external
- **WHEN** a search page is generated with the gamabhana widget launcher
- **THEN** the page references the `https://www.gamabhana.com` widget script directly
- **AND** no copy of the widget is required under `site/assets/`

### Requirement: [REQ-SO-002: Idea pages with HTML and Markdown copies]
The build SHALL generate, for every idea, a directory `site/ideas/{id}/` containing `index.html` and `index.md`. The HTML page SHALL render the idea metadata, badges linking only to catalogue pages that exist for the active `catalogues` configuration and to each idea set the idea belongs to, and the converted Markdown body. The Markdown copy SHALL reproduce the idea metadata as YAML front matter plus the body.

#### Scenario: Idea directory contains both copies
- **WHEN** the build processes an idea with id `m1`
- **THEN** `site/ideas/m1/index.html` and `site/ideas/m1/index.md` exist
- **AND** the HTML page links to the categories, concepts, and props catalogue pages and to the idea set pages the idea belongs to
- **AND** it does not link to boards, standards, or subjects catalogue pages when they are not active

### Requirement: [REQ-SO-004: Ideas catalogue landing page]
The build SHALL keep generating `site/ideas/index.html` listing every idea as a filterable Bootstrap card with an image cap, a `card-title`, a `card-text` description, and a `card-footer` listing the idea's props as links to the prop catalogue pages only when the `props` catalogue is active.

#### Scenario: All ideas are listed on the landing page
- **WHEN** the build completes
- **THEN** `site/ideas/index.html` contains one card per idea linking to `site/ideas/{id}/`

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

### Requirement: [REQ-SO-012: Phonetic search input]
The build SHALL render both search inputs — the home page's `#search-input` and the catalogue pages' `.catalogue-search` — with the shared class `phonetic-input`. Home and catalogue pages SHALL include the gamabhana widget launcher script (`https://www.gamabhana.com/gamabhanaWidget/add/?mode=custom&c=phonetic-input&lang=0`) as a parse-time script tag in the body, so the widget converts Roman keystrokes into Devanagari in those inputs.

#### Scenario: Widget launcher on search pages
- **WHEN** the home page or any catalogue page is generated
- **THEN** it contains the gamabhana widget launcher script URL
- **AND** its search input carries the `phonetic-input` class

#### Scenario: Idea pages exclude the widget
- **WHEN** an idea page is generated
- **THEN** it does not include the gamabhana widget launcher script

### Requirement: [REQ-SO-013: Idea set pages]
The build SHALL generate `site/ideasets/{slug}/index.html` for every idea set from `templates/ideaset.html.j2`, rendering the idea set title and its member ideas as a Bootstrap accordion with one item per member idea. Each accordion item header SHALL show the member idea's title, and its body SHALL contain the member idea's images and details (description and Markdown body converted to HTML). Idea set pages SHALL NOT render catalogue cards and SHALL NOT include the catalogue search experience.

#### Scenario: Idea set pages render member accordions
- **WHEN** the build completes
- **THEN** `site/ideasets/{slug}/index.html` exists for every idea set
- **AND** it contains one accordion item per member idea, each with the idea's title in the header and the idea's images and details in the body

#### Scenario: Idea set pages drop the card search
- **WHEN** an idea set page is generated
- **THEN** it contains no `.catalogue-search` input, no MiniSearch script, and no gamabhana widget launcher


