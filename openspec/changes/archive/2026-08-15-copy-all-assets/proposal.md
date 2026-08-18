# Proposal: copy-all-assets

## Why

`build.py` copies static assets with an explicit per-file list. Every new file added under `theme/assets/` must be hand-added to that list or it silently never ships - which is already happening: the home template's navbar renders `assets/{{ site.logo }}` (`content/site.json` sets `site.logo = "logo_light.png"`), but the build never copies any logo, so the brand image is broken in the generated site. Copying the whole assets folder removes the list and this failure mode entirely.

## What Changes

- Replace the four selective `theme/assets/...` copies in `build.py` (lines 623-626) with a single copy of the entire `theme/assets/` directory into `site/assets/`, so every file present there ships automatically.
- Keep the two explicit copies of `theme/style.css` and `theme/app.js` unchanged (they live in `theme/`, not `theme/assets/`).
- No template, JS, or content changes: templates already reference `/assets/{{ site.logo }}` and `/assets/card-fallback.png`.
- Fixes the missing navbar brand logo and any future asset that would otherwise be dropped.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `site-output`: REQ-SO-007 (Static assets copied to site) changes from an enumerated file list to copying the whole `theme/assets/` directory.

## Impact

- **Files changed**: `build.py` (asset-copy section).
- **Generated output**: `site/assets/` now additionally contains `card-fallback.svg`, `logo_color.png`, `logo_dark.png`, `logo_light.png` (and any future asset dropped into `theme/assets/`).
- **No breaking changes**: all previously copied files are still copied; the output is a strict superset.
