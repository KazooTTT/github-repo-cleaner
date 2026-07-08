import {mkdtemp, readFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {describe, expect, it} from "vitest";
import {writeSessionLog} from "./session-log.js";

describe("session log", () => {
  it("writes repository metadata and operation results", async () => {
    const directory = await mkdtemp(join(tmpdir(), "repo-cleaner-test-"));
    const path = await writeSessionLog({
      owner: "me",
      mode: "delete",
      startedAt: new Date("2026-07-08T00:00:00.000Z"),
      completedAt: new Date("2026-07-08T00:00:01.000Z"),
      directory,
      repositories: [{id: 1, name: "fork", fullName: "me/fork", owner: "me", private: false, fork: true, archived: false, pushedAt: null}],
      results: [{fullName: "me/fork", action: "delete", status: "success", httpStatus: 204}]
    });

    const log = JSON.parse(await readFile(path, "utf8"));
    expect(log.items[0]).toMatchObject({fullName: "me/fork", action: "delete", status: "success", httpStatus: 204});
  });
});
