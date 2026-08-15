# ideaset-page-cards Specification

## Purpose
TBD - created by syncing change ideaset-page-cards. Update Purpose after archive.

## Requirements

### Requirement: [REQ-IPC-001: Idea set pages render full-content cards]
Every individual idea set page (`site/ideasets/{slug}/index.html`) SHALL render each member idea as a `card` inside a single-column list container, instead of an accordion. Each card SHALL show the member idea's title (linked to the idea page), its photos (fallback image, single image, or fading carousel), its full details (description and Markdown body converted to HTML), and a footer of badge links derived from the active catalogue configuration. The cards SHALL be stacked in one column at every screen size.

#### Scenario: Idea set page lists member cards
- **WHEN** the build generates `/ideasets/fractions-introduction/index.html`
- **THEN** the page contains one `card` per member idea, each with a linked title, photos, the idea's converted Markdown body, and a footer of catalogue-attribute badges
- **AND** no Bootstrap accordion structure is present

#### Scenario: Cards occupy a single column
- **WHEN** the idea set page is viewed at any screen width
- **THEN** the member cards are laid out in a single column spanning the container width

### Requirement: [REQ-IPC-002: Progressive reveal on scroll]
The idea set page SHALL reveal the member idea cards progressively: the first card SHALL be visible on load, and subsequent cards SHALL be revealed one per scroll step as a sentinel element enters the viewport. When all cards are revealed, the page SHALL display an end-of-list marker. All cards SHALL remain present in the DOM so the page works without JavaScript, and the reveal SHALL be disabled under `prefers-reduced-motion`.

#### Scenario: First card visible, rest revealed on scroll
- **WHEN** the idea set page loads with JavaScript enabled
- **THEN** the first member card is visible and the remaining cards are hidden until the sentinel scrolls into view
- **AND** each sentinel intersection reveals the next card until an end-of-list marker appears

#### Scenario: Page works without JavaScript
- **WHEN** the idea set page loads without JavaScript
- **THEN** every member card is visible in the single-column list

### Requirement: [REQ-IPC-003: Footer badges reflect catalogue attributes]
The footer of each idea set page card SHALL list badge links computed the same way as idea-card footers, covering every active catalogue type whose definition has `footer: true` (values linking to the corresponding individual catalogue pages, and idea set values linking to `/ideasets/{slug}/`).

#### Scenario: Card footers link to catalogue pages
- **WHEN** a member idea has props and the `props` catalogue is active with `footer: true`
- **THEN** its card footer contains a badge linking to the prop's individual catalogue page
- **AND** an idea set value links to `/ideasets/{slug}/`
