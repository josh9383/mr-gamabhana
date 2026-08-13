# Card image carousel - Tasks

## 1. Content model

- [x] 1.1 Replace the `image` field with `images: []` in `content/ideas/fraction_1/meta.json`
- [x] 1.2 Replace the `image` field with `images: []` in `content/ideas/triangles/meta.json`

## 2. Build engine

- [x] 2.1 Read the `images` array and set `image_urls` on each idea record (replacing `image_url`) — REQ-BE-011, REQ-BE-012
- [x] 2.2 Copy every listed image `content/ideas/{id}/{image}` into `site/ideas/{id}/` (skip entries whose file is missing) — REQ-BE-012
- [x] 2.3 Carry `image_urls` into idea card payloads for both the ideas landing page (`idea_items`) and individual catalogue page cards (`item_cards`) — REQ-BE-011

## 3. Theme CSS

- [x] 3.1 Add `.card-carousel` container and `.card-carousel img` rules (relative, `aspect-ratio: 16/9`, overflow hidden, absolutely positioned images, `object-fit: cover`, `opacity: 0`) — REQ-SO-003, REQ-SO-004
- [x] 3.2 Add per-count keyframes `card-carousel-fade-2` through `card-carousel-fade-6` and `.card-carousel--N` classes with per-image `animation-duration` and staggered `nth-child` `animation-delay` — REQ-SO-003, REQ-SO-004
- [x] 3.3 Add a `prefers-reduced-motion: reduce` rule so the first image shows statically — REQ-SO-003, REQ-SO-004
- [x] 3.4 Apply a uniform `aspect-ratio: 16/9` and `object-fit: cover` to all card image caps (single `card-img-top` and fallback) so caps stay consistent — REQ-SO-003, REQ-SO-004

## 4. Templates

- [x] 4.1 Update the card image cap in `templates/catalogue.html.j2` to branch on `item.image_urls`: empty → fallback image; length 1 → single `card-img-top`; length ≥2 → `card-carousel card-carousel--N` wrapper with one `img` per image (up to 6) — REQ-SO-003, REQ-SO-004

## 5. Client-side search

- [x] 5.1 Replace `image_url` with `image_urls` in the MiniSearch `storeFields` in `theme/app.js` — REQ-CS-006
- [x] 5.2 Update `renderResults()` to emit the fallback / single / carousel image cap from `idea.image_urls` using `escapeHtml` and `baseUrl` — REQ-CS-006

## 6. Build and verify

- [x] 6.1 Run `python build.py` to regenerate `site/`
- [x] 6.2 Verify `image_urls` flows through `ideas.json` and generated pages (single and fallback cases on `site/ideas/` and catalogue pages)
- [x] 6.3 Temporarily set two placeholder images on one idea, rebuild, and verify the crossfade carousel markup (`card-carousel--2`, two `img` elements, keyframes/classes present); then restore `images: []` and rebuild
- [x] 6.4 Verify home-page search results render the image cap cases (fallback/single/carousel) from `image_urls`
- [x] 6.5 Confirm filtering hooks (`.catalogue-card`, `data-search`) are intact and `content/` changed only by the `image` → `images` field rename
