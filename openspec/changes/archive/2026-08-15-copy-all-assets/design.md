## Context

`build.py`'s `main()` ends by copying static assets into `site/assets/` with an explicit `shutil.copy` per file: `theme/style.css`, `theme/app.js`, and four files from `theme/assets/`. The `theme/assets/` folder currently holds eight files, four of which (`card-fallback.svg`, `logo_color.png`, `logo_dark.png`, `logo_light.png`) are never copied. One of those, `logo_light.png` (referenced by the home navbar as `assets/{{ site.logo }}` per `content/site.json`), is therefore missing from the generated site - a live defect. Every future asset added to `theme/assets/` silently suffers the same fate unless `build.py` is edited.

## Goals / Non-Goals

**Goals:**

- Replace the per-file `theme/assets/` copy list with a single whole-directory copy, so every file present under `theme/assets/` ships to `site/assets/`.
- Keep `theme/style.css` and `theme/app.js` copies working unchanged (they live in `theme/`, not `theme/assets/`).
- Fix the broken navbar brand logo without touching templates or `content/`.

**Non-Goals:**

- No changes to templates, `theme/app.js`, `theme/style.css`, or anything under `content/`.
- No renaming, pruning, or reorganizing `theme/assets/` contents.
- No change to how pages reference assets (all references stay `/assets/...` under `base_url`).

## Decisions

### D1. Whole-directory copy with `shutil.copytree` + `dirs_exist_ok`

Replace the four `shutil.copy` calls for `theme/assets/*` with `shutil.copytree(THEME / "assets", SITE / "assets", dirs_exist_ok=True)`. The two `theme/style.css` and `theme/app.js` copies stay as explicit `shutil.copy` lines since they are outside the assets folder.

- Alternative: a `for` loop over `glob("theme/assets/*")` calling `shutil.copy` - rejected: `copytree` is the standard idiom for "everything in this folder," handles nested content, and reads more clearly.
- Alternative: keep the explicit list and add the four missing files - rejected: the goal is to eliminate the maintenance list, not extend it.

Rationale: the build wipes `site/` at the start of `main()` (line 392), so the destination is always clean and `dirs_exist_ok=True` is safe. The output is a strict superset of the current output, so no existing page breaks.

### D2. No behavioral guardrails around the copy

`site/` is fully regenerated on every build, so a whole-folder copy cannot accumulate stale files. Any file the user drops into `theme/assets/` is intended to ship; shipping everything is the requested contract.

- Alternative: copy with an allow/deny filter - rejected: reintroduces the maintenance list the change removes.

## Risks / Trade-offs

- [Unintended files under `theme/assets/` ship to the public site] → Mitigation: the folder is a controlled source directory; `site/` is rebuilt from scratch each run, so removing a source file removes it from output immediately. Not a risk this change introduces.
- [`dirs_exist_ok` requires Python 3.8+] → Mitigation: the project already targets Python 3.8+ (matches existing `shutil.rmtree` usage); acceptable for the GitHub Actions environment.

## Migration Plan

1. Edit `build.py`: replace the four `theme/assets` `shutil.copy` lines with `shutil.copytree(THEME / "assets", SITE / "assets", dirs_exist_ok=True)`; leave the `style.css`/`app.js` copies in place.
2. Run `python build.py` and verify `site/assets/` contains all eight source files, including the four new ones.
3. Serve `site/` and confirm the home navbar brand image (`assets/logo_light.png`) renders.
4. Rollback: revert the single `build.py` edit and rebuild; `site/assets/` returns to the six previously copied files.
