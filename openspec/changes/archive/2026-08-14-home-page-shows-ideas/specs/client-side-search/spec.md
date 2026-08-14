# client-side-search Delta

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: [REQ-CS-010: Shuffled representative carousels]
**Reason**: The home page no longer renders idea set cards, so there are no representative-image carousels to shuffle. Home idea cards render the idea's own `image_urls` in source order.
**Migration**: Idea set representative imagery is still produced and displayed by the ideasets catalogue landing page (see REQ-IS-004); home idea cards use each idea's own `image_urls`.
