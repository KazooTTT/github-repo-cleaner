---
title: Add review page with page-level second confirmation
labels:
  - ready-for-agent
status: done
---
## Parent

docs/PRD.md

## What to build

Add a review step between list selection and execution. The first confirmation action opens a review page showing the selected repositories, active mode, and selected count. A second `enter` on the review page confirms execution. `esc` cancels and returns to the list. The flow must not require typed confirmation text.

## Acceptance criteria

- [ ] Pressing the review action from the list opens a confirmation page.
- [ ] The confirmation page shows the selected repositories.
- [ ] The confirmation page shows the selected count.
- [ ] The confirmation page shows whether the pending operation is archive or delete.
- [ ] Pressing `enter` on the confirmation page proceeds to execution.
- [ ] Pressing `esc` cancels and returns to the list without executing.
- [ ] No typed confirmation text, repository name, or count is required.
- [ ] Tests cover entering review, confirming, and cancelling.

## Blocked by

- 004-support-keyboard-multi-select-and-archive-delete-mode-selection


## Implementation notes

Implemented in the initial MVP commit. Covered by behavior-focused tests where the slice has runtime behavior.
