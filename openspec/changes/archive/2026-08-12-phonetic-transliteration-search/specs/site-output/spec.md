# site-output Delta

## MODIFIED Requirements

### Requirement: [REQ-SO-009: Self-contained output artifacts]
Every generated artifact SHALL be entirely self-contained with no shared runtime cross-dependencies: each page SHALL reference only assets under the site's own `base_url` path, and no page SHALL depend on another page's file at runtime. The theme stylesheet and Bootstrap script SHALL be loaded from the URLs resolved by the build from `site.json` (see REQ-SO-011) and MAY reference external CDN links. The gamabhana phonetic widget script (see REQ-SO-012) SHALL be loaded from `https://www.gamabhana.com` and MAY be referenced on search pages.

#### Scenario: Pages are atomic and self-contained
- **WHEN** any generated page is hosted standalone under its `base_url`
- **THEN** it renders correctly using only its own markup, `site/assets/style.css`, and `site/assets/app.js`

#### Scenario: Theme assets may be external
- **WHEN** a page is generated with a `theme_stylesheet` configured as a full external URL
- **THEN** the page references that URL directly
- **AND** no copy of the theme stylesheet is required under `site/assets/`

#### Scenario: Phonetic widget may be external
- **WHEN** a search page is generated with the gamabhana widget launcher
- **THEN** the page references the `https://www.gamabhana.com` widget script directly
- **AND** no copy of the widget is required under `site/assets/`

## ADDED Requirements

### Requirement: [REQ-SO-012: Phonetic search input]
The build SHALL render both search inputs — the home page's `#search-input` and the catalogue pages' `.catalogue-search` — with the shared class `phonetic-input`. Home and catalogue pages SHALL include the gamabhana widget launcher script (`https://www.gamabhana.com/gamabhanaWidget/add/?mode=custom&c=phonetic-input&lang=0`) as a parse-time script tag in the body, so the widget converts Roman keystrokes into Devanagari in those inputs.

#### Scenario: Widget launcher on search pages
- **WHEN** the home page or any catalogue page is generated
- **THEN** it contains the gamabhana widget launcher script URL
- **AND** its search input carries the `phonetic-input` class

#### Scenario: Idea pages exclude the widget
- **WHEN** an idea page is generated
- **THEN** it does not include the gamabhana widget launcher script
