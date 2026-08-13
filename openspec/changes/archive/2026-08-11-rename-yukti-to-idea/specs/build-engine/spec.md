# Build Engine Spec

## RENAMED Requirements

- FROM: `### Requirement: [REQ-BE-003: Yukti slug enrichment]`
- TO: `### Requirement: [REQ-BE-003: Idea slug enrichment]`

## MODIFIED Requirements

### Requirement: [REQ-BE-001: Build loads catalogue and content inputs]
The build engine (`build.py`) SHALL load `content/ideas.json` and the corresponding Markdown files under `content/ideas/` before generating output.

#### Scenario: Build reads all inputs
- **WHEN** `python build.py` is executed
- **THEN** it loads `content/ideas.json` and each idea's Markdown body
- **AND** it proceeds only after all required inputs are read successfully

### Requirement: [REQ-BE-003: Idea slug enrichment]
The build SHALL annotate every idea record with stable slug fields derived from its metadata: `board_slug`, `standard_slug`, `subject_slug`, `category_slug`, `concept_slugs` (array), and `prop_slugs` (array). These slugs SHALL be used consistently by templates and the client-side index.

#### Scenario: Every idea is enriched with slugs
- **WHEN** the build finishes loading metadata
- **THEN** each idea record has `board_slug`, `standard_slug`, `subject_slug`, `category_slug`, `concept_slugs`, and `prop_slugs`
- **AND** the same slug value is used in generated links and `index.json`

### Requirement: [REQ-BE-004: Catalogue aggregation with counts]
The build SHALL aggregate ideas into catalogues for `boards`, `standards`, `subjects`, `categories`, `props`, and `concepts`. Each catalogue item SHALL carry its `title`, `url`, item `count`, and a searchable `search` string. Catalogue items SHALL be sorted.

#### Scenario: Catalogue counts match source data
- **WHEN** two ideas share the same board
- **THEN** the board's catalogue item has `count` equal to 2
- **AND** the item appears exactly once in the board catalogue

### Requirement: [REQ-BE-005: Template-driven rendering]
The build SHALL render all HTML, Markdown, and XML output from Jinja2 templates located in `templates/` using a single Jinja2 environment with a `FileSystemLoader`. Markdown bodies SHALL be converted to HTML using the `markdown` library with `extra` and `toc` extensions.

#### Scenario: Output is produced by templates
- **WHEN** the build renders an idea page
- **THEN** it uses `templates/idea.html.j2` for HTML and `templates/idea.md.j2` for the Markdown copy
- **AND** the Markdown body is converted with the `extra` and `toc` extensions
