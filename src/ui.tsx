import React, {useEffect, useMemo, useRef, useState} from "react";
import {Box, Text, useApp, useInput} from "ink";
import type {GitHubApi} from "./github.js";
import {computeRiskFlags} from "./github.js";
import type {OperationMode, OperationResult, RepositorySummary, RiskFlag} from "./domain.js";
import {filterRepositories, sortByPushedAt} from "./domain.js";
import {writeSessionLog} from "./session-log.js";

export type AppProps = {
  api: GitHubApi;
  owner?: string;
  writeLog?: typeof writeSessionLog;
};

type View = "loading" | "list" | "review" | "executing" | "result" | "error";

export function App({api, owner: requestedOwner, writeLog = writeSessionLog}: AppProps) {
  const {exit} = useApp();
  const [view, setView] = useState<View>("loading");
  const [owner, setOwner] = useState(requestedOwner ?? "");
  const [repositories, setRepositories] = useState<RepositorySummary[]>([]);
  const [cursor, setCursor] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [forksOnly, setForksOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState<OperationMode>("archive");
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([]);
  const [riskFlagsLoading, setRiskFlagsLoading] = useState(false);
  const [results, setResults] = useState<OperationResult[]>([]);
  const [logPath, setLogPath] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let active = true;
    api
      .listRepositories(requestedOwner)
      .then((response) => {
        if (!active) return;
        setOwner(response.owner);
        setRepositories(response.repositories);
        setView("list");
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        const message = loadError instanceof Error ? loadError.message : "Unable to load repositories";
        setError(message);
        setView("error");
      });

    return () => {
      active = false;
    };
  }, [api, requestedOwner]);

  const visibleRepositories = useMemo(
    () => filterRepositories(sortByPushedAt(repositories), {query, forksOnly}),
    [repositories, query, forksOnly]
  );

  const selectedRepositories = useMemo(
    () => repositories.filter((repository) => selectedIds.has(repository.id)),
    [repositories, selectedIds]
  );
  const selectedRepositoriesRef = useRef<RepositorySummary[]>([]);
  const viewRef = useRef<View>(view);
  const modeRef = useRef<OperationMode>(mode);
  const ownerRef = useRef(owner);
  const riskFlagsLoadingRef = useRef(riskFlagsLoading);

  useEffect(() => {
    selectedRepositoriesRef.current = selectedRepositories;
    viewRef.current = view;
    modeRef.current = mode;
    ownerRef.current = owner;
    riskFlagsLoadingRef.current = riskFlagsLoading;
  }, [selectedRepositories, view, mode, owner, riskFlagsLoading]);

  useInput((input, key) => {
    if (input === "q") {
      exit();
      return;
    }

    const isReturn = key.return || input === "\r" || input === "\n";

    if (viewRef.current === "list") {
      if (searching) {
        if (isReturn) {
          setSearching(false);
        } else if (key.backspace || key.delete) {
          setQuery((current) => current.slice(0, -1));
        } else if (input && !key.ctrl && !key.meta) {
          setQuery((current) => `${current}${input}`);
        }
        return;
      }

      if (key.upArrow) setCursor((current) => Math.max(0, current - 1));
      if (key.downArrow) setCursor((current) => Math.min(visibleRepositories.length - 1, current + 1));
      if (input === "f") setForksOnly((current) => !current);
      if (input === "/") setSearching(true);
      if (input === "a") setMode("archive");
      if (input === "d") setMode("delete");
      if (input === " " && visibleRepositories[cursor]) {
        const repository = visibleRepositories[cursor];
        setSelectedIds((current) => {
          const next = new Set(current);
          if (next.has(repository.id)) next.delete(repository.id);
          else next.add(repository.id);
          return next;
        });
      }
      if (isReturn && selectedRepositoriesRef.current.length > 0) {
        setRiskFlags([]);
        setRiskFlagsLoading(true);
        setView("review");
        void computeRiskFlags(api, selectedRepositoriesRef.current, modeRef.current).then((flags) => {
          setRiskFlags(flags);
          setRiskFlagsLoading(false);
        });
      }
      return;
    }

    if (viewRef.current === "review") {
      if (key.escape) {
        setView("list");
        return;
      }
      if (isReturn && !riskFlagsLoadingRef.current) {
        void execute();
      }
    }
  });

  async function execute() {
    const startedAt = new Date();
    setView("executing");
    const operationResults: OperationResult[] = [];

    const repositoriesToExecute = selectedRepositoriesRef.current;
    const modeToExecute = modeRef.current;

    for (const repository of repositoriesToExecute) {
      const result = modeToExecute === "archive" ? await api.archiveRepository(repository) : await api.deleteRepository(repository);
      operationResults.push(result);
      setResults([...operationResults]);
    }

    const completedAt = new Date();
    const path = await writeLog({
      owner: ownerRef.current,
      mode: modeToExecute,
      startedAt,
      completedAt,
      repositories: repositoriesToExecute,
      results: operationResults
    });
    setLogPath(path);
    setResults(operationResults);
    setView("result");
  }

  if (view === "loading") return <Text>Loading repositories...</Text>;
  if (view === "error") return <Text color="red">{error}</Text>;
  if (view === "review") return <ReviewView mode={mode} repositories={selectedRepositories} riskFlags={riskFlags} loading={riskFlagsLoading} />;
  if (view === "executing") return <Text>Executing {mode} for {selectedRepositories.length} repositories...</Text>;
  if (view === "result") return <ResultView results={results} logPath={logPath} />;

  return (
    <Box flexDirection="column">
      <Text>github-repo-cleaner owner:{owner} mode:{mode} selected:{selectedIds.size}</Text>
      <Text>[up/down] move  [space] select  [f] forks only:{forksOnly ? "on" : "off"}  [/] search  [a] archive  [d] delete  [enter] review  [q] quit</Text>
      <Text>search:{searching ? `${query}_` : query || "-"}</Text>
      {visibleRepositories.slice(Math.max(0, cursor - 5), cursor + 15).map((repository) => {
        const active = visibleRepositories[cursor]?.id === repository.id;
        const selected = selectedIds.has(repository.id);
        return (
          <Text key={repository.id} color={active ? "cyan" : undefined}>
            {active ? ">" : " "} {selected ? "[x]" : "[ ]"} {repository.fork ? "fork" : "src "} {repository.fullName} pushed:{repository.pushedAt ?? "never"} {repository.fork ? `upstream:${repository.upstreamFullName ?? "missing"}` : ""}
          </Text>
        );
      })}
      {visibleRepositories.length === 0 ? <Text>No repositories match the current filters.</Text> : null}
    </Box>
  );
}

