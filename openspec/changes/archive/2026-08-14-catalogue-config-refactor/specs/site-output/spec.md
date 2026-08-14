# site-output Delta Spec

## MODIFIED Requirements

### Requirement: [REQ-SO-001: Home page]
The build SHALL generate `site/index.html` from `templates/home.html.j2`, rendering the site title, description, a navbar with a search icon and search input, a facet drawer button, one facet panel container per `catalogues` type whose definition has `facet: true`, and an always-visible results container for the client-side idea listing. The idea listing SHALL render in the page body outside any panel or drawer. The facet drawer button SHALL be hidden on extra-small and small screens (mobile-first) and visible from the medium breakpoint upward. The search experience SHALL operate over ideas, not idea sets. The search and facet drawer icons SHALL be Font Awesome icons loaded from the Font Awesome CDN stylesheet, not inline SVG markup.

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
The build SHALL generate a landing page at `site/{path}/index.html` and one individual page at `site/{path}/{slug}/index.html` only for the catalogue types declared as keys of the `catalogues` configuration, except the `ideasets` catalogue which SHALL generate only its landing page. Individual pages SHALL list the ideas belonging to that item and support client-side MiniSearch filtering. Every listed item SHALL be rendered as a standard Bootstrap card with the `card` and `catalogue-card` classes, containing an image cap, a `card-title`, a `card-text` description, and a `card-footer`. Landing-page cards SHALL show the item count in the footer; individual-page idea cards SHALL list the idea's props in the footer as links to the prop catalogue pages only when the `props` catalogue is active.

#### Scenario: Catalogue pages are generated only for configured types
- **WHEN** the `catalogues` configuration lists only `categories`, `concepts`, and `props` and the build completes
- **THEN** `site/categories/`, `site/concepts/`, and `site/props/` each contain a landing page and one page per item
- **AND** `site/boards/`, `site/standards/`, and `site/subjects/` are not generated

#### Scenario: Idea cards adapt their footer
- **WHEN** the `props` catalogue is not active
- **THEN** idea card footers do not link to prop catalogue pages

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
