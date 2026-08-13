## Context

Idea set pages (`templates/ideaset.html.j2` → `site/ideasets/{slug}/index.html`) currently reuse the catalogue pattern: a filterable grid of `card.catalogue-card` items, each showing the idea's title, description, and an image cap, wired to `initCatalogueSearch()` + MiniSearch. Because the cards only show teasers, visiting an idea set page gives no access to the actual idea content; users must open each idea page separately.

The build engine (`build.py`) already computes, for every idea set, `member_ids` plus aggregated facets, and it already knows how to render a member idea's Markdown body to HTML (the idea-page loop converts `meta.md` with the `markdown` library, `extra` + `toc` extensions, into `content_html`).

## Goals / Non-Goals

**Goals:**
- Render idea set pages as a Bootstrap 5 accordion with one item per member idea.
- Each accordion item header SHALL show the member idea title; its body SHALL show the idea's images and details (description + converted Markdown body), replacing the teaser-card grid.
- Remove the now-unsupported card-search (input, MiniSearch, widget script) from idea set pages.
- Keep the change server-rendered and self-contained: no new JS, no inline scripts/styles, no new dependencies.

**Non-Goals:**
- Not changing idea pages, catalogue pages, the home page, `theme/app.js`, or `theme/style.css`.
- Not altering `content/` (user-generated inputs) — idea set membership and content stay as-is.
- Not changing the ideaset search experience on the home page (idea sets are still indexed client-side there).
- Not reworking `makeAccordion` (the client-side helper that turns idea-page Markdown `H3` sections into an accordion); it is unrelated and stays untouched.

## Decisions

### D1 — Server-render the accordion in `templates/ideaset.html.j2`
Render the Bootstrap accordion markup directly in the template (`.accordion` → `.accordion-item` → `.accordion-header`/`.accordion-button` + `.accordion-collapse`/`.accordion-body`), with the first item expanded and the rest collapsed, driven by Bootstrap's bundled JS.

- **Why:** Atomic, self-contained output with no runtime JS beyond the Bootstrap bundle every page already loads; matches the no-inline-script constraint; each accordion body is a full idea, so this is the only approach that keeps the page truly self-contained.
- **Alternative:** Reuse `makeAccordion()` client-side by feeding it `H3` sections — rejected because that helper targets idea-page Markdown structure and would require the full idea content to be injected as hidden markup plus a bespoke script, violating the zero-inline-script rule and splitting the source of truth.

### D2 — Build accordion item payloads in `build.py`
In the idea set page loop, build each member item as `{title, url, description, image_urls, content_html}` where `content_html = markdown(load_idea_content(idea), extensions=["extra", "toc"])`, and pass the list to `ideaset_template.render(items=...)`.

- **Why:** Reuses the exact conversion pipeline already used by idea pages (single source of truth for content HTML); keeps data parsing isolated from visual rendering; the template stays a pure stream renderer.
- **Alternative:** Pass raw ideas and convert in the template — rejected: keeps logic out of templates and avoids re-encoding per-render concerns.

### D3 — Drop card-search from the idea set template
Remove `.catalogue-search`, the `minisearch.min.js` script, the `app.js` catalogue-search initialization, and the gamabhana widget script from `templates/ideaset.html.j2`. `app.js` remains loaded for Bootstrap-enabled pages only if needed; otherwise removed from this page too.

- **Why:** The search filters `card.catalogue-card` nodes; with the accordion replacing cards there is nothing to filter, so leaving it would render a dead input and pull in unnecessary assets.
- **Alternative:** Keep search and filter accordion items — rejected: filters on a collapsed accordion are poor UX, and MiniSearch indexes card text, not accordion content.

### D4 — Preserve idea-set page semantics elsewhere
`ideaset["member_ids"]`, `member_count`, aggregated facets, `representative_image_urls`, `site/ideas.json`, and the sitemap are unchanged. Only the ideaset page's template and its render payload change.

## Risks / Trade-offs

- [Larger HTML output per idea set page (full idea bodies inline)] → Mitigation: acceptable for a static site; identical to the content already shipped on idea pages; no runtime cost.
- [Accordion bodies may be long, hurting scanability] → Mitigation: first item open by default; Bootstrap collapse keeps others hidden until clicked; this is the requested UX.
- [External links inside idea bodies resolve under the idea-set page path] → Mitigation: body HTML uses the same relative-to-root asset references as idea pages (`/ideas/{id}/...`), so images still resolve; site is served at a path-agnostic `base_url`.
- [Removing the widget/search changes SEO/UX on idea set pages] → Mitigation: idea set pages remain listed in the sitemap and link from idea pages and home cards; card-search was never indexed content.
