# Build Engine Spec

## ADDED Requirements

### Requirement: [REQ-BE-001: Build loads catalogue and content inputs]
The build engine (`build.py`) SHALL load `content/yuktis.json` and the corresponding Markdown files under `content/yuktis/` before generating output.

#### Scenario: Build reads all inputs
- **WHEN** `python build.py` is executed
- **THEN** it loads `content/yuktis.json` and each yukti's Markdown body
- **AND** it proceeds only after all required inputs are read successfully

### Requirement: [REQ-BE-002: Stable slug generation]
The build SHALL generate URL slugs from yukti metadata using a Unicode-aware slugify function. It SHALL preserve Devanagari (U+0900–U+097F) characters, replace other non-word characters with hyphens, collapse to lowercase, and fall back to `item` when the result is empty.

#### Scenario: Slugs are generated from metadata
- **WHEN** the build processes board `महाराष्ट्र राज्य मंडळ`
- **THEN** its slug preserves the Devanagari characters and does not collapse to an empty value

#### Scenario: Empty slug falls back to item
- **WHEN** a value slugifies to an empty string
- **THEN** the slug used is `item`

### Requirement: [REQ-BE-003: Yukti slug enrichment]
The build SHALL annotate every yukti record with stable slug fields derived from its metadata: `board_slug`, `standard_slug`, `subject_slug`, `category_slug`, `concept_slugs` (array), and `prop_slugs` (array). These slugs SHALL be used consistently by templates and the client-side index.

#### Scenario: Every yukti is enriched with slugs
- **WHEN** the build finishes loading metadata
- **THEN** each yukti record has `board_slug`, `standard_slug`, `subject_slug`, `category_slug`, `concept_slugs`, and `prop_slugs`
- **AND** the same slug value is used in generated links and `index.json`

### Requirement: [REQ-BE-004: Catalogue aggregation with counts]
The build SHALL aggregate yuktis into catalogues for `boards`, `standards`, `subjects`, `categories`, `props`, and `concepts`. Each catalogue item SHALL carry its `title`, `url`, item `count`, and a searchable `search` string. Catalogue items SHALL be sorted.

#### Scenario: Catalogue counts match source data
- **WHEN** two yuktis share the same board
- **THEN** the board's catalogue item has `count` equal to 2
- **AND** the item appears exactly once in the board catalogue

### Requirement: [REQ-BE-005: Template-driven rendering]
The build SHALL render all HTML, Markdown, and XML output from Jinja2 templates located in `templates/` using a single Jinja2 environment with a `FileSystemLoader`. Markdown bodies SHALL be converted to HTML using the `markdown` library with `extra` and `toc` extensions.

#### Scenario: Output is produced by templates
- **WHEN** the build renders a yukti page
- **THEN** it uses `templates/yukti.html.j2` for HTML and `templates/yukti.md.j2` for the Markdown copy
- **AND** the Markdown body is converted with the `extra` and `toc` extensions

### Requirement: [REQ-BE-006: Idempotent refresh of output directory]
The build SHALL remove the existing `site/` directory at the start of every run and regenerate all output from scratch, so a build is deterministic and repeatable.

#### Scenario: Output directory is rebuilt from scratch
- **WHEN** `python build.py` runs after a previous build
- **THEN** the previous `site/` directory is deleted
- **AND** all output is regenerated fresh, leaving no stale files

### Requirement: [REQ-BE-007: Output scoped strictly to site]
The build SHALL write every generated artifact and copied asset only under the `site/` directory. It SHALL NOT write output anywhere outside `site/`, and `site/` SHALL be the only build output directory.

#### Scenario: No output escapes site directory
- **WHEN** a build completes
- **THEN** every file created or copied by the build resides under `site/`
- **AND** no generated files appear under `content/`, `templates/`, `theme/`, or the repository root
