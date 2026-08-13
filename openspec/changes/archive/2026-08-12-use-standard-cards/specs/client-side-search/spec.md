## MODIFIED Requirements

### Requirement: [REQ-CS-006: Search page full-text search]
On the home page (the site's search page), the client script SHALL build a MiniSearch index from `ideas.json` covering each idea's title (boosted), description, board, standard, subject, category, concepts, and props using a Unicode-aware tokenizer, and SHALL render ranked results for the trimmed query with prefix and fuzzy matching enabled. Results SHALL be rendered as Bootstrap cards with the `card` and `catalogue-card` classes containing a `card-img-top` image cap, a `card-title`, a `card-text` description, and a `card-footer` listing the idea's props as links to the prop catalogue pages. The MiniSearch `storeFields` SHALL include `id`, `title`, `description`, `url`, `props`, and `image_url`.

#### Scenario: Query returns ranked cards
- **WHEN** a user types a query in the home page search input
- **THEN** ideas are ranked and rendered with their image cap, title, description, props footer, and URL
- **AND** the results respect prefix and fuzzy matching

#### Scenario: Devanagari query tokenizes correctly
- **WHEN** a user searches for a Devanagari term such as `त्रिकोण`
- **THEN** ideas whose fields contain that term are returned
