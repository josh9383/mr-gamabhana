# site-output Specification (Delta)

## MODIFIED Requirements

### Requirement: [REQ-SO-003: Catalogue landing and individual pages]
The build SHALL generate a landing page at `site/{path}/index.html` and one individual page at `site/{path}/{slug}/index.html` only for the catalogue types declared as keys of the `catalogues` configuration, except the `ideasets` catalogue which SHALL generate only its landing page. Individual pages SHALL render the home-page search experience - a facet row of Tom Select panels plus a `#search-page` search block with a results container - with the page's own catalogue facet rendered as a static read-only control (the `locked-facet` capability), and SHALL pre-render the ideas belonging to that item inside the results container as cards so the listing works without JavaScript. Landing pages SHALL keep their card grid and support client-side MiniSearch filtering. Every listed item SHALL be rendered as a standard Bootstrap card with the `card` and `catalogue-card` classes, containing an image cap, a `card-title`, a `card-text` description, and a `card-footer`. Landing-page cards SHALL show the item count in the footer; individual-page idea cards SHALL list in the footer badges linking to the individual catalogue pages of every catalogue type whose definition has `footer: true` (or the dedicated idea set page at `/ideasets/{slug}/` for idea set values). Individual pages SHALL reference the Font Awesome stylesheet and the vendored `assets/tom-select.bootstrap5.min.css` in the head.

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

#### Scenario: Individual pages render facets with a locked control
- **WHEN** the build generates `/standards/4/index.html`
- **THEN** the page contains a facet row whose standard panel is a static read-only control showing `4`
- **AND** the other facet panels are Tom Select multi-selects
- **AND** the pre-rendered cards sit inside the `#search-results` container

### Requirement: [REQ-SO-012: Phonetic search input]
The build SHALL render all search inputs - the home page's `#search-input`, the catalogue landing pages' `.catalogue-search`, and the individual catalogue pages' `#search-input` - with the shared class `phonetic-input`. Home and catalogue pages SHALL include the gamabhana widget launcher script (`https://www.gamabhana.com/gamabhanaWidget/add/?mode=custom&c=phonetic-input&lang=0`) as a parse-time script tag in the body, so the widget converts Roman keystrokes into Devanagari in those inputs.

#### Scenario: Widget launcher on search pages
- **WHEN** the home page or any catalogue page is generated
- **THEN** it contains the gamabhana widget launcher script URL
- **AND** its search input carries the `phonetic-input` class

#### Scenario: Idea pages exclude the widget
- **WHEN** an idea page is generated
- **THEN** it does not include the gamabhana widget launcher script
