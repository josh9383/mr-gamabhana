# client-side-search Delta Spec

## ADDED Requirements

### Requirement: [REQ-CS-011: Search and facets filter the idea listing]
The home page SHALL render every idea in the page body by default and SHALL filter that listing in place as the user searches or toggles facets. The search input SHALL live in the navbar. Facets SHALL be contained in a Bootstrap offcanvas drawer opened by a navbar button; the drawer button SHALL be hidden on extra-small and small screens and visible from the medium breakpoint upward. When the page loads with search state in the URL (`q` or facet parameters), the filtered listing SHALL render immediately without the drawer being opened.

#### Scenario: Ideas listed by default
- **WHEN** the home page loads with no search state
- **THEN** the page body shows every idea in the results container
- **AND** the facet drawer is closed

#### Scenario: Typing filters the listing
- **WHEN** a user types a query in the navbar search input
- **THEN** the idea listing in the page body updates to show only matching ideas

#### Scenario: Facet drawer opens from the navbar
- **WHEN** a user clicks the facet drawer button on a medium or larger screen
- **THEN** the offcanvas drawer opens showing the facet panels
- **AND** the idea listing remains visible

#### Scenario: Mobile shows search only
- **WHEN** the home page is viewed on a screen below the medium breakpoint
- **THEN** the navbar shows the search input
- **AND** the facet drawer button is not visible

#### Scenario: Shared search state renders results
- **WHEN** the home page loads with `?q=अपूर्णांक` in its URL
- **THEN** the filtered idea listing renders immediately in the page body

### Requirement: [REQ-CS-012: Autosuggest for search input]
The home page SHALL show a type-ahead suggestion dropdown under the navbar search input using the MiniSearch `autoSuggest` method over the idea index. Suggestions SHALL update as the user types, reflect the current query, and when selected SHALL populate the search input and trigger the search. The suggestion dropdown SHALL close when the input loses focus or the query is emptied.

#### Scenario: Typing shows suggestions
- **WHEN** a user types `अपूर्णा` in the home page search input
- **THEN** a suggestion dropdown appears below the input containing indexed terms that complete the query
- **AND** the suggestions respect prefix and fuzzy matching

#### Scenario: Selecting a suggestion searches
- **WHEN** a user selects a suggestion from the dropdown
- **THEN** the search input is populated with the suggestion
- **AND** the results update to match the full suggestion

## MODIFIED Requirements

### Requirement: [REQ-CS-007: Faceted search with counts]
The home page SHALL render facet panels for each `catalogue_attributes` type plus `standard` and `subject` inside the facet drawer, each as a Tom Select multi-select control (vendored at `assets/tom-select.min.js` with the Bootstrap 5 theme `assets/tom-select.bootstrap5.min.css`) listing selectable values with live counts. Selected values SHALL appear as removable items (Tom Select items with the remove button) and each facet SHALL expose a clear button. Facet values SHALL come from each idea's own fields: `standard` and `subject` as single scalar values and the multi-valued catalogue arrays as their value lists. Multiple selected values within one facet SHALL combine with OR, different facets SHALL combine with AND, and facets SHALL compose with the text query. Counts SHALL reflect the results of the query and all other active facets.

#### Scenario: Selecting a facet narrows ideas
- **WHEN** a user selects the category `वर्गातील प्रयोग` in the facet drawer
- **THEN** only ideas with that category are shown in the page body listing
- **AND** the facet counts update to reflect the other active filters

#### Scenario: Facet types follow catalogue_attributes
- **WHEN** `catalogue_attributes` is `["categories", "concepts", "props"]`
- **THEN** the facet panels rendered are categories, concepts, props, standard, and subject
- **AND** no board facet is rendered

#### Scenario: Tom Select items show selected values
- **WHEN** a user selects values within a facet
- **THEN** each selected value appears as a removable item in the Tom Select control
- **AND** removing an item deselects the value and updates the listing

#### Scenario: Facets are powered by vendored Tom Select
- **WHEN** the home page loads its facet controls
- **THEN** the facet controls are implemented with Tom Select and are not built on jQuery or the select2 library
