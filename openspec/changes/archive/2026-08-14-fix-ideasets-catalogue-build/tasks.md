## 1. Build engine (build.py)

- [x] 1.1 Add `ideaset_catalogue_items(ideasets)` helper that maps each idea set record to a catalogue card payload (title, url from the record's `url`, count = `member_count`, description, search, image_urls = `representative_image_urls`, empty props/prop_slugs) (REQ-BE-004).
- [x] 1.2 In `main()`, build `catalogues["ideasets"]` from `ideaset_catalogue_items(ideasets)` instead of `catalogue_items()` so URLs use the idea sets' custom slugs (REQ-BE-004).
- [x] 1.3 In the catalogue landing/item loop, write the `site/ideasets/index.html` landing page but skip the per-item page generation when `key == "ideasets"` so the build no longer raises `FileExistsError` and idea set pages are not overwritten (REQ-BE-004, REQ-SO-003).
- [x] 1.4 Derive `facet_types` once as the active catalogue types excluding `ideasets` plus `standard`/`subject`; build `facet_groups` from it and add `site["facet_types"]` to the `ideas.json` payload (REQ-BE-015, REQ-SO-001).
- [x] 1.5 In the sitemap loop, append the `ideasets` landing URL but skip per-item URLs for `ideasets` so each idea set URL appears exactly once (REQ-SO-006).

## 2. Theme (JS)

- [x] 2.1 In `theme/app.js`, derive `facetTypes` from `data.site.facet_types`, falling back to `[...catalogueAttributes, "standard", "subject"]` when absent, so the client facet list matches the rendered panels (REQ-BE-015, REQ-SO-001).

## 3. Verification

- [x] 3.1 Run `python build.py` and confirm it completes without `FileExistsError` (REQ-BE-004).
- [x] 3.2 Confirm `site/ideasets/index.html` exists and lists every idea set as a `card.catalogue-card` linking to `/ideasets/{slug}/` with the member count in the footer (REQ-SO-003).
- [x] 3.3 Confirm `site/ideasets/{slug}/index.html` idea set pages still render member accordions and are not regenerated from the catalogue template (REQ-BE-014, REQ-SO-013).
- [x] 3.4 Serve `site/` and verify the home page has no empty `ideasets` facet panel and idea set searches/facets still work (REQ-BE-015, REQ-SO-001).
- [x] 3.5 Verify `site/sitemap.xml` contains each idea set URL exactly once and no `make_slug`-derived mistyped idea set URLs (REQ-SO-006).
