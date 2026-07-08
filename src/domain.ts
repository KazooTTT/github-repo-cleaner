export type OperationMode = "archive" | "delete";
export type SortDirection = "oldest" | "newest";

export type RepositorySummary = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  pushedAt: string | null;
  upstreamFullName?: string;
  upstreamMissing?: boolean;
};

export type RiskKind =
  | "open-prs"
  | "private"
  | "non-fork"
  | "archived"
  | "upstream-missing";

export type RiskFlag = {
  kind: RiskKind;
  repoFullName: string;
  message: string;
};

export type OperationResult = {
  fullName: string;
  action: OperationMode;
  status: "success" | "failed";
  httpStatus?: number;
  message?: string;
};

export type SessionLog = {
  owner: string;
  mode: OperationMode;
  startedAt: string;
  completedAt: string;
  items: Array<{
    fullName: string;
    fork: boolean;
    private: boolean;
    archived: boolean;
    openPullRequests?: number;
    action: OperationMode;
    status: OperationResult["status"];
    httpStatus?: number;
    message?: string;
  }>;
};

export function sortByPushedAt(
  repositories: RepositorySummary[],
  direction: SortDirection = "oldest"
): RepositorySummary[] {
  return [...repositories].sort((a, b) => {
    const aTime = a.pushedAt ? Date.parse(a.pushedAt) : 0;
    const bTime = b.pushedAt ? Date.parse(b.pushedAt) : 0;
    return direction === "oldest" ? aTime - bTime : bTime - aTime;
  });
}

export function formatPushedAt(value: string | null): string {
  if (!value) return "never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const formatter = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  return formatter.format(date);
}

export function filterRepositories(
  repositories: RepositorySummary[],
  options: {query: string; forksOnly: boolean}
): RepositorySummary[] {
  const normalizedQuery = options.query.trim().toLowerCase();

  return repositories.filter((repository) => {
    if (options.forksOnly && !repository.fork) return false;
    if (!normalizedQuery) return true;
    return repository.fullName.toLowerCase().includes(normalizedQuery);
  });
}

export function baseRiskFlags(repositories: RepositorySummary[]): RiskFlag[] {
  return repositories.flatMap((repository) => {
    const flags: RiskFlag[] = [];

    if (repository.private) {
      flags.push({
        kind: "private",
        repoFullName: repository.fullName,
        message: `${repository.fullName} is private`
      });
    }

    if (!repository.fork) {
      flags.push({
        kind: "non-fork",
        repoFullName: repository.fullName,
        message: `${repository.fullName} is not a fork`
      });
    }

    if (repository.archived) {
      flags.push({
        kind: "archived",
        repoFullName: repository.fullName,
        message: `${repository.fullName} is already archived`
      });
    }

    if (repository.fork && repository.upstreamMissing) {
      flags.push({
        kind: "upstream-missing",
        repoFullName: repository.fullName,
        message: `${repository.fullName} has missing upstream metadata`
      });
    }

    return flags;
  });
}
