# GitHub repo 清理 TUI 工具 PRD

## Problem Statement

用户在 GitHub 上清理 fork、临时仓库和旧仓库时，官方删除流程过长：需要进入仓库、打开 Settings、滚动到底部、经过多层确认，并手动输入 `owner/repo`。当需要连续清理多个 fork 或测试仓库时，这个流程重复、低效、容易打断。

最初考虑在 GitHub 仓库列表页注入删除按钮，但该方案要么要求在浏览器脚本里保存具备删除权限的 PAT，要么依赖 GitHub 页面内部 form、CSRF token 和删除流程模拟。前者权限敏感，后者维护脆弱。

用户更希望转向一个本地 TUI 工具：在终端中集中查看、筛选、选择 GitHub 仓库，并通过二次确认执行归档或删除。

## Solution

构建一个独立的本地 CLI/TUI 工具，暂名 `github-repo-cleaner`。

工具启动后复用 `gh` CLI 的登录态，通过 GitHub API 拉取当前用户的仓库列表。TUI 默认突出 fork 和旧仓库，支持搜索、排序、fork-only 筛选、多选，并提供 `archive` 与 `delete` 两种执行模式。

执行前进入确认页，展示待处理仓库和风险标记。用户不需要输入确认文本，只需在确认页再次按 `enter` 执行。执行完成后写入本地 session log，方便追踪本次清理了哪些仓库。

## User Stories

1. As a GitHub user, I want to see my repositories in a terminal UI, so that I can clean them without opening many GitHub Settings pages.
2. As a GitHub user, I want the tool to reuse my `gh` CLI login, so that I do not need to paste or store a PAT in another tool.
3. As a GitHub user, I want the tool to detect whether `gh` is installed, so that I get a clear setup instruction when the dependency is missing.
4. As a GitHub user, I want the tool to detect whether I am logged in to `gh`, so that I know to run `gh auth login` before using it.
5. As a GitHub user, I want the tool to detect insufficient delete permissions, so that I can refresh my GitHub CLI scopes intentionally.
6. As a GitHub user, I want to see public repositories, so that I can clean old public demos.
7. As a GitHub user, I want to see private repositories, so that private temporary projects are not hidden from cleanup.
8. As a GitHub user, I want fork repositories to be clearly marked, so that I can focus on likely cleanup targets.
9. As a GitHub user, I want a fork-only filter, so that I can quickly clean forks without scanning my own projects.
10. As a GitHub user, I want each fork to show its upstream repository when available, so that I can understand what the fork came from.
11. As a GitHub user, I want missing upstream repositories to be flagged, so that abandoned forks are easier to identify.
12. As a GitHub user, I want to sort repositories by last pushed time, so that stale repositories are easier to find.
13. As a GitHub user, I want to search repositories by name, so that I can narrow the list quickly.
14. As a GitHub user, I want to select multiple repositories with the keyboard, so that bulk cleanup is efficient.
15. As a GitHub user, I want to switch between archive and delete modes, so that I can choose the right level of cleanup.
16. As a GitHub user, I want archive to be the safer default action, so that old projects are not deleted accidentally.
17. As a GitHub user, I want delete to require an explicit mode switch, so that destructive cleanup is intentional.
18. As a GitHub user, I want to review the selected repositories before execution, so that I can catch mistakes before the API call.
19. As a GitHub user, I want confirmation to require a second page-level `enter`, so that I do not need to type confirmation text but still get a real second step.
20. As a GitHub user, I want the confirmation page to show selected repository names, so that I know exactly what will be changed.
21. As a GitHub user, I want the confirmation page to show the total count, so that I can spot accidental bulk selections.
22. As a GitHub user, I want repositories with open PRs to be flagged before deletion, so that I do not delete active contribution work by mistake.
23. As a GitHub user, I want private repositories to be flagged before deletion, so that I notice higher-risk items.
24. As a GitHub user, I want non-fork repositories to be flagged before deletion, so that I do not accidentally delete original projects while cleaning forks.
25. As a GitHub user, I want archived repositories to be flagged, so that I can distinguish already-inactive projects from active ones.
26. As a GitHub user, I want the tool to continue showing risk flags without forcing text input, so that cleanup stays fast.
27. As a GitHub user, I want per-repository execution results, so that I know which operations succeeded or failed.
28. As a GitHub user, I want failed operations to show a useful reason, so that I can fix permissions or API limitations.
29. As a GitHub user, I want a session log after each run, so that I can audit what was archived or deleted.
30. As a GitHub user, I want the session log to include repository metadata and operation status, so that I can reconstruct what happened later.
31. As a GitHub user, I want the tool to avoid showing organization repositories by default, so that I do not accidentally modify team assets.
32. As a GitHub user, I want organization cleanup to require an explicit owner option later, so that organization scope is deliberate.
33. As a GitHub user, I want the tool to be an independent repository, so that it can have its own README, release process, and future package distribution.
34. As a GitHub user, I want the first version to be locally runnable before packaging, so that the workflow can be validated quickly.

## Implementation Decisions

- Build an independent CLI/TUI tool rather than extending the Obsidian vault or writing a browser userscript.
- Use Node.js and TypeScript for the runtime and implementation language.
- Use Ink for the terminal UI.
- Use Octokit for GitHub API access.
- Use `gh` CLI as the credential provider by shelling out to obtain the active token.
- Do not persist PATs or GitHub tokens in the tool's own configuration.
- Default repository scope is the currently authenticated GitHub user.
- Include public, private, and fork repositories in the default list.
- Do not include organization repositories by default.
- Treat fork cleanup as a first-class workflow.
- Support search, pushed-date sorting, fork-only filtering, keyboard multi-select, archive mode, delete mode, review page, risk flags, execution results, and session logs.

## Out of Scope

- Browser userscripts.
- GitHub page-internal deletion flows.
- Storing PATs in the tool.
- Third-party OAuth cleanup services.
- Organization repositories by default.
- Automatic undo in MVP.
