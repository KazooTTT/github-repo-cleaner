# github-repo-cleaner

[![npm version](https://img.shields.io/npm/v/@kazoottt/github-repo-cleaner?color=orange)](https://www.npmjs.com/package/@kazoottt/github-repo-cleaner)
[![npm downloads](https://img.shields.io/npm/dm/@kazoottt/github-repo-cleaner)](https://www.npmjs.com/package/@kazoottt/github-repo-cleaner)
[![publish](https://github.com/KazooTTT/github-repo-cleaner/actions/workflows/publish.yml/badge.svg)](https://github.com/KazooTTT/github-repo-cleaner/actions/workflows/publish.yml)
[![license](https://img.shields.io/npm/l/@kazoottt/github-repo-cleaner)](./LICENSE)

Local terminal UI for cleaning GitHub repositories.

The tool reuses GitHub CLI authentication, loads repositories for the active GitHub user, makes forks easy to identify, and supports archive/delete workflows with a page-level second confirmation.

## Install

```bash
npm install -g @kazoottt/github-repo-cleaner
```

Run either command:

```bash
repo-cleaner
github-repo-cleaner
```

## Authentication

This tool expects `gh` to own credentials:

```bash
gh auth login
gh auth refresh -h github.com -s delete_repo
```

The app reads the active token from `gh auth token` and does not store PATs or GitHub tokens.

## Usage

```bash
repo-cleaner
repo-cleaner --owner KazooTTT
```

Keys:

```text
up/down  move
space    select repository
f        toggle forks-only
s        toggle sort oldest/newest
/        search
a        archive mode
d        delete mode
enter    review selected repositories
esc      cancel review
q        quit
```

## Development

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

## Release

Releases are created locally with `bumpp` and published by GitHub Actions when a `v*` tag is pushed.

```bash
npm run release
```

The release script runs tests, typecheck, and build before `bumpp` creates the version commit and tag.

## npm trusted publishing setup

This project is configured for npm trusted publishing with provenance. No `NPM_TOKEN` secret is required.

Expected identities:

```text
GitHub owner: KazooTTT
GitHub repository: github-repo-cleaner
npm package: @kazoottt/github-repo-cleaner
Workflow filename: publish.yml
```

Setup steps:

1. Push this repository to GitHub as `KazooTTT/github-repo-cleaner`.
2. Sign in to npm as the owner of the `@kazoottt` scope.
3. Open the npm package access/settings page for `@kazoottt/github-repo-cleaner`: `https://www.npmjs.com/package/@kazoottt/github-repo-cleaner/access`.
4. Add a trusted publisher with:
   - Owner: `KazooTTT`
   - Repository: `github-repo-cleaner`
   - Workflow filename: `publish.yml`
   - Environment name: leave empty unless the workflow is changed to use one
5. For the first publish only, run `npm publish --access public` locally to create the package.
6. Add the trusted publisher in the package settings.
7. For later releases, run `npm run release` locally.
8. Confirm the pushed tag triggers the `Publish` workflow in GitHub Actions.

After trusted publishing is configured, the publish workflow runs:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm publish --provenance --access public
```

## Issue Tracker

Local implementation issues live under `.scratch/issues/`.
