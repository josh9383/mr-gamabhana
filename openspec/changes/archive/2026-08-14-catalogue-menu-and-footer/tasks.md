## 1. Core Build Engine Updates

- [ ] 1.1 In `build.py`, update `DEFAULT_CATALOGUES` to include `"menu": True, "footer": True` for every fallback entry.
- [ ] 1.2 In `build.py`, update `load_catalogue_defs(site)` to ensure every catalogue definition has defaulted flags: `{"facet": True, "menu": True, "footer": True, **entry}`.
- [ ] 1.3 In `build.py`, derive `menu_groups` as a list of `(key, title, path_name)` tuples from `catalogue_defs` where `menu` is true. Add `menu_groups` to `base_context`.
- [ ] 1.4 In `build.py`, derive `footer_types` as a list of keys from `catalogue_defs` where `footer` is true.
- [ ] 1.5 In `build.py`, implement `footer_badges_for(idea, catalogue_defs, footer_types)` returning a list of `{"value": val, "url": f"/{path_name}/{slug}/"}` dicts, handling single/multi mode appropriately.
- [ ] 1.6 In `build.py`, update the `idea_card` function and payload to include `footer_badges`.
- [ ] 1.7 In `build.py`, update the `home_idea_items` payload function to include `footer_badges` for each idea in `site/meta.json`.

## 2. Template and UI Updates

- [ ] 2.1 Update the main navbar in `templates/home.html.j2` to render nav links for `menu_groups` after the brand but before the search box, using small-screen friendly wrapping styles.
- [ ] 2.2 Update the navbar in `templates/catalogue.html.j2` to render the same navbar links from `menu_groups`.
- [ ] 2.3 Update the navbar in `templates/idea.html.j2` to render the same navbar links from `menu_groups`.
- [ ] 2.4 Update the navbar in `templates/ideaset.html.j2` to render the same navbar links from `menu_groups`.
- [ ] 2.5 Update `templates/catalogue.html.j2` idea card footer rendering: replace the `props` check with a generic loop over `item.footer_badges`.

## 3. Client-Side Search Updates

- [ ] 3.1 In `theme/app.js`, add `footer_badges` to the MiniSearch `storeFields`.
- [ ] 3.2 In `theme/app.js`, update `cardHtml` to render the list of badges from `idea.footer_badges` (replacing the props-only block) using consistent Bootstrap styling.

## 4. Verification and Build

- [ ] 4.1 Run the build script `python build.py` and verify zero compilation/generation errors.
- [ ] 4.2 Validate `site/meta.json` contains `footer_badges` for each idea in the payload.
- [ ] 4.3 Verify the main navbar on the home page and individual pages displays the active catalogue links.
- [ ] 4.4 Verify card footers on the home page search results display badges for all configured footer types.
- [ ] 4.5 Verify card footers on the individual catalogue landing/item pages display badges for all configured footer types.
- [ ] 4.6 Verify content directory is byte-identical and untouched.
