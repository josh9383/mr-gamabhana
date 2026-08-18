## Why

Search only matches Devanagari today: a visitor who cannot type Devanagari (no Indic keyboard layout) cannot search. gamabhana.com runs a live phonetic-input widget (script-tag integration, `mode=custom`) that converts Roman phonetic keystrokes such as `kon` into Devanagari `कोन` inside the target input as the user types. We want that capability on the site's search inputs, plus a self-contained fallback so phonetic search still works even if the external widget is unreachable.

## What Changes

- Both search inputs - the home `#search-input` and the catalogue `.catalogue-search` - gain the shared class `phonetic-input`.
- `templates/home.html.j2` and `templates/catalogue.html.j2` include the gamabhana widget launcher as a parse-time script tag:
  `https://www.gamabhana.com/gamabhanaWidget/add/?mode=custom&c=phonetic-input&lang=0`
  The widget converts keystrokes in `phonetic-input` elements to Devanagari as-you-type (verified live over HTTPS) and renders a small gamabhana branding bar.
- `theme/app.js` gains a pure, deterministic `phoneticToDevanagari()` (compact I-trans-style Roman→Devanagari mapper) applied to the query at search time on both the home and catalogue searches. It is idempotent for Devanagari (passes already-Devanagari text through unchanged), so it doubles as the fallback when the widget fails to load and as a safety net for any keystrokes the widget has not yet converted.
- No change to facets, URL state, ranking, or results rendering. No change to `content/`, `build.py`, `theme/style.css`, idea pages, `sitemap.xml`, or `ideas.json`.
- REQ-SO-009 (self-contained output artifacts) is **modified**: its external-URL exception is extended to the gamabhana widget script, which is loaded from `https://www.gamabhana.com` rather than from under `base_url`.

## Capabilities

### New Capabilities

- _(none)_

### Modified Capabilities

- `site-output`: Modify REQ-SO-009 (extend the external-URL exception to include the gamabhana widget script) and add REQ-SO-012 (phonetic search input - search inputs carry the `phonetic-input` class and search pages include the gamabhana widget launcher).
- `client-side-search`: Add REQ-CS-009 (phonetic transliteration fallback - the client script transliterates Roman queries to Devanagari at query time so searches typed in Roman still match Devanagari content, even when the widget is unavailable).

## Impact

- **Files updated**: `templates/home.html.j2`, `templates/catalogue.html.j2`, `theme/app.js`.
- **Files created**: none.
- **Dependencies**: external gamabhana widget script (HTTPS) loaded on home and catalogue pages; it injects a fixed-position branding bar and its own transliteration engine. The launcher is `document.write`-based, so it must stay a static script tag in the HTML body (never dynamically injected after parse).
- **Constraints/Limitations/Assumptions**: assume the gamabhana widget stays live and honours `mode=custom&c=phonetic-input`; assume the widget is compatible with standard `<input type="search">` elements and fires normal `input` events (so existing handlers keep working). Out-of-scope: transliteration on idea pages, a runtime keyboard switcher, and making the widget URL configurable in `site.json`.
