# ideaset Delta

## MODIFIED Requirements

### Requirement: [REQ-IS-004: Representative idea set imagery]
Each idea set record SHALL carry `representative_image_urls`, one entry per member idea being that member's first `image_url`, in member order. The ideasets catalogue landing page SHALL display these images as the card image cap and SHALL display the bundled fallback image when the list is empty. Home-page idea set cards SHALL NOT render these images, since the home page displays individual idea cards instead.

#### Scenario: Representative images come from member ideas
- **WHEN** an idea set has members with images
- **THEN** its `representative_image_urls` contains the first image of each member idea
- **AND** its landing-page card renders those images as the image cap

#### Scenario: Fallback when no member has images
- **WHEN** no member idea of an idea set has images
- **THEN** its landing-page card renders `/assets/card-fallback.png`
