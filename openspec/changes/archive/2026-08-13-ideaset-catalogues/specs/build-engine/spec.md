# build-engine Specification (delta)

## MODIFIED Requirements

### Requirement: [REQ-BE-001: Build loads catalogue and content inputs]
The build engine (`build.py`) SHALL load `content/site.json`, `content/ideasets.json`, every per-idea metadata file `content/ideas/*/meta.json`, and the corresponding body file `content/ideas/{id}/meta.md` before generating output. Each idea record SHALL be normalized in a single pass: `id` from the folder name, `description` defaulting to `""`, and `categories`/`concepts`/`props`/`ideasets` coerced to lists.

#### Scenario: Build reads all inputs
- **WHEN** `python build.py` is executed
- **THEN** it loads `content/site.json`, `content/ideasets.json`, each idea record from `content/ideas/*/meta.json`, and each idea's Markdown body
- **AND** each idea carries a folder-derived `id`, a string `description`, and list `categories`/`concepts`/`props`/`ideasets`

### Requirement: [REQ-BE-003: Idea slug enrichment]
The build SHALL annotate every idea record with stable slug fields derived from its metadata: `board_slug`, `standard_slug`, `subject_slug`, `category_slugs` (one per `categories` entry), `concept_slugs`, `prop_slugs`, and `ideaset_slugs` (one per `ideasets` entry). These slugs SHALL be used consistently by templates and the client-side index.

#### Scenario: Every idea is enriched with slugs
- **WHEN** the build finishes loading metadata
- **THEN** each idea record has `board_slug`, `standard_slug`, `subject_slug`, `category_slugs`, `concept_slugs`, `prop_slugs`, and `ideaset_slugs`
- **AND** `category_slugs` has the same length as `categories` and `ideaset_slugs` the same length as `ideasets`

### Requirement: [REQ-BE-004: Catalogue aggregation with counts]
The build SHALL aggregate ideas into catalogues only for the catalogue types declared in `catalogue_attributes`. Each catalogue item SHALL carry its `title`, `url`, item `count`, and a searchable `search` string. Catalogue items SHALL be sorted.

#### Scenario: Catalogue counts match source data
- **WHEN** `catalogue_attributes` includes `categories` and two ideas share the same category
- **THEN** that category's catalogue item has `count` equal to 2
- **AND** the item appears exactly once in the category catalogue

#### Scenario: Only configured catalogues are aggregated
- **WHEN** `catalogue_attributes` is `["categories", "concepts", "props"]`
- **THEN** no boards, standards, or subjects catalogue items are generated

## ADDED Requirements

### Requirement: [REQ-BE-013: Idea set aggregation]
The build SHALL resolve idea set membership from each idea's `ideasets` array against `content/ideasets.json` and produce idea set records carrying `id` (slug), `title`, `description`, `url`, `member_count`, `member_ids`, aggregated `categories`/`category_slugs`, `concepts`/`concept_slugs`, `props`/`prop_slugs`, `standards`, `subjects`, and `representative_image_urls` (first image of each member idea in member order). Aggregated values SHALL be ordered unions over member ideas.

#### Scenario: Idea set record aggregates member metadata
- **WHEN** the build resolves the idea set `अपूर्णांकांची तोंडओळख` with members m1 and m2
- **THEN** its record has `member_count` 2, `standards` `["4"]`, and `categories` equal to the ordered union of both members' categories
- **AND** `representative_image_urls` holds the first image of each member in member order

### Requirement: [REQ-BE-014: Idea set pages rendered]
The build SHALL render `site/ideasets/{slug}/index.html` from `templates/ideaset.html.j2` for every idea set, listing member ideas as standard catalogue card payloads (`title`, `description`, `url`, `search`, `props`, `prop_slugs`, `image_urls`, `count`).

#### Scenario: Idea set page is generated per set
- **WHEN** the build completes
- **THEN** `site/ideasets/fractions-introduction/index.html` exists and contains one card per member idea
