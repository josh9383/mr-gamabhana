# Gamabhana — Single-language static content site

One repository represents one language.

## Content model

- `content/site.json` is the site configuration (`title`, `description`, `language`, `base_url`).
- Each idea is a self-contained directory `content/ideas/<id>/` with `meta.json` (idea metadata) and `meta.md` (idea body).
- `board`, `standard`, `subject`, `category`, and `tags` are idea metadata.
- `standard` means grade/standard.
- Slugs and URL paths are romanized ASCII (via `anyascii`), so folder names, canonical URLs, and sitemap entries are consistent and shareable.
- Tags on idea pages link directly to their tag catalogue pages.

## Generated site

The build generates:

- SEO-friendly HTML pages for ideas.
- Markdown copies of ideas.
- Home page: the MiniSearch-powered full-text + faceted search page (search box, board/standard/subject/category/concept/material facet panels with live counts, ranked prefix/fuzzy results, URL-shareable state).
- Board, standard, subject, category, and tag catalogue landing pages.
- Individual pages for every board, standard, subject, category, and tag, each with MiniSearch filtering over the page's own cards.
- Client-side searchable/filterable catalogue pages.
- `ideas.json` for client-side search.
- `sitemap.xml`.

## Local setup

```bash
python -m venv .venv
```

Activate the environment, then:

```bash
pip install -r requirements.txt
python build.py
python -m http.server 8000 --directory site
```

Open:

http://localhost:8000

## Search

The home page is the search experience, powered by [MiniSearch](https://lucaong.github.io/minisearch/) 7.2.0 (MIT, zero dependencies), vendored locally as `theme/assets/minisearch.min.js` and copied to `site/assets/minisearch.min.js`. Catalogue pages run MiniSearch over their own cards too, falling back to substring filtering if the library is unavailable.

## GitHub Pages

Push to `main`.

Then enable:

Settings → Pages → Source → GitHub Actions

Every push rebuilds the complete static site and deploys it.

Before publishing, change `site.base_url` in `content/site.json` to the actual GitHub Pages URL or custom domain.
