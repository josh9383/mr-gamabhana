# Card image carousel for multiple idea images

## Why

Cards currently support at most one image per idea via the optional `image` field, so ideas with several visuals can only ever show a single static image cap. Extending the field to an `images` array lets a card cycle through all of an idea's images with a timed CSS crossfade, making each card more representative of the idea.

## What Changes

- **BREAKING** Replace the optional `image` field in idea `meta.json` with an `images` array of image file names. The previously added empty `image` field becomes an empty `images` array.
- The build resolves each entry in `images` to a root-relative URL, copies every image file into `site/ideas/{id}/`, and exposes an `image_urls` array on idea records and idea card payloads (replacing `image_url`).
- Card image cap behaviour: one image renders as a plain `card-img-top`; two or more images render a CSS-animated crossfade carousel that cycles through the images with timely fades; no images fall back to the bundled placeholder SVG.
- The carousel is pure CSS (per-count keyframes and modifier classes), satisfying the no-inline-styles constraint, and supports cycling up to 6 images per card.
- Home-page search results (JS-rendered cards in `theme/app.js`) use the same carousel markup; the MiniSearch `storeFields` carry `image_urls`.
- **Explicit user decision**: the existing `content/ideas/*/meta.json` files are updated (`image` → `images: []`). Strictly additive — no metadata beyond the field rename is changed.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `content-model`: The idea record schema (REQ-CM-002) replaces the optional `image` field with the optional `images` array.
- `build-engine`: Multi-image resolution (REQ-BE-011, REQ-BE-012) — the build copies every listed image and exposes an `image_urls` array on idea records and card payloads.
- `site-output`: The card image cap (REQ-SO-003, REQ-SO-004) supports a cycling crossfade carousel when an idea has multiple images.
- `client-side-search`: Search result cards (REQ-CS-006) render the carousel from an `image_urls` store field.

## Impact

- `content/ideas/angles/meta.json`, `content/ideas/triangles/meta.json` — `image` → `images: []` (explicit user decision).
- `build.py` — image field resolution, per-file copy, payload enrichment (`image_urls`).
- `templates/catalogue.html.j2` — card image cap markup (single / carousel / fallback).
- `theme/style.css` — carousel container rules, per-count keyframes, and delay/duration classes.
- `theme/app.js` — `storeFields` and `renderResults()` emit the carousel markup.
- Regenerated `site/` output.
- `theme/assets/card-fallback.png` stays as the no-image fallback.
