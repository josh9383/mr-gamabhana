# build-engine Delta Spec

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

### Requirement: [REQ-BE-015: Home facet type list]
The build SHALL derive the home-page facet type list from the `catalogues` configuration: every catalogue type whose definition has `facet: true` SHALL be a home facet, and the build SHALL expose this exact list to the client-side search so rendered facet panels, URL state, and filtering stay consistent. `ideasets` SHALL be excluded by setting `facet: false` in its definition because an idea set cannot be a facet value of itself.

#### Scenario: Facet flag drives the home facet list
- **WHEN** the `catalogues` configuration marks `categories`, `concepts`, `props`, `standard`, and `subject` with `facet: true` and `ideasets` with `facet: false`
- **THEN** the home page renders facet panels for those five types
- **AND** the client-side facet type list excludes `ideasets` and `boards`

### Requirement: [REQ-BE-016: Home index payload idea records]
The build SHALL include in `site/meta.json` an `ideas` array with one record per idea, each carrying `id`, `title`, `description`, `url`, `board`, `standard` (string), `subject`, `categories`/`category_slugs`, `concepts`/`concept_slugs`, `props`/`prop_slugs`, `ideasets`/`ideaset_slugs`, and `image_urls`, so the client-side home search can index and render idea cards without further data loading.

#### Scenario: Payload carries full idea records
- **WHEN** the build generates `site/meta.json`
- **THEN** the `ideas` array contains one entry per idea carrying all search, facet, and card fields
- **AND** the URL of each entry matches its generated idea page

### Requirement: [REQ-BE-017: Catalogue definitions loaded from site config]
The build SHALL load the catalogue definitions from the `catalogues` node of `content/site.json` instead of hardcoding them in `build.py`: for each key, the build SHALL read `path_name`, `title`, `description`, `field`, `mode`, and `facet` and SHALL use them for catalogue page generation, the home facet list, and the client payload. When the `catalogues` node is absent or empty, the build SHALL fall back to the full legacy set (boards, standard, subject, categories, concepts, props, ideasets with their default definitions and `facet: true` for all but `ideasets`).

#### Scenario: Definitions come from site.json
- **WHEN** `content/site.json` declares `catalogues` with a `facet` flag
- **THEN** the build derives catalogue pages, the home facet list, and `site["facet_types"]` from those definitions
- **AND** no catalogue definitions are hardcoded in `build.py`

#### Scenario: Fallback definitions apply when absent
- **WHEN** `content/site.json` omits `catalogues`
- **THEN** the build uses the default definitions for all seven catalogue types