function ReviewView({mode, repositories, riskFlags, loading}: {mode: OperationMode; repositories: RepositorySummary[]; riskFlags: RiskFlag[]; loading: boolean}) {
  return (
    <Box flexDirection="column">
      <Text>{mode.toUpperCase()} {repositories.length} repositories</Text>
      {repositories.slice(0, 12).map((repository) => <Text key={repository.id}>- {repository.fullName}</Text>)}
      {repositories.length > 12 ? <Text>... {repositories.length - 12} more</Text> : null}
      <Text>Risk flags:</Text>
      {loading ? <Text>Checking risks...</Text> : riskFlags.length === 0 ? <Text>None</Text> : riskFlags.map((flag) => <Text key={`${flag.kind}:${flag.repoFullName}`} color="yellow">! {flag.message}</Text>)}
      <Text>{loading ? "[enter] waiting for risk check   [esc] cancel" : "[enter] confirm   [esc] cancel"}</Text>
    </Box>
  );
}

function ResultView({results, logPath}: {results: OperationResult[]; logPath?: string}) {
  return (
    <Box flexDirection="column">
      <Text>Results</Text>
      {results.map((result) => (
        <Text key={result.fullName} color={result.status === "success" ? "green" : "red"}>
          {result.status === "success" ? "ok" : "fail"} {result.action} {result.fullName} {result.httpStatus ?? ""} {result.message ?? ""}
        </Text>
      ))}
      {logPath ? <Text>Log: {logPath}</Text> : null}
    </Box>
  );
}
