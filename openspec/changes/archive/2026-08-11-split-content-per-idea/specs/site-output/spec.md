# Site Output Spec

## MODIFIED Requirements

### Requirement: [REQ-SO-005: Client-side index payload]
The build SHALL generate `site/ideas.json` containing the `site` object, the enriched `ideas` index (id, title, description, metadata, slugs, and URL), and the `catalogues` for all six catalogue types. The payload SHALL be encoded as UTF-8 JSON with indentation.

#### Scenario: ideas.json matches generated pages
- **WHEN** the build completes
- **THEN** `site/ideas.json` exists and its `ideas` entries reference URLs that match generated pages
- **AND** its `catalogues` contain the same items and URLs as the generated catalogue pages
