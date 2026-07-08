import {mkdir, writeFile} from "node:fs/promises";
import {homedir} from "node:os";
import {join} from "node:path";
import type {OperationMode, OperationResult, RepositorySummary, SessionLog} from "./domain.js";

export function defaultSessionLogDirectory(): string {
  return join(homedir(), ".local", "state", "github-repo-cleaner", "sessions");
}

export async function writeSessionLog(options: {
  owner: string;
  mode: OperationMode;
  startedAt: Date;
  completedAt: Date;
  repositories: RepositorySummary[];
  results: OperationResult[];
  directory?: string;
}): Promise<string> {
  const directory = options.directory ?? defaultSessionLogDirectory();
  await mkdir(directory, {recursive: true});

  const resultByName = new Map(options.results.map((result) => [result.fullName, result]));
  const log: SessionLog = {
    owner: options.owner,
    mode: options.mode,
    startedAt: options.startedAt.toISOString(),
    completedAt: options.completedAt.toISOString(),
    items: options.repositories.map((repository) => {
      const result = resultByName.get(repository.fullName);
      return {
        fullName: repository.fullName,
        fork: repository.fork,
        private: repository.private,
        archived: repository.archived,
        action: options.mode,
        status: result?.status ?? "failed",
        httpStatus: result?.httpStatus,
        message: result?.message
      };
    })
  };

  const fileName = `${options.startedAt.toISOString().replace(/[:.]/g, "-")}.json`;
  const path = join(directory, fileName);
  await writeFile(path, `${JSON.stringify(log, null, 2)}\n`, "utf8");
  return path;
}
