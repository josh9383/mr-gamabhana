# Client-Side Search Spec

## RENAMED Requirements

- FROM: `### Requirement: [REQ-CS-002: Home search filters yuktis]`
- TO: `### Requirement: [REQ-CS-002: Home search filters ideas]`

## MODIFIED Requirements

### Requirement: [REQ-CS-001: Home page renders from index.json]
When the home page is present in the DOM, the client script SHALL fetch `index.json` and render each catalogue group (`concepts`, `categories`, `boards`, `standards`, `subjects`, `props`) and the idea list into their corresponding containers as `.catalogue-card` anchors with title, optional description, and optional count.

#### Scenario: Home page catalogue groups render
- **WHEN** `index.json` loads successfully on the home page
- **THEN** each home container is populated with `.catalogue-card` elements linking to the matching catalogue URLs

### Requirement: [REQ-CS-002: Home search filters ideas]
The home search input SHALL filter the idea list in real time by matching the trimmed, lowercased query against each idea's title, description, board, standard, subject, category, concepts, and props. The filtered list SHALL be re-rendered into the idea list container.

#### Scenario: Search narrows the idea list
- **WHEN** a user types a query in the home search box
- **THEN** only ideas whose combined searchable fields contain the query are rendered
- **AND** ideas that do not match are removed from the list
