import {describe, expect, it} from "vitest";
import {AuthError, getGhToken, type GhCommandRunner} from "./auth.js";

describe("gh authentication", () => {
  it("reports a missing GitHub CLI", async () => {
    const runner: GhCommandRunner = async () => {
      const error = new Error("missing") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    };

    await expect(getGhToken(runner)).rejects.toMatchObject({code: "missing-gh"});
  });

  it("reports an unauthenticated GitHub CLI", async () => {
    const runner: GhCommandRunner = async () => {
      throw new Error("not logged in");
    };

    await expect(getGhToken(runner)).rejects.toMatchObject({code: "not-authenticated"});
  });

  it("returns the token from gh without persisting it", async () => {
    const runner: GhCommandRunner = async (_command, args) => {
      if (args.includes("status")) return {stdout: "", stderr: ""};
      return {stdout: "token-value\n", stderr: ""};
    };

    await expect(getGhToken(runner)).resolves.toBe("token-value");
  });
});
