# Project Context

`github-repo-cleaner` is a local terminal UI for cleaning GitHub repositories.

The core workflow is:

1. Reuse the user's existing `gh` CLI authentication.
2. Load the current user's GitHub repositories.
3. Make fork repositories easy to identify and filter.
4. Let the user select repositories with the keyboard.
5. Execute archive or delete only after a page-level second confirmation.
6. Show risk flags before destructive operations.
7. Write a local session log after execution.

The tool is not a browser userscript and must not depend on GitHub page internals.
