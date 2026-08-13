## MODIFIED Requirements

### Requirement: [REQ-CM-002: Idea record schema]
Each idea record SHALL include the metadata fields `id`, `title`, `description`, `board`, `standard`, `subject`, `category`, `concepts`, and `props`. `standard` SHALL be a number. `concepts` and `props` SHALL be arrays of strings. Each idea record MAY include an optional `image` field naming an image file stored in the idea's content directory; a missing or empty `image` field is equivalent to the idea having no image.

#### Scenario: Valid idea record
- **WHEN** an idea record is present in `content/ideas/{id}/meta.json`
- **THEN** it has `id`, `title`, `description`, `board`, `standard`, `subject`, `category`, `concepts`, and `props`
- **AND** `standard` is a number and `concepts`/`props` are string arrays

#### Scenario: Optional image field
- **WHEN** an idea record has an empty or absent `image` field
- **THEN** the idea is treated as having no image and its cards display the fallback image
