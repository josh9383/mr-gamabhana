# idea-page-card Specification

## Purpose
TBD - created by syncing change idea-page-card. Update Purpose after archive.

## Requirements

### Requirement: [REQ-IDC-001: Idea pages render as a single full-content card]
Every individual idea page (`site/ideas/{id}/index.html`) SHALL render the idea as a single `card` (`.idea-page-card`) spanning the container width, instead of the article/header/badge-row/thumbnail-grid layout. The card SHALL contain the idea title, the lead description (when non-empty), the idea's photos (fallback image, single image, or fading carousel), and the full Markdown body converted to HTML. The page SHALL keep its breadcrumb, canonical URL, and `og:` meta tags.

#### Scenario: Idea page renders a single card
- **WHEN** the build generates `/ideas/m1/index.html`
- **THEN** the page contains exactly one `.idea-page-card` with the title, the description, the photos, and the converted Markdown body
- **AND** no header badge row and no `row-cols-3` thumbnail grid are present

#### Scenario: Photos use the card rendering
- **WHEN** an idea has no images, exactly one image, or multiple images
- **THEN** the card shows the fallback image, a single `card-img-top` image, or a `card-carousel` respectively, matching the idea set page card rendering

### Requirement: [REQ-IDC-002: Idea page footer badges reflect catalogue attributes]
The idea page card SHALL end with a `card-footer` listing badge links computed with the same config-driven logic as idea-card and idea set card footers, covering every active catalogue type whose definition has `footer: true` (values linking to the corresponding individual catalogue pages, and idea set values linking to `/ideasets/{slug}/`).

#### Scenario: Footer badges link to catalogue pages
- **WHEN** an idea belongs to an active `footer: true` catalogue (e.g., props, ideasets) and the page is generated
- **THEN** its card footer contains badges linking to the corresponding individual catalogue pages
- **AND** an idea set value links to `/ideasets/{slug}/`
