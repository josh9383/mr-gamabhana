## 1. Build engine (build.py)

- [x] 1.1 Add `CATALOGUE_DEFS` declarative table (path_name, title, description, idea_field, mode `single`/`multi`) for boards, standards, subjects, categories, concepts, props.
- [x] 1.2 Rewrite `load_ideas()` to derive `id` from the folder name, default `description` to `""`, and coerce `categories`/`concepts`/`props`/`ideasets` to lists (REQ-BE-001).
- [x] 1.3 Extend slug enrichment: replace `category_slug` with `category_slugs` (array) and add `ideaset_slugs` alongside existing `board_slug`, `standard_slug`, `subject_slug`, `concept_slugs`, `prop_slugs` (REQ-BE-003).
- [x] 1.4 Read `site.catalogue_attributes` (fall back to all six types when absent) and compute the active catalogue definitions (REQ-CM-005, REQ-BE-004).
- [x] 1.5 Add `load_ideasets()` reading `content/ideasets.json` and resolve membership from each idea's `ideasets`, aggregating `member_count`, `member_ids`, `categories`/`category_slugs`, `concepts`/`concept_slugs`, `props`/`prop_slugs`, `standards`, `subjects`, and `representative_image_urls` (REQ-IS-001, REQ-IS-002, REQ-BE-013).
- [x] 1.6 Generate `site/ideasets/{slug}/index.html` from `templates/ideaset.html.j2` listing member idea cards (REQ-IS-003, REQ-SO-013, REQ-BE-014).
- [x] 1.7 Generate catalogue landing + item pages only for the active catalogue definitions; stop generating boards/standards/subjects pages when not active (REQ-BE-004, REQ-SO-003).
- [x] 1.8 Rework `site/ideas.json` payload: `site`, `ideasets` index, `catalogues` for active types; drop the per-idea `ideas` array (REQ-SO-005).
- [x] 1.9 Pass active catalogue keys and idea set context into all template renders so templates decide which badges/footers to emit (REQ-SO-002, REQ-SO-004).
- [x] 1.10 Extend the sitemap to include idea set URLs and only active catalogue URLs (REQ-SO-006).

## 2. Jinja templates

- [x] 2.1 Rewrite `templates/ideaset.html.j2` to render breadcrumb, idea set title, and member ideas as standard `card.catalogue-card` items (REQ-IS-003).
- [x] 2.2 Update `templates/idea.html.j2`: iterate `categories`/`concepts`/`props` badges only for active catalogue attributes, add per-`ideasets` badges linking to idea set pages, render lead description only when non-empty (REQ-SO-002).
- [x] 2.3 Update `templates/idea.md.j2` front matter: folder-derived `id`, optional `description`, `categories` list, `ideasets` list (REQ-SO-002).
- [x] 2.4 Update `templates/home.html.j2`: render facet panels from active catalogue attributes plus `standard` and `subject`; keep search input, results container, and data attributes (REQ-SO-001).
- [x] 2.5 Update `templates/catalogue.html.j2` to render the props footer only when the `props` catalogue is active (REQ-SO-003).

## 3. Theme (JS and CSS)

- [x] 3.1 Rework `initSearchPage()` in `theme/app.js` to build the MiniSearch index over `data.ideasets`, deriving facet types from `data.site.catalogue_attributes` plus `standard`/`subject`, with facet values from aggregated idea set fields (REQ-CS-006, REQ-CS-007).
- [x] 3.2 Update URL state handling to the new query parameters (`q`, `categories`, `concepts`, `props`, `standard`, `subject`) (REQ-CS-008).
- [x] 3.3 Render home result cards as idea set cards with a Fisher–Yates-shuffled representative `card-carousel` (capped at 6, fallback image) and a member-count footer (REQ-SO-014, REQ-CS-010).
- [x] 3.4 Update the home result-count label to `{n} संच` and keep catalogue-page standalone search behaviour unchanged.
- [x] 3.5 Add any needed idea set card styles to `theme/style.css` (no inline styles; reuse existing `card-carousel` keyframes).

## 4. Verification

- [x] 4.1 Run `python build.py` and confirm it completes without errors against the refactored content.
- [x] 4.2 Verify `site/` contains idea pages (`site/ideas/m1/…`), idea set pages (`site/ideasets/fractions-introduction/index.html`), catalogue pages only for categories/concepts/props, and the new `site/ideas.json`.
- [x] 4.3 Serve `site/` locally and check the home search over idea sets (query, facet counts, URL state), an idea set page listing members, an idea page with correct badges, and catalogue-page search.
- [x] 4.4 Check `sitemap.xml` references only existing pages and includes idea set URLs.
