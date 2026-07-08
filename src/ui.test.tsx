import React from "react";
import {render} from "ink-testing-library";
import {describe, expect, it, vi} from "vitest";
import {App} from "./ui.js";
import type {GitHubApi} from "./github.js";
import type {RepositorySummary} from "./domain.js";

const repositories: RepositorySummary[] = [
  {id: 1, name: "old-fork", fullName: "me/old-fork", owner: "me", private: false, fork: true, archived: false, pushedAt: "2024-01-01T00:00:00Z", upstreamFullName: "up/source"},
  {id: 2, name: "private-app", fullName: "me/private-app", owner: "me", private: true, fork: false, archived: false, pushedAt: "2026-01-01T00:00:00Z"}
];

async function nextTick() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function makeApi(): GitHubApi {
  return {
    getDefaultOwner: vi.fn(async () => "me"),
    listRepositories: vi.fn(async () => ({owner: "me", repositories})),
    countOpenPullRequests: vi.fn(async () => 1),
    archiveRepository: vi.fn(async (repo) => ({fullName: repo.fullName, action: "archive" as const, status: "success" as const, httpStatus: 200})),
    deleteRepository: vi.fn(async (repo) => ({fullName: repo.fullName, action: "delete" as const, status: "success" as const, httpStatus: 204}))
  };
}

describe("App", () => {
  it("renders repositories with fork metadata after loading", async () => {
    const instance = render(<App api={makeApi()} writeLog={vi.fn(async () => "/tmp/log.json")} />);

    await vi.waitFor(() => expect(instance.lastFrame()).toContain("me/old-fork"));

    expect(instance.lastFrame()).toContain("fork me/old-fork");
    expect(instance.lastFrame()).toContain("own  me/private-app");
    expect(instance.lastFrame()).toContain("pushed:2024-01-01");
    expect(instance.lastFrame()).not.toContain("T00:00:00Z");
    expect(instance.lastFrame()).toContain("upstream:up/source");
  });

  it("toggles pushed date sorting with s", async () => {
    const instance = render(<App api={makeApi()} writeLog={vi.fn(async () => "/tmp/log.json")} />);

    await vi.waitFor(() => expect(instance.lastFrame()).toContain("sort:oldest"));
    expect(instance.lastFrame()).toContain("> [ ] fork me/old-fork");
    await nextTick();
    instance.stdin.write("s");

    await vi.waitFor(() => expect(instance.lastFrame()).toContain("sort:newest"));
    expect(instance.lastFrame()).toContain("> [ ] own  me/private-app");
  });

  it("loads an explicit owner scope when provided", async () => {
    const api = makeApi();
    render(<App api={api} owner="some-org" writeLog={vi.fn(async () => "/tmp/log.json")} />);

    await vi.waitFor(() => expect(api.listRepositories).toHaveBeenCalledWith("some-org"));
  });

  it("opens a review page and executes archive with a second enter", async () => {
    const api = makeApi();
    const writeLog = vi.fn(async () => "/tmp/log.json");
    const instance = render(<App api={api} writeLog={writeLog} />);

    await vi.waitFor(() => expect(instance.lastFrame()).toContain("me/old-fork"));
    await nextTick();
    instance.stdin.write(" ");
    await vi.waitFor(() => expect(instance.lastFrame()).toContain("selected:1"));
    instance.stdin.write("\n");

    await vi.waitFor(() => expect(instance.lastFrame()).toContain("ARCHIVE 1 repositories"));
    await vi.waitFor(() => expect(instance.lastFrame()).toContain("[enter] confirm"));
    await nextTick();
    instance.stdin.write("\n");

    await vi.waitFor(() => expect(instance.lastFrame()).toContain("Results"));
    expect(api.archiveRepository).toHaveBeenCalledWith(repositories[0]);
    expect(writeLog).toHaveBeenCalled();
  });

  it("shows risk flags for delete review without typed confirmation", async () => {
    const instance = render(<App api={makeApi()} writeLog={vi.fn(async () => "/tmp/log.json")} />);

    await vi.waitFor(() => expect(instance.lastFrame()).toContain("me/old-fork"));
    await nextTick();
    instance.stdin.write("d");
    instance.stdin.write(" ");
    await vi.waitFor(() => {
      expect(instance.lastFrame()).toContain("mode:delete");
      expect(instance.lastFrame()).toContain("selected:1");
    });
    instance.stdin.write("\n");

    await vi.waitFor(() => expect(instance.lastFrame()).toContain("DELETE 1 repositories"));
    await vi.waitFor(() => expect(instance.lastFrame()).toContain("open pull request"));
    expect(instance.lastFrame()).toContain("[enter] confirm   [esc] cancel");
  });
});
