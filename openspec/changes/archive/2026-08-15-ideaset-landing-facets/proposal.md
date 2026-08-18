## Why

The ideasets landing page (`/ideasets/`) lists idea sets as static cards with only a simple card-search box. Users cannot narrow the idea sets by the same facets they use elsewhere (standard, subject, category, concept, material), forcing them back to the home page. The ideasets catalogue is the one catalogue landing page without the faceted search experience.

## What Changes

- The ideasets landing page (`site/ideasets/index.html`) gains the home-page search + facets experience: search input, facet panels with live counts, autosuggest, URL-shareable state, infinite scroll, and a reset button.
- The search operates over the idea sets themselves, using each idea set's aggregated metadata (its members' standards, subjects, categories, concepts, and props) as facet values.
- **No "ideasets" (युक्तीसंच) facet panel is rendered on this page** - the page is already the ideasets catalogue, so the facet for the ideaset type is omitted entirely; the remaining facets are interactive.
- Idea set cards keep their existing look (representative images, title, description, member count in the footer).
- The client index in `site/meta.json` gains the aggregated facet fields (and an `id`) for each idea set so the page can be driven by the existing `initPage()` search engine generalized to an "ideaset index" mode.
- The client derives the active facet types from the rendered facet panels (single source of truth), so the page's facet set is controlled by what the template renders.

## Capabilities

### New Capabilities

- `ideaset-landing-search`: The ideasets landing page provides a full-text search + faceted browse over idea sets with aggregated facet values, excludes the ideasets facet panel entirely, and composes facets/query/URL state/reset within the idea set index.

### Modified Capabilities

- `build-engine`: The idea set catalogue items carry an `id` plus aggregated facet fields (`standards`, `subjects`, `categories`/`category_slugs`, `concepts`/`concept_slugs`, `props`/`prop_slugs`) in the client payload; the ideasets landing page is rendered with the search index mode and a facet group list that excludes `ideasets`.
- `site-output`: The ideasets landing page renders the search experience block (facets + `#search-page` + pre-rendered idea set cards) instead of the plain card grid, with no ideasets facet panel; individual idea set pages are unchanged.

## Impact

Files created or updated:

- `build.py` - enrich `ideaset_catalogue_items` with `id` and aggregated facet fields; render the ideasets landing page with `search_index="ideasets"` and `facet_groups` excluding `ideasets`.
- `templates/catalogue.html.j2` - render the search experience block when `search_index` is set (facet panels from the passed `facet_groups`, `#search-page` with `data-index="ideasets"`), and keep the landing card grid otherwise.
- `theme/app.js` - generalize `initPage()`: item source by `data-index` (`ideas` vs `catalogues.ideasets`), aggregated facet values for idea sets, index-mode-aware MiniSearch fields and card footer (member count), facet types derived from the rendered facet panels.
- `theme/style.css` - no changes expected (reuses existing facet/card styles).
- `openspec/specs/ideaset-landing-search/spec.md` (new), `openspec/specs/build-engine/spec.md` and `openspec/specs/site-output/spec.md` (deltas).

No changes to `content/` (user inputs). No new dependencies; MiniSearch and Tom Select are already vendored.

Constraints, Limitations, Assumptions, Out-of-Scope:

- **Constraint**: Facet values for idea sets are their aggregated metadata (ordered unions of member values), matching how idea set cards are already built.
- **Limitation**: An idea set matches a selected facet value only if that value appears in its aggregated metadata; a member-level subset cannot be filtered (the unit of the page is the idea set).
- **Assumption**: The home page and individual catalogue pages keep their current facet sets (including the ideasets facet on the home page, per its configuration); only the ideasets landing page excludes it.
- **Out-of-scope**: Individual idea set pages (`/ideasets/{slug}/`) keep their accordion display with no facets; other catalogue landing pages keep their card search.
