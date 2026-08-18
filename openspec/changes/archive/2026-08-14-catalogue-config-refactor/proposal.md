## Why

Catalogue configuration is split across two files. `build.py` hardcodes `CATALOGUE_DEFS` (path names, Marathi titles and descriptions, idea field mapping, and `single`/`multi` mode for all seven catalogue types) while `content/site.json` independently lists the active types in `catalogue_attributes`. The build then derives home facets with a hardcoded rule ("all active types except `ideasets`"). Adding or reconfiguring a catalogue type requires touching both files, and whether a type appears as a home facet is not configurable at all.

The generated client-side payload is also misnamed: `site/ideas.json` no longer contains only ideas - it carries the `site` object, the `ideas` array, and the `catalogues`. Per-idea content files are named `meta.json`, so naming the generated payload `meta.json` is consistent and accurate.

## What Changes

- **Rename the client-side payload** `site/ideas.json` → `site/meta.json`. The build writes `meta.json`, the home page fetches `meta.json`, and docs and specs reference the new name.
- **Externalize catalogue definitions into `content/site.json`.** A new `catalogues` node maps each active catalogue type to its definition (`path_name`, `title`, `description`, `field`, `mode`, `facet`). The build loads this node and drives catalogue page generation, the home facet list, and the client payload from it. The `catalogue_attributes` node is removed from `site.json`.
- **Facet groups derive from the `facet` flag.** A catalogue type whose definition has `facet: true` is a home facet; `facet_groups` and `site["facet_types"]` come from that flag instead of the hardcoded "exclude `ideasets`" rule.
- **Fallback preserved.** When `catalogues` is absent or empty in `site.json`, the build falls back to the legacy full set (all seven types with the current Marathi metadata, `facet: true` for every type except `ideasets`), so existing configs keep building.

## Breaking Changes

- **BREAKING:** `site/ideas.json` is renamed to `site/meta.json`; any external consumer or bookmark must update. `theme/app.js` is updated in this change.
- **BREAKING:** `content/site.json` replaces the `catalogue_attributes` array with the `catalogues` object; the file is updated in this change.
- The client payload no longer carries a `catalogue_attributes` entry; `app.js` reads the build-derived `facet_types` (already present and preferred).

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `content-model`: `content/site.json` provides a `catalogues` mapping of type → definition (`path_name`, `title`, `description`, `field`, `mode`, `facet`) instead of `catalogue_attributes`; absent `catalogues` falls back to the full legacy set (REQ-CM-001, REQ-CM-005 modified).
- `build-engine`: Catalogue aggregation, the home facet list, and the client payload run off the `catalogues` configuration; the payload is written to `site/meta.json` (REQ-BE-004, REQ-BE-015, REQ-BE-016 modified; REQ-BE-017 added).
- `site-output`: The home page renders facet panels for the `catalogues` types with `facet: true`; catalogue pages are generated for the `catalogues` keys; the client payload is `site/meta.json` (REQ-SO-001, REQ-SO-003, REQ-SO-005 modified).
- `client-side-search`: The home index loads from `site/meta.json`, and facet panels follow the `catalogues` `facet` flag (REQ-CS-003, REQ-CS-005, REQ-CS-006, REQ-CS-007 modified).

## Impact

- **Files created/updated:**
  - `build.py` - remove the hardcoded `CATALOGUE_DEFS`, load catalogue definitions from `site.json`, derive `active_types`/`facet_types`/`facet_groups` from the `catalogues` node, write `site/meta.json`.
  - `content/site.json` - replace `catalogue_attributes` with the `catalogues` object (same active types, same Marathi metadata, `facet` true except `ideasets`).
  - `theme/app.js` - fetch `meta.json`; use `facet_types` directly.
  - `README.md` - `ideas.json` → `meta.json`.
  - `site/` - regenerated output (including the renamed `site/meta.json`).
- **Unchanged:** `templates/` (the `facet_groups`/`catalogue_attributes` template context variables keep their names), catalogue/idea/ideaset page markup, the payload shape (`site`/`ideas`/`catalogues` keys), URL state semantics, and per-idea `content/ideas/{id}/meta.json` files.
- **Dependencies:** None new.
- **Constraints, Limitations, Assumptions:**
  - `content/site.json` is user-generated input (REQ-CM-004); the `catalogues` edit is a one-time manual edit inside this change, and the build never writes to `content/`.
  - The `facet` flag only controls whether a catalogue type appears as a home facet; it does not change catalogue page generation.
  - Catalogue type keys determine generation order, so the `catalogues` object is ordered to preserve the current facet panel order (categories, concepts, props, standard, subject).
- **Out-of-Scope:** New catalogue types, changes to per-idea `meta.json` records, changes to catalogue/idea/ideaset page rendering, and changes to URL state semantics.
