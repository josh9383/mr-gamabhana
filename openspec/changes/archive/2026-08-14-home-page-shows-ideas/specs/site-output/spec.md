# site-output Delta

## MODIFIED Requirements

### Requirement: [REQ-SO-001: Home page]
The build SHALL generate `site/index.html` from `templates/home.html.j2`, rendering the site title, description, a search input, one facet panel container per `catalogue_attributes` entry excluding `ideasets` plus `standard` and `subject`, and a results container for the client-side search experience. Its canonical URL SHALL be the site root. The search experience SHALL operate over ideas, not idea sets.

#### Scenario: Home page is generated
- **WHEN** the build completes
- **THEN** `site/index.html` exists, contains the site title and description, and declares a canonical URL pointing at the site root

#### Scenario: Home page provides the idea search experience
- **WHEN** the home page is generated with `catalogue_attributes` `["categories", "concepts", "props"]`
- **THEN** it contains a search input, facet panels for categories, concepts, props, standard, and subject, and a results container
- **AND** it references the site's own `assets/minisearch.min.js` and `assets/app.js`

#### Scenario: No ideaset facet panel
- **WHEN** `catalogue_attributes` includes `ideasets`
- **THEN** the home page renders no facet panel for `ideasets`

### Requirement: [REQ-SO-005: Client-side index payload]
The build SHALL generate `site/ideas.json` containing the `site` object, an `ideas` array (one record per idea carrying `id`, `title`, `description`, `url`, `board`, `standard`, `subject`, catalogue arrays with their slugs, `ideasets` with `ideaset_slugs`, and `image_urls`), and the `catalogues` for the active catalogue types. The `ideasets` index SHALL be removed from the payload. The payload SHALL be encoded as UTF-8 JSON with indentation.

#### Scenario: ideas.json matches generated pages
- **WHEN** the build completes
- **THEN** `site/ideas.json` exists, its `ideas` entries reference URLs that match generated idea pages, and its `catalogues` match the generated catalogue pages
- **AND** the payload contains no idea set index

## REMOVED Requirements

### Requirement: [REQ-SO-014: Idea set card imagery on home page]
**Reason**: The home page now renders idea cards instead of idea set cards, so the home-page representative-image carousel no longer exists. Idea set representative imagery is still produced and displayed by the ideasets catalogue landing page (see REQ-IS-004).
**Migration**: Home idea cards render the idea's own `image_urls` in order; idea set imagery lives on the ideasets catalogue landing page.
