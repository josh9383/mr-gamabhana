# build-engine Delta Spec

## MODIFIED Requirements

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

## ADDED Requirements

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
