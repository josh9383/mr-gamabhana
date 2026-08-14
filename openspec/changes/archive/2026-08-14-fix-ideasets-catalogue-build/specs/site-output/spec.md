# site-output Delta

## MODIFIED Requirements

### Requirement: [REQ-SO-001: Home page]
The build SHALL generate `site/index.html` from `templates/home.html.j2`, rendering the site title, description, a search input, one facet panel container per `catalogue_attributes` entry excluding `ideasets` plus `standard` and `subject`, and a results container for the client-side search experience. Its canonical URL SHALL be the site root. The search experience SHALL operate over idea sets, not individual ideas.

#### Scenario: Home page is generated
- **WHEN** the build completes
- **THEN** `site/index.html` exists, contains the site title and description, and declares a canonical URL pointing at the site root

#### Scenario: Home page provides the idea set search experience
- **WHEN** the home page is generated with `catalogue_attributes` `["categories", "concepts", "props"]`
- **THEN** it contains a search input, facet panels for categories, concepts, props, standard, and subject, and a results container
- **AND** it references the site's own `assets/minisearch.min.js` and `assets/app.js`

#### Scenario: No ideaset facet panel
- **WHEN** `catalogue_attributes` includes `ideasets`
- **THEN** the home page renders no facet panel for `ideasets`

### Requirement: [REQ-SO-003: Catalogue landing and individual pages]
The build SHALL generate a landing page at `site/{path}/index.html` and one individual page at `site/{path}/{slug}/index.html` only for the catalogue types listed in `catalogue_attributes`, except the `ideasets` catalogue which SHALL generate only its landing page. Individual pages SHALL list the ideas belonging to that item and support client-side MiniSearch filtering. Every listed item SHALL be rendered as a standard Bootstrap card with the `card` and `catalogue-card` classes, containing an image cap, a `card-title`, a `card-text` description, and a `card-footer`. Landing-page cards SHALL show the item count in the footer; individual-page idea cards SHALL list the idea's props in the footer as links to the prop catalogue pages only when the `props` catalogue is active.

#### Scenario: Catalogue pages are generated only for configured types
- **WHEN** `catalogue_attributes` is `["categories", "concepts", "props"]` and the build completes
- **THEN** `site/categories/`, `site/concepts/`, and `site/props/` each contain a landing page and one page per item
- **AND** `site/boards/`, `site/standards/`, and `site/subjects/` are not generated

#### Scenario: Idea cards adapt their footer
- **WHEN** the `props` catalogue is not active
- **THEN** idea card footers do not link to prop catalogue pages

#### Scenario: Ideasets catalogue landing page
- **WHEN** `catalogue_attributes` includes `ideasets` and the build completes
- **THEN** `site/ideasets/index.html` exists, listing every idea set as a card linking to `/ideasets/{slug}/` with the member count in the footer
- **AND** no per-item catalogue page is generated under any `site/ideasets/{slug}/` path

### Requirement: [REQ-SO-006: Sitemap]
The build SHALL generate `site/sitemap.xml` listing the home URL, the ideas landing URL, every idea page URL, every idea set page URL, every active catalogue landing URL, and every individual catalogue page URL, each prefixed with the site's `base_url`. Ideaset page URLs SHALL be emitted from the idea set records exactly once; the catalogue loop SHALL NOT re-emit them for the `ideasets` catalogue.

#### Scenario: Sitemap covers generated pages
- **WHEN** the build completes
- **THEN** `site/sitemap.xml` contains a `<loc>` entry for every idea set page and every generated catalogue and idea page
- **AND** it contains no URLs for catalogue types that are not active

#### Scenario: Sitemap contains no duplicate ideaset URLs
- **WHEN** `catalogue_attributes` includes `ideasets` and the build completes
- **THEN** each idea set page URL appears exactly once in `site/sitemap.xml`
