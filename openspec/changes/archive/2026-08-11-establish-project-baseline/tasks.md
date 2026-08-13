# Implementation Tasks

## 1. Content Model Baseline

- [x] 1.1 Verify `content/yuktis.json` schema matches REQ-CM-001/002 (site config fields and yukti record fields: id, title, description, board, standard, subject, category, concepts, props)
- [x] 1.2 Verify each yukti has a matching `content/yuktis/{id}.md` body file per REQ-CM-003
- [x] 1.3 Confirm the build never writes under `content/` (REQ-CM-004) by diffing the `content/` tree before and after a build

## 2. Build Engine Baseline

- [x] 2.1 Confirm `build.py` loads `yuktis.json` and yukti Markdown files as its only data inputs (REQ-BE-001)
- [x] 2.2 Verify `slugify()` behaviour on Devanagari text and the `item` fallback for empty values (REQ-BE-002)
- [x] 2.3 Verify slug enrichment fields (`board_slug`, `standard_slug`, `subject_slug`, `category_slug`, `concept_slugs`, `prop_slugs`) are present on every yukti (REQ-BE-003)
- [x] 2.4 Verify catalogue aggregation for boards/standards/subjects/categories/props/concepts includes correct counts and sorted titles (REQ-BE-004)
- [x] 2.5 Verify all output is rendered via Jinja2 templates in `templates/` and Markdown uses `extra` + `toc` extensions (REQ-BE-005)
- [x] 2.6 Confirm `site/` is deleted and regenerated on each run with no stale files (REQ-BE-006)
- [x] 2.7 Confirm all build output and asset copies land strictly under `site/` (REQ-BE-007)

## 3. Site Output Baseline

- [x] 3.1 Verify `site/index.html` renders title, description, catalogue links, and client containers with root canonical URL (REQ-SO-001)
- [x] 3.2 Verify each yukti generates `site/yuktis/{id}/index.html` and `index.md` with tags linking to catalogue pages (REQ-SO-002)
- [x] 3.3 Verify catalogue landing and individual pages exist for all six catalogue types and list their yuktis (REQ-SO-003)
- [x] 3.4 Verify `site/yuktis/index.html` lists every yukti as a filterable card (REQ-SO-004)
- [x] 3.5 Verify `site/index.json` contains site, enriched yuktis index, and all catalogues matching generated URLs (REQ-SO-005)
- [x] 3.6 Verify `site/sitemap.xml` covers home, yuktis, all yukti pages, and all catalogue pages under `base_url` (REQ-SO-006)
- [x] 3.7 Verify `site/assets/style.css` and `site/assets/app.js` are copied and referenced by all HTML pages (REQ-SO-007)
- [x] 3.8 Verify every HTML page declares lang, title, meta description, and self-referencing canonical; yukti/catalogue pages show breadcrumbs (REQ-SO-008)
- [x] 3.9 Verify generated pages are self-contained (no cross-page runtime dependencies, only own assets) (REQ-SO-009)

## 4. Client-Side Search Baseline

- [x] 4.1 Verify home page fetches `index.json` and renders all catalogue groups plus yukti list (REQ-CS-001)
- [x] 4.2 Verify home search filters yuktis across all searchable fields in real time (REQ-CS-002)
- [x] 4.3 Verify catalogue pages filter `.catalogue-card` via `data-search` without requesting `index.json` (REQ-CS-003)
- [x] 4.4 Verify `?tag=` query parameter pre-filters cards and pre-fills the search input (REQ-CS-004)
- [x] 4.5 Verify failed `index.json` load logs an error and does not break catalogue-page filtering (REQ-CS-005)

## 5. Deployment Baseline

- [x] 5.1 Verify workflow triggers on push to `main` (REQ-DP-001)
- [x] 5.2 Verify CI checks out repo, sets up Python 3, installs `requirements.txt`, and runs `python build.py` (REQ-DP-002)
- [x] 5.3 Verify Pages configuration, artifact upload of `site/`, and deploy step with the required permissions (REQ-DP-003)
- [x] 5.4 Verify local `python build.py` reproduces the same `site/` output as CI (REQ-DP-004)

## 6. Finalize Baseline

- [x] 6.1 Run `python build.py` end-to-end and spot-check the generated `site/` against the spec scenarios
- [x] 6.2 Review all five capability specs for consistency with the proposal capabilities list
- [x] 6.3 Archive the change so the baseline specs land in `openspec/specs/`
