# site-output Specification (delta)

## MODIFIED Requirements

### Requirement: [REQ-SO-001: Home page]
The build SHALL generate `site/index.html` from `templates/home.html.j2`, rendering the site title, description, a search input, one facet panel container per `catalogue_attributes` entry plus `standard` and `subject`, and a results container for the client-side search experience. Its canonical URL SHALL be the site root. The search experience SHALL operate over idea sets, not individual ideas.

#### Scenario: Home page is generated
- **WHEN** the build completes
- **THEN** `site/index.html` exists, contains the site title and description, and declares a canonical URL pointing at the site root

#### Scenario: Home page provides the idea set search experience
- **WHEN** the home page is generated with `catalogue_attributes` `["categories", "concepts", "props"]`
- **THEN** it contains a search input, facet panels for categories, concepts, props, standard, and subject, and a results container
- **AND** it references the site's own `assets/minisearch.min.js` and `assets/app.js`

### Requirement: [REQ-SO-002: Idea pages with HTML and Markdown copies]
The build SHALL generate, for every idea, a directory `site/ideas/{id}/` containing `index.html` and `index.md`. The HTML page SHALL render the idea metadata, badges linking only to catalogue pages that exist for the active `catalogue_attributes` and to each idea set the idea belongs to, and the converted Markdown body. The Markdown copy SHALL reproduce the idea metadata as YAML front matter plus the body.

#### Scenario: Idea directory contains both copies
- **WHEN** the build processes an idea with id `m1`
- **THEN** `site/ideas/m1/index.html` and `site/ideas/m1/index.md` exist
- **AND** the HTML page links to the categories, concepts, and props catalogue pages and to the idea set pages the idea belongs to
- **AND** it does not link to boards, standards, or subjects catalogue pages when they are not active

### Requirement: [REQ-SO-003: Catalogue landing and individual pages]
The build SHALL generate a landing page at `site/{path}/index.html` and one individual page at `site/{path}/{slug}/index.html` only for the catalogue types listed in `catalogue_attributes`. Individual pages SHALL list the ideas belonging to that item and support client-side MiniSearch filtering. Every listed item SHALL be rendered as a standard Bootstrap card with the `card` and `catalogue-card` classes, containing an image cap, a `card-title`, a `card-text` description, and a `card-footer`. Landing-page cards SHALL show the item count in the footer; individual-page idea cards SHALL list the idea's props in the footer as links to the prop catalogue pages only when the `props` catalogue is active.

#### Scenario: Catalogue pages are generated only for configured types
- **WHEN** `catalogue_attributes` is `["categories", "concepts", "props"]` and the build completes
- **THEN** `site/categories/`, `site/concepts/`, and `site/props/` each contain a landing page and one page per item
- **AND** `site/boards/`, `site/standards/`, and `site/subjects/` are not generated

#### Scenario: Idea cards adapt their footer
- **WHEN** the `props` catalogue is not active
- **THEN** idea card footers do not link to prop catalogue pages

### Requirement: [REQ-SO-004: Ideas catalogue landing page]
The build SHALL keep generating `site/ideas/index.html` listing every idea as a filterable Bootstrap card with an image cap, a `card-title`, a `card-text` description, and a `card-footer` listing the idea's props as links to the prop catalogue pages only when the `props` catalogue is active.

#### Scenario: All ideas are listed on the landing page
- **WHEN** the build completes
- **THEN** `site/ideas/index.html` contains one card per idea linking to `site/ideas/{id}/`

### Requirement: [REQ-SO-005: Client-side index payload]
The build SHALL generate `site/ideas.json` containing the `site` object, the `ideasets` index (id, title, description, url, `member_count`, aggregated catalogue values with slugs, `standards`, `subjects`, and `representative_image_urls`), and the `catalogues` for the active catalogue types. The individual `ideas` array SHALL be removed from the payload. The payload SHALL be encoded as UTF-8 JSON with indentation.

#### Scenario: ideas.json matches generated pages
- **WHEN** the build completes
- **THEN** `site/ideas.json` exists, its `ideasets` entries reference URLs that match generated idea set pages, and its `catalogues` match the generated catalogue pages
- **AND** the payload contains no per-idea search index

### Requirement: [REQ-SO-006: Sitemap]
The build SHALL generate `site/sitemap.xml` listing the home URL, the ideas landing URL, every idea page URL, every idea set page URL, every active catalogue landing URL, and every individual catalogue page URL, each prefixed with the site's `base_url`.

#### Scenario: Sitemap covers generated pages
- **WHEN** the build completes
- **THEN** `site/sitemap.xml` contains a `<loc>` entry for every idea set page and every generated catalogue and idea page
- **AND** it contains no URLs for catalogue types that are not active

## ADDED Requirements

### Requirement: [REQ-SO-013: Idea set pages]
The build SHALL generate `site/ideasets/{slug}/index.html` for every idea set from `templates/ideaset.html.j2`, rendering the idea set title and its member ideas as standard catalogue cards with the same card anatomy and card payloads used on catalogue pages.

#### Scenario: Idea set pages render member cards
- **WHEN** the build completes
- **THEN** `site/ideasets/{slug}/index.html` exists for every idea set
- **AND** it contains one `card.catalogue-card` per member idea

### Requirement: [REQ-SO-014: Idea set card imagery on home page]
Home-page idea set cards SHALL render an image cap built from `representative_image_urls` shuffled at render time into the existing CSS crossfade carousel (capped at six images), or the bundled `/assets/card-fallback.png` when there are no representative images.

#### Scenario: Home cards show representative carousels
- **WHEN** an idea set has representative images
- **THEN** its home card renders a `card-carousel` of those images in random order
- **AND** when it has none, its home card renders the fallback image
