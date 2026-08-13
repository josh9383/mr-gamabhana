## MODIFIED Requirements

### Requirement: [REQ-SO-013: Idea set pages]
The build SHALL generate `site/ideasets/{slug}/index.html` for every idea set from `templates/ideaset.html.j2`, rendering the idea set title and its member ideas as a Bootstrap accordion with one item per member idea. Each accordion item header SHALL show the member idea's title, and its body SHALL contain the member idea's images and details (description and Markdown body converted to HTML). Idea set pages SHALL NOT render catalogue cards and SHALL NOT include the catalogue search experience.

#### Scenario: Idea set pages render member accordions
- **WHEN** the build completes
- **THEN** `site/ideasets/{slug}/index.html` exists for every idea set
- **AND** it contains one accordion item per member idea, each with the idea's title in the header and the idea's images and details in the body

#### Scenario: Idea set pages drop the card search
- **WHEN** an idea set page is generated
- **THEN** it contains no `.catalogue-search` input, no MiniSearch script, and no gamabhana widget launcher
