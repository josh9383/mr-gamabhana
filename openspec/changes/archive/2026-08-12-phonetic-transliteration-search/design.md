## Context

Search is built on MiniSearch over Devanagari content (home index from `ideas.json`; catalogue pages index their own `.catalogue-card` text). The input fields are plain `<input type="search">` and the client logic lives in `theme/app.js` (`initSearchPage` on the home page, `initCatalogueSearch` on catalogue pages). The site is otherwise self-contained; REQ-SO-009 was recently modified to allow external theme CSS/JS URLs.

gamabhana.com provides a live phonetic-input widget: a launcher script (`https://www.gamabhana.com/gamabhanaWidget/add/?mode=…`) that, during parse, `document.write`s a small branding bar and then asynchronously loads a transliteration engine that makes elements with a given class phonetic (Roman → Devanagari as-you-type). Both `mode=all` and `mode=custom&c=<classes>` launchers were verified live over HTTPS.

## Goals / Non-Goals

**Goals:**
- Users can type Roman phonetic text (e.g., `kon`, `trikon`) in either search input and get Devanagari results.
- Primary mechanism: the gamabhana widget (as-you-type conversion inside the input, matching the requested integration).
- Fallback mechanism: a small self-contained transliterator in `app.js` so search still works phonetically if the widget is unreachable.
- Existing behavior (facets, URL state, ranking, catalogue `?tag=` pre-filter, substring fallback) is preserved.

**Non-Goals:**
- No transliteration on idea pages (no search input there).
- No runtime keyboard/layout switcher UI of our own.
- No configurable widget URL in `site.json` (fixed integration per the user request).
- No vendoring of the gamabhana engine into `theme/`.

## Decisions

**D1. Load the widget as a static parse-time script tag.**
The launcher calls `document.write` immediately, which is only safe while the parser is running. Injecting it dynamically from `app.js` would wipe the document. Therefore `templates/home.html.j2` and `templates/catalogue.html.j2` get a plain `<script src="https://www.gamabhana.com/gamabhanaWidget/add/?mode=custom&c=phonetic-input&lang=0"></script>` placed in the body just before `app.js`.
Rationale: only viable integration given `document.write`; static tags are consistent with how the theme/bootstrap scripts are loaded.
Alternative: dynamic injection (rejected - would destroy the page).

**D2. Target the search inputs with one shared class.**
Add `phonetic-input` to both `#search-input` (home) and `.catalogue-search` (catalogue) inputs and launch the widget with `mode=custom&c=phonetic-input&lang=0`. `c` is a comma-separated class list the widget passes into its engine URL (verified in the live launcher output).
Rationale: one integration hook shared by both search pages; idea pages simply have no such element.

**D3. Always transliterate the query at search time (the fallback).**
Add a pure function `phoneticToDevanagari(text)` to `app.js` and apply it to the query right before it is fed to MiniSearch / substring matching on both the home page (`state.q`) and catalogue pages (search value and `?tag=` value). The function only rewrites ASCII letter sequences; Devanagari characters pass through untouched, making it idempotent. This avoids any need to detect whether the widget attached, and it covers three cases:
- widget active → the field value is already Devanagari → function is a no-op;
- widget failed to load → the field value stays Roman → function converts it;
- widget lagging a keystroke → the current value is converted exactly once.
Rationale: deterministic, single code path, no timing/race detection; trivially testable headlessly.
Alternative: feature-detect the widget (rejected - no reliable global/API contract from the packed launcher).

**D4. Compact I-trans-style transliteration.**
`phoneticToDevanagari` implements a longest-match syllable mapper: normalize case and Unicode diacritics (`ā ī ū ṛ ṅ ñ ṭ ḍ ṇ ś ṣ ḷ`), map digraphs (`kh ch th ph bh gh jh ṭh ḍh sh ksh` etc.), apply implicit `a`, vowel matras, and the halant (`्`) before a following consonant. Includes Marathi `ळ` and the `क्ष`/`ज्ञ` conjuncts. Pure, dependency-free, ~70 lines.
Rationale: vanilla-stack compliance; `indic-transliteration` would be a heavyweight external-library exception for a fallback path.
Limitation: approximate for unusual spellings - acceptable because MiniSearch runs with `fuzzy: 0.2` and the primary path is the gamabhana widget.

**D5. Keep existing event handlers untouched.**
The widget produces Devanagari through the normal value + `input` event path. Our listeners stay exactly as they are; only the query string passed into the search pipeline is wrapped by `phoneticToDevanagari`.
Rationale: minimal diff, preserves all current tested behavior.

**D6. Extend the REQ-SO-009 exception to the widget URL.**
The self-containment rule already permits configured theme stylesheet/script URLs; extend the exception to the fixed gamabhana widget script URL.
Rationale: keeps the guarantee honest - one documented, pinned external script beyond the theme pair.

## Risks / Trade-offs

- [Widget uses `document.write`] → Mitigation: static parse-time tag only; never dynamic injection (D1).
- [Widget service becomes unavailable] → Mitigation: D3 fallback keeps phonetic search working with zero external calls.
- [Double transliteration] → Mitigation: idempotent mapper (D3); widget-converted Devanagari is never re-converted.
- [Branding bar injected by widget] → Accepted trade-off of the requested free integration; widget already shows it on gamabhana-owned properties.
- [Fallback mapping inaccuracy for exotic spellings] → Mitigation: fuzzy MiniSearch matching; widget remains primary.
- [Widget's engine loads asynchronously] → Mitigation: D3 runs on every input event, so any missed keystroke is still converted at query time.

## Migration Plan

No content changes. Rebuild with `python build.py` to include the widget tag and `phonetic-input` class. Rollback: remove the widget script tag and the class, and strip the query-time transliteration from `app.js`, then rebuild.

## Open Questions

None blocking. Minor: the widget branding bar position/behaviour is controlled by the external widget and is not customisable here.
