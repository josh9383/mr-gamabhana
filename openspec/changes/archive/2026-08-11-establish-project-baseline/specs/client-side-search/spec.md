# Client-Side Search Spec

## ADDED Requirements

### Requirement: [REQ-CS-001: Home page renders from index.json]
When the home page is present in the DOM, the client script SHALL fetch `index.json` and render each catalogue group (`concepts`, `categories`, `boards`, `standards`, `subjects`, `props`) and the yukti list into their corresponding containers as `.catalogue-card` anchors with title, optional description, and optional count.

#### Scenario: Home page catalogue groups render
- **WHEN** `index.json` loads successfully on the home page
- **THEN** each home container is populated with `.catalogue-card` elements linking to the matching catalogue URLs

### Requirement: [REQ-CS-002: Home search filters yuktis]
The home search input SHALL filter the yukti list in real time by matching the trimmed, lowercased query against each yukti's title, description, board, standard, subject, category, concepts, and props. The filtered list SHALL be re-rendered into the yukti list container.

#### Scenario: Search narrows the yukti list
- **WHEN** a user types a query in the home search box
- **THEN** only yuktis whose combined searchable fields contain the query are rendered
- **AND** yuktis that do not match are removed from the list

### Requirement: [REQ-CS-003: Catalogue pages filter without index.json]
Catalogue pages SHALL filter their `.catalogue-card` elements in place based on each card's `data-search` attribute, and SHALL work without loading `index.json`, so they remain functional under GitHub Pages project paths.

#### Scenario: Catalogue filter works standalone
- **WHEN** a user types a query in a catalogue page's search box
- **THEN** each `.catalogue-card` is shown if its `data-search` text contains the query and hidden otherwise
- **AND** no `index.json` request is made on catalogue pages

### Requirement: [REQ-CS-004: Tag query parameter pre-filters]
Catalogue pages SHALL read a `tag` query parameter from the URL. When present, the page SHALL pre-filter its cards to those matching the tag and populate the search input with the tag value.

#### Scenario: Tag parameter filters on load
- **WHEN** a catalogue page loads with `?tag=कोन` in its URL
- **THEN** only cards whose searchable text matches `कोन` are visible
- **AND** the search input is pre-filled with `कोन`

### Requirement: [REQ-CS-005: Graceful degradation on index failure]
If `index.json` cannot be loaded on the home page, the script SHALL log the error and leave the home page functional without breaking the catalogue-page search behaviour.

#### Scenario: Missing index.json degrades gracefully
- **WHEN** `index.json` fails to load on the home page
- **THEN** an error is logged to the console
- **AND** catalogue-page filtering continues to work if a search input is present
