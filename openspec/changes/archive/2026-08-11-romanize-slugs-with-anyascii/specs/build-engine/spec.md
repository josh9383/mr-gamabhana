# Build Engine Spec

## MODIFIED Requirements

### Requirement: [REQ-BE-002: Stable slug generation]
The build SHALL generate URL slugs from idea metadata by romanizing non-ASCII characters with the `anyascii` library and then applying ASCII slugification: lowercase, non-alphanumeric characters replaced with hyphens, collapsing consecutive hyphens, trimming leading/trailing hyphens, and falling back to `item` when the result is empty. The same slug SHALL be used for the generated file/directory name and the URL path.

#### Scenario: Slugs are romanized and slugified
- **WHEN** the build processes board `महाराष्ट्र राज्य मंडळ`
- **THEN** its slug is an ASCII romanization (e.g., `mharastr-rajy-mmdl`) used consistently for the folder and URL path
- **AND** the romanized slug is deterministic across builds

#### Scenario: Empty slug falls back to item
- **WHEN** a value romanizes to an empty string
- **THEN** the slug used is `item`
