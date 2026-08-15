# build-engine Specification (Delta)

## ADDED Requirements

### Requirement: [REQ-BE-019: Locked facet context on individual catalogue pages]
The build SHALL pass a `locked_facet` context to the catalogue template when rendering each individual catalogue page, derived from the page's item title and the catalogue definition: `type` (the catalogue key), `label` (the catalogue definition's `title`), and `values` (a single-element list containing the item's title). The build SHALL NOT pass a locked facet when rendering catalogue landing pages or the ideas landing page. The template SHALL use the context to render the read-only locked-facet control and the search container's `data-locked-facet` and `data-locked-values` attributes.

#### Scenario: Individual pages receive a locked facet
- **WHEN** the build renders `/standards/4/index.html` for the standard catalogue
- **THEN** `locked_facet.type` is `standard`, `locked_facet.label` is the standard definition's title, and `locked_facet.values` is `["4"]`

#### Scenario: Landing pages receive no locked facet
- **WHEN** the build renders `site/standards/index.html` or `site/ideas/index.html`
- **THEN** the render context carries no `locked_facet`
- **AND** the page keeps the card-grid landing layout
