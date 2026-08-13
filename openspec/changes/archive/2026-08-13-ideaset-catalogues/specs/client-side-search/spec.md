# client-side-search Specification (delta)

## MODIFIED Requirements

### Requirement: [REQ-CS-006: Search page full-text search]
On the home page, the client script SHALL build a MiniSearch index from the `ideasets` array of `site/ideas.json` covering each idea set's title (boosted), description, and aggregated categories, concepts, props, standards, and subjects using a Unicode-aware tokenizer, and SHALL render ranked results for the trimmed query with prefix and fuzzy matching enabled. Results SHALL be rendered as Bootstrap cards with the `card` and `catalogue-card` classes containing an image cap (shuffled representative carousel or fallback), a `card-title`, a `card-text` description, and a `card-footer` showing the member count and prop badges. The MiniSearch `storeFields` SHALL include `id`, `title`, `description`, `url`, `member_count`, `props`, `prop_slugs`, and `representative_image_urls`.

#### Scenario: Query returns ranked idea set cards
- **WHEN** a user types a query in the home page search input
- **THEN** idea sets are ranked and rendered with their image cap, title, description, member count, and URL
- **AND** the results respect prefix and fuzzy matching

#### Scenario: Devanagari query tokenizes correctly
- **WHEN** a user searches for a Devanagari term such as `अपूर्णांक`
- **THEN** idea sets whose aggregated fields contain that term are returned

### Requirement: [REQ-CS-007: Faceted search with counts]
The home page SHALL render facet panels for each `catalogue_attributes` type plus `standard` and `subject`, each showing selectable values with live counts. Facet values SHALL be aggregated from each idea set's member ideas. Multiple selected values within one facet SHALL combine with OR, different facets SHALL combine with AND, and facets SHALL compose with the text query. Counts SHALL reflect the results of the query and all other active facets.

#### Scenario: Selecting a facet narrows idea sets
- **WHEN** a user selects the category `वर्गातील प्रयोग` on the home page
- **THEN** only idea sets whose members include that category are shown
- **AND** the facet counts update to reflect the other active filters

#### Scenario: Facet types follow catalogue_attributes
- **WHEN** `catalogue_attributes` is `["categories", "concepts", "props"]`
- **THEN** the facet panels rendered are categories, concepts, props, standard, and subject
- **AND** no board facet is rendered

### Requirement: [REQ-CS-008: Search state in URL]
The home page SHALL read the query and facet selections from the URL query parameters (`q`, `categories`, `concepts`, `props`, `standard`, `subject`) on load and SHALL update them on every search change so the state is shareable and survives a refresh.

#### Scenario: Shared URL restores the idea set search
- **WHEN** the home page loads with `?q=अपूर्णांक&categories=वर्गातील%20प्रयोग` in its URL
- **THEN** the query and category facet are pre-selected and the results reflect them

#### Scenario: State is written to the URL
- **WHEN** a user changes the query or toggles a facet
- **THEN** the URL query parameters are updated to match the current search state

## ADDED Requirements

### Requirement: [REQ-CS-010: Shuffled representative carousels]
When rendering a home-page idea set card, the client script SHALL copy the idea set's `representative_image_urls`, shuffle the copy with a Fisher–Yates shuffle, cap it at six entries, and render them as a `card-carousel`. With an empty list, the script SHALL render the bundled fallback image.

#### Scenario: Carousel order is randomized per render
- **WHEN** an idea set with representative images is rendered twice on the home page
- **THEN** the first-displayed image may differ between renders while the build output stays deterministic

#### Scenario: Fallback for empty representative images
- **WHEN** an idea set has no representative images
- **THEN** its card image cap renders `/assets/card-fallback.png`
