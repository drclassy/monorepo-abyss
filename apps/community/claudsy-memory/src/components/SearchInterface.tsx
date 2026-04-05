// Architected and built by Claudesy.

"use client";

import type { FactRecord, SearchMeta } from "@/lib/types";

interface SearchInterfaceProps {
  searchResults: FactRecord[];
  searchMeta: SearchMeta;
  onInspectFact: (factId: string) => void;
  onSearchPageChange?: (page: number) => void;
}

export function SearchInterface({
  searchResults,
  searchMeta,
  onInspectFact,
  onSearchPageChange,
}: SearchInterfaceProps) {
  return (
    <div className="workspace-panel">
      <div className="workspace-panel-header">
        <div>
          <div className="workspace-panel-title">SEARCH RESULTS</div>
          <div className="workspace-panel-sub">
            {searchResults.length === 0
              ? searchMeta.mode === "recent"
                ? "No recent facts loaded"
                : searchMeta.query
                  ? `No results for "${searchMeta.query}"`
                  : "No search performed"
              : searchMeta.mode === "recent"
                ? `${searchResults.length} recent result${searchResults.length !== 1 ? "s" : ""} on page ${searchMeta.page}`
                : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}${searchMeta.query ? ` for "${searchMeta.query}"` : ""} on page ${searchMeta.page}`}
          </div>
        </div>
      </div>
      <div className="workspace-panel-body">
        {searchResults.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 20px" }}>
            <div className="empty-state-title">No facts found yet</div>
            <div className="empty-state-sub">Try another query or filter.</div>
          </div>
        ) : (
          <div className="facts-table-wrap">
            <table className="facts-table">
              <thead>
                <tr>
                  <th className="facts-table-th">Fact</th>
                  <th className="facts-table-th">Category</th>
                  <th className="facts-table-th">Status</th>
                  <th className="facts-table-th">ID</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((r) => (
                  <tr
                    key={r.id}
                    className="facts-table-row"
                    onClick={() => onInspectFact(r.id)}
                    title="Click to inspect"
                  >
                    <td className="facts-table-td facts-td-fact">
                      <div className="facts-fact-main">{r.fact}</div>
                      <div className="facts-fact-source">{r.source}</div>
                    </td>
                    <td className="facts-table-td">
                      <span className={`badge badge-${r.category}`}>
                        {r.category}
                      </span>
                    </td>
                    <td className="facts-table-td">
                      <span
                        className={`status-badge status-${r.status === "active" ? "ok" : r.status === "stale" ? "warn" : "fail"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="facts-table-td facts-td-id">
                      {r.id.slice(0, 8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(searchMeta.category ||
          searchMeta.status ||
          searchMeta.mode === "recent") && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}
          >
            <span className="status-chip">
              <span className="status-chip-label">MODE</span>
              <span className="status-chip-value">{searchMeta.mode}</span>
            </span>
            {searchMeta.category && (
              <span className="status-chip">
                <span className="status-chip-label">CATEGORY</span>
                <span className="status-chip-value">{searchMeta.category}</span>
              </span>
            )}
            {searchMeta.status && (
              <span className="status-chip">
                <span className="status-chip-label">STATUS</span>
                <span className="status-chip-value">{searchMeta.status}</span>
              </span>
            )}
          </div>
        )}
        {onSearchPageChange && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <button
              className="cmd-btn"
              disabled={!searchMeta.hasPrev}
              onClick={() => onSearchPageChange(searchMeta.page - 1)}
            >
              Prev
            </button>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Page {searchMeta.page}
            </span>
            <button
              className="cmd-btn"
              disabled={!searchMeta.hasNext}
              onClick={() => onSearchPageChange(searchMeta.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
