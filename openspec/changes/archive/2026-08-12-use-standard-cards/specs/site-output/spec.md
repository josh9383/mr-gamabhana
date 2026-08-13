## MODIFIED Requirements

### Requirement: [REQ-SO-003: Catalogue landing and individual pages]
The build SHALL generate a landing page at `site/{path}/index.html` and one individual page at `site/{path}/{slug}/index.html` for `boards`, `standards`, `subjects`, `categories`, `props`, and `concepts`. Individual pages SHALL list the ideas belonging to that item and support client-side MiniSearch filtering. Every listed item SHALL be rendered as a standard Bootstrap card with the `card` and `catalogue-card` classes, containing a `card-img-top` image cap, a `card-title`, a `card-text` description, and a `card-footer`. Landing-page cards SHALL show the item count in the footer; individual-page idea cards SHALL list the idea's props in the footer as links to the prop catalogue pages.

#### Scenario: Catalogue pages are generated for every item
- **WHEN** the build completes
- **THEN** `site/boards/`, `site/standards/`, `site/subjects/`, `site/categories/`, `site/props/`, and `site/concepts/` each contain a landing page and one page per item
- **AND** each individual page lists every idea that belongs to that item

#### Scenario: Catalogue cards use the standard card anatomy
- **WHEN** any catalogue page is generated
- **THEN** every item is a `card.catalogue-card` with an image cap, a title, a description, and a footer
- **AND** landing cards show the item count in the footer and idea cards show the idea's props in the footer

#### Scenario: Catalogue pages reference the search asset
- **WHEN** any catalogue page is generated
- **THEN** it references the site's own `assets/minisearch.min.js` and `assets/app.js` under the `base_url`

### Requirement: [REQ-SO-004: Ideas catalogue landing page]
The build SHALL generate `site/ideas/index.html` listing every idea as a filterable Bootstrap card with a `card-img-top` image cap, a `card-title`, a `card-text` description, and a `card-footer` listing the idea's props as links to the prop catalogue pages.

#### Scenario: All ideas are listed on the landing page
- **WHEN** the build completes
- **THEN** `site/ideas/index.html` contains one card per idea linking to `site/ideas/{id}/`

#### Scenario: Idea cards show a props footer
- **WHEN** an idea has one or more props
- **THEN** its card footer lists each prop as a link to the matching `site/props/{slug}/` page

### Requirement: [REQ-SO-007: Static assets copied to site]
The build SHALL copy `theme/style.css`, `theme/app.js`, `theme/assets/minisearch.min.js`, and `theme/assets/card-fallback.png` into `site/assets/` so all pages reference assets from the generated site.

#### Scenario: Assets are available in site
- **WHEN** the build completes
- **THEN** `site/assets/style.css`, `site/assets/app.js`, `site/assets/minisearch.min.js`, and `site/assets/card-fallback.png` exist
- **AND** every generated HTML page references them via the site's `base_url`
