# Design: Fix ideaset catalogue build

## Context

`content/site.json` declares `catalogue_attributes = ["categories", "concepts", "props", "ideasets"]` and `build.py` has a matching `"ideasets"` entry in `CATALOGUE_DEFS` (`("ideasets", "युक्तीसंच", "युक्तीसंचानुसार युक्त्या", "ideasets", "multi")`). Two passes in `main()` write under `site/ideasets/`:

1. The idea-set pass (build.py:311-337) creates `site/ideasets/{slug}/index.html` for each idea set from `templates/ideaset.html.j2`.
2. The generic catalogue pass (build.py:340-370) then iterates the active types; for `ideasets` it computes `item_dir = SITE / "ideasets" / make_slug(item["title"])` and calls `item_dir.mkdir(parents=True)`. Those directories already exist (idea sets carry custom slugs like `fractions-introduction` that do not match `make_slug` of the Marathi key), so `mkdir` raises `FileExistsError: [WinError 183] Cannot create a file when that file already exists` and the build aborts. Even with `exist_ok=True`, the loop would overwrite the idea set pages with the catalogue template.

A second latent bug: `catalogue_items()` builds idea set URLs as `/ideasets/{make_slug(title)}/`, but idea sets define their own slugs in `ideasets.json`, so those links would be wrong for every custom slug.

Constraints: `content/` is read-only user input; output is self-contained under `site/`; strictly vanilla frontend (no inline scripts/styles); catalogue landing pages render standard `card.catalogue-card` cards with a member-count footer.

## Goals / Non-Goals

**Goals:**

- `python build.py` completes without error with `ideasets` in `catalogue_attributes`.
- `site/ideasets/index.html` is generated like every other catalogue landing page, listing each idea set as a card linking to `/ideasets/{slug}/` with its member count in the footer.
- Idea set pages (`site/ideasets/{slug}/index.html`, accordion template) are unchanged and not overwritten.
- Ideaset catalogue links/URLs always match the generated idea set pages (custom slugs).
- The home page does not render an empty `ideasets` facet panel; rendered panels and client-side facet types stay in sync.
- Sitemap emits each idea set URL exactly once.

**Non-Goals:**

- No changes to `content/` files.
- No new catalogue types or template structure changes.
- No changes to idea set pages, idea pages, or the client search index semantics beyond the facet-type list.
- No frontend dependency changes; no inline scripts/styles.

## Decisions

### D1. Ideasets catalogue items are derived from idea set records, not raw membership

Add a small helper that maps each idea set record to a catalogue card payload:

```python
def ideaset_catalogue_items(ideasets):
    return [
        {
            "title": s["title"],
            "url": s["url"],
            "count": s["member_count"],
            "description": s["description"],
            "search": s["search"],
            "image_urls": s["representative_image_urls"],
            "props": [],
            "prop_slugs": [],
        }
        for s in ideasets
    ]
```

`url` comes from the idea set's `url` field (custom slug), `count` from `member_count`, and `image_urls` from the representative images so the landing cards get an image cap. `props` stays empty so the card footer falls through to the count footer (the same behaviour as other landing pages). Alternative considered: reusing `catalogue_items()` over each idea's `ideasets` array - rejected because it produces URLs from `make_slug(title)` that mismatch custom slugs and loses the member count semantics.

### D2. Ideasets is a landing-only catalogue

In `main()`, after building `catalogues`, treat `ideasets` specially in both loops:

- In the aggregation step, `catalogues["ideasets"] = ideaset_catalogue_items(ideasets)` instead of `catalogue_items(...)`.
- In the landing/item loop, always write the landing page (`site/ideasets/index.html` from `catalogue.html.j2`), then `continue` before the per-item loop when `key == "ideasets"`.
- The landing `mkdir` uses `exist_ok=True` because `site/ideasets/` already exists from the idea-set page pass; this is harmless since `site/` is wiped at the start of every build and is in fact the exact original crash site (`FileExistsError` on `site\ideasets`).

The per-item pages already exist as dedicated idea set pages; skipping them prevents overwriting the accordion pages with the catalogue template. Alternative considered: passing `exist_ok=True` to the per-item `mkdir` - rejected because it merely papers over the crash and then clobbers the idea set pages with the wrong template.

### D3. Single facet-type source omits ideasets

The build already renders home facet panels from `facet_groups`. Derive both the panels and the client-facing list from one value:

```python
facet_types = [key for key in active_types if key != "ideasets"] + ["standard", "subject"]
facet_groups = [(key, CATALOGUE_DEFS[key][1]) for key in active_types if key != "ideasets"] + FACET_EXTRA_TYPES
site["facet_types"] = facet_types
```

`site["facet_types"]` is embedded in `site/ideas.json`, and `theme/app.js` switches from `[...catalogueAttributes, "standard", "subject"]` to `data.site.facet_types` (with the old expression as a fallback for missing data). This keeps one source of truth in the build and keeps URL state, panel rendering, and filtering consistent. An idea set cannot facet on itself, so `ideasets` is excluded from facets while still being a catalogue. Alternative considered: hardcoding the exclusion in `app.js` - rejected because it splits the source of truth across two files.

### D4. Sitemap emits idea set URLs once

The sitemap already lists every idea set page from the idea set records. The catalogue loop adds per-item URLs; for `ideasets` this would either duplicate those URLs or add mistyped `make_slug` URLs. Skip the per-item URL extension when `key == "ideasets"` while still adding the landing URL `site/base_url/ideasets/`.

## Risks / Trade-offs

- [Another catalogue added later that needs landing-only treatment] → `key == "ideasets"` checks are centralized in `main()`; if more landing-only catalogues appear, promote to a `LANDING_ONLY` set constant.
- [`site.facet_types` absent in an older payload] → `app.js` keeps the `catalogueAttributes` fallback expression, so old payloads still behave as before.
- [Landing cards show count footer instead of props] → Intended: landing pages already show counts; idea set props remain visible on idea set pages and home facets.
- [Hardcoded `ideasets` name in the skip checks] → Acceptable at this scale; the name is already hardcoded in `CATALOGUE_DEFS` and `site.json`.

## Migration Plan

1. Edit `build.py`: add `ideasets_catalogue_items`, build `catalogues["ideasets"]` from idea set records, add `facet_types` to the site payload, skip the per-item loop and sitemap per-item URLs for `ideasets`.
2. Edit `theme/app.js`: read `data.site.facet_types` (with fallback).
3. Run `python build.py`; confirm it completes and `site/ideasets/index.html` exists.
4. Serve `site/` and verify: ideasets landing page cards link to `/ideasets/{slug}/` with correct counts, idea set pages still render accordions, home page has no empty `ideasets` facet panel, and `sitemap.xml` has each idea set URL once.
5. Rollback: revert `build.py` and `theme/app.js` from version control and rebuild; `content/` is untouched.
