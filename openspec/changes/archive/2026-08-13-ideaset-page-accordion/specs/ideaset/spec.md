## MODIFIED Requirements

### Requirement: [REQ-IS-003: Idea set pages list member ideas as an accordion]
The build SHALL render `site/ideasets/{slug}/index.html` from `templates/ideaset.html.j2`, displaying the idea set title and every member idea as an accordion item. Each accordion item header SHALL show the member idea's title, and its body SHALL show the member idea's images and details (description and Markdown body converted to HTML), linking to the idea's page where appropriate. Idea set pages SHALL NOT display member ideas as `card.catalogue-card` entries.

#### Scenario: Idea set page lists all members as accordion items
- **WHEN** the build processes an idea set with two member ideas
- **THEN** `site/ideasets/{slug}/index.html` contains exactly two accordion items, one per member idea, each with the idea's title in its header
- **AND** each item's body contains that idea's images and converted Markdown details

#### Scenario: Idea set pages contain no catalogue cards
- **WHEN** the build generates an idea set page
- **THEN** the page contains no `card.catalogue-card` element
