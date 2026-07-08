---
title: Load authenticated user repositories from gh and GitHub API
labels:
  - ready-for-agent
status: done
---
## Parent

docs/PRD.md

## What to build

Implement the first end-to-end data path: the CLI detects `gh`, verifies that the user is authenticated, obtains the active GitHub token through `gh`, and loads the currently authenticated user's repositories from the GitHub API.

The user should get clear terminal feedback for missing `gh`, unauthenticated `gh`, token retrieval failure, and insufficient permissions.

## Acceptance criteria

- [ ] Running the CLI checks whether `gh` is available.
- [ ] If `gh` is missing, the CLI shows a clear setup message and exits without a stack trace.
- [ ] If `gh` is not authenticated, the CLI tells the user to run `gh auth login`.
- [ ] The CLI obtains the current GitHub token from `gh` without persisting it.
- [ ] The CLI loads repositories for the current authenticated user.
- [ ] Loaded repositories include public, private, and fork repositories where the authenticated user has access.
- [ ] Organization repositories are not loaded by default.
- [ ] Behavior is covered by tests with mocked `gh` and mocked GitHub API responses.

## Blocked by

- 001-scaffold-local-cli-repo-and-test-harness


## Implementation notes

Implemented in the initial MVP commit. Covered by behavior-focused tests where the slice has runtime behavior.
