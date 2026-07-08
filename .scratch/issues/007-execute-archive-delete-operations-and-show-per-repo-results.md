---
title: Execute archive/delete operations and show per-repo results
labels:
  - ready-for-agent
status: done
---
## Parent

docs/PRD.md

## What to build

Execute the confirmed archive or delete operation for each selected repository through the GitHub API. After execution, show a result view with per-repository success or failure information and useful error messages.

## Acceptance criteria

- [ ] Archive mode sends the expected GitHub API request for each selected repository.
- [ ] Delete mode sends the expected GitHub API request for each selected repository.
- [ ] The UI shows execution progress or a clear executing state.
- [ ] The result view shows successful operations per repository.
- [ ] The result view shows failed operations per repository.
- [ ] Failure messages are understandable enough to diagnose permission or API errors.
- [ ] Partial failures do not hide successful operations.
- [ ] Tests cover archive success, delete success, API failure, and partial failure.

## Blocked by

- 006-compute-and-display-deletion-risk-flags


## Implementation notes

Implemented in the initial MVP commit. Covered by behavior-focused tests where the slice has runtime behavior.
