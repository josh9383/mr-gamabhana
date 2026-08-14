## 1. Content configuration (content/site.json)

- [x] 1.1 Replace the `catalogue_attributes` array with a `catalogues` object listing the same six active types (`categories`, `concepts`, `props`, `ideasets`, `standard`, `subject`), each with `path_name`, `title`, `description`, `field`, `mode`, and `facet` — `facet: true` for all except `ideasets` (REQ-CM-001, REQ-CM-005, REQ-BE-017).
- [x] 1.2 Confirm key order preserves the current facet order (categories, concepts, props, standard, subject) and all Marathi values match the old `CATALOGUE_DEFS` (REQ-CM-005).

## 2. Build engine (build.py)

- [x] 2.1 Remove the module-level `CATALOGUE_DEFS` constant (REQ-BE-017).
- [x] 2.2 Add `load_catalogue_defs(site)` that reads the `catalogues` node and falls back to the legacy default set (all seven types, `facet` true except `ideasets`) when absent or empty (REQ-BE-017, REQ-CM-005).
- [x] 2.3 Derive `active_types` from the loaded catalogue definition keys (honoring a legacy `catalogue_attributes` subset if still present) instead of reading `site.get("catalogue_attributes")` as the primary source (REQ-BE-004, REQ-BE-017).
- [x] 2.4 Derive `facet_types` and `facet_groups` from the `facet` flag of each definition (REQ-BE-015).
- [x] 2.5 Read `path_name`, `field`, `mode`, `title`, and `description` from the definition dicts in the aggregation loop, the catalogue page rendering loop, and the sitemap loop (REQ-BE-004, REQ-BE-017).
- [x] 2.6 Write the client payload to `site/meta.json` instead of `site/ideas.json`, keeping the payload shape unchanged (REQ-BE-016, REQ-SO-005).

## 3. Client script (theme/app.js)

- [x] 3.1 Change `loadIndex()` to fetch `"meta.json"` and update the error message to `Could not load meta.json: ...` (REQ-CS-005, REQ-CS-006).
- [x] 3.2 Simplify facet type resolution to `const facetTypes = (data.site && data.site.facet_types) || [];`, removing the `catalogue_attributes` fallback (REQ-CS-007).
- [x] 3.3 Update comments referencing `ideas.json` to `meta.json` (REQ-CS-003).
- [x] 3.4 Run `node --check theme/app.js` to confirm the script is syntactically valid (REQ-CS-006).

## 4. Documentation

- [x] 4.1 Update `README.md`: the generated-site bullet changes from `ideas.json` to `meta.json`.

## 5. Verification

- [x] 5.1 Run `python build.py` and confirm it completes without errors (REQ-BE-017).
- [x] 5.2 Confirm `site/meta.json` exists with the same payload shape (`site`, `ideas`, `catalogues`) and that no `site/ideas.json` is generated (REQ-SO-005, REQ-BE-016).
- [x] 5.3 Confirm the home page still lists ideas by default, filters by query and facets, and renders facet panels for categories, concepts, props, standard, and subject only (REQ-SO-001, REQ-CS-007).
- [x] 5.4 Confirm catalogue pages are generated for the same types as before (categories, concepts, props, ideasets, standard, subject) and `site/boards/` is not generated (REQ-SO-003, REQ-BE-004).
- [x] 5.5 Confirm the payload `site` object carries `facet_types` and no `catalogue_attributes`, and that the home page restores a facet URL parameter (REQ-BE-015, REQ-CS-008).
- [x] 5.6 Confirm `content/` is untouched by the build (REQ-CM-004).
