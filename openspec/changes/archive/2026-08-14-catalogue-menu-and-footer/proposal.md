## Why

After `catalogue-config-refactor`, the `catalogues` node in `content/site.json` controls which catalogue pages are generated and which types are home facets. Two placement decisions are still hardcoded: the main navbar has no catalogue menu links at all, and idea card footers only ever show props (gated by the `props` catalogue being active). Site owners cannot control whether a catalogue type appears in the main navbar or in idea card footers.

## What Changes

- Each `catalogues` definition gains two boolean attributes: `menu` and `footer`, both **defaulting to true** when omitted.
- A catalogue type with `menu: true` SHALL appear as a nav link in the main navbar of every generated page (home, catalogue, idea, idea set), labeled with its `title`, linking to `/{path_name}/`.
- A catalogue type with `footer: true` SHALL contribute badges to idea card footers: each badge shows one of the idea's values for that type and links to that value's individual page `/{path_name}/{slug}/` (for `ideasets`, `/ideasets/{slug}/`, which is the dedicated idea set page).
- The generic footer rule replaces the current props-only footer rule on server-rendered idea cards (individual catalogue pages, the ideas landing page) and on home-page JS-rendered cards.
- The build SHALL derive a navbar menu list and a footer type list from the definitions, and SHALL precompute a `footer_badges` list (value + URL pairs) on every idea card payload so templates and the client render badges without per-type logic.
- **Defaults:** a definition that omits `menu` or `footer` is treated as `true`; the legacy fallback definitions carry both as `true`. With the current `content/site.json` (no explicit flags) all six active types therefore gain navbar links and footer badges.
- **No breaking changes** to the payload shape, catalogue page generation, facets, URL state, or per-idea `meta.json` files. `content/` is not edited by this change.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `content-model`: The `catalogues` definitions gain the booleans `menu` and `footer`, both defaulting to true (REQ-CM-005 modified).
- `build-engine`: The build derives the navbar menu list and footer type list from the definitions and precomputes `footer_badges` on idea card payloads; `load_catalogue_defs` reads `menu`/`footer` (REQ-BE-016, REQ-BE-017 modified; REQ-BE-018 added).
- `site-output`: The main navbar of every generated page renders a nav link per `menu: true` catalogue type; idea card footers render badges per `footer: true` catalogue type (REQ-SO-001, REQ-SO-003 modified).
- `client-side-search`: Home result cards render their `card-footer` badges from each idea's `footer_badges` instead of the props-only rule (REQ-CS-006 modified).

## Impact

- **Files created/updated:**
  - `build.py` — normalize `menu`/`footer` to default true in `load_catalogue_defs`; derive `menu_groups` and `footer_types`; add `footer_badges_for(idea, ...)`; add `footer_badges` to `idea_card` and `home_idea_items`; pass `menu_groups` in `base_context`.
  - `templates/home.html.j2`, `templates/catalogue.html.j2`, `templates/idea.html.j2`, `templates/ideaset.html.j2` — navbar menu links from `menu_groups`.
  - `templates/catalogue.html.j2` — idea card footer badges from `item.footer_badges` (landing cards keep the count footer).
  - `theme/app.js` — `cardHtml` renders `idea.footer_badges` (replacing the props-only footer).
  - `site/` — regenerated output (including `meta.json` with `footer_badges`).
- **Unchanged:** `content/` (no edits — defaults apply), catalogue page generation, facets and URL state, payload top-level shape, and per-idea `meta.json` records.
- **Dependencies:** None new.
- **Constraints, Limitations, Assumptions:**
  - The `menu` flag controls navbar visibility only; it does not affect catalogue page generation.
  - The `footer` flag controls idea card footer badges only; the idea detail page badge list is out of scope.
  - `content/site.json` is user-generated input (REQ-CM-004); this change keeps the existing file valid as-is because both new flags default to true.
- **Out-of-Scope:** New catalogue types, changes to idea detail page badges, changes to catalogue page generation, and changes to facet or URL-state semantics.
