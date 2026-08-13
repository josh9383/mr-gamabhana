# Client-Side Search Spec

## RENAMED Requirements

- FROM: `### Requirement: [REQ-CS-001: Home page renders from index.json]`
- TO: `### Requirement: [REQ-CS-001: Home page renders from ideas.json]`
- FROM: `### Requirement: [REQ-CS-003: Catalogue pages filter without index.json]`
- TO: `### Requirement: [REQ-CS-003: Catalogue pages filter without ideas.json]`

## MODIFIED Requirements

### Requirement: [REQ-CS-001: Home page renders from ideas.json]
When the home page is present in the DOM, the client script SHALL fetch `ideas.json` and render each catalogue group (`concepts`, `categories`, `boards`, `standards`, `subjects`, `props`) and the idea list into their corresponding containers as `.catalogue-card` anchors with title, optional description, and optional count.

#### Scenario: Home page catalogue groups render
- **WHEN** `ideas.json` loads successfully on the home page
- **THEN** each home container is populated with `.catalogue-card` elements linking to the matching catalogue URLs

### Requirement: [REQ-CS-003: Catalogue pages filter without ideas.json]
Catalogue pages SHALL filter their `.catalogue-card` elements in place based on each card's `data-search` attribute, and SHALL work without loading `ideas.json`, so they remain functional under GitHub Pages project paths.

#### Scenario: Catalogue filter works standalone
- **WHEN** a user types a query in a catalogue page's search box
- **THEN** each `.catalogue-card` is shown if its `data-search` text contains the query and hidden otherwise
- **AND** no `ideas.json` request is made on catalogue pages

### Requirement: [REQ-CS-005: Graceful degradation on index failure]
If `ideas.json` cannot be loaded on the home page, the script SHALL log the error and leave the home page functional without breaking the catalogue-page search behaviour.

#### Scenario: Missing ideas.json degrades gracefully
- **WHEN** `ideas.json` fails to load on the home page
- **THEN** an error is logged to the console
- **AND** catalogue-page filtering continues to work if a search input is present
