'use client'

// Architected and built by Claudesy.

import { useState } from 'react'
import type { DashboardState, SearchFilters } from '@/lib/types'
import { SearchInterface } from '../SearchInterface'

interface MemoryZoneProps {
  state: DashboardState
  onSearch: (filters: SearchFilters) => void
  onSearchPageChange: (page: number) => void
  onInspectFact: (factId: string) => void
  onNewFact: () => void
}

export function MemoryZone({
  state,
  onSearch,
  onSearchPageChange,
  onInspectFact,
  onNewFact,
}: MemoryZoneProps) {
  const [query, setQuery]       = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus]     = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    onSearch({
      mode: 'search',
      query: query.trim(),
      category,
      status,
      page: 1,
      pageSize: state.searchMeta.pageSize,
    })
  }

  function handleRecent() {
    onSearch({
      mode: 'recent',
      query: '',
      category,
      status,
      page: 1,
      pageSize: state.searchMeta.pageSize,
    })
  }

  return (
    <div className="zone-page">
      <div className="zone-hero">
        <div>
          <h1 className="zone-hero-title">Memory Browser</h1>
          <p className="zone-hero-sub">
            {state.engineState?.factCount ?? 0} facts stored · search, inspect, create
          </p>
        </div>
        <button className="cmd-btn accent" onClick={onNewFact}>
          + New Fact
        </button>
      </div>

      {/* Search toolbar */}
      <section className="zone-card" style={{ marginBottom: 16 }}>
        <div className="zone-card-header">
          <span className="zone-card-title">Search & Filter</span>
        </div>
        <div className="zone-card-body">
          <form onSubmit={handleSearch} className="memory-search-bar">
            <input
              className="nav-input"
              style={{ flex: 1 }}
              placeholder="Search facts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="nav-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: 140 }}
            >
              <option value="">All categories</option>
              <option value="semantic">semantic</option>
              <option value="episodic">episodic</option>
              <option value="procedural">procedural</option>
              <option value="preference">preference</option>
            </select>
            <select
              className="nav-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: 130 }}
            >
              <option value="">All statuses</option>
              <option value="active">active</option>
              <option value="stale">stale</option>
              <option value="deleted">deleted</option>
              <option value="superseded">superseded</option>
            </select>
            <button className="cmd-btn accent" type="submit" disabled={state.loading}>
              Search
            </button>
            <button className="cmd-btn" type="button" onClick={handleRecent} disabled={state.loading}>
              Recent
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      <SearchInterface
        searchResults={state.searchResults}
        searchMeta={state.searchMeta}
        onInspectFact={onInspectFact}
        onSearchPageChange={onSearchPageChange}
      />
    </div>
  )
}
