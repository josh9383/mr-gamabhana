## ADDED Requirements

### Requirement: [REQ-BE-011: Idea card payload enrichment]
The build SHALL expose on every idea card item used by the ideas landing page and individual catalogue pages the fields `props`, `prop_slugs`, and `image_url` in addition to `title`, `description`, `url`, `search`, and `count`, so templates can render an image cap and a props footer.

#### Scenario: Idea card items carry props
- **WHEN** the build generates `site/ideas/index.html` or any individual catalogue page
- **THEN** each idea card payload contains its `props` array and matching `prop_slugs` array
- **AND** each idea card payload contains its `image_url`

### Requirement: [REQ-BE-012: Card image resolution]
When an idea's `meta.json` has a non-empty `image` field, the build SHALL copy `content/ideas/{id}/{image}` into the idea's output directory `site/ideas/{id}/` and SHALL set a root-relative `image_url` on the idea record and on its card payloads. When the field is missing or empty, `image_url` SHALL reference the bundled fallback asset `/assets/card-fallback.png`.

#### Scenario: Idea image is copied
- **WHEN** an idea `angles` has a non-empty `image` field
- **THEN** the file `site/ideas/angles/{image}` exists after the build
- **AND** the idea's card payloads reference `/ideas/angles/{image}`

#### Scenario: Fallback image for missing image
- **WHEN** an idea has no `image` field or it is empty
- **THEN** the idea's card payloads reference `/assets/card-fallback.png`
- **AND** no image file is copied for that idea
