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
The build SHALL aggregate ideas into catalogues only for the catalogue types declared as keys of the `catalogues` node in `content/site.json`. Each catalogue item SHALL carry its `title`, `url`, item `count`, and a searchable `search` string, and SHALL be sorted. The `ideasets` catalogue is the exception: its items SHALL be derived from the idea set records instead of aggregated from ideas, each item carrying `title`, `url` `/ideasets/{slug}/`, `count` equal to the idea set's `member_count`, and `search` from the idea set's aggregated metadata. The `ideasets` catalogue SHALL produce only a landing page; per-item pages SHALL NOT be generated because `site/ideasets/{slug}/index.html` already exists as a dedicated idea set page.

#### Scenario: Catalogue counts match source data
- **WHEN** the `catalogues` configuration includes `categories` and two ideas share the same category
- **THEN** that category's catalogue item has `count` equal to 2
- **AND** the item appears exactly once in the category catalogue

#### Scenario: Only configured catalogues are aggregated
- **WHEN** the `catalogues` configuration lists only `categories`, `concepts`, and `props`
- **THEN** no boards, standards, or subjects catalogue items are generated

#### Scenario: Ideasets items derive from idea set records
- **WHEN** the `catalogues` configuration includes `ideasets`
- **THEN** the ideasets catalogue items use the idea sets' custom slugs and `member_count` values
- **AND** their URLs match the generated idea set pages

#### Scenario: Ideasets catalogue is landing-only
- **WHEN** the build runs with `ideasets` active
- **THEN** no catalogue-template output is written under any `site/ideasets/{slug}/` path
- **AND** the build completes without a `FileExistsError`

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

