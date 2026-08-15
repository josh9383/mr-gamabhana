# ideaset-landing-search Specification

## ADDED Requirements

### Requirement: [REQ-ILS-001: Ideasets landing search experience]
The ideasets landing page (`site/ideasets/index.html`) SHALL render the faceted search experience: a `#search-page` block with a `#search-input`, a row of Tom Select facet panels with live counts, a reset button, autosuggest, URL-shareable state, and infinite scroll, operating over idea sets. The page SHALL pre-render every idea set as a card inside the `#search-results` container so the listing works without JavaScript. The page SHALL NOT render a facet panel for `ideasets`; every other rendered facet SHALL be interactive.

#### Scenario: Ideasets landing page renders facets and search
- **WHEN** the build generates `site/ideasets/index.html`
- **THEN** the page contains a `#search-page` element with `data-index="ideasets"`, a search input, facet panels for every active facet except `ideasets`, and one pre-rendered card per idea set inside `#search-results`

#### Scenario: No ideasets facet panel
- **WHEN** the ideasets landing page is inspected
- **THEN** no `.facet` element has `data-facet="ideasets"`

### Requirement: [REQ-ILS-002: Idea set facet matching]
An idea set SHALL match a selected facet value when that value appears in the idea set's aggregated metadata (`standards`, `subjects`, `categories`, `concepts`, or `props`). Counts SHALL reflect the number of idea sets matching a value after applying the other active facets and the current query. The unit of filtering is the idea set; a value that appears in only some members matches the whole idea set.

#### Scenario: Facet counts reflect idea set matches
- **WHEN** a user selects a concept in the ideasets landing page facets
- **THEN** the results list every idea set whose aggregated `concepts` contains that concept
- **AND** the count shown for each other facet value counts idea sets, not member ideas

### Requirement: [REQ-ILS-003: Idea set card footer]
Idea set cards on the ideasets landing page SHALL render the member count in the card footer as `युक्त्या (count)` using the existing `card`/`catalogue-card` classes, matching the current static idea set cards. The aggregated facet search SHALL NOT change the card's image cap, title, or description.

#### Scenario: Cards show member count footer
- **WHEN** the ideasets landing page renders an idea set with `count` 4
- **THEN** its card footer contains `युक्त्या (4)`

### Requirement: [REQ-ILS-004: Client idea set index mode]
The client search SHALL read the `data-index` attribute of `#search-page`; when it is `"ideasets"`, the client SHALL index `catalogues.ideasets` from `site/meta.json` with MiniSearch fields `["title", "description", "standards", "subjects", "categories", "concepts", "props"]` and derive facet values from the aggregated arrays. For any other or missing value, the client SHALL index the `ideas` array with the existing fields and behavior.

#### Scenario: Ideaset index uses aggregated fields
- **WHEN** the ideasets landing page initializes search
- **THEN** MiniSearch indexes `data.catalogues.ideasets` with the idea set field set
- **AND** query and facet state apply to idea sets only

### Requirement: [REQ-ILS-005: Facet types from rendered panels]
The client SHALL derive the active facet types from the rendered facet panels on the page (each `.facet` group's `data-facet`), falling back to `site.facet_types` when no panels are present. URL state SHALL read and write only the derived facet types, so the ideasets landing page never carries an `ideasets` facet in its URL or state.

#### Scenario: URL state follows rendered facets
- **WHEN** the ideasets landing page applies a URL query or resets facets
- **THEN** the `ideasets` facet is never read from or written to the URL
- **AND** the page shares its current facet selections and query via the URL
