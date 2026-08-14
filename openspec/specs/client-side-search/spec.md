# client-side-search Specification

## Purpose
TBD - created by archiving change establish-project-baseline. Update Purpose after archive.
## Requirements
### Requirement: [REQ-CS-004: Tag query parameter pre-filters]
Catalogue pages SHALL read a `tag` query parameter from the URL. When present, the page SHALL pre-filter its cards by running the tag through the page's MiniSearch index (with substring fallback) and populate the search input with the tag value.

#### Scenario: Tag parameter filters on load
- **WHEN** a catalogue page loads with `?tag=कोन` in its URL
- **THEN** only cards whose searchable text matches `कोन` are visible
- **AND** the search input is pre-filled with `कोन`

### Requirement: [REQ-CS-005: Graceful degradation on index failure]
If `ideas.json` cannot be loaded on the home page, the script SHALL log the error and leave the home page functional without breaking the catalogue-page search behaviour.

#### Scenario: Missing ideas.json degrades gracefully
- **WHEN** `ideas.json` fails to load on the home page
- **THEN** an error is logged to the console
- **AND** catalogue-page filtering continues to work if a search input is present

### Requirement: [REQ-CS-003: Catalogue pages filter without ideas.json]
Catalogue pages SHALL build a MiniSearch index in the browser from their own `.catalogue-card` elements' searchable text and SHALL filter those cards in place using prefix and fuzzy matching, without loading `ideas.json`, so they remain functional under GitHub Pages project paths. If the MiniSearch library is unavailable, the page SHALL fall back to substring filtering.

#### Scenario: Catalogue filter works standalone
- **WHEN** a user types a query in a catalogue page's search box
- **THEN** each `.catalogue-card` is shown if the MiniSearch query matches its searchable text and hidden otherwise
- **AND** no `ideas.json` request is made on catalogue pages

#### Scenario: Catalogue filter falls back to substring
- **WHEN** the MiniSearch library is unavailable on a catalogue page
- **THEN** cards are filtered by substring containment of the query

### Requirement: [REQ-CS-006: Search page full-text search]
On the home page, the client script SHALL build a MiniSearch index from the `ideas` array of `site/ideas.json` covering each idea's title (boosted), description, board, standard, subject, categories, concepts, props, and ideasets using a Unicode-aware tokenizer, and SHALL render ranked results for the trimmed query with prefix and fuzzy matching enabled. Results SHALL be rendered as Bootstrap cards with the `card` and `catalogue-card` classes containing an image cap (the idea's own images in order, or the bundled fallback), a `card-title`, a `card-text` description, and a `card-footer` listing prop badges when the `props` catalogue is active. The MiniSearch `storeFields` SHALL include `id`, `title`, `description`, `url`, `props`, `prop_slugs`, and `image_urls`.

#### Scenario: Query returns ranked idea cards
- **WHEN** a user types a query in the home page search input
- **THEN** ideas are ranked and rendered with their image cap, title, description, and URL
- **AND** the results respect prefix and fuzzy matching

#### Scenario: Devanagari query tokenizes correctly
- **WHEN** a user searches for a Devanagari term such as `अपूर्णांक`
- **THEN** ideas whose fields contain that term are returned

### Requirement: [REQ-CS-007: Faceted search with counts]
The home page SHALL render facet panels for each `catalogue_attributes` type plus `standard` and `subject`, each showing selectable values with live counts. Facet values SHALL come from each idea's own fields: `standard` and `subject` as single scalar values and the multi-valued catalogue arrays as their value lists. Multiple selected values within one facet SHALL combine with OR, different facets SHALL combine with AND, and facets SHALL compose with the text query. Counts SHALL reflect the results of the query and all other active facets.

#### Scenario: Selecting a facet narrows ideas
- **WHEN** a user selects the category `वर्गातील प्रयोग` on the home page
- **THEN** only ideas with that category are shown
- **AND** the facet counts update to reflect the other active filters

#### Scenario: Facet types follow catalogue_attributes
- **WHEN** `catalogue_attributes` is `["categories", "concepts", "props"]`
- **THEN** the facet panels rendered are categories, concepts, props, standard, and subject
- **AND** no board facet is rendered

### Requirement: [REQ-CS-008: Search state in URL]
The home page SHALL read the query and facet selections from the URL query parameters (`q`, `categories`, `concepts`, `props`, `standard`, `subject`) on load and SHALL update them on every search change so the state is shareable and survives a refresh.

#### Scenario: Shared URL restores the idea search
- **WHEN** the home page loads with `?q=अपूर्णांक&categories=वर्गातील%20प्रयोग` in its URL
- **THEN** the query and category facet are pre-selected and the results reflect them

#### Scenario: State is written to the URL
- **WHEN** a user changes the query or toggles a facet
- **THEN** the URL query parameters are updated to match the current search state

### Requirement: [REQ-CS-009: Phonetic transliteration fallback]
The client script SHALL transliterate Roman phonetic search queries to Devanagari before querying the MiniSearch index or substring filter, on both the home page and catalogue pages. The transliteration SHALL be a pure, deterministic function that rewrites ASCII letter sequences and leaves existing Devanagari text unchanged, so it acts as a fallback when the gamabhana widget is unavailable and as a safety net for unconverted keystrokes.

#### Scenario: Roman query matches Devanagari content
- **WHEN** a user types `kon` in the home page search input and the widget did not convert it
- **THEN** the search queries the index with `कोन`
- **AND** ideas matching `कोन` are returned

#### Scenario: Devanagari query passes through unchanged
- **WHEN** the search input value is already Devanagari, such as `त्रिकोण`
- **THEN** the transliteration leaves the value unchanged
- **AND** results match as they would without transliteration

#### Scenario: Catalogue search transliterates
- **WHEN** a user types a Roman query in a catalogue page's search box
- **THEN** the card index is queried with the query's Devanagari equivalent


