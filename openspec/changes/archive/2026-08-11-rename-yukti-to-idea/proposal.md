## Why

The term `yukti` (युक्ती, Marathi for "idea/trick") is used inconsistently as the name for the site's core content unit. Its romanization is ambiguous and not self-explanatory to new contributors. Standardizing on the English token `idea`/`ideas` everywhere in code, scripts, templates, static data filenames, and specs makes the codebase self-documenting and greppable.

## What Changes

- Rename every `yukti` token to `idea` and every `yuktis` token to `ideas` across `build.py`, `templates/`, `theme/app.js`, `theme/style.css`, `README.md`, and the OpenSpec specs.
- Rename the content source files: `content/yuktis.json` → `content/ideas.json`, directory `content/yuktis/` → `content/ideas/`, and the JSON key `"yuktis"` → `"ideas"`.
- Rename template files `templates/yukti.html.j2` → `templates/idea.html.j2` and `templates/yukti.md.j2` → `templates/idea.md.j2`.
- Rename generated output paths and public URLs: `site/yuktis/` → `site/ideas/`, `/yuktis/` → `/ideas/`, plus canonical URLs and the `index.json` `yuktis`/`yukti-list` keys and element ids.
- Rename Python identifiers (`yuktis`, `yukti_index`, `yukti_items`, `load_yukti_content`, loop variables), JS identifiers (`data.yuktis`, `yukti-list`), and CSS classes (`.yukti-header`, `.yukti-content`, `.page.yukti`).
- **BREAKING**: public URL paths change from `/yuktis/...` to `/ideas/...`. Existing indexed links and canonical URLs change; a sitemap regeneration is required on deploy.
- **Marathi display text is explicitly out of scope**: the literal `युक्त्या` (and derived Marathi strings such as `...नुसार युक्त्या`) SHALL remain unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-model`: Terminology and file references updated - `content/yuktis.json` → `content/ideas.json`, the `yuktis` array → `ideas`, `yukti` → `idea` in REQ-CM-001, REQ-CM-002, REQ-CM-003. REQ-CM-004 is unchanged.
- `build-engine`: Terminology and references updated in REQ-BE-001, REQ-BE-003, REQ-BE-004, REQ-BE-005 (`yuktis.json`, `yuktis/`, `yukti page`, `templates/yukti.html.j2` → `idea.html.j2`). REQ-BE-002/006/007 are unchanged.
- `site-output`: Output paths and terminology updated - `site/yuktis/` → `site/ideas/`, `/yuktis/` → `/ideas/`, `yukti` → `idea` in REQ-SO-002, REQ-SO-004, REQ-SO-005, REQ-SO-006, REQ-SO-008. REQ-SO-001/003/007/009 are unchanged.
- `client-side-search`: Terminology updated - `yukti list` → `idea list`, `yuktis` → `ideas` in REQ-CS-001, REQ-CS-002. REQ-CS-003/004/005 are unchanged.

## Impact

- **Files updated**:
  - `build.py` (paths, identifiers, `index.json` payload key, URLs, print message)
  - `templates/index.html.j2` (`yukti-list` id, `/yuktis/` link)
  - `templates/yukti.html.j2` → `templates/idea.html.j2` (canonical URL, CSS classes, `/yuktis/` URL)
  - `templates/yukti.md.j2` → `templates/idea.md.j2`
  - `theme/app.js` (`data.yuktis`, `yukti-list`)
  - `theme/style.css` (`.yukti-header`, `.yukti-content`)
  - `README.md`
  - `content/yuktis.json` → `content/ideas.json` (file name + `"yuktis"` key)
  - `content/yuktis/` → `content/ideas/` (angles.md, triangles.md moved)
  - Specs: `openspec/specs/{content-model,build-engine,site-output,client-side-search}/spec.md`
- **Files created**: change artifacts under `openspec/changes/rename-yukti-to-idea/` (proposal, delta specs, design, tasks).
- **Regenerated**: `site/` output (already gitignored, rebuilt by CI).
- **Not touched**: `.github/workflows/pages.yml`, `requirements.txt`, archived change `2026-08-11-establish-project-baseline`, Marathi literals, yukti `id` values (`angles`, `triangles` - they contain no `yukti` token).

### Constraints, Assumptions, Out-of-Scope

- **Assumption / explicit exception**: renaming `content/yuktis.json`, `content/yuktis/`, and the `"yuktis"` key is done at the user's explicit request, overriding the default "do not change content/" rule for this one-time rename. The build must keep reading its inputs from the renamed paths.
- Marathi display literals (`युक्त्या`, `...नुसार युक्त्या`) are unchanged.
- No behavioural or SEO logic changes beyond the rename; URL-path change is the only breaking effect.
