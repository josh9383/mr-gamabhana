# content-model Specification (delta)

## MODIFIED Requirements

### Requirement: [REQ-CM-002: Idea record schema]
Each idea record SHALL be stored at `content/ideas/{id}/meta.json` where `{id}` is the containing folder name; the `id` field SHALL NOT be stored in the JSON. The record SHALL include `title`, `board`, `standard`, `subject`, `categories`, `concepts`, and `props`. `standard` SHALL be a number. `categories`, `concepts`, `props`, and `ideasets` SHALL be arrays of strings. The `ideasets` array SHALL declare the idea sets the idea belongs to. The record MAY include an optional `images` array naming image files in the idea folder and an optional `description`; a missing or empty `description` SHALL be treated as an empty string.

#### Scenario: Idea id is the folder name
- **WHEN** an idea record exists at `content/ideas/m1/meta.json` without an `id` field
- **THEN** the idea's `id` is `m1` for all output paths and URLs

#### Scenario: Categories is an array
- **WHEN** an idea record declares `categories`
- **THEN** `categories` is an array of strings, one per catalogue category, not a single string

#### Scenario: Missing description is empty
- **WHEN** an idea record has no `description` field
- **THEN** the idea's `description` is the empty string and cards/pages render without a description

#### Scenario: Idea set membership declared
- **WHEN** an idea record declares `ideasets`
- **THEN** each entry names an idea set defined in `content/ideasets.json`

### Requirement: [REQ-CM-001: Site config and idea metadata are the source of truth]
The system SHALL treat `content/site.json` as the single source of truth for site configuration and each per-idea file `content/ideas/{id}/meta.json` as the single source of truth for that idea's catalogue metadata. `content/site.json` SHALL provide a `site` object with `title`, `description`, `language`, `base_url_live`, `base_url`, and `catalogue_attributes`. Each `content/ideas/{id}/meta.json` SHALL provide exactly one idea record whose `id` is derived from the folder name.

#### Scenario: Site config and idea metadata load
- **WHEN** the build loads `content/site.json` and every `content/ideas/*/meta.json`
- **THEN** it reads a `site` object with `title`, `description`, `language`, `base_url_live`, `base_url`, and `catalogue_attributes`
- **AND** it reads one idea record from each `content/ideas/{id}/meta.json` with `id` equal to the folder name

## ADDED Requirements

### Requirement: [REQ-CM-005: Catalogue attributes drive catalogue pages]
The `site` object in `content/site.json` SHALL provide a `catalogue_attributes` array naming the catalogue types (`boards`, `standards`, `subjects`, `categories`, `concepts`, `props`) for which the build SHALL generate catalogue pages. The build SHALL generate catalogue pages only for the listed types. When `catalogue_attributes` is absent or empty, the build SHALL fall back to the full legacy set of all six types.

#### Scenario: Configured catalogue types are generated
- **WHEN** `catalogue_attributes` is `["categories", "concepts", "props"]`
- **THEN** the build generates catalogue pages only for categories, concepts, and props
- **AND** no catalogue pages are generated for boards, standards, or subjects

#### Scenario: Absent catalogue_attributes falls back
- **WHEN** `content/site.json` omits `catalogue_attributes`
- **THEN** the build generates catalogue pages for all six catalogue types
