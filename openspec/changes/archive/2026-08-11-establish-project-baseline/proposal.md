## Why

Gamabhana (गमभन) is a brownfield static-site project: the Python build engine (`build.py`), Jinja2 templates, vanilla theme assets, and Marathi seed content are already written and deployed to GitHub Pages, but no formal specification baseline exists. Future changes currently have no documented contract for the content model, build pipeline, generated output, or client-side behaviour, so regressions are likely and coordination is ad-hoc. This change establishes the foundational specs so every subsequent change can be traced against an explicit, testable baseline.

## What Changes

- Create the initial capability specs that capture the current, observable behaviour of the project as requirements with `[REQ-xxx: ...]` traceability tags and Given/When/Then acceptance criteria.
- Document the content model contract (`content/yuktis.json`, `content/yuktis/*.md`) as user-generated inputs that the build must never mutate.
- Document the build-engine pipeline (data loading, slug computation, catalogue aggregation, template rendering, site refresh) and its output guarantees.
- Document the generated site structure (home, yukti pages, catalogue landing/individual pages, `index.json`, `sitemap.xml`, assets).
- Document the client-side search/catalogue behaviour in `theme/app.js`.
- Document the GitHub Pages deployment pipeline.
- **No production code, content, template, or theme files are changed.** This is a documentation-only baseline.

## Capabilities

### New Capabilities

- `content-model`: The schema and semantics of `content/yuktis.json`, the per-yukti Markdown files under `content/yuktis/`, and the site-level configuration; content is user input and is never modified by the build.
- `build-engine`: The `build.py` pipeline - loading inputs, slug generation, catalogue aggregation, template rendering, and idempotent refresh of the `site/` output directory with strict atomicity.
- `site-output`: The set of generated artifacts (home, yukti HTML + Markdown copies, catalogue landing and individual pages, `index.json`, `sitemap.xml`, asset copies) and their SEO/linkage guarantees.
- `client-side-search`: The vanilla-JS behaviour in `theme/app.js` - home page index loading and filtering, catalogue page filtering that is independent of `index.json`, and project-path-safe operation.
- `deployment`: The GitHub Actions workflow that rebuilds the site from `main` and deploys it to GitHub Pages.

### Modified Capabilities

None - no specs exist yet; all capabilities above are being established for the first time.

## Impact

- **Files created**: five spec files under `openspec/changes/establish-project-baseline/specs/` - `content-model/spec.md`, `build-engine/spec.md`, `site-output/spec.md`, `client-side-search/spec.md`, `deployment/spec.md` - plus `design.md` and `tasks.md`.
- **Files updated**: none in production. On archiving, the specs will land in `openspec/specs/`.
- **Systems referenced (not modified)**: `build.py`, `content/yuktis.json`, `content/yuktis/*.md`, `templates/*.j2`, `theme/app.js`, `theme/style.css`, `.github/workflows/pages.yml`, `requirements.txt`.
- **Constraints honored**: no changes to `content/`; site artifacts remain fully self-contained with no cross-dependencies; strict vanilla stack; no inline scripts/styles; no unit tests introduced.
