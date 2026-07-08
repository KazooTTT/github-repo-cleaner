---
title: Scaffold local CLI repo and test harness
labels:
  - ready-for-agent
status: done
---
## Parent

docs/PRD.md

## What to build

Create the first runnable project skeleton for `github-repo-cleaner`. It should be a local Node.js and TypeScript CLI/TUI project using Ink, with a minimal command entrypoint, test command, lint/typecheck command if practical, and enough README guidance for another agent to start implementation.

This slice is complete when the repository can run a placeholder CLI and execute the configured verification commands locally.

## Acceptance criteria

- [ ] The project has a package manifest for a Node.js and TypeScript CLI.
- [ ] The project has an Ink-based placeholder UI or command entrypoint that can run locally.
- [ ] The project has a test harness suitable for behavior-focused CLI/TUI tests.
- [ ] The project documents the intended `gh` authentication model and confirms that the tool must not store PATs.
- [ ] The project includes local markdown issue tracker configuration and the PRD.

## Blocked by

None - can start immediately


## Implementation notes

Implemented in the initial MVP commit. Covered by behavior-focused tests where the slice has runtime behavior.
