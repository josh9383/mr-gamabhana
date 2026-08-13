# Design — Split Content Per Idea

## Context

`content/ideas.json` currently holds both the `site` object (title, description, language, base URLs) and the `ideas` array (all idea metadata). Each idea's body lives in a flat file `content/ideas/{id}.md`. `build.py` loads the single JSON in `load_data()`, reads each body via `load_idea_content()`, and writes a client-side payload to `site/index.json`. `theme/app.js` fetches `index.json` on the home page.

The goal is atomic per-idea content: every idea becomes a self-contained directory holding its metadata (`meta.json`) and body (`meta.md`), site config moves to `content/site.json`, the build clubs the per-idea JSONs together, and the generated client-side payload is renamed to `site/ideas.json`.

## Goals / Non-Goals

**Goals:**
- Single source of truth per idea: `content/ideas/{id}/meta.json` (metadata) + `content/ideas/{id}/meta.md` (body).
- Site config isolated in `content/site.json` so site-wide edits don't touch idea data.
- Build-time clubbing: `build.py` discovers `content/ideas/*/meta.json`, loads each, and produces the same in-memory `ideas` list used today.
- Generated client-side payload renamed from `site/index.json` to `site/ideas.json`, same shape (`site`, `ideas`, `catalogues`).
- Preserve all generated page URLs, catalogue behavior, sitemap, and Marathi display literals exactly.

**Non-Goals:**
- No template or CSS changes; no URL structure changes; no new dependencies; no runtime changes to catalogue-page filtering.
- No changes to the `site` object schema beyond relocating it to `content/site.json`.
- No change to the generated HTML/Markdown output content itself.

## Decisions

**D1 — Per-idea directory layout.**
Each idea moves from `content/ideas/{id}.md` to a directory `content/ideas/{id}/` containing `meta.json` and `meta.md`. The directory name is the idea's `id` (stable slug), matching today's `/ideas/{id}/` URL and slug-enrichment keying.

*Alternatives:* Keeping the flat body file and only splitting metadata (rejected: does not achieve atomic per-idea directories); numbering directories (rejected: ids are already stable and URL-facing).

**D2 — Build-time discovery via `content/ideas/*/meta.json`.**
`build.py` uses `Path.glob("content/ideas/*/meta.json")` to enumerate ideas. Each `meta.json` holds exactly one idea record; the build clubs them into an `ideas` list. Iterating the directory means adding/removing an idea is just adding/removing its folder.

*Alternatives:* Keeping a separate index file listing idea ids (rejected: reintroduces the monolithic coupling this change removes).

**D3 — `content/site.json` holds the `site` object only.**
The `site` object is read by `load_site()` from `content/site.json`. All templates receive `site` unchanged (same fields `title`, `description`, `language`, `base_url_live`, `base_url`).

**D4 — Output payload renamed to `site/ideas.json`.**
The client-side payload keeps its shape but is written to `SITE / "ideas.json"`. `theme/app.js` fetches `"ideas.json"`. This aligns the generated payload name with its content (`ideas`) and the per-idea source layout.

**D5 — `load_data()` split into two pure functions.**
`load_data()` (single-source loader) is replaced by `load_site()` (returns the `site` object from `content/site.json`) and `load_ideas()` (returns the clubbed `ideas` list). `load_idea_content(idea)` reads `content/ideas/{id}/meta.md`. This keeps data-parsing isolated from rendering per the layered-service constraint.

## Risks / Trade-offs

- **BREAKING content layout** — existing `content/ideas.json` and `content/ideas/*.md` paths are replaced. Mitigated by documenting the new layout in `README.md` and the config context, and by the build failing fast if `content/site.json` or any `meta.md` is missing.
- **Missing `meta.md` for an idea** — would silently drop body content. Mitigated by failing the build (REQ-CM-003 scenario) rather than generating a partial page.
- **Stale references to `site/index.json`** — any remaining fetcher would 404. Mitigated by updating `theme/app.js` and grepping the repo for `index.json` during verification.
- **Sort order of the clubbed ideas list** — `Path.glob` order is filesystem-dependent. The build sorts ideas by `id` after loading to keep output deterministic.
