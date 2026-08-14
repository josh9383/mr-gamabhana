# client-side-search Delta Spec

## MODIFIED Requirements

### Requirement: [REQ-CS-006: Search page full-text search]
On the home page, the client script SHALL build a MiniSearch index from the `ideas` array of `site/meta.json` covering each idea's title (boosted), description, board, standard, subject, categories, concepts, props, and ideasets using a Unicode-aware tokenizer, and SHALL render ranked results for the trimmed query with prefix and fuzzy matching enabled. Results SHALL be rendered as Bootstrap cards with the `card` and `catalogue-card` classes containing an image cap (the idea's own images in order, or the bundled fallback), a `card-title`, a `card-text` description, and a `card-footer` listing badges for every catalogue type whose definition has `footer: true`, rendered from the idea's precomputed `footer_badges` list. The MiniSearch `storeFields` SHALL include `id`, `title`, `description`, `url`, `props`, `prop_slugs`, `image_urls`, and `footer_badges`.

#### Scenario: Query returns ranked idea cards
- **WHEN** a user types a query in the home page search input
- **THEN** ideas are ranked and rendered with their image cap, title, description, URL, and footer badges
- **AND** the results respect prefix and fuzzy matching

#### Scenario: Devanagari query tokenizes correctly
- **WHEN** a user searches for a Devanagari term such as `अपूर्णांक`
- **THEN** ideas whose fields contain that term are returned

#### Scenario: Card footer badges follow catalogues configuration
- **WHEN** the `catalogues` configuration marks `props` with `footer: true`
- **THEN** the idea card footer renders prop badges for the idea's props
- **AND** a type with `footer: false` contributes no badges to the card footer
