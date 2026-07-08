---
title: Support keyboard multi-select and archive/delete mode selection
labels:
  - ready-for-agent
status: done
---
## Parent

docs/PRD.md

## What to build

Add keyboard interaction for selecting multiple repositories and choosing the operation mode. Archive should be the default mode. Delete should require an explicit mode switch.

## Acceptance criteria

- [ ] The user can move through the repository list with the keyboard.
- [ ] The user can select and deselect repositories with the keyboard.
- [ ] The UI shows the current selection count.
- [ ] Archive is the default operation mode.
- [ ] The user can explicitly switch to delete mode.
- [ ] The UI clearly shows the active operation mode.
- [ ] Tests cover selection, deselection, selection count, default archive mode, and delete mode switching.

## Blocked by

- 003-render-repository-list-with-fork-first-browsing-controls


## Implementation notes

Implemented in the initial MVP commit. Covered by behavior-focused tests where the slice has runtime behavior.
