# Content Model Spec

## RENAMED Requirements

- FROM: `### Requirement: [REQ-CM-001: Ideas catalogue is the single source of metadata]`
- TO: `### Requirement: [REQ-CM-001: Site config and idea metadata are the source of truth]`

## MODIFIED Requirements

### Requirement: [REQ-CM-001: Site config and idea metadata are the source of truth]
The system SHALL treat `content/site.json` as the single source of truth for site configuration and each per-idea file `content/ideas/{id}/meta.json` as the single source of truth for that idea's catalogue metadata. `content/site.json` SHALL provide a `site` object with `title`, `description`, `language`, `base_url_live`, and `base_url`. Each `content/ideas/{id}/meta.json` SHALL provide exactly one idea record.

#### Scenario: Site config and idea metadata load
- **WHEN** the build loads `content/site.json` and every `content/ideas/*/meta.json`
- **THEN** it reads a `site` object with `title`, `description`, `language`, `base_url_live`, and `base_url`
- **AND** it reads one idea record from each `content/ideas/{id}/meta.json`

### Requirement: [REQ-CM-002: Idea record schema]
Each idea record SHALL include the metadata fields `id`, `title`, `description`, `board`, `standard`, `subject`, `category`, `concepts`, and `props`. `standard` SHALL be a number. `concepts` and `props` SHALL be arrays of strings.

#### Scenario: Valid idea record
- **WHEN** an idea record is present in `content/ideas/{id}/meta.json`
- **THEN** it has `id`, `title`, `description`, `board`, `standard`, `subject`, `category`, `concepts`, and `props`
- **AND** `standard` is a number and `concepts`/`props` are string arrays

### Requirement: [REQ-CM-003: Idea content files]
The system SHALL store each idea's body content in a Markdown file named `content/ideas/{id}/meta.md`, where `{id}` matches the idea's `id` field in its `content/ideas/{id}/meta.json`. The file SHALL contain the full body text of the idea in Markdown format.

#### Scenario: Content file exists for each idea
- **WHEN** the build processes an idea with id `angles`
- **THEN** it reads the body from `content/ideas/angles/meta.md`
- **AND** if the file is missing, the build fails rather than generating a partial page
