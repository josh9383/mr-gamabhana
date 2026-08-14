## Context

The `catalogues` node in `content/site.json` now fully drives catalogue page generation and the home facet list (`facet` flag). Two placement decisions remain hardcoded. First, the navbar (rendered identically in `home.html.j2`, `catalogue.html.j2`, `idea.html.j2`, and `ideaset.html.j2`) shows only the brand (plus the home search box and facets toggle); it has no catalogue links. Second, idea card footers are hardcoded to props: server-rendered cards (`templates/catalogue.html.j2`) show props badges only when `"props" in catalogue_attributes`, and home cards (`cardHtml` in `theme/app.js`) show props badges only when `facetTypes.includes("props")`. `build.py` builds idea card payloads in two places — `idea_card()` (server cards) and `home_idea_items()` (client payload) — and each currently carries only `props`/`prop_slugs` for the footer.

## Goals / Non-Goals

**Goals:**
- Let each `catalogues` definition decide, via `menu` and `footer` booleans (default true), whether its type appears in the main navbar and in idea card footers.
- Add navbar nav links for `menu: true` types on every generated page, labeled with the type's `title` and linking to `/{path_name}/`.
- Render idea card footer badges for every `footer: true` type, linking each badge to the value's individual page (`/{path_name}/{slug}/`, and `/ideasets/{slug}/` for idea sets).
- Apply the same generic footer rule to server-rendered cards and home-page JS-rendered cards.
- Keep the payload and templates simple by precomputing `footer_badges` on idea card payloads.

**Non-Goals:**
- No changes to idea detail page badges (`idea.html.j2` header badge list).
- No changes to catalogue page generation, facet behavior, URL state, or the top-level payload shape.
- No changes to `content/` — the existing `content/site.json` stays valid because the new flags default to true.
- No new catalogue types or per-idea `meta.json` changes.

## Decisions

**D1: `menu` and `footer` definition attributes (default true).**
Each `catalogues` definition gains `menu` and `footer` booleans. `load_catalogue_defs(site)` normalizes every entry with `{"facet": True, "menu": True, "footer": True, **entry}`, so omitted flags default to true for both configured definitions and the `DEFAULT_CATALOGUES` fallback set. `DEFAULT_CATALOGUES` entries get explicit `menu`/`footer` too. This keeps `content/site.json` unchanged while enabling per-type opt-out.
- Alternative considered: a separate top-level `navbar`/`footers` array in `site.json` — rejected because the per-definition flags keep a single source of truth alongside `facet`.

**D2: Navbar menu derived from the definitions.**
`menu_groups = [(key, title, path_name) for key in active_types if catalogue_defs[key]["menu"]]` is added to `base_context`, so every template renders the same navbar. Each navbar inserts a compact `navbar-nav flex-row flex-wrap gap-2` list of nav links after the brand; the home page's search keeps its `ms-auto`. Each link is `<a class="nav-link" href="{base_url}/{path_name}/">{title}</a>`.

**D3: Footer badges precomputed by the build.**
`footer_types = [key for key in active_types if catalogue_defs[key]["footer"]]`. A helper `footer_badges_for(idea, catalogue_defs, footer_types)` returns `[{"value": ..., "url": ...}]`: for `single` mode it uses `idea[field]` and the `{key}_slug` slug (e.g., `board_slug`, `standard_slug`, `subject_slug`); for `multi` mode it zips `idea[field]` with `{key}_slugs` (e.g., `category_slugs`, `ideaset_slugs`). URLs are `/{path_name}/{slug}/`. `idea_card()` and `home_idea_items()` both add `footer_badges`. This keeps the Jinja template and `app.js` free of per-type mode/slug logic and makes the client payload self-describing.
- Alternative considered: passing per-type accessors or `mode`/`path_name` maps into templates and JS — rejected because precomputed badges are uniform and simpler to render and test.

**D4: Template idea-card footer (catalogue.html.j2).**
Idea cards (`item.count is none`) render a `card-footer` of `item.footer_badges` badges (class `text-bg-light text-decoration-none`, same as today's props badges); landing-page cards keep the count footer. The `"props" in catalogue_attributes` branch is replaced by the generic `footer_badges` loop. The ideas landing page (`site/ideas/index.html`) uses the same template and gets the same badges automatically.

**D5: Home card footer (app.js).**
`cardHtml(idea)` renders `idea.footer_badges` badges into the `card-footer` instead of the `facetTypes.includes("props")` props-only block. The rest of the card rendering is unchanged.

**D6: Payload exposure.**
`home_idea_items` records gain `footer_badges`; the `site` object and payload shape otherwise stay the same. No `footer_types`/`menu` data needs to be sent to the client because the badges are precomputed per idea.

## Risks / Trade-offs

- [Default-true adds 6 navbar links and more footer badges] → That is the requested default; site owners opt out per type with `menu: false` / `footer: false`. The navbar list is compact, flex-wrapped, and small-screen tolerant; badge counts are bounded by the idea's values.
- [Navbar space is tight on small screens] → The nav list is `flex-row flex-wrap` and placed after the brand before the `ms-auto` search, so it wraps rather than overflowing.
- [Precomputed badges can drift from generated pages] → The URLs are derived from the same slugs used to generate catalogue pages (`make_slug`), so a badge URL always matches a generated page; `ideasets` badges target the dedicated idea set pages that always exist.
- [idea_card search/index weight grows] → `footer_badges` is derived data, not searchable text; MiniSearch indexing fields are unchanged.

## Migration Plan

1. Update `build.py`: normalize `menu`/`footer` defaults; derive `menu_groups` and `footer_types`; add `footer_badges_for`; add `footer_badges` to `idea_card` and `home_idea_items`; add `menu_groups` to `base_context`.
2. Update the four templates' navbars to render `menu_groups`.
3. Update `templates/catalogue.html.j2` idea-card footer to loop `item.footer_badges`.
4. Update `theme/app.js` `cardHtml` to render `idea.footer_badges`.
5. Run `python build.py`, serve `site/`, and verify navbar links, card footers (server + home), catalogue/idea pages, and that `content/` is untouched.
6. No data migration; rollback is a revert of the edited files plus a rebuild.

## Open Questions

None.
