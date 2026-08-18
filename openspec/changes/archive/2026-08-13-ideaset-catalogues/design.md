# Design: Ideaset catalogues

## Context

The content layer has been refactored ahead of this change:

- Each idea lives in its own folder `content/ideas/{id}/` with `meta.json`, `meta.md`, and images. The `id` is the folder name; it is no longer a field in `meta.json`.
- The idea record now uses `categories` (array) instead of `category` (string), `description` is optional, and a new `ideasets` array declares membership in one or more idea sets.
- `content/ideasets.json` defines idea sets, keyed by their Marathi title, with a `title` and a romanized `slug`.
- `content/site.json` now declares `site.catalogue_attributes = ["categories", "concepts", "props"]`, the only attributes that should produce catalogue pages.

The build engine (`build.py`), the Jinja templates, `theme/app.js`, and `theme/style.css` still target the old flat model: they read `id`/`description`/`category` from `meta.json`, hardcode six catalogue types, render `templates/ideaset.html.j2` (an unused copy of the single-idea page), and run the home-page search over individual ideas. A build today would fail on `KeyError` and the generated site would not match the intended information architecture.

Constraints: strictly vanilla frontend stack (no frameworks, no inline scripts/styles), all generated artifacts must be self-contained under `site/`, content under `content/` is user-generated and read-only to the build, and everything must keep working under a GitHub Pages project path.

## Goals / Non-Goals

**Goals:**

- Build compiles against the refactored content model: folder-derived idea ids, `categories` arrays, optional `description`, and `ideasets` membership.
- Catalogue generation is driven by `site.catalogue_attributes`; only listed attributes produce landing and item pages.
- Idea set pages are generated and list all member ideas as catalogue cards.
- The home page search + facets operate over idea sets (with facet values aggregated from member ideas), not over individual ideas.
- Idea pages render badges only for catalogue pages that exist plus idea set badges, and adapt to optional descriptions.
- `site/ideas.json` drives the client-side idea set search; idea set cards use a shuffled representative-image carousel with fallback.
- Keep catalogue-page search working standalone (no `ideas.json` dependency) exactly as today.

**Non-Goals:**

