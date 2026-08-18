# Tasks

## 1. Content Restructure

- [x] 1.1 Create `content/site.json` with the `site` object from `content/ideas.json` (`title`, `description`, `language`, `base_url_live`, `base_url`), Marathi values byte-identical
- [x] 1.2 For each idea in `content/ideas.json`, create `content/ideas/{id}/meta.json` (that idea's metadata record, byte-identical fields) and `content/ideas/{id}/meta.md` (the body moved from `content/ideas/{id}.md`)
- [x] 1.3 Delete `content/ideas.json` and the flat `content/ideas/{id}.md` files; confirm `content/ideas/` contains only per-idea directories
- [x] 1.4 Confirm no `content/` file contains any `index.json`/`ideas.json` reference and Marathi literals are unchanged

## 2. Build Engine

- [x] 2.1 Replace `load_data()` in `build.py` with `load_site()` (reads `content/site.json`) and `load_ideas()` (globs `content/ideas/*/meta.json`, clubs records, sorts by `id`)
- [x] 2.2 Update `load_idea_content()` to read `content/ideas/{id}/meta.md`
- [x] 2.3 Update `main()` to source `site` from `load_site()` and `ideas` from `load_ideas()`; replace `data["site"]`/`data["ideas"]` usages throughout
- [x] 2.4 Write the client-side payload to `SITE / "ideas.json"` instead of `SITE / "index.json"` (REQ-SO-005)
- [x] 2.5 Confirm build output still writes only under `site/` and leaves `content/` untouched (REQ-BE-006, REQ-BE-007, REQ-CM-004)

## 3. Theme

- [x] 3.1 Update `theme/app.js` to fetch `ideas.json` instead of `index.json` (REQ-CS-001, REQ-CS-003, REQ-CS-005 wording references)

## 4. Docs and Specs

- [x] 4.1 Update `README.md`: content model (per-idea `meta.json`/`meta.md`, `content/site.json`), generated site (`ideas.json`), and publishing note (`site.base_url` in `content/site.json`)
- [x] 4.2 Update `openspec/config.yaml` context: build engine input description now reads `site.json` + per-idea `meta.json` files
- [x] 4.3 Confirm the 4 delta spec files are present (content-model, build-engine, site-output, client-side-search)

## 5. Verify

- [x] 5.1 Run `python build.py` and confirm the site builds with no errors
- [x] 5.2 Verify generated `site/`: `ideas.json` exists (no `index.json`), payload has `site`/`ideas`/`catalogues`, and all URLs match generated pages
- [x] 5.3 Run a repo-wide grep for `index.json` - only archived changes and Marathi literals may reference it; no live code
- [x] 5.4 Confirm per-idea output (`site/ideas/{id}/index.html`, `index.md`) and catalogue pages are byte-identical in structure to the pre-change build
