# content-model Delta Spec

## MODIFIED Requirements

### Requirement: [REQ-CM-001: Site config and idea metadata are the source of truth]
The system SHALL treat `content/site.json` as the single source of truth for site configuration and each per-idea file `content/ideas/{id}/meta.json` as the single source of truth for that idea's catalogue metadata. `content/site.json` SHALL provide a `site` object with `title`, `description`, `language`, `base_url_live`, `base_url`, and `catalogues`. Each `content/ideas/{id}/meta.json` SHALL provide exactly one idea record whose `id` is derived from the folder name.

#### Scenario: Site config and idea metadata load
- **WHEN** the build loads `content/site.json` and every `content/ideas/*/meta.json`
- **THEN** it reads a `site` object with `title`, `description`, `language`, `base_url_live`, `base_url`, and `catalogues`
- **AND** it reads one idea record from each `content/ideas/{id}/meta.json` with `id` equal to the folder name

### Requirement: [REQ-CM-005: Catalogue definitions drive catalogue pages]
The `site` object in `content/site.json` SHALL provide a `catalogues` object mapping each active catalogue type name (`boards`, `standard`, `subject`, `categories`, `concepts`, `props`, `ideasets`) to a definition carrying `path_name`, `title`, `description`, `field`, `mode` (`single` or `multi`), and a boolean `facet`. The build SHALL generate catalogue pages only for the types listed as keys, using each definition's `path_name`, `title`, and `description`. A type whose definition has `facet: true` SHALL be a home-page facet. When `catalogues` is absent or empty, the build SHALL fall back to the full legacy set of all seven types with their default definitions and `facet: true` for every type except `ideasets`.

#### Scenario: Configured catalogue types are generated
- **WHEN** `catalogues` is `{"categories": {...}, "concepts": {...}, "props": {...}}`
- **THEN** the build generates catalogue pages only for categories, concepts, and props
- **AND** no catalogue pages are generated for boards, standards, or subjects

#### Scenario: Absent catalogues falls back
- **WHEN** `content/site.json` omits `catalogues`
- **THEN** the build generates catalogue pages for all seven catalogue types
- **AND** every type except `ideasets` is a home facet

#### Scenario: Facet flag derives home facets
- **WHEN** a `catalogues` definition sets `facet: false` for `ideasets`
- **THEN** no `ideasets` facet panel is rendered on the home page
