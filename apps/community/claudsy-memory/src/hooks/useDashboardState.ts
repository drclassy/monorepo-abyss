// Architected and built by Claudesy.

import { useCallback, useEffect, useReducer, useRef } from "react";
import type {
  ActiveZone,
  ActivityEvent,
  CommandResult,
  DaemonStatus,
  DashboardState,
  FactRecord,
  HealthHistoryEntry,
  HealthSummary,
  SearchFilters,
  SearchMeta,
  SearchResult,
  WorkspaceTab,
  ZoneDetailPanel,
} from "@/lib/types";

const DEFAULT_BASE_DIR =
  process.env.NEXT_PUBLIC_DEFAULT_BASE_DIR ?? "~/.claudesy";
const DEFAULT_DAEMON: DaemonStatus = {
  running: false,
  agent: null,
  pid: null,
  mode: "full",
  intervalSeconds: 300,
  startedAt: null,
  stopRequested: false,
  lastExitCode: null,
  lastError: null,
};
const DEFAULT_SEARCH_META: SearchMeta = {
  mode: "search",
  page: 1,
  pageSize: 10,
  hasNext: false,
  hasPrev: false,
  category: "",
  status: "",
  query: "",
};

const INITIAL: DashboardState = {
  agent: "claude-code",
  baseDir: DEFAULT_BASE_DIR,
  agents: ["claude-code"],
  engineState: null,
  daemon: DEFAULT_DAEMON,
  healthSummary: null,
  healthHistory: [],
  activity: [],
  commandResults: [],
  searchResults: [],
  searchMeta: DEFAULT_SEARCH_META,
  selectedFact: null,
  daemonRunning: false,
  loading: false,
  activeTab: "activity",
  searchQuery: "",
  healthOutput: "",
  activeZone: "overview",
  detailPanel: { open: false, mode: null },
};

type Action =
  | { type: "SET_LOADING"; value: boolean }
  | { type: "SET_AGENT"; agent: string }
  | { type: "SET_BASE_DIR"; dir: string }
  | { type: "SET_AGENTS"; agents: string[] }
  | { type: "SET_TAB"; tab: WorkspaceTab }
  | { type: "SET_ZONE"; zone: ActiveZone }
  | { type: "SET_DETAIL_PANEL"; panel: ZoneDetailPanel }
  | { type: "ADD_ACTIVITY"; event: ActivityEvent }
  | { type: "ADD_RESULT"; result: CommandResult }
  | {
      type: "SET_SEARCH";
      results: SearchResult[];
      query: string;
      meta: SearchMeta;
    }
  | { type: "SET_SELECTED_FACT"; fact: FactRecord | null }
  | { type: "SET_HEALTH"; output: string }
  | { type: "SET_HEALTH_SUMMARY"; summary: HealthSummary | null }
  | { type: "SET_HEALTH_HISTORY"; history: HealthHistoryEntry[] }
  | { type: "SET_DAEMON_STATUS"; daemon: DaemonStatus }
  | { type: "SET_DAEMON"; running: boolean }
  | { type: "SET_ENGINE_STATE"; state: DashboardState["engineState"] }
  | { type: "RESET_WORKSPACE" };

function reducer(s: DashboardState, a: Action): DashboardState {
  switch (a.type) {
    case "SET_LOADING":
      return { ...s, loading: a.value };
    case "SET_AGENT":
      return { ...s, agent: a.agent };
    case "SET_BASE_DIR":
      return { ...s, baseDir: a.dir };
    case "SET_AGENTS":
      return { ...s, agents: a.agents };
    case "SET_TAB":
      return { ...s, activeTab: a.tab };
    case "SET_ZONE":
      return { ...s, activeZone: a.zone };
    case "SET_DETAIL_PANEL":
      return { ...s, detailPanel: a.panel };
    case "ADD_ACTIVITY":
      return { ...s, activity: [...s.activity.slice(-99), a.event] };
    case "ADD_RESULT":
      return {
        ...s,
        commandResults: [...s.commandResults.slice(-19), a.result],
      };
    case "SET_SEARCH":
      return {
        ...s,
        searchResults: a.results,
        searchQuery: a.query,
        searchMeta: a.meta,
      };
    case "SET_SELECTED_FACT":
      return { ...s, selectedFact: a.fact };
    case "SET_HEALTH":
      return { ...s, healthOutput: a.output };
    case "SET_HEALTH_SUMMARY":
      return { ...s, healthSummary: a.summary };
    case "SET_HEALTH_HISTORY":
      return { ...s, healthHistory: a.history };
    case "SET_DAEMON_STATUS":
      return { ...s, daemon: a.daemon };
    case "SET_DAEMON":
      return { ...s, daemonRunning: a.running };
    case "SET_ENGINE_STATE":
      return { ...s, engineState: a.state };
    case "RESET_WORKSPACE":
      return {
        ...s,
        engineState: null,
        healthSummary: null,
        healthHistory: [],
        activity: [],
        commandResults: [],
        searchResults: [],
        searchMeta: s.searchMeta,
        selectedFact: null,
        daemonRunning: s.daemon.running && s.daemon.agent === s.agent,
        loading: false,
        activeTab: "activity",
        searchQuery: "",
        healthOutput: "",
      };
    default:
      return s;
  }
}

