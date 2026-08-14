# client-side-search Delta Spec

## MODIFIED Requirements

### Requirement: [REQ-CS-003: Catalogue pages filter without meta.json]
Catalogue pages SHALL build a MiniSearch index in the browser from their own `.catalogue-card` elements' searchable text and SHALL filter those cards in place using prefix and fuzzy matching, without loading `meta.json`, so they remain functional under GitHub Pages project paths. If the MiniSearch library is unavailable, the page SHALL fall back to substring filtering.

#### Scenario: Catalogue filter works standalone
- **WHEN** a user types a query in a catalogue page's search box
- **THEN** each `.catalogue-card` is shown if the MiniSearch query matches its searchable text and hidden otherwise
- **AND** no `meta.json` request is made on catalogue pages

#### Scenario: Catalogue filter falls back to substring
- **WHEN** the MiniSearch library is unavailable on a catalogue page
- **THEN** cards are filtered by substring containment of the query

### Requirement: [REQ-CS-005: Graceful degradation on index failure]
If `meta.json` cannot be loaded on the home page, the script SHALL log the error and leave the home page functional without breaking the catalogue-page search behaviour.

#### Scenario: Missing meta.json degrades gracefully
- **WHEN** `meta.json` fails to load on the home page
- **THEN** an error is logged to the console
- **AND** catalogue-page filtering continues to work if a search input is present

### Requirement: [REQ-CS-006: Search page full-text search]
On the home page, the client script SHALL build a MiniSearch index from the `ideas` array of `site/meta.json` covering each idea's title (boosted), description, board, standard, subject, categories, concepts, props, and ideasets using a Unicode-aware tokenizer, and SHALL render ranked results for the trimmed query with prefix and fuzzy matching enabled. Results SHALL be rendered as Bootstrap cards with the `card` and `catalogue-card` classes containing an image cap (the idea's own images in order, or the bundled fallback), a `card-title`, a `card-text` description, and a `card-footer` listing prop badges when the `props` catalogue is active. The MiniSearch `storeFields` SHALL include `id`, `title`, `description`, `url`, `props`, `prop_slugs`, and `image_urls`.

#### Scenario: Query returns ranked idea cards
- **WHEN** a user types a query in the home page search input
- **THEN** ideas are ranked and rendered with their image cap, title, description, and URL
- **AND** the results respect prefix and fuzzy matching

#### Scenario: Devanagari query tokenizes correctly
- **WHEN** a user searches for a Devanagari term such as `अपूर्णांक`
- **THEN** ideas whose fields contain that term are returned

### Requirement: [REQ-CS-007: Faceted search with counts]
The home page SHALL render facet panels for each catalogue type whose definition in the `catalogues` configuration has `facet: true` inside the facet drawer, each as a Tom Select multi-select control (vendored at `assets/tom-select.min.js` with the Bootstrap 5 theme `assets/tom-select.bootstrap5.min.css`) listing selectable values with live counts. Selected values SHALL appear as removable items (Tom Select items with the remove button) and each facet SHALL expose a clear button. Facet values SHALL come from each idea's own fields: `standard` and `subject` as single scalar values and the multi-valued catalogue arrays as their value lists. Multiple selected values within one facet SHALL combine with OR, different facets SHALL combine with AND, and facets SHALL compose with the text query. Counts SHALL reflect the results of the query and all other active facets.

#### Scenario: Selecting a facet narrows ideas
- **WHEN** a user selects the category `वर्गातील प्रयोग` in the facet drawer
- **THEN** only ideas with that category are shown in the page body listing
- **AND** the facet counts update to reflect the other active filters

#### Scenario: Facet types follow catalogues configuration
- **WHEN** the `catalogues` configuration marks `categories`, `concepts`, `props`, `standard`, and `subject` with `facet: true`
- **THEN** the facet panels rendered are categories, concepts, props, standard, and subject
- **AND** no board or ideaset facet is rendered

#### Scenario: Tom Select items show selected values
- **WHEN** a user selects values within a facet
- **THEN** each selected value appears as a removable item in the Tom Select control
- **AND** removing an item deselects the value and updates the listing

#### Scenario: Facets are powered by vendored Tom Select
- **WHEN** the home page loads its facet controls
- **THEN** the facet controls are implemented with Tom Select and are not built on jQuery or the select2 library
