## MODIFIED Requirements

### Requirement: [REQ-BE-011: Idea card payload enrichment]
The build SHALL expose on every idea card item used by the ideas landing page and individual catalogue pages the fields `props`, `prop_slugs`, and `image_urls` in addition to `title`, `description`, `url`, `search`, and `count`, so templates can render an image cap and a props footer.

#### Scenario: Idea card items carry props
- **WHEN** the build generates `site/ideas/index.html` or any individual catalogue page
- **THEN** each idea card payload contains its `props` array and matching `prop_slugs` array
- **AND** each idea card payload contains its `image_urls` array

### Requirement: [REQ-BE-012: Card image resolution]
When an idea's `meta.json` has a non-empty `images` array, the build SHALL copy every listed file `content/ideas/{id}/{image}` into the idea's output directory `site/ideas/{id}/` and SHALL set a root-relative `image_urls` array on the idea record and on its card payloads, one entry per image in the same order. When the field is missing or empty, `image_urls` SHALL be an empty array and cards SHALL display the bundled fallback asset `/assets/card-fallback.png`.

#### Scenario: Idea images are copied
- **WHEN** an idea `angles` has a non-empty `images` array
- **THEN** every listed file exists under `site/ideas/angles/` after the build
- **AND** the idea's card payloads reference `/ideas/angles/{image}` for each listed image in order

#### Scenario: Fallback image for missing images
- **WHEN** an idea has no `images` field or an empty array
- **THEN** the idea's card payloads have an empty `image_urls` array
- **AND** no image file is copied for that idea
- **AND** its cards display `/assets/card-fallback.png`
