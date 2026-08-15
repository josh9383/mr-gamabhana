# site-output Specification

## MODIFIED Requirements

### Requirement: [REQ-SO-013: Idea set pages]
The build SHALL generate `site/ideasets/{slug}/index.html` for every idea set from `templates/ideaset.html.j2`, rendering the idea set title and its member ideas as full-content cards in a single-column list with progressive on-scroll reveal (the `ideaset-page-cards` capability). Each card SHALL show the member idea's title, photos, details (description and Markdown body converted to HTML), and catalogue-attribute footer badges. Idea set pages SHALL NOT include the catalogue search experience and SHALL NOT use the Bootstrap accordion structure.

#### Scenario: Idea set pages render member cards
- **WHEN** the build completes
- **THEN** `site/ideasets/{slug}/index.html` exists for every idea set
- **AND** it contains one full-content card per member idea in a single-column list with a reveal sentinel

#### Scenario: Idea set pages drop the card search
- **WHEN** an idea set page is generated
- **THEN** it contains no `.catalogue-search` input, no MiniSearch script, no gamabhana widget launcher, and no accordion markup
