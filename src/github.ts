import {Octokit} from "@octokit/rest";
import type {OperationMode, OperationResult, RepositorySummary, RiskFlag} from "./domain.js";

export type GitHubApi = {
  getDefaultOwner(): Promise<string>;
  listRepositories(owner?: string): Promise<{owner: string; repositories: RepositorySummary[]}>;
  countOpenPullRequests(repository: RepositorySummary): Promise<number>;
  archiveRepository(repository: RepositorySummary): Promise<OperationResult>;
  deleteRepository(repository: RepositorySummary): Promise<OperationResult>;
};

type RestRepository = {
  id: number;
  name: string;
  full_name: string;
  owner: {login: string};
  private?: boolean;
  fork?: boolean;
  archived?: boolean;
  pushed_at?: string | null;
  parent?: {full_name?: string | null};
};

export class OctokitGitHubApi implements GitHubApi {
  private readonly octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({auth: token, userAgent: "github-repo-cleaner"});
  }

  async getDefaultOwner(): Promise<string> {
    const {data} = await this.octokit.rest.users.getAuthenticated();
    return data.login;
  }

  async listRepositories(owner?: string): Promise<{owner: string; repositories: RepositorySummary[]}> {
    const defaultOwner = await this.getDefaultOwner();
    const activeOwner = owner ?? defaultOwner;

    const repositories = !owner || activeOwner.toLowerCase() === defaultOwner.toLowerCase()
      ? await this.octokit.paginate(this.octokit.rest.repos.listForAuthenticatedUser, {
          affiliation: "owner",
          per_page: 100,
          sort: "pushed",
          direction: "desc"
        })
      : await this.listForExplicitOwner(activeOwner);

    return {
      owner: activeOwner,
      repositories: repositories
        .filter((repository) => repository.owner.login.toLowerCase() === activeOwner.toLowerCase())
        .map(toRepositorySummary)
    };
  }

  async countOpenPullRequests(repository: RepositorySummary): Promise<number> {
    const {data} = await this.octokit.rest.search.issuesAndPullRequests({
      q: `repo:${repository.fullName} is:pr is:open`,
      per_page: 1
    });
    return data.total_count;
  }

  async archiveRepository(repository: RepositorySummary): Promise<OperationResult> {
    return this.execute("archive", repository, async () => {
      const response = await this.octokit.rest.repos.update({
        owner: repository.owner,
        repo: repository.name,
        archived: true
      });
      return response.status;
    });
  }

  async deleteRepository(repository: RepositorySummary): Promise<OperationResult> {
    return this.execute("delete", repository, async () => {
      const response = await this.octokit.rest.repos.delete({
        owner: repository.owner,
        repo: repository.name
      });
      return response.status;
    });
  }

  private async listForExplicitOwner(owner: string): Promise<RestRepository[]> {
    const {data: user} = await this.octokit.rest.users.getByUsername({username: owner});
    if (user.type === "Organization") {
      return this.octokit.paginate(this.octokit.rest.repos.listForOrg, {
        org: owner,
        type: "all",
        per_page: 100,
        sort: "pushed",
        direction: "desc"
      });
    }

    return this.octokit.paginate(this.octokit.rest.repos.listForUser, {
      username: owner,
      type: "owner",
      per_page: 100,
      sort: "pushed",
      direction: "desc"
    });
  }

  private async execute(
    action: OperationMode,
    repository: RepositorySummary,
    call: () => Promise<number>
  ): Promise<OperationResult> {
    try {
      const httpStatus = await call();
      return {fullName: repository.fullName, action, status: "success", httpStatus};
    } catch (error) {
      const apiError = error as {status?: number; message?: string};
      return {
        fullName: repository.fullName,
        action,
        status: "failed",
        httpStatus: apiError.status,
        message: formatGitHubApiErrorMessage(apiError)
      };
    }
  }
}

function toRepositorySummary(repository: RestRepository): RepositorySummary {
  const parent = repository.parent;

  return {
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    owner: repository.owner.login,
    private: repository.private ?? false,
    fork: repository.fork ?? false,
    archived: repository.archived ?? false,
    pushedAt: repository.pushed_at ?? null,
    upstreamFullName: parent?.full_name ?? undefined,
    upstreamMissing: (repository.fork ?? false) && !parent?.full_name
  };
}

export async function computeRiskFlags(
  api: Pick<GitHubApi, "countOpenPullRequests">,
  repositories: RepositorySummary[],
  mode: OperationMode
): Promise<RiskFlag[]> {
  const {baseRiskFlags} = await import("./domain.js");
  const flags = baseRiskFlags(repositories);

  if (mode !== "delete") return flags;

  const openPrCounts = await Promise.all(
    repositories
      .filter((repository) => repository.fork)
      .map(async (repository) => ({repository, count: await api.countOpenPullRequests(repository)}))
  );

  for (const {repository, count} of openPrCounts) {
    if (count > 0) {
      flags.push({
        kind: "open-prs",
        repoFullName: repository.fullName,
        message: `${repository.fullName} has ${count} open pull request${count === 1 ? "" : "s"}`
      });
    }
  }

  return flags;
}


export function formatGitHubApiErrorMessage(error: {status?: number; message?: string}): string {
  const permissionHint = error.status === 403
    ? " Try gh auth refresh -h github.com -s delete_repo if this is a permission issue."
    : "";
  return `${error.message ?? "Unknown GitHub API error"}${permissionHint}`;
}
