## MODIFIED Requirements

### Requirement: [REQ-BE-014: Idea set pages rendered as member accordions]
The build SHALL render `site/ideasets/{slug}/index.html` from `templates/ideaset.html.j2` for every idea set, providing for each member idea an accordion item payload containing `title`, `url`, `description`, `image_urls`, and `content_html` (the idea's Markdown body converted to HTML with the `extra` and `toc` extensions).

#### Scenario: Idea set page is generated with member accordion payloads
- **WHEN** the build completes
- **THEN** `site/ideasets/fractions-introduction/index.html` exists
- **AND** it contains one accordion item per member idea, each carrying the idea's title, url, description, images, and converted Markdown body
