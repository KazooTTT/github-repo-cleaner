import {execFile} from "node:child_process";
import {promisify} from "node:util";

const execFileAsync = promisify(execFile);

export type GhCommandRunner = (command: string, args: string[]) => Promise<{stdout: string; stderr: string}>;

export class AuthError extends Error {
  constructor(
    public readonly code: "missing-gh" | "not-authenticated" | "token-unavailable",
    message: string
  ) {
    super(message);
  }
}

export async function getGhToken(runCommand: GhCommandRunner = execFileAsync): Promise<string> {
  try {
    await runCommand("gh", ["auth", "status", "--hostname", "github.com"]);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException & {stderr?: string};
    if (nodeError.code === "ENOENT") {
      throw new AuthError("missing-gh", "GitHub CLI is not installed. Install gh, then run gh auth login.");
    }

    throw new AuthError("not-authenticated", "GitHub CLI is not authenticated. Run gh auth login.");
  }

  try {
    const {stdout} = await runCommand("gh", ["auth", "token", "--hostname", "github.com"]);
    const token = stdout.trim();
    if (!token) {
      throw new AuthError("token-unavailable", "GitHub CLI did not return a token.");
    }
    return token;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError(
      "token-unavailable",
      "Unable to read a GitHub token from gh. Try gh auth refresh -h github.com -s delete_repo."
    );
  }
}
