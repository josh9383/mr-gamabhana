## ADDED Requirements

### Requirement: [REQ-CS-006: Search page full-text search]
On the search page, the client script SHALL build a MiniSearch index from `ideas.json` covering each idea's title (boosted), description, board, standard, subject, category, concepts, and props using a Unicode-aware tokenizer, and SHALL render ranked results for the trimmed query with prefix and fuzzy matching enabled.

#### Scenario: Query returns ranked results
- **WHEN** a user types a query in the search page input
- **THEN** ideas are ranked and rendered with their title, description, and URL
- **AND** the results respect prefix and fuzzy matching

#### Scenario: Devanagari query tokenizes correctly
- **WHEN** a user searches for a Devanagari term such as `त्रिकोण`
- **THEN** ideas whose fields contain that term are returned

### Requirement: [REQ-CS-007: Faceted search with counts]
The search page SHALL render facet panels for boards, standards, subjects, categories, concepts, and props, each showing selectable values with live counts. Multiple selected values within one facet SHALL combine with OR, different facets SHALL combine with AND, and facets SHALL compose with the text query. Counts SHALL reflect the results of the query and all other active facets.

#### Scenario: Selecting a facet narrows results
- **WHEN** a user selects the board `महाराष्ट्र राज्य मंडळ`
- **THEN** only ideas belonging to that board are shown
- **AND** the facet counts update to reflect the other active filters

#### Scenario: Multiple facets combine
- **WHEN** a user selects a subject and a standard
- **THEN** only ideas matching both the subject and the standard are shown

### Requirement: [REQ-CS-008: Search state in URL]
The search page SHALL read the query and facet selections from the URL query parameters (`q`, `board`, `standard`, `subject`, `category`, `concept`, `prop`) on load and SHALL update them on every search change so the state is shareable and survives a refresh.

#### Scenario: Shared URL restores the search
- **WHEN** a search page loads with `?q=त्रिकोण&board=महाराष्ट्र%20राज्य%20मंडळ` in its URL
- **THEN** the query and board facet are pre-selected and the results reflect them

#### Scenario: State is written to the URL
- **WHEN** a user changes the query or toggles a facet
- **THEN** the URL query parameters are updated to match the current search state
