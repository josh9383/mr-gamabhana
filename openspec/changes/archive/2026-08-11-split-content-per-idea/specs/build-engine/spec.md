# Build Engine Spec

## MODIFIED Requirements

### Requirement: [REQ-BE-001: Build loads catalogue and content inputs]
The build engine (`build.py`) SHALL load `content/site.json`, every per-idea metadata file `content/ideas/*/meta.json`, and the corresponding body file `content/ideas/{id}/meta.md` before generating output.

#### Scenario: Build reads all inputs
- **WHEN** `python build.py` is executed
- **THEN** it loads `content/site.json`, clubs each idea record from `content/ideas/*/meta.json`, and reads each idea's Markdown body
- **AND** it proceeds only after all required inputs are read successfully

### Requirement: [REQ-BE-003: Idea slug enrichment]
The build SHALL annotate every idea record with stable slug fields derived from its metadata: `board_slug`, `standard_slug`, `subject_slug`, `category_slug`, `concept_slugs` (array), and `prop_slugs` (array). These slugs SHALL be used consistently by templates and the client-side index.

#### Scenario: Every idea is enriched with slugs
- **WHEN** the build finishes loading metadata
- **THEN** each idea record has `board_slug`, `standard_slug`, `subject_slug`, `category_slug`, `concept_slugs`, and `prop_slugs`
- **AND** the same slug value is used in generated links and `ideas.json`
