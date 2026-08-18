# build-engine Specification

## ADDED Requirements

### Requirement: [REQ-BE-022: Idea page context carries footer badges]
The build SHALL include `footer_badges` in the render context for every idea page (`site/ideas/{id}/index.html` from `templates/idea.html.j2`), computed with the same logic as idea-card footers - a list of `value`/`url` pairs from the active `catalogues` configuration for every type with `footer: true`. The context SHALL retain the idea record fields, `catalogue_attributes`, `content`, and `content_html`, and the Markdown copy render SHALL be unaffected.

#### Scenario: Idea page is generated with footer badges
- **WHEN** the build renders an idea page for an idea with active `footer: true` catalogue attributes
- **THEN** the render context contains `footer_badges` with the idea's catalogue values and their catalogue page URLs

#### Scenario: Markdown copy is unaffected
- **WHEN** the build renders `index.md` for an idea
- **THEN** it still contains the idea metadata as YAML front matter plus the body
