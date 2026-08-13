# Tasks

## 1. Dependency

- [x] 1.1 Add `anyascii` to `requirements.txt`

## 2. Build Engine

- [x] 2.1 Update `slugify()` in `build.py` to romanize input with `anyascii` first, then apply ASCII slugification (lowercase, `[^a-z0-9]+` → hyphens, strip, `item` fallback)
- [x] 2.2 Confirm Devanagari metadata romanizes deterministically (e.g., `कोन` → `kon`, `महाराष्ट्र राज्य मंडळ` → `mharastr-rajy-mmdl`)

## 3. Docs

- [x] 3.1 Update `README.md` to note that slugs/URLs are romanized ASCII (no Devanagari in paths)

## 4. Verify

- [x] 4.1 Run `python build.py` and confirm the site builds with no errors
- [x] 4.2 Verify `site/`: folders, canonical URLs, sitemap, and `site/ideas.json` URLs are all ASCII romanized and mutually consistent
- [x] 4.3 Run a repo-wide grep to confirm no generated path references Devanagari in `site/` and no live code still preserves Devanagari in slugs
