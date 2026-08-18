# Home page shows ideas

## Why

The home page currently runs the search experience over idea sets: the client index is built from `ideasets`, result cards are idea set cards, and the count reads "{n} संच". The user wants the home page to search and display individual ideas instead, so visitors can discover and open specific ideas directly from the home search.

## What Changes

- **Home search targets ideas:** `site/ideas.json` carries a full `ideas` array again (board, standard, subject, categories/concepts/props with slugs, ideasets with slugs, image_urls); the home MiniSearch index is built over ideas, not idea sets.
- **BREAKING - Payload:** The `ideasets` array is removed from `site/ideas.json` (nothing consumes it after this change); the payload becomes `site` + `ideas` + `catalogues`.
- **Home result cards are idea cards:** Cards show the idea's own images in order (single image, carousel, or fallback), title, description, and prop badges (only when the `props` catalogue is active); they link to `/ideas/{id}/`. No member-count footer, no representative-image carousels, no client-side shuffle.
- **Facets unchanged in shape:** The same facet types (`catalogue_attributes` excluding `ideasets`, plus `standard` and `subject`) now aggregate values from each idea's own fields - `standard`/`subject` as scalars, catalogue arrays for the multi-valued types.
- **Copy updated:** Result count becomes "{n} युक्त्या" and the empty state reads "कोणतीही युक्ती सापडली नाही".
- **Idea set pages and the ideasets catalogue landing page are unchanged:** only the home search experience moves from idea sets back to ideas.

## Capabilities

### New Capabilities

- None - this change reverses part of the earlier ideaset-catalogues change for the home page; no new domain concept is introduced.

### Modified Capabilities

- `build-engine`: The `site/ideas.json` payload exposes per-idea home-index records with all fields needed for search, facets, and card rendering.
- `site-output`: The home page search operates over ideas (REQ-SO-001); the payload drops `ideasets` and includes `ideas` (REQ-SO-005); the home idea-set card imagery requirement is removed (REQ-SO-014).
- `client-side-search`: The home index, result cards, and facet values all switch from idea sets to individual ideas (REQ-CS-006/007/008); the idea-set representative-carousel requirement is removed (REQ-CS-010).
- `ideaset`: `representative_image_urls` remains on idea set records for the ideasets catalogue landing page but is no longer used for home-page cards (REQ-IS-004).

## Impact

- `build.py` - serialize home-index idea records into `site/ideas.json`; drop `ideasets` from the payload.
- `theme/app.js` - `initSearchPage()` indexes and renders ideas; facet values read per-idea fields; idea card anatomy; copy changes; remove the shuffle helper and representative-carousel rendering.
- `templates/home.html.j2` - unchanged (panels and results are data-driven).
- Regenerated `site/` output.
- No `content/` or dependency changes.
