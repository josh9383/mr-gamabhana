# site-output Delta Spec

## MODIFIED Requirements

### Requirement: [REQ-SO-007: Static assets copied to site]
The build SHALL copy `theme/style.css`, `theme/app.js`, `theme/assets/minisearch.min.js`, `theme/assets/tom-select.min.js`, `theme/assets/tom-select.bootstrap5.min.css`, and `theme/assets/card-fallback.png` into `site/assets/` so all pages reference assets from the generated site.

#### Scenario: Tom Select assets are copied
- **WHEN** the build completes
- **THEN** `site/assets/tom-select.min.js` and `site/assets/tom-select.bootstrap5.min.css` exist alongside the other static assets

### Requirement: [REQ-SO-001: Home page]
The build SHALL generate `site/index.html` from `templates/home.html.j2`, rendering the site title, description, a navbar with a search icon and search input, a facet drawer button, one facet panel container per `catalogue_attributes` entry excluding `ideasets` plus `standard` and `subject`, and an always-visible results container for the client-side idea listing. The idea listing SHALL render in the page body outside any panel or drawer. The facet drawer button SHALL be hidden on extra-small and small screens (mobile-first) and visible from the medium breakpoint upward. The search experience SHALL operate over ideas, not idea sets. The search and facet drawer icons SHALL be Font Awesome icons loaded from the Font Awesome CDN stylesheet, not inline SVG markup.

#### Scenario: Home page is generated
- **WHEN** the build completes
- **THEN** `site/index.html` exists, contains the site title and description, and declares a canonical URL pointing at the site root

#### Scenario: Home page provides the idea search experience
- **WHEN** the home page is generated with `catalogue_attributes` `["categories", "concepts", "props"]`
- **THEN** it contains a search input in the navbar, a facet drawer with panels for categories, concepts, props, standard, and subject, and an always-visible results container in the page body
- **AND** it references the site's own `assets/minisearch.min.js`, `assets/tom-select.min.js`, `assets/tom-select.bootstrap5.min.css`, and `assets/app.js`

#### Scenario: Idea listing is always visible
- **WHEN** the home page loads
- **THEN** the results container is in the page body outside the facet drawer and is not collapsed
- **AND** the listing can show every idea when no query or facet is active

#### Scenario: Facet drawer button is responsive
- **WHEN** the home page is generated
- **THEN** the facet drawer button is hidden on extra-small and small screens
- **AND** the facet drawer button is visible from the medium breakpoint upward

#### Scenario: Icons use Font Awesome
- **WHEN** the home page is generated
- **THEN** it loads the Font Awesome CDN stylesheet in the head
- **AND** the search and facet drawer icons are rendered with Font Awesome `<i>` classes instead of inline `<svg>` elements

#### Scenario: No ideaset facet panel
- **WHEN** `catalogue_attributes` includes `ideasets`
- **THEN** the home page renders no facet panel for `ideasets`
