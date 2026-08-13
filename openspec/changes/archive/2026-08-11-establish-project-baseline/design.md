## Context

Gamabhana (गमभन) is a single-language (Marathi) static education-content site. It is brownfield: `build.py`, five Jinja2 templates in `templates/`, vanilla theme assets in `theme/`, and Marathi seed content in `content/` are already implemented and deployed to GitHub Pages via `.github/workflows/pages.yml`. No formal specification baseline exists today, so this change captures the existing behaviour into traceable capability specs (`content-model`, `build-engine`, `site-output`, `client-side-search`, `deployment`). This design documents the architecture that the baseline specs describe, so future changes have a stable reference.

**Current architecture at a glance:**

```
content/yuktis.json ──┐
content/yuktis/*.md ──┼──> build.py (Jinja2 + Markdown) ──> site/ (static, atomic)
templates/*.j2 ───────┤                                          ├── index.html, index.json
theme/{style.css,     │                                          ├── yuktis/{id}/{index.html,index.md}
        app.js} ──────┘                                          ├── {boards|standards|subjects|categories|
└── .github/workflows/pages.yml ── builds site/, deploys via Pages    props|concepts}/** index.html
```

**Constraints:** strictly vanilla stack (no frontend frameworks/libraries), no inline scripts or styles, no unit tests, content/ is user input and must never be modified by the build, all generated artifacts must live strictly under `site/` and be self-contained.

## Goals / Non-Goals

**Goals:**
- Establish a written, testable baseline for the existing system so future changes can be traced (`[REQ-xxx]` → code).
- Document the contract boundaries: content (input) → build engine → site (output), plus client-side behaviour and deployment.
- Ensure the specs accurately reflect the current code so they are immediately useful and truthful.

**Non-Goals:**
- No production code, content, template, or theme changes — this change is documentation-only.
- No refactoring of `build.py`, `theme/app.js`, or templates.
- No new features, tests, or tooling.
- No decision on which future features will build on this baseline.

## Decisions

### D1: Baseline scope covers five capability areas
Capabilities are split by stable, separable responsibilities observed in the code: `content-model` (input contract), `build-engine` (pipeline), `site-output` (artifacts), `client-side-search` (theme/app.js behaviour), `deployment` (CI/CD).

*Rationale:* These five map directly to the existing directory/file boundaries (`content/`, `build.py`, `site/`, `theme/`, `.github/`), giving one obvious home for each future change's spec deltas.
*Alternative considered:* A single monolithic spec — rejected because it would make later per-feature deltas noisy and less traceable.

### D2: Requirements capture existing behaviour as normative contracts
Requirements use SHALL/MUST wording, `[REQ-xxx]` traceability tags, and Given/When/Then-style scenarios that mirror what the code currently does (e.g., slugify Devanagari preservation, self-contained catalogue search without `index.json`, strict output scoping to `site/`).

*Rationale:* A baseline must describe the system as it behaves today, not a desired future state. Normative wording and scenarios make each requirement testable and enforceable when subsequent changes arrive.
*Alternative considered:* Descriptive prose without scenarios — rejected per spec rules (every requirement must have at least one scenario in BDD format).

### D3: Content model is documented as read-only input
`content/yuktis.json` and `content/yuktis/*.md` are specified as user-generated inputs the build must never mutate, and the yukti record schema is pinned.

*Rationale:* This is the highest-risk contract — the build silently depends on field names (`id`, `board`, `standard`, `subject`, `category`, `concepts`, `props`) and the `{id}.md` file convention. Pinning it protects the brownfield invariant.
*Alternative considered:* Leaving content unspecified — rejected because future changes to the build could otherwise invalidate content without any documented contract.

### D4: Site output atomicity is an explicit requirement
Specs require self-contained artifacts (pages reference only their own assets under `base_url`) and full refresh of `site/` on every build.

*Rationale:* The config mandates strict atomicity; this is a real, observable behaviour (build.py deletes `site/` first) and the app.js design already depends on it (catalogue search works without `index.json`).

### D5: No architecture change is proposed
Because this is a documentation baseline, the design intentionally proposes zero structural change; the specs reference the existing layering (input → service pipeline in `build.py` → generated pages + stateless client functions in `theme/app.js`).

*Rationale:* Minimizes risk and keeps the baseline truthful to the brownfield state.

## Risks / Trade-offs

- [Specs may drift from code as the project evolves] → Specs live in `openspec/` and are updated via the standard change workflow (`/opsx-propose` + archive), so any future code change is forced to reconcile its delta with these baseline requirements.
- [Baseline is single-language (Marathi); per-language repos differ] → The content-model spec is intentionally general (site config includes `language`), so it stays valid if other language repos adopt the same workflow.
- [Doc-only change may be treated as "no-op" and skipped] → All five capability specs are archived to `openspec/specs/` and referenced by later changes, making them the durable contract.
- [No tests are permitted] → Traceability tags plus BDD scenarios are the compensating control; each scenario maps to a reviewable behaviour rather than an automated test.

## Migration Plan

None required — no production code changes. On completion, the change is archived, moving the five capability specs from `openspec/changes/establish-project-baseline/specs/` into `openspec/specs/` where subsequent changes reference them.

## Open Questions

- Should the baseline also capture future aspirations (e.g., multi-language support, richer yukti schema) as out-of-scope requirements? Decision deferred until a change actually needs them.
