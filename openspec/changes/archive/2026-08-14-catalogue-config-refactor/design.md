## Context

Catalogue configuration currently lives in two places. `build.py` hardcodes `CATALOGUE_DEFS` — a dict mapping seven type keys to `(path_name, title, description, idea_field, mode)` tuples with Marathi titles and descriptions (build.py:20-30). `content/site.json` separately lists the active types in `catalogue_attributes` (currently `["categories", "concepts", "props", "ideasets", "standard", "subject"]`). The home facet list is derived with a hardcoded rule — all active types except `ideasets` (build.py:297-302) — and exposed to the client as `site["facet_types"]`. The client payload is written to `site/ideas.json` (build.py:425) and fetched by `theme/app.js` `loadIndex()`; `app.js` resolves facets from `data.site.facet_types` with a `catalogue_attributes` fallback (app.js:135-136).

## Goals / Non-Goals

**Goals:**
- Make `content/site.json` the single source of truth for which catalogues exist, how they map to idea fields, and which are home facets.
- Remove the hardcoded `CATALOGUE_DEFS` from `build.py`.
- Derive `facet_groups` and `facet_types` from an explicit `facet` flag per catalogue type.
- Rename the generated payload `site/ideas.json` → `site/meta.json` (consistent with per-idea `meta.json` and accurate, since the payload carries `site` + `ideas` + `catalogues`).
- Preserve current output behavior exactly (same active types, same facet panels and order, same payload shape).

**Non-Goals:**
- No new catalogue types; no changes to per-idea `content/ideas/{id}/meta.json` records.
- No change to catalogue/idea/ideaset page markup or the URL state semantics.
- No change to the payload shape (`site`/`ideas`/`catalogues` keys).
- No change to template names or the `facet_groups`/`catalogue_attributes` template context variables.

## Decisions

**D1: `catalogues` node in `content/site.json`.**
Add a `catalogues` object mapping each active type key to a definition: `path_name`, `title`, `description`, `field`, `mode` (`single`/`multi`), and `facet` (bool). Keys are ordered to preserve the current facet order (categories, concepts, props, standard, subject); `ideasets` gets `facet: false`. The `catalogue_attributes` array is deleted. Active types = keys of `catalogues`.
- Alternative considered: keeping `catalogue_attributes` and adding a parallel `facet_types` list — rejected because two config sources are exactly the duplication this change removes; the `facet` flag on each catalogue definition is the single source.

**D2: Build loads catalogue definitions, falls back on absent config.**
`build.py` replaces the module-level `CATALOGUE_DEFS` constant with `load_catalogue_defs(site)` reading `site.get("catalogues")`; when absent or empty it returns a legacy default dict (the current seven types with the same Marathi metadata, `facet` true except `ideasets`). Entries become dicts `{"path_name", "title", "description", "field", "mode", "facet"}` instead of tuples. `active_types` comes from the definition keys; for backward compatibility a legacy `catalogue_attributes` list (if still present) is still honored as a subset filter.
- Alternative considered: keeping `CATALOGUE_DEFS` and only adding the `facet` flag — rejected because the user asked for the definitions to live in `site.json`.

**D3: Active types, facets, and generation all derive from the loaded definitions.**
- `active_types = list(catalogue_defs)` (order = `catalogues` key order, preserving the current facet panel order).
- `facet_types = [k for k in active_types if catalogue_defs[k]["facet"]]`.
- `facet_groups = [(k, catalogue_defs[k]["title"]) for k in active_types if catalogue_defs[k]["facet"]]`.
- The catalogue aggregation loop (build.py:289-294), the catalogue page rendering loop (build.py:383-416), and the sitemap loop (build.py:438-439) read `path_name`/`title`/`description`/`field`/`mode` from the definition dicts.
- `base_context["catalogue_attributes"]` keeps its name and value (`active_types`) so `templates/idea.html.j2` and `templates/catalogue.html.j2` are untouched.

**D4: Payload rename `site/ideas.json` → `site/meta.json`.**
`build.py` writes `SITE / "meta.json"` instead of `SITE / "ideas.json"`. `theme/app.js` `loadIndex()` fetches `"meta.json"` and the error message becomes `Could not load meta.json: ...`. Comments in `app.js` referencing `ideas.json` are updated. `README.md` is updated. The payload shape is unchanged.

**D5: Client reads `facet_types` only.**
Since the payload's `site` no longer carries `catalogue_attributes`, `app.js:135-136` is simplified to `const facetTypes = (data.site && data.site.facet_types) || [];` — the build-derived list is authoritative. `standard` and `subject` remain facets because their definitions carry `facet: true`.

## Risks / Trade-offs

- [Renaming `ideas.json` breaks external consumers] → The rename is intentional and documented as breaking in the proposal; the only in-repo consumer (`app.js`) is updated here, and `meta.json` keeps the identical payload shape, so migration is a file rename.
- [Ordering depends on JSON key order] → `catalogues` keys are written in the exact order of the old `catalogue_attributes` list so facet panel order is unchanged; Python dicts preserve insertion order.
- [Config drift between `catalogues` and per-idea fields] → Same risk as today (a type's `field`/`mode` must match idea `meta.json`); consolidating the config in `site.json` makes it visible in one place.
- [Fallback masks config errors] → The absent-config fallback keeps legacy builds working; an unknown key simply means that type is not generated (the same behaviour as a missing `catalogue_attributes` entry today).

## Migration Plan

1. Update `content/site.json`: replace `catalogue_attributes` with the `catalogues` object (same six active types, `facet: true` except `ideasets`).
2. Update `build.py`: remove `CATALOGUE_DEFS`; add `load_catalogue_defs`; derive `active_types`/`facet_types`/`facet_groups` from it; read path/title/description/field/mode from dicts; write `site/meta.json`.
3. Update `theme/app.js`: fetch `meta.json`; drop the `catalogue_attributes` fallback; update comments.
4. Update `README.md` (`ideas.json` → `meta.json`).
5. Run `python build.py`, serve `site/`, and verify the home search, facets, catalogue pages, and the presence of `meta.json` with no `ideas.json`.
6. No data migration; rollback is a revert of the edited files plus a rebuild.

## Open Questions

None.
