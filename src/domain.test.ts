import {describe, expect, it} from "vitest";
import {baseRiskFlags, filterRepositories, formatPushedAt, sortByPushedAt, type RepositorySummary} from "./domain.js";

const repositories: RepositorySummary[] = [
  {id: 1, name: "old-fork", fullName: "me/old-fork", owner: "me", private: false, fork: true, archived: false, pushedAt: "2024-01-01T00:00:00Z", upstreamFullName: "up/source"},
  {id: 2, name: "app", fullName: "me/app", owner: "me", private: true, fork: false, archived: false, pushedAt: "2026-01-01T00:00:00Z"},
  {id: 3, name: "lost", fullName: "me/lost", owner: "me", private: false, fork: true, archived: true, pushedAt: null, upstreamMissing: true}
];

describe("repository browsing rules", () => {
  it("filters to forks and search matches visible full names", () => {
    expect(filterRepositories(repositories, {forksOnly: true, query: "old"}).map((repo) => repo.fullName)).toEqual(["me/old-fork"]);
  });

  it("sorts repositories by pushed date oldest first by default", () => {
    expect(sortByPushedAt(repositories).map((repo) => repo.fullName)).toEqual(["me/lost", "me/old-fork", "me/app"]);
  });

  it("sorts repositories by pushed date newest first when requested", () => {
    expect(sortByPushedAt(repositories, "newest").map((repo) => repo.fullName)).toEqual(["me/app", "me/old-fork", "me/lost"]);
  });

  it("formats pushed timestamps for terminal scanning", () => {
    expect(formatPushedAt("2024-09-24T01:34:10Z")).toMatch(/^2024-09-24 \d{2}:34$/);
    expect(formatPushedAt(null)).toBe("never");
  });

  it("reports base risk flags without requiring destructive execution", () => {
    expect(baseRiskFlags(repositories).map((flag) => flag.kind)).toEqual(["private", "non-fork", "archived", "upstream-missing"]);
  });
});
