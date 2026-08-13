# build-engine Specification

## Purpose
TBD - created by archiving change establish-project-baseline. Update Purpose after archive.
## Requirements
### Requirement: [REQ-BE-001: Build loads catalogue and content inputs]
The build engine (`build.py`) SHALL load `content/site.json`, `content/ideasets.json`, every per-idea metadata file `content/ideas/*/meta.json`, and the corresponding body file `content/ideas/{id}/meta.md` before generating output. Each idea record SHALL be normalized in a single pass: `id` from the folder name, `description` defaulting to `""`, and `categories`/`concepts`/`props`/`ideasets` coerced to lists.

#### Scenario: Build reads all inputs
- **WHEN** `python build.py` is executed
- **THEN** it loads `content/site.json`, `content/ideasets.json`, each idea record from `content/ideas/*/meta.json`, and each idea's Markdown body
- **AND** each idea carries a folder-derived `id`, a string `description`, and list `categories`/`concepts`/`props`/`ideasets`

### Requirement: [REQ-BE-002: Stable slug generation]
The build SHALL generate URL slugs from idea metadata by romanizing non-ASCII characters with the `anyascii` library and then applying ASCII slugification: lowercase, non-alphanumeric characters replaced with hyphens, collapsing consecutive hyphens, trimming leading/trailing hyphens, and falling back to `item` when the result is empty. The same slug SHALL be used for the generated file/directory name and the URL path.

#### Scenario: Slugs are romanized and slugified
- **WHEN** the build processes board `महाराष्ट्र राज्य मंडळ`
- **THEN** its slug is an ASCII romanization (e.g., `mharastr-rajy-mmdl`) used consistently for the folder and URL path
- **AND** the romanized slug is deterministic across builds

#### Scenario: Empty slug falls back to item
- **WHEN** a value romanizes to an empty string
- **THEN** the slug used is `item`

### Requirement: [REQ-BE-004: Catalogue aggregation with counts]
The build SHALL aggregate ideas into catalogues only for the catalogue types declared in `catalogue_attributes`. Each catalogue item SHALL carry its `title`, `url`, item `count`, and a searchable `search` string. Catalogue items SHALL be sorted.

#### Scenario: Catalogue counts match source data
- **WHEN** `catalogue_attributes` includes `categories` and two ideas share the same category
- **THEN** that category's catalogue item has `count` equal to 2
- **AND** the item appears exactly once in the category catalogue

#### Scenario: Only configured catalogues are aggregated
- **WHEN** `catalogue_attributes` is `["categories", "concepts", "props"]`
- **THEN** no boards, standards, or subjects catalogue items are generated

### Requirement: [REQ-BE-005: Template-driven rendering]
The build SHALL render all HTML, Markdown, and XML output from Jinja2 templates located in `templates/` using a single Jinja2 environment with a `FileSystemLoader`. Markdown bodies SHALL be converted to HTML using the `markdown` library with `extra` and `toc` extensions.

#### Scenario: Output is produced by templates
- **WHEN** the build renders an idea page
- **THEN** it uses `templates/idea.html.j2` for HTML and `templates/idea.md.j2` for the Markdown copy
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

### Requirement: [REQ-BE-003: Idea slug enrichment]
The build SHALL annotate every idea record with stable slug fields derived from its metadata: `board_slug`, `standard_slug`, `subject_slug`, `category_slugs` (one per `categories` entry), `concept_slugs`, `prop_slugs`, and `ideaset_slugs` (one per `ideasets` entry). These slugs SHALL be used consistently by templates and the client-side index.

#### Scenario: Every idea is enriched with slugs
- **WHEN** the build finishes loading metadata
- **THEN** each idea record has `board_slug`, `standard_slug`, `subject_slug`, `category_slugs`, `concept_slugs`, `prop_slugs`, and `ideaset_slugs`
- **AND** `category_slugs` has the same length as `categories` and `ideaset_slugs` the same length as `ideasets`

