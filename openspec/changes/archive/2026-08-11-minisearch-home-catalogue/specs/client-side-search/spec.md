## REMOVED Requirements

### Requirement: [REQ-CS-001: Home page renders from ideas.json]
**Reason**: The home page no longer renders catalogue-group containers; it is now the search page, and catalogue navigation is provided by facet panels. The catalogue-group rendering logic was removed from the client script.
**Migration**: Use the home page's facet panels for catalogue navigation instead of the removed home catalogue-group sections.

### Requirement: [REQ-CS-002: Home search filters ideas]
**Reason**: Superseded by the MiniSearch-based home search experience (REQ-CS-006/007/008); the naive substring filter is obsolete.
**Migration**: The home page search input now runs a MiniSearch full-text index with prefix and fuzzy matching and composes with facets.

## MODIFIED Requirements

### Requirement: [REQ-CS-003: Catalogue pages filter without ideas.json]
Catalogue pages SHALL build a MiniSearch index in the browser from their own `.catalogue-card` elements' searchable text and SHALL filter those cards in place using prefix and fuzzy matching, without loading `ideas.json`, so they remain functional under GitHub Pages project paths. If the MiniSearch library is unavailable, the page SHALL fall back to substring filtering.

#### Scenario: Catalogue filter works standalone
- **WHEN** a user types a query in a catalogue page's search box
- **THEN** each `.catalogue-card` is shown if the MiniSearch query matches its searchable text and hidden otherwise
- **AND** no `ideas.json` request is made on catalogue pages

#### Scenario: Catalogue filter falls back to substring
- **WHEN** the MiniSearch library is unavailable on a catalogue page
- **THEN** cards are filtered by substring containment of the query

### Requirement: [REQ-CS-004: Tag query parameter pre-filters]
Catalogue pages SHALL read a `tag` query parameter from the URL. When present, the page SHALL pre-filter its cards by running the tag through the page's MiniSearch index (with substring fallback) and populate the search input with the tag value.

#### Scenario: Tag parameter filters on load
- **WHEN** a catalogue page loads with `?tag=कोन` in its URL
- **THEN** only cards whose searchable text matches `कोन` are visible
- **AND** the search input is pre-filled with `कोन`

### Requirement: [REQ-CS-006: Search page full-text search]
On the home page (the site's search page), the client script SHALL build a MiniSearch index from `ideas.json` covering each idea's title (boosted), description, board, standard, subject, category, concepts, and props using a Unicode-aware tokenizer, and SHALL render ranked results for the trimmed query with prefix and fuzzy matching enabled.

#### Scenario: Query returns ranked results
- **WHEN** a user types a query in the home page search input
- **THEN** ideas are ranked and rendered with their title, description, and URL
- **AND** the results respect prefix and fuzzy matching

#### Scenario: Devanagari query tokenizes correctly
- **WHEN** a user searches for a Devanagari term such as `त्रिकोण`
- **THEN** ideas whose fields contain that term are returned

### Requirement: [REQ-CS-007: Faceted search with counts]
The home page SHALL render facet panels for boards, standards, subjects, categories, concepts, and props, each showing selectable values with live counts. Multiple selected values within one facet SHALL combine with OR, different facets SHALL combine with AND, and facets SHALL compose with the text query. Counts SHALL reflect the results of the query and all other active facets.

#### Scenario: Selecting a facet narrows results
- **WHEN** a user selects the board `महाराष्ट्र राज्य मंडळ` on the home page
- **THEN** only ideas belonging to that board are shown
- **AND** the facet counts update to reflect the other active filters

#### Scenario: Multiple facets combine
- **WHEN** a user selects a subject and a standard
- **THEN** only ideas matching both the subject and the standard are shown

### Requirement: [REQ-CS-008: Search state in URL]
The home page SHALL read the query and facet selections from the URL query parameters (`q`, `board`, `standard`, `subject`, `category`, `concept`, `prop`) on load and SHALL update them on every search change so the state is shareable and survives a refresh.

#### Scenario: Shared URL restores the search
- **WHEN** the home page loads with `?q=त्रिकोण&board=महाराष्ट्र%20राज्य%20मंडळ` in its URL
- **THEN** the query and board facet are pre-selected and the results reflect them

#### Scenario: State is written to the URL
- **WHEN** a user changes the query or toggles a facet
- **THEN** the URL query parameters are updated to match the current search state
