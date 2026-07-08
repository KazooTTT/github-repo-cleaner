---
title: Add explicit owner option for future organization scope
labels:
  - ready-for-agent
status: done
---
## Parent

docs/PRD.md

## What to build

Add an explicit owner option so the user can intentionally load repositories for a named owner, including organization owners. The default behavior must remain scoped to the authenticated user and must not include organization repositories unless the user passes the owner option.

## Acceptance criteria

- [ ] The CLI accepts an explicit owner option.
- [ ] Without the owner option, the CLI loads only the authenticated user's repository scope.
- [ ] With the owner option, the CLI loads repositories for the named owner.
- [ ] The UI clearly displays the active owner scope.
- [ ] Organization scope is never entered implicitly.
- [ ] Tests cover default user scope and explicit owner scope.

## Blocked by

- 008-write-session-logs-for-audit-trail


## Implementation notes

Implemented in the initial MVP commit. Covered by behavior-focused tests where the slice has runtime behavior.
