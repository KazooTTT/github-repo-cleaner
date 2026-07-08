---
title: Compute and display deletion risk flags
labels:
  - ready-for-agent
status: done
---
## Parent

docs/PRD.md

## What to build

Compute and display risk flags for selected repositories before execution. For delete mode, the MVP must check selected forks for open pull requests. The review page should also surface private repositories, non-fork repositories, archived repositories, and missing upstream information.

Warnings should be visible but should not block execution in MVP.

## Acceptance criteria

- [ ] The review page displays private repository risk flags.
- [ ] The review page displays non-fork repository risk flags.
- [ ] The review page displays archived repository risk flags.
- [ ] The review page displays missing upstream risk flags when known.
- [ ] In delete mode, selected forks are checked for open pull requests.
- [ ] Open pull request warnings are displayed before execution.
- [ ] Risk warnings do not require additional typed confirmation.
- [ ] Tests cover each risk flag and the open PR check with mocked API responses.

## Blocked by

- 005-add-review-page-with-page-level-second-confirmation


## Implementation notes

Implemented in the initial MVP commit. Covered by behavior-focused tests where the slice has runtime behavior.
