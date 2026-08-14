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
If `meta.json` cannot be loaded on the home page, the script SHALL log the error and leave the home page functional without breaking the catalogue-page search behaviour.

#### Scenario: Missing meta.json degrades gracefully
- **WHEN** `meta.json` fails to load on the home page
- **THEN** an error is logged to the console
- **AND** catalogue-page filtering continues to work if a search input is present

### Requirement: [REQ-CS-003: Catalogue pages filter without meta.json]
Catalogue pages SHALL build a MiniSearch index in the browser from their own `.catalogue-card` elements' searchable text and SHALL filter those cards in place using prefix and fuzzy matching, without loading `meta.json`, so they remain functional under GitHub Pages project paths. If the MiniSearch library is unavailable, the page SHALL fall back to substring filtering.

#### Scenario: Catalogue filter works standalone
- **WHEN** a user types a query in a catalogue page's search box
- **THEN** each `.catalogue-card` is shown if the MiniSearch query matches its searchable text and hidden otherwise
- **AND** no `meta.json` request is made on catalogue pages

#### Scenario: Catalogue filter falls back to substring
- **WHEN** the MiniSearch library is unavailable on a catalogue page
- **THEN** cards are filtered by substring containment of the query

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

### Requirement: [REQ-CS-011: Search and facets filter the idea listing]
The home page SHALL render the first page of matching ideas in the page body by default and SHALL filter that listing in place as the user searches or toggles facets, appending further pages of the result set as the user scrolls (see REQ-CS-013). The search input SHALL live in the navbar. Facets SHALL be contained in a Bootstrap offcanvas drawer opened by a navbar button; the drawer button SHALL be hidden on extra-small and small screens and visible from the medium breakpoint upward. When the page loads with search state in the URL (`q` or facet parameters), the filtered listing SHALL render immediately without the drawer being opened.

#### Scenario: Ideas listed by default
- **WHEN** the home page loads with no search state
- **THEN** the page body shows the first page of matching ideas in the results container
- **AND** the facet drawer is closed

#### Scenario: Typing filters the listing
- **WHEN** a user types a query in the navbar search input
- **THEN** the idea listing in the page body updates to show only matching ideas, starting from the first page

#### Scenario: Facet drawer opens from the navbar
- **WHEN** a user clicks the facet drawer button on a medium or larger screen
- **THEN** the offcanvas drawer opens showing the facet panels
- **AND** the idea listing remains visible

#### Scenario: Mobile shows search only
- **WHEN** the home page is viewed on a screen below the medium breakpoint
- **THEN** the navbar shows the search input
- **AND** the facet drawer button is not visible

#### Scenario: Shared search state renders results
- **WHEN** the home page loads with `?q=अपूर्णांक` in its URL
- **THEN** the filtered idea listing renders immediately in the page body

### Requirement: [REQ-CS-012: Autosuggest for search input]
The home page SHALL show a type-ahead suggestion dropdown under the navbar search input using the MiniSearch `autoSuggest` method over the idea index. Suggestions SHALL update as the user types, reflect the current query, and when selected SHALL populate the search input and trigger the search. The suggestion dropdown SHALL close when the input loses focus or the query is emptied.

#### Scenario: Typing shows suggestions
- **WHEN** a user types `अपूर्णा` in the home page search input
- **THEN** a suggestion dropdown appears below the input containing indexed terms that complete the query
- **AND** the suggestions respect prefix and fuzzy matching

#### Scenario: Selecting a suggestion searches
- **WHEN** a user selects a suggestion from the dropdown
- **THEN** the search input is populated with the suggestion
- **AND** the results update to match the full suggestion

### Requirement: [REQ-CS-013: Infinite scroll pagination of the idea listing]
The home page SHALL paginate the idea listing with an infinite scroll: it SHALL render the first page of the current result set (page size 6 ideas) and SHALL append the next page when the user scrolls to the bottom of the results container. A sentinel element at the end of the listing SHALL be observed with an `IntersectionObserver`; when it becomes visible and no page load is in progress, the next page SHALL be appended. The result count SHALL reflect the total number of matching ideas, not the loaded count. Once every matching idea is loaded, the listing SHALL show an end-of-list state and SHALL stop loading further pages. Any change to the search query or any facet SHALL reset the listing to the first page. The pagination SHALL be session-scoped and SHALL NOT be written to the URL.

#### Scenario: First page renders on load
- **WHEN** the home page loads with matching ideas
- **THEN** the results container shows the first page of matching ideas (up to 6)
- **AND** the result count shows the total number of matching ideas

#### Scenario: Scrolling to the bottom loads the next page
- **WHEN** the user scrolls the results container so the sentinel becomes visible
- **THEN** the next page of matching ideas (up to 6) is appended to the listing

#### Scenario: No duplicate loads while a page is loading
- **WHEN** the sentinel is visible while a page load is already in progress
- **THEN** no additional page load is started

#### Scenario: End of list stops loading
- **WHEN** every matching idea has been loaded
- **THEN** an end-of-list state is shown
- **AND** no further page loads occur

#### Scenario: Filtering resets to the first page
- **WHEN** the user changes the search query or toggles a facet after scrolling through several pages
- **THEN** the listing resets to the first page of the new result set

#### Scenario: Pagination is session-scoped
- **WHEN** the user scrolls through several pages and then reloads the page
- **THEN** the listing starts again from the first page
- **AND** the URL contains no pagination parameters

