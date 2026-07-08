import {describe, expect, it} from "vitest";
import {baseRiskFlags, filterRepositories, sortByPushedAt, type RepositorySummary} from "./domain.js";

const repositories: RepositorySummary[] = [
  {id: 1, name: "old-fork", fullName: "me/old-fork", owner: "me", private: false, fork: true, archived: false, pushedAt: "2024-01-01T00:00:00Z", upstreamFullName: "up/source"},
  {id: 2, name: "app", fullName: "me/app", owner: "me", private: true, fork: false, archived: false, pushedAt: "2026-01-01T00:00:00Z"},
  {id: 3, name: "lost", fullName: "me/lost", owner: "me", private: false, fork: true, archived: true, pushedAt: null, upstreamMissing: true}
];

describe("repository browsing rules", () => {
  it("filters to forks and search matches visible full names", () => {
    expect(filterRepositories(repositories, {forksOnly: true, query: "old"}).map((repo) => repo.fullName)).toEqual(["me/old-fork"]);
  });

  it("sorts stale repositories first by pushed date", () => {
    expect(sortByPushedAt(repositories).map((repo) => repo.fullName)).toEqual(["me/lost", "me/old-fork", "me/app"]);
  });

  it("reports base risk flags without requiring destructive execution", () => {
    expect(baseRiskFlags(repositories).map((flag) => flag.kind)).toEqual(["private", "non-fork", "archived", "upstream-missing"]);
  });
});
