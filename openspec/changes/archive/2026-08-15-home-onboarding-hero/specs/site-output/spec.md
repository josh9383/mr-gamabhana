# site-output Specification

## MODIFIED Requirements

### Requirement: [REQ-SO-001: Home page]
The build SHALL generate `site/index.html` from `templates/home.html.j2`, rendering the site title, description, a navbar with a search icon and search input, a facet drawer button, one facet panel container per `catalogues` type whose definition has `facet: true`, **a nav link per `catalogues` type whose definition has `menu: true` (labeled with the type's `title`, linking to `/{path_name}/`)**, an onboarding hero section directly below the navbar (the `home-onboarding-hero` capability), and an always-visible results container for the client-side idea listing. The idea listing SHALL render in the page body outside any panel or drawer. The facet drawer button SHALL be hidden on extra-small and small screens (mobile-first) and visible from the medium breakpoint upward. The search experience SHALL operate over ideas, not idea sets. The search and facet drawer icons SHALL be Font Awesome icons loaded from the Font Awesome CDN stylesheet, not inline SVG markup.

#### Scenario: Home page is generated
- **WHEN** the build completes
- **THEN** `site/index.html` exists, contains the site title and description, and declares a canonical URL pointing at the site root

#### Scenario: Home page provides the idea search experience
- **WHEN** the home page is generated with `catalogues` marking `categories`, `concepts`, `props`, `standard`, and `subject` with `facet: true`
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
- **WHEN** the `catalogues` configuration sets `facet: false` for `ideasets`
- **THEN** the home page renders no facet panel for `ideasets`

#### Scenario: Home page renders the onboarding hero
- **WHEN** the home page is generated
- **THEN** it contains an onboarding hero section directly below the navbar
- **AND** the hero contains three ordered steps covering searching, filtering, and opening an idea
