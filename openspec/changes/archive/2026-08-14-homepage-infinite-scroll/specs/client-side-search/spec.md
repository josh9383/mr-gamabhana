# client-side-search Delta Spec

## ADDED Requirements

### Requirement: [REQ-CS-013: Infinite scroll pagination of the idea listing]
The home page SHALL paginate the idea listing with an infinite scroll: it SHALL render the first page of the current result set (page size 6 ideas) and SHALL append the next page when the user scrolls to the bottom of the results container. A sentinel element at the end of the listing SHALL be observed with an `IntersectionObserver`; when it becomes visible and no page load is in progress, the next page SHALL be appended. The result count SHALL reflect the total number of matching ideas, not the loaded count. Once every matching idea is loaded, the listing SHALL show an end-of-list state and SHALL stop loading further pages. Any change to the search query or any facet SHALL reset the listing to the first page. The pagination SHALL be session-scoped and SHALL NOT be written to the URL.

#### Scenario: First page renders on load
- **WHEN** the home page loads with matching ideas
- **THEN** the results container shows the first page of matching ideas (up to 6)
- **AND** the result count shows the total number of matching ideas

#### Scenario: Scrolling to the bottom loads the next page
- **WHEN** the user scrolls the results container so the sentinel becomes visible
- **THEN** the next page of matching ideas (up to 6) is appended to the listing

#### Scenario: No duplicate loads while a page is loading
- **WHEN** the sentinel is visible while a page load is already in progress
- **THEN** no additional page load is started

#### Scenario: End of list stops loading
- **WHEN** every matching idea has been loaded
- **THEN** an end-of-list state is shown
- **AND** no further page loads occur

#### Scenario: Filtering resets to the first page
- **WHEN** the user changes the search query or toggles a facet after scrolling through several pages
- **THEN** the listing resets to the first page of the new result set

#### Scenario: Pagination is session-scoped
- **WHEN** the user scrolls through several pages and then reloads the page
- **THEN** the listing starts again from the first page
- **AND** the URL contains no pagination parameters

## MODIFIED Requirements

### Requirement: [REQ-CS-011: Search and facets filter the idea listing]
The home page SHALL render the first page of matching ideas in the page body by default and SHALL filter that listing in place as the user searches or toggles facets, appending further pages of the result set as the user scrolls (see REQ-CS-013). The search input SHALL live in the navbar. Facets SHALL be contained in a Bootstrap offcanvas drawer opened by a navbar button; the drawer button SHALL be hidden on extra-small and small screens and visible from the medium breakpoint upward. When the page loads with search state in the URL (`q` or facet parameters), the filtered listing SHALL render immediately without the drawer being opened.

#### Scenario: Ideas listed by default
- **WHEN** the home page loads with no search state
- **THEN** the page body shows the first page of matching ideas in the results container
- **AND** the facet drawer is closed

#### Scenario: Typing filters the listing
- **WHEN** a user types a query in the navbar search input
- **THEN** the idea listing in the page body updates to show only matching ideas, starting from the first page

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