function mkId() {
  return Math.random().toString(36).slice(2);
}
function mkActivity(
  level: ActivityEvent["level"],
  category: string,
  message: string,
): ActivityEvent {
  return {
    id: mkId(),
    level,
    category,
    message,
    timestamp: new Date().toLocaleTimeString(),
  };
}

export function useDashboardState() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadState = useCallback(
    async (agent: string, options?: { silent?: boolean }) => {
      try {
        const res = await fetch(
          `/api/state?agent=${encodeURIComponent(agent)}`,
        );
        const data = await res.json();
        if (!mountedRef.current) return;

        if (!res.ok) {
          const message =
            typeof data.error === "string"
              ? data.error
              : "Could not load engine state";
          throw new Error(message);
        }

        if (data.baseDir) dispatch({ type: "SET_BASE_DIR", dir: data.baseDir });
        if (data.agents)
          dispatch({
            type: "SET_AGENTS",
            agents: data.agents.length ? data.agents : [agent],
          });
        if (data.health) {
          dispatch({ type: "SET_HEALTH", output: data.health });
        }
        dispatch({
          type: "SET_HEALTH_SUMMARY",
          summary: data.healthSummary ?? null,
        });
        dispatch({
          type: "SET_HEALTH_HISTORY",
          history: data.healthHistory ?? [],
        });
        dispatch({
          type: "SET_DAEMON_STATUS",
          daemon: data.daemon ?? DEFAULT_DAEMON,
        });
        dispatch({ type: "SET_ENGINE_STATE", state: data.engineState ?? null });
        dispatch({
          type: "SET_DAEMON",
          running: Boolean(
            (data.daemon ?? DEFAULT_DAEMON).running &&
            (data.daemon ?? DEFAULT_DAEMON).agent === agent,
          ),
        });
        if (!options?.silent) {
          dispatch({
            type: "ADD_ACTIVITY",
            event: mkActivity("success", "init", "Engine state loaded"),
          });
        }
      } catch (err) {
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity(
            "warn",
            "init",
            `Could not connect to Python engine: ${err instanceof Error ? err.message : "Unknown error"}`,
          ),
        });
      }
    },
    [],
  );

  // Load initial state
  useEffect(() => {
    void loadState(state.agent);
  }, [loadState, state.agent]);

  const runCommand = useCallback(
    async (cmd: string) => {
      dispatch({ type: "SET_LOADING", value: true });
      dispatch({
        type: "ADD_ACTIVITY",
        event: mkActivity("info", "cmd", `Running: ${cmd}`),
      });

      try {
        const res = await fetch("/api/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: cmd, agent: state.agent }),
        });
        const data = await res.json();

        const result: CommandResult = {
          command: cmd,
          output: data.output ?? data.error ?? "(no output)",
          success: data.success ?? false,
          timestamp: data.timestamp ?? new Date().toISOString(),
          durationMs: data.durationMs,
        };

        dispatch({ type: "ADD_RESULT", result });
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity(
            result.success ? "success" : "error",
            "cmd",
            `${cmd}: ${result.success ? "completed" : "failed"}`,
          ),
        });

        if (cmd === "health")
          dispatch({ type: "SET_HEALTH", output: result.output });
        if (result.success) {
          void loadState(state.agent, { silent: true });
        }
      } catch (err) {
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity(
            "error",
            "cmd",
            `${cmd} failed: ${err instanceof Error ? err.message : "Unknown"}`,
          ),
        });
      } finally {
        dispatch({ type: "SET_LOADING", value: false });
      }
    },
    [loadState, state.agent],
  );

  const handleSearch = useCallback(
    async (filters: SearchFilters) => {
      dispatch({ type: "SET_LOADING", value: true });
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...filters, agent: state.agent }),
        });
        const data = await res.json();
        const meta: SearchMeta = {
          mode: data.mode === "recent" ? "recent" : "search",
          page: data.page ?? filters.page,
          pageSize: data.pageSize ?? filters.pageSize,
          hasNext: Boolean(data.hasNext),
          hasPrev: Boolean(data.hasPrev),
          category: data.category ?? filters.category,
          status: data.status ?? filters.status,
          query: data.query ?? filters.query,
        };
        dispatch({
          type: "SET_SEARCH",
          results: data.results ?? [],
          query: data.query ?? filters.query,
          meta,
        });
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity(
            "info",
            "search",
            meta.mode === "recent"
              ? `Recent facts: ${(data.results ?? []).length} results on page ${meta.page}`
              : `Search "${data.query ?? filters.query}": ${(data.results ?? []).length} results on page ${meta.page}`,
          ),
        });
      } catch {
        dispatch({
          type: "SET_SEARCH",
          results: [],
          query: filters.query,
          meta: { ...DEFAULT_SEARCH_META, ...filters },
        });
      } finally {
        dispatch({ type: "SET_LOADING", value: false });
      }
    },
    [state.agent],
  );

  const handleSearchPage = useCallback(
    (page: number) => {
      void handleSearch({
        mode: state.searchMeta.mode,
        query: state.searchQuery,
        category: state.searchMeta.category,
        status: state.searchMeta.status,
        page,
        pageSize: state.searchMeta.pageSize,
      });
    },
    [handleSearch, state.searchMeta, state.searchQuery],
  );

  const handleLoadDocument = useCallback(
    async (doc: string) => {
      dispatch({ type: "SET_LOADING", value: true });
      try {
        const res = await fetch(
          `/api/document?agent=${encodeURIComponent(state.agent)}&doc=${encodeURIComponent(doc)}`,
        );
        const data = await res.json();
        if (!res.ok) {
          const message =
            typeof data.error === "string"
              ? data.error
              : `Failed to load ${doc}`;
          throw new Error(message);
        }
        // Note: docContent and docName are handled in Dashboard
        if (data.baseDir) dispatch({ type: "SET_BASE_DIR", dir: data.baseDir });
        dispatch({ type: "SET_TAB", tab: "output" });
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity("success", "doc", `Loaded ${doc}`),
        });
      } catch (err) {
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity(
            "error",
            "doc",
            `${doc} load failed: ${err instanceof Error ? err.message : "Unknown error"}`,
          ),
        });
      } finally {
        dispatch({ type: "SET_LOADING", value: false });
      }
    },
    [state.agent],
  );

  const handleInspectFact = useCallback(
    async (factId: string) => {
      dispatch({ type: "SET_LOADING", value: true });
      try {
        const res = await fetch(
          `/api/facts/${encodeURIComponent(factId)}?agent=${encodeURIComponent(state.agent)}`,
        );
        const data = await res.json();
        if (!res.ok) {
          const message =
            typeof data.error === "string"
              ? data.error
              : `Failed to inspect ${factId}`;
          throw new Error(message);
        }
        dispatch({ type: "SET_SELECTED_FACT", fact: data.fact ?? null });
        dispatch({ type: "SET_TAB", tab: "inspect" });
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity("success", "inspect", `Loaded fact ${factId}`),
        });
      } catch (err) {
        dispatch({ type: "SET_SELECTED_FACT", fact: null });
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity(
            "error",
            "inspect",
            `${factId} inspect failed: ${err instanceof Error ? err.message : "Unknown error"}`,
          ),
        });
      } finally {
        dispatch({ type: "SET_LOADING", value: false });
      }
    },
    [state.agent],
  );

  const handleStartDaemon = useCallback(
    async (mode: DaemonStatus["mode"], intervalSeconds: number) => {
      dispatch({ type: "SET_LOADING", value: true });
      dispatch({
        type: "ADD_ACTIVITY",
        event: mkActivity(
          "info",
          "daemon",
          `Starting daemon (${mode}, ${intervalSeconds}s)`,
        ),
      });
      try {
        const res = await fetch("/api/daemon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: state.agent, mode, intervalSeconds }),
        });
        const data = await res.json();
        if (!res.ok) {
          const message =
            typeof data.error === "string"
              ? data.error
              : "Failed to start daemon";
          throw new Error(message);
        }
        const daemon = data.daemon ?? DEFAULT_DAEMON;
        dispatch({ type: "SET_DAEMON_STATUS", daemon });
        dispatch({
          type: "SET_DAEMON",
          running: Boolean(daemon.running && daemon.agent === state.agent),
        });
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity(
            "success",
            "daemon",
            data.alreadyRunning ? "Daemon already running" : "Daemon started",
          ),
        });
        void loadState(state.agent, { silent: true });
      } catch (err) {
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity(
            "error",
            "daemon",
            `Daemon start failed: ${err instanceof Error ? err.message : "Unknown error"}`,
          ),
        });
      } finally {
        dispatch({ type: "SET_LOADING", value: false });
      }
    },
    [loadState, state.agent],
  );

  const handleStopDaemon = useCallback(async () => {
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({
      type: "ADD_ACTIVITY",
      event: mkActivity("info", "daemon", "Stopping daemon"),
    });
    try {
      const res = await fetch("/api/daemon", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        const message =
          typeof data.error === "string" ? data.error : "Failed to stop daemon";
        throw new Error(message);
      }
      const daemon = data.daemon ?? DEFAULT_DAEMON;
      dispatch({ type: "SET_DAEMON_STATUS", daemon });
      dispatch({
        type: "SET_DAEMON",
        running: Boolean(daemon.running && daemon.agent === state.agent),
      });
      dispatch({
        type: "ADD_ACTIVITY",
        event: mkActivity(
          "warn",
          "daemon",
          data.stopped ? "Daemon stopped" : "No daemon was running",
        ),
      });
      void loadState(state.agent, { silent: true });
    } catch (err) {
      dispatch({
        type: "ADD_ACTIVITY",
        event: mkActivity(
          "error",
          "daemon",
          `Daemon stop failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        ),
      });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, [loadState, state.agent]);

  const handleDocSave = useCallback(
    async (content: string, docName: string) => {
      if (!docName) return;
      try {
        dispatch({ type: "SET_LOADING", value: true });
        const res = await fetch("/api/document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: state.agent, doc: docName, content }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          const message =
            typeof data.error === "string"
              ? data.error
              : `Failed to save ${docName}`;
          throw new Error(message);
        }
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity("success", "doc", `Saved ${docName}`),
        });
      } catch (err) {
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity(
            "error",
            "doc",
            `${docName} save failed: ${err instanceof Error ? err.message : "Unknown error"}`,
          ),
        });
      } finally {
        dispatch({ type: "SET_LOADING", value: false });
      }
    },
    [state.agent],
  );

  const handleAddAgent = useCallback(
    async (name: string) => {
      try {
        await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add", name }),
        });
        dispatch({ type: "SET_AGENTS", agents: [...state.agents, name] });
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity("success", "agent", `Added agent: ${name}`),
        });
      } catch {
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity("error", "agent", `Failed to add ${name}`),
        });
      }
    },
    [state.agents],
  );

  const handleRemoveAgent = useCallback(
    async (name: string) => {
      try {
        await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remove", name }),
        });
        dispatch({
          type: "SET_AGENTS",
          agents: state.agents.filter((a) => a !== name),
        });
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity("info", "agent", `Removed agent: ${name}`),
        });
      } catch {
        dispatch({
          type: "ADD_ACTIVITY",
          event: mkActivity("error", "agent", `Failed to remove ${name}`),
        });
      }
    },
    [state.agents],
  );

  const handleAgentChange = useCallback(
    (agent: string) => {
      dispatch({ type: "SET_AGENT", agent });
      dispatch({ type: "RESET_WORKSPACE" });
      void loadState(agent);
    },
    [loadState],
  );

  const handleSetZone = useCallback((zone: ActiveZone) => {
    dispatch({ type: "SET_ZONE", zone });
  }, []);

  const handleOpenDetailPanel = useCallback(
    (mode: ZoneDetailPanel["mode"]) => {
      dispatch({ type: "SET_DETAIL_PANEL", panel: { open: true, mode } });
    },
    [],
  );

  const handleCloseDetailPanel = useCallback(() => {
    dispatch({ type: "SET_DETAIL_PANEL", panel: { open: false, mode: null } });
  }, []);

  return {
    state,
    dispatch,
    loadState,
    runCommand,
    handleSearch,
    handleSearchPage,
    handleLoadDocument,
    handleInspectFact,
    handleStartDaemon,
    handleStopDaemon,
    handleDocSave,
    handleAddAgent,
    handleRemoveAgent,
    handleAgentChange,
    handleSetZone,
    handleOpenDetailPanel,
    handleCloseDetailPanel,
  };
}
