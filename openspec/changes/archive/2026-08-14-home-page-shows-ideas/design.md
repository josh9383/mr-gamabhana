# Design: Home page shows ideas

## Context

The ideaset-catalogues change switched the home page from an individual-idea search to an idea-set search: `site/ideas.json` carries `{site, ideasets, catalogues}`, `theme/app.js`'s `initSearchPage()` indexes `data.ideasets` with fields aggregated per idea set, facet values come from each set's member union, and result cards are idea set cards with a shuffled representative-image carousel and a member-count footer ("{n} संच"). The user now wants the home page to show individual ideas again.

The build already normalizes every idea in `load_ideas()` (`board_slug`, `standard_slug`, `subject_slug`, `category_slugs`, `concept_slugs`, `prop_slugs`, `ideaset_slugs`, `image_urls`, `description` defaulted, lists coerced), so the data needed for an idea-based home search already exists in memory. Idea set pages, the ideasets catalogue landing page, and all other catalogue pages are unchanged by this work.

Constraints: `content/` is read-only; output is self-contained under `site/`; strictly vanilla frontend; no inline scripts/styles; no unit tests.

## Goals / Non-Goals

**Goals:**

- The home search indexes and ranks individual ideas from `site/ideas.json`, not idea sets.
- Home result cards are idea cards (image cap from the idea's own images in order, title, description, prop-badge footer when `props` is active) linking to `/ideas/{id}/`.
- Facet panels keep the same types (`catalogue_attributes` excluding `ideasets`, plus `standard`/`subject`) but read values from each idea's own fields, with `standard`/`subject` as scalars.
- URL state (`q` + facet params) keeps working unchanged.
- Copy switches back to ideas ("{n} युक्त्या"; "कोणतीही युक्ती सापडली नाही").
- Idea set pages, the ideasets catalogue landing page, and catalogue pages are untouched.

**Non-Goals:**

- No changes to idea set pages, idea pages, catalogue pages, or their templates.
- No new facet types (an `ideasets` facet for ideas is possible later but out of scope).
- No changes to `content/`, dependencies, or the deployment pipeline.

## Decisions

### D1. The payload regains an `ideas` array and drops `ideasets`

`site/ideas.json` becomes `{site, ideas, catalogues}`. A new build helper serializes each normalized idea into a home-index record:

```python
def home_idea_items(ideas):
    return [
        {
            "id": idea["id"],
            "title": idea["title"],
            "description": idea["description"],
            "url": f"/ideas/{idea['id']}/",
            "board": idea["board"],
            "standard": str(idea["standard"]),
            "subject": idea["subject"],
            "categories": idea["categories"],
            "category_slugs": idea["category_slugs"],
            "concepts": idea["concepts"],
            "concept_slugs": idea["concept_slugs"],
            "props": idea["props"],
            "prop_slugs": idea["prop_slugs"],
            "ideasets": idea["ideasets"],
            "ideaset_slugs": idea["ideaset_slugs"],
            "image_urls": idea["image_urls"],
        }
        for idea in ideas
    ]
```

The `ideasets` array is dropped because nothing consumes it after this change (`app.js` is updated in the same change and catalogue pages never read `ideas.json`). Alternative considered: keeping both arrays in the payload — rejected as dead weight and it would leave the client open to regressing to the old behavior.

### D2. Client search switches from idea sets to ideas

In `initSearchPage()` of `theme/app.js`:

- Source becomes `const ideas = data.ideas;` with `data.ideasets` removed.
- `facetValues(idea, type)` reads per-idea fields: `standard` → `[String(idea.standard)]`, `subject` → `[idea.subject]`, otherwise `(idea[type] || []).map(String)`. This matches the scalar vs. multi catalogue modes in the build.
- MiniSearch fields: `["title", "description", "board", "standard", "subject", "categories", "concepts", "props", "ideasets"]` with `title` boosted; `storeFields: ["id", "title", "description", "url", "props", "prop_slugs", "image_urls"]`.
- `matchesFacets`, `filteredByOthers`, `renderFacets`, `currentResults`, and URL-state code are mechanically changed from `ideasets`/`set` to `ideas`/`idea`; the `standard`/`subject` scalar handling in `facetValues` is the only semantic change.

Alternative considered: adding an `ideasets` facet now that ideas are the search subject — rejected to keep this change focused; the data is present in the payload so it can be added later.

### D3. Home result cards render idea images in order

`imageCapHtml(idea)` renders the idea's own `image_urls` in source order: fallback when empty, single `<img>` when one, otherwise a `card-carousel` capped at six — exactly the card anatomy the catalogue templates already use for idea cards. No Fisher–Yates shuffle (that was idea-set-specific `REQ-CS-010`, now removed); the unused `shuffle()` helper is deleted.

The card footer shows prop badges only when `props` is an active catalogue, mirroring `templates/catalogue.html.j2`; there is no member-count footer because ideas are not sets. The result-count label becomes `{n} युक्त्या` and the empty state "कोणतीही युक्ती सापडली नाही".

### D4. Facet types and build facets stay unchanged

`facet_types` (active catalogue types excluding `ideasets` + `standard`/`subject`) and `facet_groups` in `build.py` are unchanged, and `home.html.j2` is untouched. The only facet-side change is that the client derives values from idea records instead of idea set records (D2). `REQ-BE-015` continues to hold.

## Risks / Trade-offs

- [Home payload grows with per-idea records] → Acceptable at current content scale; payload is a single JSON file fetched once per load.
- [Idea set discovery now happens via the ideasets catalogue landing page instead of the home facets] → Intentional; the ideasets landing page already lists every set with member counts.
- [An idea with no images shows the fallback on home] → Same as every other idea card on the site; consistent.
- [Dropping `ideasets` from the payload is a breaking payload change] → Nothing else consumes it; verified by grep that only `initSearchPage` reads `data.ideasets`.

## Migration Plan

1. Edit `build.py`: add `home_idea_items()` and switch the payload from `ideasets` to `ideas`.
2. Edit `theme/app.js`: rewire `initSearchPage()` to ideas (D2, D3), update copy, delete `shuffle()`.
3. Run `python build.py`; confirm it completes and `site/ideas.json` contains `ideas` and no `ideasets`.
4. Serve `site/` and verify: home search returns idea cards linking to `/ideas/{id}/`, facet counts reflect ideas, URL state round-trips, `{n} युक्त्या` label, empty state, and the ideasets landing page still renders.
5. Rollback: revert `build.py` and `theme/app.js` from version control and rebuild; `content/` is untouched.
