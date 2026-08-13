# Design — Romanize Slugs With AnyAscii

## Context

`slugify()` in `build.py` currently strips to a slug while preserving Devanagari (U+0900–U+097F):

```python
def slugify(value):
    value = str(value).strip().lower()
    value = re.sub(r"[^\w\u0900-\u097f-]+", "-", value, flags=re.UNICODE)
    return value.strip("-") or "item"
```

This yields Devanagari URLs/folders (`/boards/महाराष्ट्र-राज्य-मंडळ/`) that are hard to share and inspect. The user wants slugs romanized to ASCII with `anyascii` so file/folder names and URL paths are consistent and shareable.

## Goals / Non-Goals

**Goals:**
- Romanize non-ASCII (Devanagari) input to ASCII via `anyascii` inside `slugify()`.
- Keep the existing ASCII-slug contract: lowercase, hyphens, `item` fallback.
- Regenerate `site/` so folders, canonical URLs, sitemap, and client payload URLs are all consistent with the new slugs.

**Non-Goals:**
- No template, theme, or client-side search behavior changes.
- No changes to idea `id`s or content files.
- No transliteration *back* to Devanagari at runtime (only the forward romanization for slugs).

## Decisions

**D1 — Apply `anyascii` at the start of `slugify()`.**
Romanize first, then slugify the ASCII result. This gives one code path for ASCII and non-ASCII input:

```python
from anyascii import anyascii

def slugify(value):
    value = anyascii(str(value)).strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value, flags=re.UNICODE)
    return value.strip("-") or "item"
```

*Alternatives:* Romanizing per-field before calling `slugify` (rejected: duplicates logic); using a transliteration table by hand (rejected: `anyascii` is dependency-light, deterministic, and maintained).

**D2 — Replace the Devanagari-preserving character class.**
The old regex kept `\u0900-\u097f`; after romanization everything is ASCII, so the slug class becomes `[^a-z0-9]+`. Any leftover Unicode characters (not romanizable by `anyascii`) also collapse to hyphens.

**D3 — Determinism.**
`anyascii` is a pure character mapping — same input yields the same romanized string across runs, so generated slugs and URLs are stable for a given content set.

## Risks / Trade-offs

- **BREAKING URL/folder change** — every Devanagari-derived path changes (e.g., `/concepts/कोन/` → `/concepts/kon/`). Mitigated by regenerating `site/` in the same change and documenting the new URLs in `README.md`.
- **Romanization quality** — `anyascii` transliterations can read differently from native romanization (e.g., `महाराष्ट्र` → `mharastr`). This is accepted: the goal is consistency and reversibility, not pronunciation fidelity.
- **Collision risk** — two distinct Devanagari strings could romanize to the same slug. Accepted as low-risk for current content; `item` fallback and slug uniqueness are verified during implementation.
