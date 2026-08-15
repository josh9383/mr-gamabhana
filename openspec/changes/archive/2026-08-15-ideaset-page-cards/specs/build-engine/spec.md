# build-engine Specification

## MODIFIED Requirements

### Requirement: [REQ-BE-014: Idea set pages rendered as member cards]
The build SHALL render `site/ideasets/{slug}/index.html` from `templates/ideaset.html.j2` for every idea set, providing for each member idea a card payload containing `title`, `url`, `description`, `image_urls`, `content_html` (the idea's Markdown body converted to HTML with the `extra` and `toc` extensions), and `footer_badges` (a list of `value`/`url` pairs computed with the same logic as idea-card footers from the active `catalogues` configuration). The payload SHALL NOT include accordion-specific fields.

#### Scenario: Idea set page is generated with member card payloads
- **WHEN** the build completes
- **THEN** `site/ideasets/fractions-introduction/index.html` exists
- **AND** it contains one card per member idea, each carrying the idea's title, url, description, images, converted Markdown body, and footer badges
