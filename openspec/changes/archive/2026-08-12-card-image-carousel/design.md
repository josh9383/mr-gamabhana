# Card image carousel - Design

## Context

The `use-standard-cards` change shipped cards as `<a class="card catalogue-card">` with a single `card-img-top` image cap, `card-body` (`card-title` + `card-text`), and a data-driven `card-footer`. Ideas support one optional `image` file in `content/ideas/{id}/meta.json`; `build.py` resolves it to a root-relative `image_url` (falling back to `theme/assets/card-fallback.png`), and `templates/catalogue.html.j2` plus `renderResults()` in `theme/app.js` render the single image.

This change extends ideas to hold several images and makes the card image cap cycle through them with a timed CSS crossfade. Constraints that shape the design: strictly vanilla stack, no inline styles or inline scripts, self-contained `site/` output under `base_url`, and Bootstrap/Bootswatch card anatomy preserved.

## Goals / Non-Goals

**Goals:**
- Replace the `image` field with an `images` array in the idea schema and content files.
- The build copies every listed image into `site/ideas/{id}/` and exposes an `image_urls` array on idea records and card payloads.
- Image cap behaviour: one image → single `card-img-top`; two or more → pure-CSS crossfade carousel cycling up to 6 images; none → bundled fallback SVG.
- Identical card markup from the Jinja template and from the JS-rendered home search results.
- All cap variants share a consistent 16:9 aspect ratio to keep cards equal height.

**Non-Goals:**
- No JS carousel logic (no timers, state, or DOM manipulation for cycling).
- No carousel controls (arrows, dots, autoplay switch); the cycle is decorative.
- No changes to card body, footer, filtering hooks, or search behaviour.

## Decisions

### Decision: Rename `image` to `images` (array) in the idea schema
`meta.json` gains `"images": []` in place of the empty `image` field (explicit user decision; additive). The build reads `(idea.get("images") or [])` and tolerates a missing field (treats it as no images). REQ-CM-002 is updated accordingly.

### Decision: The build exposes an `image_urls` array; the empty case is a rendering concern
For each entry in `images`, the build copies `content/ideas/{id}/{image}` to `site/ideas/{id}/{image}` and appends `/ideas/{id}/{image}` to `image_urls`; missing or empty `images` yields an empty array. The template and JS branch on `image_urls.length` (0 → fallback SVG, 1 → single img, ≥2 → carousel). Keeping fallback handling in the render layer means `image_urls` stays purely the list of real images and catalogue landing cards (no images at all) naturally render the fallback.

### Decision: Pure-CSS crossfade carousel using per-count classes and keyframes
No inline styles are allowed, so the cycle is driven by static CSS. Each card cap container uses:

- `.card-carousel` — `position: relative`, `aspect-ratio: 16/9`, `overflow: hidden`; images are absolutely positioned, `inset: 0`, `width/height: 100%`, `object-fit: cover`, starting at `opacity: 0`.
- Per-count keyframes `card-carousel-fade-2` … `card-carousel-fade-6` where each image is fully opaque for exactly one `100/N` slot with a ~0.4 s fade on each side.
- Per-count modifier classes `.card-carousel--N` setting `animation-duration: N * 3s` on the images and a staggered `animation-delay: (i-1) * 3s` per `:nth-child(i)`.

The template/JS emits `<div class="card-carousel card-carousel--N">` with one `<img>` per image. This needs no inline styles and no script; the cycle is pure CSS. Up to 6 images are cycled; if an idea lists more, only the first 6 are rendered (documented limit).

### Decision: Uniform 16:9 image caps with `object-fit: cover`
All image caps — single, carousel, and fallback — render at `aspect-ratio: 16/9` with `object-fit: cover` (the fallback SVG is already 16:9, so it is unaffected). This avoids layout shift when the first image loads and keeps every card in a row the same height. Alternative (natural aspect per image) rejected because mixed aspect ratios would misalign cards and cause layout jump.

### Decision: Respect `prefers-reduced-motion`
A `@media (prefers-reduced-motion: reduce)` block disables the cycling animation, so the first image of a multi-image cap is shown statically. This keeps the decoration accessible without any script.

### Decision: JS-rendered home results share the same markup
`renderResults()` in `theme/app.js` emits the same three cases using template literals and the existing `escapeHtml` helper. The MiniSearch `storeFields` gain `image_urls` (the build already serializes it in `ideas.json`). Image `src` values use the existing `baseUrl + <root-relative path>` pattern.

## Risks / Trade-offs

- [Hard cap of 6 cycled images] → Documented in the specs; idea metadata rarely exceeds a few images; any extras are omitted from the cap.
- [Multiple `<img>` elements all download regardless of visibility] → Opacity-animated images stay in the DOM and load; acceptable for a static site with few, small images; `loading="lazy"` is applied to each.
- [Non-16:9 idea images are cropped by `object-fit: cover`] → Trade-off for consistent card heights; authors control the crop by choosing image framing.
- [Crossfade may flash under some themes] → Fade windows are short (0.4 s) and use smooth `ease`; verified against the active Bootswatch theme during implementation.

## Migration Plan

1. Update the two `content/ideas/*/meta.json` files (`image` → `images: []`).
2. Update `build.py` (read `images`, copy each file, set `image_urls` on records + card payloads).
3. Update `templates/catalogue.html.j2` (single / carousel / fallback image cap), `theme/style.css` (carousel rules + per-count keyframes/classes + reduced-motion), and `theme/app.js` (storeFields + `renderResults()`).
4. Regenerate `site/` with `python build.py` and verify single, multi, and fallback caps on catalogue pages and the home search page.
5. Rollback: revert the four source files and rebuild; `meta.json` arrays stay valid metadata regardless.

## Open Questions

- None blocking; default timing (3 s per image, 0.4 s crossfade) is a reasonable starting point and is easy to tune in `theme/style.css`.
