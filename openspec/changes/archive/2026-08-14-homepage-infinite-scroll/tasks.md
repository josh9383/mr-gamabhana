## 1. Template

- [x] 1.1 Add a static sentinel `<div id="search-more" aria-live="polite"></div>` to `templates/home.html.j2`, directly after the `#search-results` container (REQ-CS-013).

## 2. JavaScript (theme/app.js)

- [x] 2.1 Add `const PAGE_SIZE = 6`, `let loadedPage = 0`, and `let loadingMore = false` to `initSearchPage()` alongside `state` (REQ-CS-013).
- [x] 2.2 Extract the idea card template literal from `renderResults()` into a `cardHtml(idea)` function and use it for every rendered page (REQ-CS-006, REQ-CS-013).
- [x] 2.3 Slice in `renderResults()`: render only `currentResults().slice(0, (loadedPage + 1) * PAGE_SIZE)` while the total count keeps showing `currentResults().length` (REQ-CS-011, REQ-CS-013).
- [x] 2.4 Add `resetAndRender()` that sets `loadedPage = 0` and calls `render()`; route the navbar input listener, Tom Select `onChange`, `clear-facets`, `applySuggestion`, and `applyState` through it so any filter change restarts pagination (REQ-CS-011, REQ-CS-013).
- [x] 2.5 Add `loadNextPage()` that guards with `loadingMore`, increments `loadedPage`, re-renders the slice, and updates the sentinel state (REQ-CS-013).
- [x] 2.6 Add an `IntersectionObserver` on `#search-more` that calls `loadNextPage()` when the sentinel becomes visible, and `unobserve()` it once all results are loaded (REQ-CS-013).
- [x] 2.7 Add graceful degradation: when `IntersectionObserver` is undefined, render all matching ideas at once (REQ-CS-013).
- [x] 2.8 Show the end-of-list state in `#search-more` (e.g., `सर्व युक्त्या पाहिल्या`) once every matching idea is loaded, and clear the sentinel when no results match (REQ-CS-013).
- [x] 2.9 Run `node --check theme/app.js` to confirm the script is syntactically valid (REQ-CS-013).

## 3. CSS (theme/style.css)

- [x] 3.1 Add minimal `#search-more` and end-of-list styles (centered, muted, small padding) using `var(--bs-*)` tokens and no inline styles (REQ-CS-013).

## 4. Verification

- [x] 4.1 Run `python build.py` and confirm it completes without errors (REQ-CS-013).
- [x] 4.2 Serve `site/` and confirm the home page renders the first page (up to 6 ideas) of the full set with the total count shown (REQ-CS-011, REQ-CS-013).
- [x] 4.3 Confirm scrolling to the bottom appends the next page and that the end-of-list state appears once all matching ideas are loaded (REQ-CS-013).
- [x] 4.4 Confirm changing the query or a facet resets the listing to the first page and restarts scroll loading (REQ-CS-011, REQ-CS-013).
- [x] 4.5 Confirm no pagination parameters appear in the URL and a reload starts again from the first page (REQ-CS-013).
- [x] 4.6 Confirm no duplicates are appended when the sentinel stays visible and that catalogue pages are unaffected (REQ-CS-013).
