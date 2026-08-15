# locked-facet Specification

## ADDED Requirements

### Requirement: Locked facet is preselected, applied, and read-only
On an individual catalogue page, the facet corresponding to the page's catalogue type SHALL be preselected with the page's single value, applied to all search results, and read-only: the user SHALL NOT be able to change or remove it. The locked facet SHALL render as a static read-only control (an `h3` label and a disabled form control) rather than an interactive multi-select, and the remaining facets SHALL render as interactive Tom Select multi-selects.

#### Scenario: Locked facet displayed on its catalogue page
- **WHEN** a user opens `/standards/4/`
- **THEN** the standard facet shows `4` as a static read-only control
- **AND** the user cannot change or remove that value
- **AND** every result belongs to standard 4

#### Scenario: Other facets remain interactive
- **WHEN** a user opens `/standards/4/`
- **THEN** the categories, concepts, props, and subject facets are user-changeable Tom Select multi-selects

### Requirement: Reset retains the locked facet
The reset/clear button on an individual catalogue page SHALL clear the search query and all user-changeable facets but SHALL retain the page's locked facet selection, then SHALL re-render results within the page scope.

#### Scenario: Reset keeps the page scope
- **WHEN** a user has typed a query and selected other facets on `/standards/4/` and clicks the reset button
- **THEN** the query and the other facets are cleared
- **AND** the standard facet stays selected with `4`
- **AND** the results still contain only standard 4 ideas

### Requirement: URL state honours the locked facet
On an individual catalogue page, the search state written to the URL SHALL include the query and user-changeable facets but SHALL NOT include the locked facet. On load, the page's locked facet value SHALL override any URL parameter for the same facet type.

#### Scenario: URL params cannot change the locked facet
- **WHEN** a user opens `/concepts/tulnaa/?concepts=%E0%A4%95%E0%A4%BE%E0%A4%B9%E0%A5%80&q=%E0%A4%95%E0%A5%8B%E0%A4%A8`
- **THEN** the concepts facet remains `तुलना` and read-only
- **AND** the query `कोन` is applied within the concepts scope

#### Scenario: Locked facet omitted from the URL
- **WHEN** a user selects another facet on `/standards/4/`
- **THEN** the URL contains the other facet parameters and the query but no `standard` parameter

### Requirement: Locked facet context comes from the page
The build engine SHALL provide the locked facet's type, label, and single value on the page's search container as data attributes, and the client script SHALL seed its facet state from those attributes before rendering, keeping the DOM as the single source of truth.

#### Scenario: Build provides the locked facet context
- **WHEN** the build generates `/standards/4/index.html`
- **THEN** the `#search-page` element carries `data-locked-facet="standard"` and `data-locked-values` containing `4`
- **AND** the client seeds its state from those attributes on load
