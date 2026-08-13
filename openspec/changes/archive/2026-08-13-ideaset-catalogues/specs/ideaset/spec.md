# ideaset Specification

## Purpose
Idea sets group related ideas into curated collections. This capability covers the `content/ideasets.json` source of truth, membership resolution from each idea's `ideasets` array, aggregated metadata for home-page search and facets, representative card imagery, and generation of idea set pages.

## Requirements

### Requirement: [REQ-IS-001: Idea set definitions]
`content/ideasets.json` SHALL be the single source of truth for idea sets. The file SHALL be a JSON object keyed by the idea set's Marathi title; each value SHALL contain `title` and a romanized `slug`. An idea set's URL SHALL be `/ideasets/{slug}/` and its page SHALL be generated at `site/ideasets/{slug}/index.html`.

#### Scenario: Idea sets load from ideasets.json
- **WHEN** the build loads `content/ideasets.json`
- **THEN** each entry provides a `title` and `slug`
- **AND** the slug is used consistently for the generated page path and URL

### Requirement: [REQ-IS-002: Idea set membership and aggregation]
The build SHALL assign an idea to an idea set when the idea's `ideasets` array contains the idea set's key. Each idea set record SHALL expose `member_count`, `member_ids`, and aggregated facet values computed as an ordered union over its member ideas: `categories`, `concepts`, `props` (each with matching slug arrays) plus `standards` and `subjects`. Ideas referencing an unknown idea set SHALL be ignored for membership; an idea set with no members SHALL still generate its page.

#### Scenario: Membership is resolved from idea metadata
- **WHEN** ideas m1 and m2 both list the idea set key `अपूर्णांकांची तोंडओळख`
- **THEN** that idea set has `member_count` equal to 2
- **AND** its aggregated `categories` contain the union of both ideas' categories in stable order

#### Scenario: Unknown idea set membership is ignored
- **WHEN** an idea's `ideasets` references a key absent from `content/ideasets.json`
- **THEN** the idea is not counted as a member of any generated idea set page

### Requirement: [REQ-IS-003: Idea set pages list member ideas]
The build SHALL render `site/ideasets/{slug}/index.html` from `templates/ideaset.html.j2`, displaying the idea set title and every member idea as a standard `card.catalogue-card` with image cap, title, description, and props footer (when the `props` catalogue is active), linking to each idea's page.

#### Scenario: Idea set page lists all members
- **WHEN** the build processes an idea set with two member ideas
- **THEN** `site/ideasets/{slug}/index.html` contains exactly two cards, each linking to its idea's `/ideas/{id}/` page

### Requirement: [REQ-IS-004: Representative idea set imagery]
Each idea set record SHALL carry `representative_image_urls`, one entry per member idea being that member's first `image_url`, in member order. Home-page idea set cards SHALL display these images as a shuffled crossfade carousel capped at six images and SHALL display the bundled fallback image when the list is empty. Shuffling SHALL happen client-side at render time so the build output stays deterministic.

#### Scenario: Representative images come from member ideas
- **WHEN** an idea set has members with images
- **THEN** its `representative_image_urls` contains the first image of each member idea
- **AND** the home-page card renders a carousel of those images in random order

#### Scenario: Fallback when no member has images
- **WHEN** no member idea of an idea set has images
- **THEN** its home-page card renders `/assets/card-fallback.png`
