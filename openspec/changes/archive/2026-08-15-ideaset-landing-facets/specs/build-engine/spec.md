# build-engine Specification

## MODIFIED Requirements

### Requirement: [REQ-BE-004: Catalogue aggregation with counts]
The build SHALL aggregate ideas into catalogues only for the catalogue types declared as keys of the `catalogues` node in `content/site.json`. Each catalogue item SHALL carry its `title`, `url`, item `count`, and a searchable `search` string, and SHALL be sorted. The `ideasets` catalogue is the exception: its items SHALL be derived from the idea set records instead of aggregated from ideas, each item carrying `title`, `url` `/ideasets/{slug}/`, `count` equal to the idea set's `member_count`, and `search` from the idea set's aggregated metadata. The `ideasets` catalogue SHALL produce only a landing page; per-item pages SHALL NOT be generated because `site/ideasets/{slug}/index.html` already exists as a dedicated idea set page.

#### Scenario: Catalogue counts match source data
- **WHEN** the `catalogues` configuration includes `categories` and two ideas share the same category
- **THEN** that category's catalogue item has `count` equal to 2
- **AND** the item appears exactly once in the category catalogue

#### Scenario: Only configured catalogues are aggregated
- **WHEN** the `catalogues` configuration lists only `categories`, `concepts`, and `props`
- **THEN** no boards, standards, or subjects catalogue items are generated

#### Scenario: Ideasets items derive from idea set records
- **WHEN** the `catalogues` configuration includes `ideasets`
- **THEN** the ideasets catalogue items use the idea sets' custom slugs and `member_count` values
- **AND** their URLs match the generated idea set pages

#### Scenario: Ideasets catalogue is landing-only
- **WHEN** the build runs with `ideasets` active
- **THEN** no catalogue-template output is written under any `site/ideasets/{slug}/` path
- **AND** the build completes without a `FileExistsError`

## ADDED Requirements

### Requirement: [REQ-BE-020: Ideaset catalogue items carry facet fields and id]
The build SHALL expose on every idea set catalogue item, in addition to `title`, `url`, `count`, `description`, `search`, and `image_urls`, the fields `id` (the idea set slug) and the aggregated facet fields `standards`, `subjects`, `categories`/`category_slugs`, `concepts`/`concept_slugs`, and `props`/`prop_slugs`, copied from the idea set records so the client can facet and index idea sets. The same enriched item list SHALL feed both the ideasets landing page render and `catalogues.ideasets` in `site/meta.json`.

#### Scenario: Ideaset items carry facet fields
- **WHEN** the build generates the ideasets landing page or `site/meta.json`
- **THEN** each ideasets catalogue item has an `id` matching the idea set slug
- **AND** its `standards`, `subjects`, `categories`, `concepts`, and `props` arrays equal the idea set record's aggregated values

### Requirement: [REQ-BE-021: Ideasets landing page search context]
The build SHALL render `site/ideasets/index.html` from the catalogue template with a `search_index` context of `"ideasets"` and a `facet_groups` list that excludes `ideasets`, and SHALL pass no `locked_facet`. Other catalogue landing pages and the ideas landing page SHALL continue to render without `search_index`, and individual catalogue pages SHALL continue to receive `locked_facet`.

#### Scenario: Ideasets landing uses search context
- **WHEN** the build renders `site/ideasets/index.html`
- **THEN** the render context carries `search_index` equal to `"ideasets"` and a `facet_groups` list without `ideasets`
- **AND** no `locked_facet` is passed

#### Scenario: Other landing pages stay unchanged
- **WHEN** the build renders `site/standards/index.html` or `site/ideas/index.html`
- **THEN** the render context carries no `search_index`
