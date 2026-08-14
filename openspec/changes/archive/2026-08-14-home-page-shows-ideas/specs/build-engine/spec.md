# build-engine Delta

## ADDED Requirements

### Requirement: [REQ-BE-016: Home index payload idea records]
The build SHALL include in `site/ideas.json` an `ideas` array with one record per idea, each carrying `id`, `title`, `description`, `url`, `board`, `standard` (string), `subject`, `categories`/`category_slugs`, `concepts`/`concept_slugs`, `props`/`prop_slugs`, `ideasets`/`ideaset_slugs`, and `image_urls`, so the client-side home search can index and render idea cards without further data loading.

#### Scenario: Payload carries full idea records
- **WHEN** the build generates `site/ideas.json`
- **THEN** the `ideas` array contains one entry per idea carrying all search, facet, and card fields
- **AND** the URL of each entry matches its generated idea page