### Requirement: [REQ-BE-009: Theme configuration resolution]
The build SHALL read the optional `theme_stylesheet` and `bootstrap_script` fields from `content/site.json` and expose the resolved values in the template context on every render. A field with a non-empty value SHALL be used as-is; a missing or empty field SHALL fall back to the default constants (Bootswatch Vapor 5.3.3 stylesheet and Bootstrap 5.3.3 JS bundle via jsDelivr).

#### Scenario: Custom theme fields are used
- **WHEN** `content/site.json` sets a non-empty `theme_stylesheet` value
- **THEN** every template render receives that exact URL as `site.theme_stylesheet`

#### Scenario: Defaults applied for absent fields
- **WHEN** `content/site.json` omits the `theme_stylesheet` field
- **THEN** the render context contains the default Bootswatch Vapor stylesheet URL

#### Scenario: Bootstrap script resolved alongside theme
- **WHEN** the build resolves theme configuration
- **THEN** both `theme_stylesheet` and `bootstrap_script` values are present in the template context for every page

### Requirement: [REQ-BE-011: Idea card payload enrichment]
The build SHALL expose on every idea card item used by the ideas landing page and individual catalogue pages the fields `props`, `prop_slugs`, and `image_urls` in addition to `title`, `description`, `url`, `search`, and `count`, so templates can render an image cap and a props footer.

#### Scenario: Idea card items carry props
- **WHEN** the build generates `site/ideas/index.html` or any individual catalogue page
- **THEN** each idea card payload contains its `props` array and matching `prop_slugs` array
- **AND** each idea card payload contains its `image_urls` array

### Requirement: [REQ-BE-012: Card image resolution]
When an idea's `meta.json` has a non-empty `images` array, the build SHALL copy every listed file `content/ideas/{id}/{image}` into the idea's output directory `site/ideas/{id}/` and SHALL set a root-relative `image_urls` array on the idea record and on its card payloads, one entry per image in the same order. When the field is missing or empty, `image_urls` SHALL be an empty array and cards SHALL display the bundled fallback asset `/assets/card-fallback.png`.

#### Scenario: Idea images are copied
- **WHEN** an idea `angles` has a non-empty `images` array
- **THEN** every listed file exists under `site/ideas/angles/` after the build
- **AND** the idea's card payloads reference `/ideas/angles/{image}` for each listed image in order

#### Scenario: Fallback image for missing images
- **WHEN** an idea has no `images` field or an empty array
- **THEN** the idea's card payloads have an empty `image_urls` array
- **AND** no image file is copied for that idea
- **AND** its cards display `/assets/card-fallback.png`

### Requirement: [REQ-BE-013: Idea set aggregation]
The build SHALL resolve idea set membership from each idea's `ideasets` array against `content/ideasets.json` and produce idea set records carrying `id` (slug), `title`, `description`, `url`, `member_count`, `member_ids`, aggregated `categories`/`category_slugs`, `concepts`/`concept_slugs`, `props`/`prop_slugs`, `standards`, `subjects`, and `representative_image_urls` (first image of each member idea in member order). Aggregated values SHALL be ordered unions over member ideas.

#### Scenario: Idea set record aggregates member metadata
- **WHEN** the build resolves the idea set `अपूर्णांकांची तोंडओळख` with members m1 and m2
- **THEN** its record has `member_count` 2, `standards` `["4"]`, and `categories` equal to the ordered union of both members' categories
- **AND** `representative_image_urls` holds the first image of each member in member order

### Requirement: [REQ-BE-014: Idea set pages rendered as member accordions]
The build SHALL render `site/ideasets/{slug}/index.html` from `templates/ideaset.html.j2` for every idea set, providing for each member idea an accordion item payload containing `title`, `url`, `description`, `image_urls`, and `content_html` (the idea's Markdown body converted to HTML with the `extra` and `toc` extensions).

#### Scenario: Idea set page is generated with member accordion payloads
- **WHEN** the build completes
- **THEN** `site/ideasets/fractions-introduction/index.html` exists
- **AND** it contains one accordion item per member idea, each carrying the idea's title, url, description, images, and converted Markdown body

