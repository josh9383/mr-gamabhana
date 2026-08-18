# Ideaset catalogues

## Why

The site currently treats every idea as a flat, independently searchable unit. Content has been refactored so that ideas are grouped into curated idea sets (ideasets), the idea record schema has changed (`id` is now the folder name, `category` became the `categories` array, `description` is optional, and a new `ideasets` array declares membership), and the set of catalogue attributes is now declared centrally in `site.json` via `catalogue_attributes`. The build engine, templates, CSS, HTML, and JS still target the old flat model, so the site no longer matches its content and must be updated.

## What Changes

- **BREAKING - Idea identity:** An idea's `id` is no longer a field in `meta.json`; it is the folder name `content/ideas/{id}/`. The build derives it from the directory name.
- **BREAKING - Idea metadata:** `category` (single string) is replaced by `categories` (array). `description` is now optional (empty fallback). A new required `ideasets` array names the idea sets an idea belongs to.
- **BREAKING - Declarative catalogues:** Only the catalogue attributes listed in `site.json` `site.catalogue_attributes` (currently `categories`, `concepts`, `props`) get generated catalogue landing and item pages. The hardcoded `boards`, `standards`, and `subjects` catalogue pages are removed.
- **BREAKING - Home search targets idea sets:** The home page search and facet filter operate over idea sets, not individual ideas. Search results are idea set cards; each card links to its idea set page.
- **New - Idea set pages:** `content/ideasets.json` is the single source of truth for idea sets (title + slug). The build generates `site/ideasets/{slug}/index.html` from `templates/ideaset.html.j2`, listing every member idea as a standard catalogue card.
- **New - Idea set card imagery:** An idea set's home-page card shows a crossfade carousel built from the first image of each member idea, displayed in random order (capped like existing card carousels), falling back to the bundled fallback image when no member has images.
- **Home page facets:** Facet panels are driven by `catalogue_attributes` plus `standard` and `subject`; facet values are aggregated (union) from each idea set's member ideas.
- **Idea pages:** Badges link only to catalogue pages that exist (active `catalogue_attributes`) and add a link to each idea set the idea belongs to.
- **Client index:** `site/ideas.json` carries an idea set index instead of an individual-idea search index; the client-side search is rebuilt over it.

## Capabilities

### New Capabilities

- `ideaset`: The idea set concept end to end - `content/ideasets.json` as source of truth, idea set ↔ idea membership resolution, generation of idea set pages, and the aggregated idea set metadata used for home-page cards and facets.

### Modified Capabilities

- `content-model`: Idea record schema changes (`id` from folder name, `categories` array, optional `description`, new `ideasets` array) and `catalogue_attributes` as a site-level catalogue driver.
- `build-engine`: Load idea sets, derive idea ids from folder names, aggregate idea set metadata, and generate catalogue pages only for `catalogue_attributes`.
- `site-output`: Home page renders idea sets; idea set pages are generated; boards/standards/subjects catalogue pages are removed; idea pages and cards adapt to active catalogues.
- `client-side-search`: Home page search indexes idea sets and aggregates facets from member ideas; idea set card carousels shuffle representative images.

## Impact

Files created or updated by implementation (content inputs under `content/` are read-only and are **not** modified):

- `build.py` - major rework of idea loading, idea set aggregation, catalogue generation, and the client index payload.
- `templates/ideaset.html.j2` - rewritten to list member ideas as catalogue cards (was an unused single-idea copy).
- `templates/idea.html.j2` - iterate `categories`, conditionally render badges only for active catalogues, add idea set badges, optional description.
- `templates/home.html.j2` - facet panels driven by active catalogue attributes plus standard/subject; search-page data attributes for the client script.
- `templates/idea.md.j2` - front matter with folder-derived `id`, `categories` list, and `ideasets` list.
- `templates/catalogue.html.j2` - props footer rendered only when the `props` catalogue is active.
- `theme/app.js` - home index built over idea sets; aggregated facets; shuffled representative-image carousels.
- `theme/style.css` - idea set card/carousel styles (minor).
- `templates/sitemap.xml.j2` - unchanged; sitemap generation logic in `build.py` extended for idea set pages.
- Regenerated `site/` output.

Dependencies: none new (existing Python `jinja2`, `markdown`, `anyascii` and vendored MiniSearch).