- No new catalogue types beyond those expressible via `catalogue_attributes` (each must map to a known idea field).
- No changes to `content/` files (read-only input).
- No new frontend dependencies; no inline scripts/styles.
- No changes to the deployment pipeline.
- No server-side idea set browsing beyond the generated idea set pages (no idea set landing index beyond the home page's own search).
- README and other non-build docs are out of scope.

## Decisions

### D1. Catalogue definitions are a declarative table in the build engine

Define one `CATALOGUE_DEFS` map in `build.py`:

```python
CATALOGUE_DEFS = {
  "boards":     ("boards", "मंडळे",     "मंडळांनुसार युक्त्या",      "board",     "single"),
  "standards":  ("standards", "इयत्ता", "इयत्तांनुसार युक्त्या",     "standard",  "single"),
  "subjects":   ("subjects", "विषय",    "विषयानुसार युक्त्या",      "subject",   "single"),
  "categories": ("categories", "विभाग", "विभागांनुसार युक्त्या",    "categories", "multi"),
  "concepts":   ("concepts", "संकल्पना", "संकल्पनांनुसार युक्त्या", "concepts",  "multi"),
  "props":      ("props", "साहित्य",    "साहित्यानुसार युक्त्या",   "props",     "multi"),
}
```

Each tuple is `(path_name, title, description, idea_field, mode)` where mode `single` reads the scalar field and mode `multi` reads the array field. `catalogue_attributes` from `site.json` selects the subset to build. Rationale: the build becomes a pure projection of configuration; adding a catalogue later is a one-line change. Alternative considered: hardcoding the old six - rejected because it contradicts the new config-driven contract.

### D2. Idea identity and normalization happen in one pass

`load_ideas()` derives `idea["id"]` from the folder name, defaults `description` to `""`, coerces `categories`/`concepts`/`props`/`ideasets` to lists, and then enriches every record with `board_slug`, `standard_slug`, `subject_slug`, `category_slugs`, `concept_slugs`, `prop_slugs`, `ideaset_slugs`, and `image_urls`. Card payloads and the client index are built only from these normalized records so templates and JS never see raw field shapes. Alternative: patching at each render site - rejected as error-prone.

### D3. Idea set records are derived in the build, not duplicated in content

Each entry in `content/ideasets.json` yields a record:

- `id` = slug, `title`, `description` = title (no separate description field exists; the home card shows the member count as its descriptive footer), `url` = `/ideasets/{slug}/`.
- `member_ids` = ideas whose `ideasets` contains the ideaset key (sorted by idea id); `member_count`.
- Aggregated facet values = ordered union over members of each active catalogue attribute, plus `standard` and `subject`:
  - `categories`, `concepts`, `props` → arrays of strings (with matching `*_slugs` arrays for badges).
  - `standards`, `subjects` → arrays of strings (standard coerced to string).
- `representative_image_urls` = the first `image_url` of each member idea, in member order. Shuffling happens client-side at render time (D8), so the build stays deterministic.

Membership is by matching the idea's `ideasets` values against the ideaset keys in `ideasets.json`. An idea referencing an unknown ideaset is ignored for membership; an ideaset with no members still generates a page (empty list).

### D4. Home facets = `catalogue_attributes` + standard + subject

Per the accepted decision, the home page renders one facet panel per active `catalogue_attributes` entry (in the order given in `site.json`), followed by `standard` and `subject`. Board is not a facet and has no page. Facet values for an idea set are its aggregated member values (D3). The facet "type" keys sent to the client are exactly these names (`categories`, `concepts`, `props`, `standard`, `subject`) and double as the URL query parameter names (replacing the old `category`, `concept`, `prop` params - a deliberate, approved break).

### D5. The client index switches from ideas to idea sets

`site/ideas.json` becomes:

```json
{
  "site": { ...site incl. "catalogue_attributes": [...] },
  "ideasets": [ { id, title, description, url, member_count, categories, category_slugs,
                  concepts, concept_slugs, props, prop_slugs, standards, subjects,
                  representative_image_urls, search } ],
  "catalogues": { <active catalogue key>: [items] }
}
```

The `ideas` array is removed from the payload (the home page no longer lists ideas; catalogue pages never read `ideas.json`). `app.js`'s `loadIndex()` keeps the same URL so nothing else changes.

### D6. Idea set page template replaces the unused single-idea copy

`templates/ideaset.html.j2` is rewritten to render a breadcrumb, the idea set title, and the member ideas as standard `card.catalogue-card` items (reusing the exact card anatomy: image cap, title, description, props footer when the `props` catalogue is active). The build renders it at `site/ideasets/{slug}/index.html`.

`templates/idea.html.j2` becomes the only single-idea template. It loops `categories`/`concepts`/`props` for badges only for active catalogue attributes, renders an idea set badge per `ideasets` (linking to the idea set page), and renders the lead description only when non-empty.

### D7. Idea cards stay self-contained; footer adapts to active catalogues

Catalogue pages and the `site/ideas/index.html` all-ideas landing (kept, since idea set pages link to ideas) still render idea cards whose `data-search` text includes all metadata fields. The card footer shows prop badges only when `props` is an active catalogue; otherwise it falls back to the item count footer (landing cards) or is omitted (idea cards). The build passes the active catalogue keys into every template context so templates decide what to link.

### D8. Representative image carousel shuffles client-side

Each idea set card on the home page renders a `card-carousel` from `representative_image_urls` (capped at 6, reusing the existing crossfade keyframes) after a Fisher–Yates shuffle performed at render time in `app.js`. With no representative images the card shows `/assets/card-fallback.png`. Rationale: keeps the build deterministic while satisfying "displayed in random order"; alternative - shuffling in Python - was rejected because it would make output non-deterministic across builds.

### D9. Idea set search state and copy

The home page URL state now uses `q` plus the five facet types (`categories`, `concepts`, `props`, `standard`, `subject`). The result count label becomes `{n} संच` (the existing `युक्त्या` label referred to individual ideas). The search input, phonetic widget, and `minisearch.min.js` wiring are unchanged.

## Risks / Trade-offs

- [Old URLs (e.g., `/boards/…`) 404 after the change] → Approved break; sitemap regenerated to only reference existing pages; idea/ideaset/catalogue pages only link to live pages.
- [`catalogue_attributes` absent in `site.json`] → Fall back to the full six-type set so an unmodified config still builds (keeps the build defensive).
- [Ideaset membership to an unknown ideaset] → Ignored for membership; documented in D3; home search never surfaces orphaned ideas since it only indexes idea sets.
- [Randomized carousel order differs per page load] → Deterministic build preserved; visual randomness is a deliberate UX choice for the home page only.
- [Removing `ideas` from `ideas.json` could break the old home search] → The home script is rewritten in the same change; catalogue pages never consumed `ideas.json` (REQ-CS-003).
- [Large idea sets create heavy home payloads] → Acceptable for current content scale; representative images capped at 6 in the carousel regardless of set size.

## Migration Plan

1. Implement build engine changes (idea normalization, idea set aggregation, config-driven catalogues, new `ideas.json` payload, sitemap with idea set pages).
2. Update templates (`ideaset`, `idea`, `home`, `idea.md`, `catalogue`).
3. Update `theme/app.js` (idea set search, aggregated facets, shuffled carousels) and `theme/style.css` (minor idea set card styles).
4. Run `python build.py`, then `python -m http.server 8000 --directory site` and verify: home search over idea sets, facet counts, idea set page listing member ideas, idea page badges, active catalogue pages, and `sitemap.xml`.
5. Rollback: restore previous `build.py`/templates/theme from version control and rebuild; no content migration is required because `content/` is unchanged by this work.

## Open Questions

- None blocking. (Minor copy decisions - result label `संच`, idea set page description - were fixed here as reasonable defaults and can be revisited during implementation.)