### Requirement: [REQ-BE-014: Idea set pages rendered as member cards]
The build SHALL render `site/ideasets/{slug}/index.html` from `templates/ideaset.html.j2` for every idea set, providing for each member idea a card payload containing `title`, `url`, `description`, `image_urls`, `content_html` (the idea's Markdown body converted to HTML with the `extra` and `toc` extensions), and `footer_badges` (a list of `value`/`url` pairs computed with the same logic as idea-card footers from the active `catalogues` configuration). The payload SHALL NOT include accordion-specific fields.

#### Scenario: Idea set page is generated with member card payloads
- **WHEN** the build completes
- **THEN** `site/ideasets/fractions-introduction/index.html` exists
- **AND** it contains one card per member idea, each carrying the idea's title, url, description, images, converted Markdown body, and footer badges

### Requirement: [REQ-BE-015: Home facet type list]
The build SHALL derive the home-page facet type list from the `catalogues` configuration: every catalogue type whose definition has `facet: true` SHALL be a home facet, and the build SHALL expose this exact list to the client-side search so rendered facet panels, URL state, and filtering stay consistent. `ideasets` SHALL be excluded by setting `facet: false` in its definition because an idea set cannot be a facet value of itself.

#### Scenario: Facet flag drives the home facet list
- **WHEN** the `catalogues` configuration marks `categories`, `concepts`, `props`, `standard`, and `subject` with `facet: true` and `ideasets` with `facet: false`
- **THEN** the home page renders facet panels for those five types
- **AND** the client-side facet type list excludes `ideasets` and `boards`

### Requirement: [REQ-BE-016: Home index payload idea records]
The build SHALL include in `site/meta.json` an `ideas` array with one record per idea, each carrying `id`, `title`, `description`, `url`, `board`, `standard` (string), `subject`, `categories`/`category_slugs`, `concepts`/`concept_slugs`, `props`/`prop_slugs`, `ideasets`/`ideaset_slugs`, `image_urls`, and `footer_badges` (a list of `value`/`url` pairs precomputed from the `catalogues` configuration), so the client-side home search can index and render idea cards without further data loading.

#### Scenario: Payload carries full idea records
- **WHEN** the build generates `site/meta.json`
- **THEN** the `ideas` array contains one entry per idea carrying all search, facet, card, and footer fields
- **AND** the URL of each entry matches its generated idea page

### Requirement: [REQ-BE-017: Catalogue definitions loaded from site config]
The build SHALL load the catalogue definitions from the `catalogues` node of `content/site.json` instead of hardcoding them in `build.py`: for each key, the build SHALL read `path_name`, `title`, `description`, `field`, `mode`, `facet`, `menu`, and `footer` and SHALL use them for catalogue page generation, the home facet list, the navbar menu, the idea card footers, and the client payload. When the `catalogues` node is absent or empty, the build SHALL fall back to the full legacy set (boards, standard, subject, categories, concepts, props, ideasets with their default definitions, `facet: true` for all but `ideasets`, and `menu`/`footer` true for all). A definition that omits `menu` or `footer` SHALL be treated as if it set them to `true`.

#### Scenario: Definitions come from site.json
- **WHEN** `content/site.json` declares `catalogues` with `facet`, `menu`, and `footer` flags
- **THEN** the build derives catalogue pages, the home facet list, `site["facet_types"]`, the navbar menu list, and the idea card footer badges from those definitions
- **AND** no catalogue definitions are hardcoded in `build.py`

#### Scenario: Fallback definitions apply when absent
- **WHEN** `content/site.json` omits `catalogues`
- **THEN** the build uses the default definitions for all seven catalogue types

### Requirement: [REQ-BE-018: Catalogue navbar menu and card footer lists]
The build SHALL derive two lists from the `catalogues` configuration: the navbar menu list containing each type with `menu: true` together with its `title` and `path_name`, and the footer type list containing each type with `footer: true`. A missing `menu` or `footer` flag SHALL be treated as `true`. The build SHALL make the navbar menu list available to every page template, and SHALL precompute a `footer_badges` list on idea card payloads (both `idea_card` server records and `home_idea_items` client records) holding one `value`/`url` pair per value of each footer-enabled type, where `single`-mode types use the idea's `{key}_slug` and `multi`-mode types use the idea's `{key}_slugs` to build the URLs.

#### Scenario: Menu flag drives the navbar
- **WHEN** the `catalogues` configuration marks `categories`, `concepts`, and `props` with `menu: true`
- **THEN** the templates receive a navbar menu list containing those three types with their titles and path names
- **AND** types with `menu: false` are absent from the navbar menu list

#### Scenario: Footer flag drives card footer badges
- **WHEN** the `catalogues` configuration marks `props` and `standard` with `footer: true` and `subject` with `footer: false`
- **THEN** idea card payloads carry `footer_badges` for the idea's props and standard values
- **AND** no subject badges appear in idea card footers

#### Scenario: Omitted flags default to true
- **WHEN** the `catalogues` configuration omits the `menu` and `footer` flags on an entry
- **THEN** the entry is included in both the navbar menu list and the footer type list

### Requirement: [REQ-BE-019: Locked facet context on individual catalogue pages]
The build SHALL pass a `locked_facet` context to the catalogue template when rendering each individual catalogue page, derived from the page's item title and the catalogue definition: `type` (the catalogue key), `label` (the catalogue definition's `title`), and `values` (a single-element list containing the item's title). The build SHALL NOT pass a locked facet when rendering catalogue landing pages or the ideas landing page. The template SHALL use the context to render the read-only locked-facet control and the search container's `data-locked-facet` and `data-locked-values` attributes.

#### Scenario: Individual pages receive a locked facet
- **WHEN** the build renders `/standards/4/index.html` for the standard catalogue
- **THEN** `locked_facet.type` is `standard`, `locked_facet.label` is the standard definition's title, and `locked_facet.values` is `["4"]`

#### Scenario: Landing pages receive no locked facet
- **WHEN** the build renders `site/standards/index.html` or `site/ideas/index.html`
- **THEN** the render context carries no `locked_facet`
- **AND** the page keeps the card-grid landing layout

### Requirement: [REQ-BE-020: Ideaset catalogue items carry facet fields and id]
The build SHALL expose on every idea set catalogue item, in addition to `title`, `url`, `count`, `description`, `search`, and `image_urls`, the fields `id` (the idea set slug) and the aggregated facet fields `standards`, `subjects`, `categories`/`category_slugs`, `concepts`/`concept_slugs`, and `props`/`prop_slugs`, copied from the idea set records so the client can facet and index idea sets. The same enriched item list SHALL feed both the ideasets landing page render and `catalogues.ideasets` in `site/meta.json`.

#### Scenario: Ideaset items carry facet fields
- **WHEN** the build generates the ideasets landing page or `site/meta.json`
- **THEN** each ideasets catalogue item has an `id` matching the idea set slug
- **AND** its `standards`, `subjects`, `categories`, `concepts`, and `props` arrays equal the idea set record's aggregated values

### Requirement: [REQ-BE-021: Ideasets landing page search context]
The build SHALL render `site/ideasets/index.html` from the catalogue template with a `search_index` context of `"ideasets"` and a `facet_groups` list that excludes `ideasets`, and SHALL pass no `locked_facet`. Other catalogue landing pages and the ideas landing page SHALL continue to render without `search_index`, and individual catalogue pages SHALL continue to receive `locked_facet`.

#### Scenario: Ideasets landing uses search context
- **WHEN** the build renders `site/ideasets/index.html`
- **THEN** the render context carries `search_index` equal to `"ideasets"` and a `facet_groups` list without `ideasets`
- **AND** no `locked_facet` is passed

#### Scenario: Other landing pages stay unchanged
- **WHEN** the build renders `site/standards/index.html` or `site/ideas/index.html`
- **THEN** the render context carries no `search_index`

### Requirement: [REQ-BE-022: Idea page context carries footer badges]
The build SHALL include `footer_badges` in the render context for every idea page (`site/ideas/{id}/index.html` from `templates/idea.html.j2`), computed with the same logic as idea-card footers - a list of `value`/`url` pairs from the active `catalogues` configuration for every type with `footer: true`. The context SHALL retain the idea record fields, `catalogue_attributes`, `content`, and `content_html`, and the Markdown copy render SHALL be unaffected.

#### Scenario: Idea page is generated with footer badges
- **WHEN** the build renders an idea page for an idea with active `footer: true` catalogue attributes
- **THEN** the render context contains `footer_badges` with the idea's catalogue values and their catalogue page URLs

#### Scenario: Markdown copy is unaffected
- **WHEN** the build renders `index.md` for an idea
- **THEN** it still contains the idea metadata as YAML front matter plus the body

