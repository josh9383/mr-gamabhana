# Deployment Spec

## ADDED Requirements

### Requirement: [REQ-DP-001: Build triggers on push to main]
The deployment workflow SHALL trigger on every push to the `main` branch.

#### Scenario: Push to main starts the workflow
- **WHEN** a commit is pushed to `main`
- **THEN** the deployment workflow is triggered automatically

### Requirement: [REQ-DP-002: Build runs in a clean environment]
The workflow SHALL check out the repository, set up a current Python 3 runtime, install dependencies from `requirements.txt`, and run `python build.py` to produce the site.

#### Scenario: Site is built from source
- **WHEN** the workflow runs the build job
- **THEN** the repository is checked out, Python is set up, dependencies are installed from `requirements.txt`
- **AND** `python build.py` succeeds and produces the `site/` directory

### Requirement: [REQ-DP-003: Site deploys to GitHub Pages]
The workflow SHALL configure GitHub Pages, upload the `site/` directory as a Pages artifact, and deploy it to GitHub Pages. The workflow SHALL declare `contents: read`, `pages: write`, and `id-token: write` permissions.

#### Scenario: Deployed site is current
- **WHEN** the build job succeeds
- **THEN** the workflow uploads `site/` and deploys it to GitHub Pages
- **AND** the published site reflects the latest `main` branch content

### Requirement: [REQ-DP-004: Local and CI builds are equivalent]
The local build command `python build.py` SHALL produce the same `site/` output as the CI build given the same inputs and dependency versions, so contributors can preview the deployable site locally.

#### Scenario: Local build matches CI output
- **WHEN** a contributor runs `python build.py` locally with the same content and `requirements.txt` as CI
- **THEN** the generated `site/` output matches what CI produces
- **AND** no CI-only steps are required to reproduce the site locally
