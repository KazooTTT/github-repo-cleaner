# Agent Rules

This repository is an implementation workspace for `github-repo-cleaner`, a local CLI/TUI tool for cleaning GitHub repositories.

## Agent Skills

### Issue Tracker

Issues are tracked as local markdown files under `.scratch/issues/`. External PRs are not a triage surface.

### Triage Labels

Use the canonical triage roles in issue frontmatter or prose when needed: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.

### Domain Docs

Single-context project. Project context lives in `CONTEXT.md`; decision records can live under `docs/adr/` if needed.

## Implementation Notes

- Prefer Node.js, TypeScript, Ink, Octokit, and `gh` CLI authentication.
- Do not store GitHub tokens or PATs in this repo.
- Keep issues as vertical slices that are independently implementable and verifiable.
