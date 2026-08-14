# content-model Delta Spec

## MODIFIED Requirements

### Requirement: [REQ-CM-005: Catalogue definitions drive catalogue pages]
The `site` object in `content/site.json` SHALL provide a `catalogues` object mapping each active catalogue type name (`boards`, `standard`, `subject`, `categories`, `concepts`, `props`, `ideasets`) to a definition carrying `path_name`, `title`, `description`, `field`, `mode` (`single` or `multi`), and the booleans `facet`, `menu`, and `footer`. The build SHALL generate catalogue pages only for the types listed as keys, using each definition's `path_name`, `title`, and `description`. A type whose definition has `facet: true` SHALL be a home-page facet. A type whose definition has `menu: true` SHALL appear as a nav link in the main navbar. A type whose definition has `footer: true` SHALL contribute badges to idea card footers. When `catalogues` is absent or empty, the build SHALL fall back to the full legacy set of all seven types with their default definitions, `facet: true` for every type except `ideasets`, and `menu`/`footer` true for every type.

#### Scenario: Configured catalogue types are generated
- **WHEN** `catalogues` is `{"categories": {...}, "concepts": {...}, "props": {...}}`
- **THEN** the build generates catalogue pages only for categories, concepts, and props
- **AND** no catalogue pages are generated for boards, standards, or subjects

#### Scenario: Absent catalogues falls back
- **WHEN** `content/site.json` omits `catalogues`
- **THEN** the build generates catalogue pages for all seven catalogue types
- **AND** every type except `ideasets` is a home facet

#### Scenario: Facet flag derives home facets
- **WHEN** a `catalogues` definition sets `facet: false` for `ideasets`
- **THEN** no `ideasets` facet panel is rendered on the home page

#### Scenario: Menu and footer flags default to true
- **WHEN** a `catalogues` definition omits the `menu` and `footer` flags
- **THEN** the type is treated as `menu: true` and `footer: true`
- **AND** it appears in the main navbar and contributes idea card footer badges
