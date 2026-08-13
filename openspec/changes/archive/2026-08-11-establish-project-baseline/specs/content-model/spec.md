# Content Model Spec

## ADDED Requirements

### Requirement: [REQ-CM-001: Yuktis catalogue is the single source of metadata]
The system SHALL treat `content/yuktis.json` as the single source of truth for site configuration and yukti catalogue metadata. It SHALL contain a `site` object and a `yuktis` array. The `site` object SHALL provide `title`, `description`, `language`, `base_url_live`, and `base_url`.

#### Scenario: Catalogue contains site config and yuktis
- **WHEN** the build loads `content/yuktis.json`
- **THEN** it reads a `site` object with `title`, `description`, `language`, `base_url_live`, and `base_url`
- **AND** it reads a `yuktis` array containing every yukti record

### Requirement: [REQ-CM-002: Yukti record schema]
Each yukti record SHALL include the metadata fields `id`, `title`, `description`, `board`, `standard`, `subject`, `category`, `concepts`, and `props`. `standard` SHALL be a number. `concepts` and `props` SHALL be arrays of strings.

#### Scenario: Valid yukti record
- **WHEN** a yukti record is present in `yuktis.json`
- **THEN** it has `id`, `title`, `description`, `board`, `standard`, `subject`, `category`, `concepts`, and `props`
- **AND** `standard` is a number and `concepts`/`props` are string arrays

### Requirement: [REQ-CM-003: Yukti content files]
The system SHALL store each yukti's body content in a Markdown file named `content/yuktis/{id}.md`, where `{id}` matches the yukti's `id` field in `yuktis.json`. The file SHALL contain the full body text of the yukti in Markdown format.

#### Scenario: Content file exists for each yukti
- **WHEN** the build processes a yukti with id `angles`
- **THEN** it reads the body from `content/yuktis/angles.md`
- **AND** if the file is missing, the build fails rather than generating a partial page

### Requirement: [REQ-CM-004: Content is user-generated input]
The build engine SHALL treat every file under `content/` as user-generated metadata and content input. It SHALL NOT create, modify, or delete any file under `content/` during a build.

#### Scenario: Build leaves content untouched
- **WHEN** a build runs to completion
- **THEN** no files under `content/` are created, modified, or deleted
- **AND** the `content/` directory tree is byte-identical before and after the build
