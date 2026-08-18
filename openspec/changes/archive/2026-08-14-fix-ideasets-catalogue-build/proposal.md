# Fix ideaset catalogue build

## Why

`ideasets` was added to `catalogue_attributes` in `content/site.json` and to `CATALOGUE_DEFS` in `build.py`, but the build crashes with `FileExistsError: Cannot create a file when that file already exists`. The generic catalogue loop tries to `mkdir` `site/ideasets/{slug}/` for each idea set, directories that the idea-set page pass has already created, so `python build.py` fails before producing any output. The ideasets catalogue also has no landing `site/ideasets/index.html` of its own, unlike every other catalogue directory.

## What Changes

- **New - Ideasets catalogue landing page:** `site/ideasets/index.html` is generated from `templates/catalogue.html.j2`, listing every idea set as a standard catalogue card (image cap, title, description, member-count footer) and linking to its idea set page `/ideasets/{slug}/`.
- **Fix - No per-item generation for ideasets:** The generic catalogue item loop skips `ideasets`; its per-item directories and `index.html` files already exist as dedicated idea set pages rendered from `templates/ideaset.html.j2`. Re-running `mkdir` there is the crash cause and would otherwise overwrite those pages with the wrong template.
- **Fix - Landing items come from idea set records:** The landing items are derived from the idea set records (custom `slug`, `member_count`, aggregated metadata, representative images), not from `catalogue_items()` over each idea's raw `ideasets` values, so URLs always match the generated idea set pages.
- **Fix - Home page excludes ideasets from facet panels:** An idea set cannot facet on itself; an `ideasets` facet derived from set records would always be empty. The build and `theme/app.js` use the same facet type list that omits `ideasets`, keeping rendered panels, URL state, and filtering consistent.
- **Fix - Sitemap:** Ideaset page URLs already come from the idea set records, so the sitemap no longer emits duplicated or mistyped `/ideasets/{make_slug(title)}/` URLs from the catalogue loop.
- **No content changes:** `content/` stays read-only input; idea set pages themselves are unchanged.

## Capabilities

### New Capabilities

- None - this change fixes and extends existing behaviour; no new domain concept is introduced.

### Modified Capabilities

- `build-engine`: Catalogue generation special-cases `ideasets` as a landing-only catalogue whose items are derived from idea set records; per-item pages are skipped.
- `site-output`: A new ideaset catalogue landing page `site/ideasets/index.html` is generated; the home page omits the empty `ideasets` facet panel; the sitemap excludes duplicated ideaset URLs from the catalogue loop.

## Impact

- `build.py` - catalogue item derivation for ideasets, landing-only skip in the item loop, facet group filter, sitemap loop.
- `theme/app.js` - facet type list driven from a single derived source that omits `ideasets`.
- `templates/home.html.j2` - unchanged (facets are already data-driven).
- Regenerated `site/` output; `site/ideasets/index.html` appears for the first time.
- No `content/`, dependency, or template-structure changes.
