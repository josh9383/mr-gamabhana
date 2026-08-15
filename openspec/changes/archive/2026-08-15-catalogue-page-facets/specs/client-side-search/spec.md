# client-side-search Specification (Delta)

## MODIFIED Requirements

### Requirement: [REQ-CS-003: Catalogue pages filter without meta.json]
Catalogue landing pages (`site/{path}/index.html`) and the ideas landing page SHALL build a MiniSearch index in the browser from their own `.catalogue-card` elements' searchable text and SHALL filter those cards in place using prefix and fuzzy matching, without loading `meta.json`, so they remain functional under GitHub Pages project paths. If the MiniSearch library is unavailable, the page SHALL fall back to substring filtering. Individual catalogue pages SHALL NOT use card-based filtering; they SHALL use the client index search described in REQ-CS-014.

#### Scenario: Landing page filter works standalone
- **WHEN** a user types a query in a catalogue landing page's search box
- **THEN** each `.catalogue-card` is shown if the MiniSearch query matches its searchable text and hidden otherwise
- **AND** no `meta.json` request is made on landing pages

#### Scenario: Landing page filter falls back to substring
- **WHEN** the MiniSearch library is unavailable on a catalogue landing page
- **THEN** cards are filtered by substring containment of the query

#### Scenario: Individual pages do not use card filtering
- **WHEN** a user opens an individual catalogue page such as `/standards/4/`
- **THEN** its results come from the client index search
- **AND** no card-based MiniSearch index is built over the page's cards

### Requirement: [REQ-CS-004: Tag query parameter pre-filters]
Catalogue landing pages and the ideas landing page SHALL read a `tag` query parameter from the URL. When present, the page SHALL pre-filter its cards by running the tag through the page's MiniSearch index (with substring fallback) and populate the search input with the tag value.

#### Scenario: Tag parameter filters on load
- **WHEN** a catalogue landing page loads with `?tag=कोन` in its URL
- **THEN** only cards whose searchable text matches `कोन` are visible
- **AND** the search input is pre-filled with `कोन`

### Requirement: [REQ-CS-005: Graceful degradation on index failure]
If `meta.json` cannot be loaded on the home page or on an individual catalogue page, the script SHALL log the error and leave the page functional: the home page SHALL keep the landing-page card-search behaviour working, and an individual catalogue page SHALL keep its pre-rendered static card listing visible.

#### Scenario: Missing meta.json degrades gracefully
- **WHEN** `meta.json` fails to load on the home page or on an individual catalogue page
- **THEN** an error is logged to the console
- **AND** catalogue landing-page filtering continues to work if a search input is present
- **AND** the individual catalogue page still shows its pre-rendered card listing

## ADDED Requirements

### Requirement: [REQ-CS-014: Individual catalogue page search and facets]
Individual catalogue pages SHALL provide the same search experience as the home page, driven by `initPage()` over the `site/meta.json` ideas index and restricted to the page's scope: full-text search, facet panels with live counts, autosuggest, URL-shareable state, and infinite scroll pagination. The client script SHALL load `meta.json` from a base-URL-aware path (`data-meta-url`) so individual pages work under GitHub Pages project paths. The page's own catalogue facet SHALL be preselected, applied, and read-only per the `locked-facet` capability; the remaining facets SHALL filter within the page scope and SHALL compose with the text query.

#### Scenario: Individual page provides full search within scope
- **WHEN** a user types a query on `/standards/4/`
- **THEN** the results restrict to standard 4 ideas and are ranked by the query
- **AND** facet counts reflect the query within the standard 4 scope

#### Scenario: Other facets compose with the page scope
- **WHEN** a user selects a material facet on `/concepts/tulnaa/`
- **THEN** only `तुलना` ideas with that material are shown
- **AND** the material facet counts reflect the concepts scope

#### Scenario: Meta.json loads from a base-URL-aware path
- **WHEN** an individual catalogue page is hosted under a GitHub Pages project path
- **THEN** the page fetches `meta.json` from the site base URL rather than from its own directory

#### Scenario: URL state restores within the page scope
- **WHEN** an individual catalogue page loads with a `q` query parameter and user-changeable facet parameters
- **THEN** the query and those facets are restored
- **AND** the results remain restricted to the page's locked scope
