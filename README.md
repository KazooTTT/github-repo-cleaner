# github-repo-cleaner

Local terminal UI for cleaning GitHub repositories.

The tool reuses GitHub CLI authentication, loads repositories for the active GitHub user, makes forks easy to identify, and supports archive/delete workflows with a page-level second confirmation.

## Development

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

## Authentication

This tool expects `gh` to own credentials:

```bash
gh auth login
gh auth refresh -h github.com -s delete_repo
```

The app reads the active token from `gh auth token` and does not store PATs or GitHub tokens.

## Issue Tracker

Local implementation issues live under `.scratch/issues/`.
