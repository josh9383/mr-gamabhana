# build-engine Delta

## ADDED Requirements

### Requirement: [REQ-BE-009: Theme configuration resolution]
The build SHALL read the optional `theme_stylesheet` and `bootstrap_script` fields from `content/site.json` and expose the resolved values in the template context on every render. A field with a non-empty value SHALL be used as-is; a missing or empty field SHALL fall back to the default constants (Bootswatch Vapor 5.3.3 stylesheet and Bootstrap 5.3.3 JS bundle via jsDelivr).

#### Scenario: Custom theme fields are used
- **WHEN** `content/site.json` sets a non-empty `theme_stylesheet` value
- **THEN** every template render receives that exact URL as `site.theme_stylesheet`

#### Scenario: Defaults applied for absent fields
- **WHEN** `content/site.json` omits the `theme_stylesheet` field
- **THEN** the render context contains the default Bootswatch Vapor stylesheet URL

#### Scenario: Bootstrap script resolved alongside theme
- **WHEN** the build resolves theme configuration
- **THEN** both `theme_stylesheet` and `bootstrap_script` values are present in the template context for every page
