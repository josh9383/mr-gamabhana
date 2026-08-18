## Context

The codebase uses `yukti`/`yuktis` as the name of its core content unit across `build.py` (paths, identifiers, `index.json` payload, print output), five Jinja2 templates, `theme/app.js`, `theme/style.css`, `README.md`, the seed content files (`content/yuktis.json`, `content/yuktis/*.md`), and the four capability specs that reference these. The term is a romanization of युक्ती and is not self-explanatory. This change renames the English token to `idea`/`ideas` everywhere while leaving all Marathi display text (`युक्त्या` etc.) untouched.

**Dependency chain affected:**
```
content/ideas.json ──> build.py (loads "ideas" key) ──> templates/idea.html.j2, idea.md.j2 ──> site/ideas/**, index.json ("ideas" key) ──> theme/app.js (data.ideas, #idea-list)
```

## Goals / Non-Goals

**Goals:**
- Single consistent English term (`idea`/`ideas`) for the content unit across code, templates, theme, specs, and seed data filenames.
- Keep the build pipeline's observable behaviour identical apart from the token and URL-path renames.
- Keep the site fully buildable and deployable after the rename (no dangling references).

**Non-Goals:**
- No change to any Marathi display literal (`युक्त्या`, `...नुसार युक्त्या`, etc.).
- No change to yukti `id` values (`angles`, `triangles`) - they contain no `yukti` token.
- No change to `.github/workflows/pages.yml` or `requirements.txt` (no `yukti` references).
- No change to the archived baseline change.
- No behavioural/SEO logic changes; the `/yuktis/` → `/ideas/` URL path change is the sole breaking effect.

## Decisions

### D1: Rename the seed data file and key
`content/yuktis.json` → `content/ideas.json`, directory `content/yuktis/` → `content/ideas/`, and the JSON key `"yuktis"` → `"ideas"`. `build.py` reads `data["ideas"]`.

*Rationale:* A half-rename (code renames but data keeps old names) would leave the single source of truth permanently inconsistent with the rest of the system and confuse future edits. The user explicitly requested the rename include content files.
*Alternative considered:* Keep `content/` as-is and map old names in `build.py` - rejected: perpetuates the inconsistency and complicates every future change.

### D2: Rename identifiers mechanically, one token mapping
Apply a strict token mapping in each file:
`yukti` → `idea`, `yuktis` → `ideas` (longest match first to avoid partial matches), including: Python identifiers (`yuktis`, `yukti_index`, `yukti_items`, `load_yukti_content`, loop vars), template/CSS class names (`.yukti-header` → `.idea-header`, `.yukti-content` → `.idea-content`, `.page.yukti` → `.page.idea`), element id `yukti-list` → `idea-list`, JS `data.yuktis` → `data.ideas`, file names, directory names, URL segments, and the JSON payload key.

*Rationale:* A single deterministic mapping avoids missed or inconsistent references and makes the rename verifiable by a repo-wide grep.
*Alternative considered:* Renaming only user-facing strings (URLs/labels) and keeping internal identifiers - rejected: the user asked for tokens everywhere, and internal consistency is the point of the change.

### D3: Keep Marathi literals as an explicit exception to the mapping
The strings `युक्त्या` and `...नुसार युक्त्या` are Marathi words, not the English token `yukti`, and SHALL NOT be replaced. The mapping applies only to ASCII `yukti`/`yuktis` tokens.

*Rationale:* The site is Marathi-language; the display label is a deliberate Marathi word. Changing it would alter the product's UI text, which the user explicitly excluded.
*Alternative considered:* Translating `युक्त्या` to `कल्पनासंग्रह` - rejected by user.

### D4: Rename template files and update all references atomically
`templates/yukti.html.j2` → `templates/idea.html.j2`, `templates/yukti.md.j2` → `templates/idea.md.j2`, and update `build.py`'s `env.get_template(...)` calls in the same step. The `index.html.j2` and `catalogue.html.j2` templates are not renamed but their `yukti`/`yuktis` tokens are updated.

*Rationale:* Template file names are part of the build contract; renaming file and call site together keeps the build green at every step.

### D5: Sitemap/SEO URLs regenerate from the new path
`/yuktis/...` → `/ideas/...` in canonical URLs, generated page URLs, `index.json`, and `sitemap.xml`; the client-side `#idea-list` container and `data.ideas` index key keep home-page rendering working.

*Rationale:* The build derives all URLs from the same code path, so one change keeps home, catalogue, canonical, and sitemap URLs consistent (already verified by the baseline).

## Risks / Trade-offs

- [**BREAKING**: public URL paths change (`/yuktis/` → `/ideas/`), breaking external links and search indexes] → Expected and accepted; the sitemap is regenerated and re-submitted on the next deploy. Documented as breaking in the proposal.
- [Missed occurrence leaves a dangling reference (build crash or broken link)] → A repo-wide grep for `yukti` (case-insensitive) after implementation must return zero matches outside the archived change; the build is run end-to-end and the generated `site/` is spot-checked.
- [Content rename conflicts with the "never change content/" rule] → Explicitly documented as a one-time user-approved exception in the proposal.
- [Devanagari/Unicode issues while moving directories] → Use filesystem-safe moves; the yukti `id`s and content bodies are untouched, so no encoding risk.

## Migration Plan

1. Rename content source: move `content/yuktis.json` → `content/ideas.json` (rename key `"yuktis"` → `"ideas"`), move `content/yuktis/` → `content/ideas/`.
2. Rename templates and update `build.py` references, then run `python build.py` and confirm `site/` regenerates under `site/ideas/` with a clean grep.
3. Update `theme/app.js`, `theme/style.css`, `README.md`, and specs; rebuild and re-verify.
4. Rollback: `git checkout` reverts all renames; content move is trivially reversible with the same two `mv` operations in reverse.

## Open Questions

None - scope confirmed by the user (rename tokens only, keep Marathi literals).
