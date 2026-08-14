# site-output Delta Spec

## MODIFIED Requirements

### Requirement: [REQ-SO-001: Home page structure and layout]
The build SHALL generate `site/index.html` with a responsive Bootstrap navbar and a body layout. The navbar SHALL render the site brand, a nav link per catalogue type whose `catalogues` definition has `menu: true` (labeled with the type's `title`, linking to `/{path_name}/`), a search box, and the facets toggle button. The body SHALL contain the search input area, a results listing, and a facet drawer.

#### Scenario: Home page navbar shows catalogue menu links
- **WHEN** the `catalogues` configuration marks `categories`, `concepts`, `props`, `standard`, and `subject` with `menu: true`
- **THEN** the home page navbar renders a nav link for each of those types labeled with its title and linking to `/{path_name}/`
- **AND** no nav link is rendered for a type with `menu: false`

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
