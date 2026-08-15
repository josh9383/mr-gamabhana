# site-output Specification

## MODIFIED Requirements

### Requirement: [REQ-SO-002: Idea pages with HTML and Markdown copies]
The build SHALL generate, for every idea, a directory `site/ideas/{id}/` containing `index.html` and `index.md`. The HTML page SHALL render the idea as a single full-width card (the `idea-page-card` capability): a `card-body` with the title, description, photos, and the converted Markdown body, plus a `card-footer` of badge links computed from the active `catalogues` configuration (every type with `footer: true`), covering the catalogue pages that exist and each idea set the idea belongs to. The Markdown copy SHALL reproduce the idea metadata as YAML front matter plus the body.

#### Scenario: Idea directory contains both copies
- **WHEN** the build processes an idea with id `m1`
- **THEN** `site/ideas/m1/index.html` and `site/ideas/m1/index.md` exist
- **AND** the HTML page contains a single `.idea-page-card` whose footer links to the idea's catalogue pages and idea set pages
- **AND** it does not link to boards, standards, or subjects catalogue pages when they are not active

#### Scenario: Idea page drops the header badge row and thumbnail grid
- **WHEN** an idea page is generated
- **THEN** it contains no separate header badge row and no `row-cols-3` thumbnail grid
