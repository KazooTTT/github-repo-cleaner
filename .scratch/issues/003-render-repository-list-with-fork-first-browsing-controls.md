---
title: Render repository list with fork-first browsing controls
labels:
  - ready-for-agent
status: done
---
## Parent

docs/PRD.md

## What to build

Render the loaded repositories in the TUI with browsing controls that make fork cleanup fast. The list should clearly distinguish fork repositories from source repositories, show upstream information when available, support fork-only filtering, support search, and support sorting by last pushed time.

## Acceptance criteria

- [ ] The TUI renders a repository list after repositories are loaded.
- [ ] Each row clearly marks whether the repository is a fork or a source repository.
- [ ] Fork rows show upstream repository information when available.
- [ ] Missing upstream information is represented in a way that can later feed risk flags.
- [ ] The user can toggle a fork-only filter.
- [ ] The user can search repositories by name.
- [ ] The user can sort repositories by pushed date.
- [ ] Tests cover list rendering, fork-only filtering, search, and sorting from the user's perspective.

## Blocked by

- 002-load-authenticated-user-repositories-from-gh-and-github-api


## Implementation notes

Implemented in the initial MVP commit. Covered by behavior-focused tests where the slice has runtime behavior.
