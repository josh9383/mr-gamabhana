# build-engine Delta

## MODIFIED Requirements

### Requirement: [REQ-BE-004: Catalogue aggregation with counts]
The build SHALL aggregate ideas into catalogues only for the catalogue types declared in `catalogue_attributes`. Each catalogue item SHALL carry its `title`, `url`, item `count`, and a searchable `search` string, and SHALL be sorted. The `ideasets` catalogue is the exception: its items SHALL be derived from the idea set records instead of aggregated from ideas, each item carrying `title`, `url` `/ideasets/{slug}/`, `count` equal to the idea set's `member_count`, and `search` from the idea set's aggregated metadata. The `ideasets` catalogue SHALL produce only a landing page; per-item pages SHALL NOT be generated because `site/ideasets/{slug}/index.html` already exists as a dedicated idea set page.

#### Scenario: Catalogue counts match source data
- **WHEN** `catalogue_attributes` includes `categories` and two ideas share the same category
- **THEN** that category's catalogue item has `count` equal to 2
- **AND** the item appears exactly once in the category catalogue

#### Scenario: Only configured catalogues are aggregated
- **WHEN** `catalogue_attributes` is `["categories", "concepts", "props"]`
- **THEN** no boards, standards, or subjects catalogue items are generated

#### Scenario: Ideasets items derive from idea set records
- **WHEN** `catalogue_attributes` includes `ideasets`
- **THEN** the ideasets catalogue items use the idea sets' custom slugs and `member_count` values
- **AND** their URLs match the generated idea set pages

#### Scenario: Ideasets catalogue is landing-only
- **WHEN** the build runs with `ideasets` active
- **THEN** no catalogue-template output is written under any `site/ideasets/{slug}/` path
- **AND** the build completes without a `FileExistsError`

## ADDED Requirements

### Requirement: [REQ-BE-015: Home facet type list]
The build SHALL derive the home-page facet type list from the active catalogue types excluding `ideasets`, plus `standard` and `subject`, and SHALL expose this exact list to the client-side search so rendered facet panels, URL state, and filtering stay consistent. `ideasets` SHALL be excluded because an idea set cannot be a facet value of itself.

#### Scenario: Ideasets is not a home facet
- **WHEN** `catalogue_attributes` includes `ideasets`
- **THEN** the home page renders no `ideasets` facet panel
- **AND** the client-side facet type list excludes `ideasets`
