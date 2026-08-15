# Tasks

## 1. Build change

- [x] 1.1 Replace the four `theme/assets/*` `shutil.copy` lines in `main()` with a single `shutil.copytree(THEME / "assets", SITE / "assets", dirs_exist_ok=True)` (REQ-SO-007)
- [x] 1.2 Keep the `theme/style.css` and `theme/app.js` explicit `shutil.copy` lines unchanged (REQ-SO-007)

## 2. Verification

- [x] 2.1 Run `python build.py` and confirm `site/assets/` contains all eight source files, including `card-fallback.svg`, `logo_color.png`, `logo_dark.png`, and `logo_light.png` (REQ-SO-007)
- [x] 2.2 Serve `site/` and confirm the home page navbar brand image at `/assets/logo_light.png` resolves (HTTP 200) (REQ-SO-007)
- [x] 2.3 Confirm catalogue, idea set, and idea pages still reference `assets/style.css`, `assets/app.js`, and `assets/card-fallback.png` successfully (REQ-SO-007)
