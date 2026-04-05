# Task ID: 3

**Title:** Move dashboard route from / to /dashboard

**Status:** done

**Dependencies:** None

**Priority:** high

**Description:** Create src/app/dashboard/page.tsx importing the existing Dashboard component, and add a dashboard-specific layout.tsx that preserves overflow:hidden behavior. Verify dashboard renders correctly at /dashboard with all existing functionality.

**Details:**

1. Create src/app/dashboard/page.tsx: import { Dashboard } from '@/components/dashboard'; export default function DashboardPage() { return <Dashboard /> }
2. Create src/app/dashboard/layout.tsx with overflow:hidden on the body/container
3. Update src/app/page.tsx to be a placeholder or landing shell
4. Verify all dashboard zones (Overview, Memory, Curation) work at /dashboard
5. Verify API routes still respond correctly

**Test Strategy:**

Navigate to /dashboard and verify: all zones load, command palette (Ctrl+K) works, API routes respond, daemon controls functional, detail panel opens/closes.
