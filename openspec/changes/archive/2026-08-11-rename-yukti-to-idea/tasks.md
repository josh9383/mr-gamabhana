# Implementation Tasks

## 1. Content Source Rename

- [x] 1.1 Move `content/yuktis.json` to `content/ideas.json` and rename the `"yuktis"` JSON key to `"ideas"` (leave all Marathi values untouched)
- [x] 1.2 Move `content/yuktis/` directory to `content/ideas/` (angles.md, triangles.md)
- [x] 1.3 Confirm `content/` contains no `yukti`/`yuktis` token in file or directory names

## 2. Templates Rename

- [x] 2.1 Rename `templates/yukti.html.j2` to `templates/idea.html.j2` and `templates/yukti.md.j2` to `templates/idea.md.j2`
- [x] 2.2 Update `templates/idea.html.j2`: canonical URL `/yuktis/{id}/` → `/ideas/{id}/`, CSS classes `.page.yukti`/`.yukti-header`/`.yukti-content` → `.idea-*`
- [x] 2.3 Update `templates/index.html.j2`: element id `yukti-list` → `idea-list`, link `/yuktis/` → `/ideas/` (Marathi `युक्त्या` unchanged)
- [x] 2.4 Confirm no `yukti`/`yuktis` token remains in `templates/`

## 3. Build Engine Rename

- [x] 3.1 Update `build.py` content paths: `CONTENT / "yuktis.json"` → `"ideas.json"`, `CONTENT / "yuktis"` → `"ideas"`, `load_yukti_content` → `load_idea_content`
- [x] 3.2 Update `build.py` data key access: `data["yuktis"]` → `data["ideas"]`, variable `yuktis` → `ideas`, loop variable `yukti` → `idea`
- [x] 3.3 Update `build.py` identifiers: `yukti_index` → `idea_index`, `yukti_items` → `idea_items`, `yuktis_dir` → `ideas_dir`, template lookups `yukti.html.j2`/`yukti.md.j2` → `idea.html.j2`/`idea.md.j2`
- [x] 3.4 Update `build.py` output paths and URLs: `SITE / "yuktis"` → `"ideas"`, `/yuktis/{id}/` → `/ideas/{id}/`, `/yuktis/` → `/ideas/`, `index.json` payload key `"yuktis"` → `"ideas"`
- [x] 3.5 Update `build.py` print message `Built N yuktis.` → `Built N ideas.`
- [x] 3.6 Confirm no `yukti`/`yuktis` token remains in `build.py`

## 4. Theme Rename

- [x] 4.1 Update `theme/app.js`: `renderHomeGroup("yukti-list", ...)` → `"idea-list"`, `data.yuktis` → `data.ideas` (Marathi template literal unchanged)
- [x] 4.2 Update `theme/style.css`: `.yukti-header` → `.idea-header`, `.yukti-content` → `.idea-content`
- [x] 4.3 Confirm no `yukti`/`yuktis` token remains in `theme/`

## 5. Docs and Specs

- [x] 5.1 Update `README.md`: `yuktis.json` → `ideas.json`, `content/yuktis/` → `content/ideas/`, `yukti` → `idea`, `yuktis` → `ideas`
- [x] 5.2 Confirm spec delta files under `openspec/changes/rename-yukti-to-idea/specs/` match the four modified capabilities (content-model, build-engine, site-output, client-side-search)

## 6. Build and Verify

- [x] 6.1 Run `python build.py` and confirm the site builds under `site/ideas/` with no errors
- [x] 6.2 Verify generated `site/`: `/ideas/` URLs, `index.json` `"ideas"` key, canonical URLs, and sitemap all use `ideas`
- [x] 6.3 Run a repo-wide grep for `yukti` (case-insensitive) — the only remaining matches SHALL be in the archived change and Marathi literals
- [x] 6.4 Confirm Marathi literals (`युक्त्या` etc.) are byte-identical in `templates/`, `theme/app.js`, and `build.py`
