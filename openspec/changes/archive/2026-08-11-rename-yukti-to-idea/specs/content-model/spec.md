# Content Model Spec

## RENAMED Requirements

- FROM: `### Requirement: [REQ-CM-001: Yuktis catalogue is the single source of metadata]`
- TO: `### Requirement: [REQ-CM-001: Ideas catalogue is the single source of metadata]`
- FROM: `### Requirement: [REQ-CM-002: Yukti record schema]`
- TO: `### Requirement: [REQ-CM-002: Idea record schema]`
- FROM: `### Requirement: [REQ-CM-003: Yukti content files]`
- TO: `### Requirement: [REQ-CM-003: Idea content files]`

## MODIFIED Requirements

### Requirement: [REQ-CM-001: Ideas catalogue is the single source of metadata]
The system SHALL treat `content/ideas.json` as the single source of truth for site configuration and idea catalogue metadata. It SHALL contain a `site` object and an `ideas` array. The `site` object SHALL provide `title`, `description`, `language`, `base_url_live`, and `base_url`.

#### Scenario: Catalogue contains site config and ideas
- **WHEN** the build loads `content/ideas.json`
- **THEN** it reads a `site` object with `title`, `description`, `language`, `base_url_live`, and `base_url`
- **AND** it reads an `ideas` array containing every idea record

### Requirement: [REQ-CM-002: Idea record schema]
Each idea record SHALL include the metadata fields `id`, `title`, `description`, `board`, `standard`, `subject`, `category`, `concepts`, and `props`. `standard` SHALL be a number. `concepts` and `props` SHALL be arrays of strings.

#### Scenario: Valid idea record
- **WHEN** an idea record is present in `ideas.json`
- **THEN** it has `id`, `title`, `description`, `board`, `standard`, `subject`, `category`, `concepts`, and `props`
- **AND** `standard` is a number and `concepts`/`props` are string arrays

### Requirement: [REQ-CM-003: Idea content files]
The system SHALL store each idea's body content in a Markdown file named `content/ideas/{id}.md`, where `{id}` matches the idea's `id` field in `ideas.json`. The file SHALL contain the full body text of the idea in Markdown format.

#### Scenario: Content file exists for each idea
- **WHEN** the build processes an idea with id `angles`
- **THEN** it reads the body from `content/ideas/angles.md`
- **AND** if the file is missing, the build fails rather than generating a partial page
