import {describe, expect, it, vi} from "vitest";
import {computeRiskFlags, formatGitHubApiErrorMessage, type GitHubApi} from "./github.js";
import type {RepositorySummary} from "./domain.js";

const fork: RepositorySummary = {id: 1, name: "fork", fullName: "me/fork", owner: "me", private: false, fork: true, archived: false, pushedAt: null};
const source: RepositorySummary = {id: 2, name: "source", fullName: "me/source", owner: "me", private: false, fork: false, archived: false, pushedAt: null};

describe("risk computation", () => {
  it("checks open pull requests for selected forks in delete mode", async () => {
    const api = {countOpenPullRequests: vi.fn(async () => 2)} as unknown as GitHubApi;

    const flags = await computeRiskFlags(api, [fork, source], "delete");

    expect(api.countOpenPullRequests).toHaveBeenCalledWith(fork);
    expect(flags.map((flag) => flag.kind)).toContain("open-prs");
    expect(flags.map((flag) => flag.kind)).toContain("non-fork");
  });

  it("does not call open PR checks for archive mode", async () => {
    const api = {countOpenPullRequests: vi.fn()} as unknown as GitHubApi;

    await computeRiskFlags(api, [fork], "archive");

    expect(api.countOpenPullRequests).not.toHaveBeenCalled();
  });
});


describe("GitHub API error messages", () => {
  it("adds a gh refresh hint for permission failures", () => {
    expect(formatGitHubApiErrorMessage({status: 403, message: "Resource not accessible by token"})).toContain("gh auth refresh");
  });
});
