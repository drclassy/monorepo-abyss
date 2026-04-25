# Digital Factory Dashboard - Comprehensive Design Plan

## Executive Overview

This document outlines the comprehensive design plan for a **monorepo digital factory dashboard** intended for monitoring multiple projects across four operational domains. The design preserves all existing visual elements (layout, positioning, colors, fonts) while introducing a cohesive structure that clearly differentiates the four main sections through strategic positioning and visual hierarchy.

---

## 1. DESIGN SYSTEM FOUNDATION

### 1.1 Visual Identity (Preserved Elements)

#### Color Palette
- **Primary Neutral**: White (#FFFFFF) / Dark (#0F0F12)
- **Secondary Neutral**: Light Gray (#F2F2F2) / Dark Gray (#1F1F23)
- **Text Colors**: Dark gray (#374151) / Light gray (#D1D5DB)
- **Borders**: Light gray (#E5E7EB) / Dark borders (#2B2B30)
- **Chart Colors**:
  - Chart 1: Orange (#F97316)
  - Chart 2: Teal (#2DD4BF)
  - Chart 3: Navy (#1E3A8A)
  - Chart 4: Yellow (#FBBF24)
  - Chart 5: Rose (#FB7185)

#### Typography
- **Font Family**: Inter (sans-serif)
- **Heading Styles**:
  - Section Headers: 18px, bold (font-bold), dark gray/white
  - Card Headers: 16px, bold, flex items-center with icon spacing
  - Subsection Labels: 12px, uppercase, tracking-wider, gray-500/gray-400
- **Body Text**: 14px, regular weight, gray-600/gray-300
- **Labels**: 12px, uppercase tracking-wider for section groupings

#### Spacing & Border Radius
- **Radius**: 0.5rem (standard rounded corners)
- **Card Spacing**: p-6 (24px padding)
- **Gap Between Sections**: gap-6 (24px)
- **Internal Element Gap**: gap-4 (16px)
- **Borders**: 1px solid, gray-200 (light) / #1F1F23 (dark)

---

## 2. LAYOUT ARCHITECTURE

### 2.1 Overall Structure

```
┌─────────────────────────────────────────────────┐
│ HEADER (Breadcrumb, Notifications, Theme, User) │ h-16
├──────────────┬──────────────────────────────────┤
│              │                                    │
│  SIDEBAR     │     MAIN CONTENT AREA             │
│  (Fixed)     │     (Scrollable)                   │
│  w-64        │     px-6 py-6                      │
│              │     flex-1                         │
└──────────────┴──────────────────────────────────┘
```

### 2.2 Main Content Grid Structure

The dashboard uses a **responsive grid system** with clear sectional organization:

#### Desktop Layout (lg: 1024px+)
```
┌─────────────────────────────────────────────────────────────┐
│                    SECTION 1 HEADER                          │
├─────────────────────────────┬───────────────────────────────┤
│  Operational Status (50%)    │  Health Integration (50%)     │
├─────────────────────────────┴───────────────────────────────┤
│                    SECTION 2 HEADER                          │
├─────────────────────────────────────────────────────────────┤
│              Knowledge Capacity (Full Width)                 │
├─────────────────────────────────────────────────────────────┤
│                    SECTION 3 HEADER                          │
├─────────────────────────────────────────────────────────────┤
│              Agent Activity (Full Width)                     │
└─────────────────────────────────────────────────────────────┘
```

#### Tablet Layout (md: 768px+)
```
┌──────────────────────────────────────┐
│  Operational Status (Full Width)     │
├──────────────────────────────────────┤
│  Health Integration (Full Width)     │
├──────────────────────────────────────┤
│  Knowledge Capacity (Full Width)     │
├──────────────────────────────────────┤
│  Agent Activity (Full Width)         │
└──────────────────────────────────────┘
```

#### Mobile Layout (< 768px)
All sections stack vertically (grid-cols-1)

---

## 3. FOUR MAIN SECTIONS - DETAILED SPECIFICATIONS

### 3.1 SECTION 1: OPERATIONAL STATUS

**Purpose**: Real-time overview of factory operations across all monitored projects

**Location**: Top-left (Desktop: 50% width, 2-column grid with Health Integration)

#### Structure
```
┌──────────────────────────────────────────────────┐
│ 📊 Operational Status (icon + bold heading)      │
├──────────────────────────────────────────────────┤
│                                                   │
│ • Active Projects Count                          │
│ • System Health Indicator (Color-coded)          │
│ • Running Tasks/Processes                        │
│ • Recent Operations Timeline                     │
│                                                   │
│ [Sub-component: Status Card List]                │
│ [Indicator: Green=Healthy, Yellow=Warning, Red] │
│                                                   │
└──────────────────────────────────────────────────┘
```

#### Visual Elements
- **Header Icon**: Briefcase or Factory icon (lucide-react)
- **Card Background**: white / #0F0F12 (dark)
- **Border**: gray-200 / #1F1F23
- **Status Indicators**: Color-coded badges
  - Green (#10B981) = Operational
  - Yellow (#F59E0B) = Monitoring
  - Red (#EF4444) = Critical
- **Padding**: p-6, rounded-xl
- **Content Density**: Medium - balanced between data and readability

#### Components Inside
1. **Status Card List** (similar to existing List01/02 pattern)
   - Project Name | Status Icon | Health Percentage
   - Row spacing: gap-3
   - Hover effect: bg-gray-50 / bg-[#1F1F23]

2. **Quick Stats Row** (optional top section)
   - Total Projects | Active | Idle | Down
   - Each stat in a mini-card with number + label

---

### 3.2 SECTION 2: HEALTH INTEGRATION & API

**Purpose**: Monitor API health, integration status, and communication channels

**Location**: Top-right (Desktop: 50% width, 2-column grid with Operational Status)

#### Structure
```
┌──────────────────────────────────────────────────┐
│ 🔗 Health Integration & API (icon + heading)     │
├──────────────────────────────────────────────────┤
│                                                   │
│ • API Endpoint Status (UP/DOWN)                  │
│ • Response Time Metrics                          │
│ • Integration Connections                        │
│ • Error Rates (Last 24h)                         │
│                                                   │
│ [Sub-component: Integration Status List]         │
│ [Real-time metrics display]                      │
│                                                   │
└──────────────────────────────────────────────────┘
```

#### Visual Elements
- **Header Icon**: Link or Zap icon (lucide-react)
- **Card Background**: white / #0F0F12 (dark)
- **Border**: gray-200 / #1F1F23
- **Metric Colors**: 
  - Green (#10B981) = Healthy
  - Orange (#F59E0B) = Slow
  - Red (#EF4444) = Error
- **Padding**: p-6, rounded-xl
- **Content Density**: Medium

#### Components Inside
1. **Integration Status List**
   - Service Name | Connected | Last Ping | Status
   - Visual indicator (dot) + text label
   - Row spacing: gap-3

2. **Metrics Grid** (optional)
   - 4 columns: Uptime % | Avg Response Time | Total Requests | Error Rate
   - Each metric: Large number (bold) + label

3. **Alert Box** (if errors exist)
   - Red/Yellow border left
   - Error summary with timestamp

---

### 3.3 SECTION 3: KNOWLEDGE CAPACITY

**Purpose**: Monitor data storage, processing capacity, and knowledge base metrics

**Location**: Full-width (Spans below sections 1 & 2)

#### Structure
```
┌─────────────────────────────────────────────────────────────┐
│ 💾 Knowledge Capacity (icon + heading)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [Multi-column layout with capacity indicators]              │
│                                                               │
│ ┌──────────────────────┬──────────────────────────────────┐ │
│ │ Storage Utilization  │ Processing Queue                 │ │
│ │ ███████░░░ 75%       │ Items: 1,245 | Pending: 432     │ │
│ └──────────────────────┴──────────────────────────────────┘ │
│                                                               │
│ ┌──────────────────────┬────────────────────────────────┐   │
│ │ Database Performance │ Cache Hit Rate                │   │
│ │ ████████░░ 82%       │ ██████████ 94%               │   │
│ └──────────────────────┴────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Visual Elements
- **Header Icon**: Database or Brain icon (lucide-react)
- **Card Background**: white / #0F0F12 (dark)
- **Border**: gray-200 / #1F1F23
- **Padding**: p-6, rounded-xl
- **Content**: 2x2 or 3-column grid (responsive)
- **Progress Bars**: 
  - Color progression: Green → Yellow → Red based on usage %
  - Height: h-2 or h-3

#### Components Inside
1. **Capacity Cards** (Each showing a metric)
   - Title | Chart/Visual | Percentage | Trend indicator (↑/↓)
   - Layout: flex column
   - Each card: bg-gray-50 / bg-[#1F1F23] padding p-4

2. **Progress Visualization**
   - Horizontal progress bars with labels
   - Color zones clearly marked

3. **Trend Indicator** (arrow icon)
   - Up/Down arrows showing change direction
   - Color: Green (good) or Red (concerning)

---

### 3.4 SECTION 4: AGENT ACTIVITY

**Purpose**: Track autonomous agent execution, tasks, and activity logs

**Location**: Full-width (Bottom section)

#### Structure
```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 Agent Activity (icon + heading)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [Activity timeline/list with real-time updates]             │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Agent Name  │ Task        │ Status      │ Time  │ Action│ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Agent-001   │ Data Sync   │ ✓ Complete  │ 2m ago│ View │ │
│ │ Agent-002   │ Processing  │ ⧖ Running   │ 30s ago│ Stop │ │
│ │ Agent-003   │ Analysis    │ ✗ Failed    │ 5m ago│ Retry│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Pagination or scroll] [Filter options]                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Visual Elements
- **Header Icon**: Zap or Workflow icon (lucide-react)
- **Card Background**: white / #0F0F12 (dark)
- **Border**: gray-200 / #1F1F23
- **Padding**: p-6, rounded-xl
- **Content**: Scrollable table/list format
- **Status Icons/Badges**:
  - ✓ (Green) = Complete
  - ⧖ (Orange) = Running
  - ✗ (Red) = Failed
  - ⏸ (Gray) = Paused

#### Components Inside
1. **Activity Table/List** (Similar to existing List01/02/03)
   - Columns: Agent Name | Task | Status | Duration | Action
   - Row alternation: subtle (not required)
   - Hover state: bg-gray-50 / bg-[#1F1F23]
   - Padding per row: py-3, px-4

2. **Status Badge** (Inline)
   - Colored pill badges
   - Icons: CheckCircle, Clock, AlertCircle, PauseCircle

3. **Action Column** (Right-aligned)
   - Secondary buttons: View Details, Stop, Retry, etc.
   - Size: sm, variant: outline
   - Hover behavior: consistent with design system

4. **Real-time Indicator** (Optional)
   - Blinking dot or subtle animation on running tasks
   - Color: Chart color (orange/yellow)

5. **Footer Actions** (Optional)
   - Pagination controls (if data exceeds visible rows)
   - Filter/sort options
   - Refresh button

---

## 4. COMPONENT REUSABILITY & PATTERNS

### 4.1 Shared Card Component Pattern
All four sections use a consistent card pattern:

```tsx
// Structure maintained across all sections
<div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
    <IconComponent className="w-3.5 h-3.5" />
    Section Title
  </h2>
  
  {/* Content varies by section */}
</div>
```

### 4.2 List Item Pattern
For Activity and Status lists, maintain consistent row styling:

```tsx
<div className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50 dark:hover:bg-[#1F1F23] rounded-lg transition-colors">
  <div className="flex-1">
    <p className="text-sm font-medium text-gray-900 dark:text-white">Name/Title</p>
  </div>
  <div className="text-sm text-gray-600 dark:text-gray-300">
    Secondary Info
  </div>
  <StatusBadge status={status} />
  <ActionButton />
</div>
```

### 4.3 Metric/Progress Pattern
For capacity metrics:

```tsx
<div className="bg-gray-50 dark:bg-[#1F1F23] p-4 rounded-lg">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Label</span>
    <span className="text-sm font-bold text-gray-900 dark:text-white">85%</span>
  </div>
  <div className="h-2 bg-gray-200 dark:bg-[#2B2B30] rounded-full overflow-hidden">
    <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
  </div>
</div>
```

---

## 5. VISUAL HIERARCHY & INFORMATION FLOW

### 5.1 Hierarchy Levels
1. **Level 1**: Main section headers (18px bold, icon + text)
2. **Level 2**: Card headers (16px bold)
3. **Level 3**: Row/Item labels (14px regular)
4. **Level 4**: Secondary info/descriptions (12px, gray-600)
5. **Level 5**: Micro-labels (12px, uppercase tracking-wider)

### 5.2 Scanning Pattern
The layout follows an **F-pattern** scan for optimal information absorption:

1. **Top horizontal**: Section 1 & 2 headers (Operational Status & Health Integration)
2. **Vertical left**: Operational Status content
3. **Vertical right**: Health Integration content
4. **Horizontal middle**: Knowledge Capacity full-width section
5. **Vertical full**: Agent Activity full-width section

### 5.3 Eye Movement Flow
```
┌─────────────────────────────────────────────────────┐
│ START: Operational Status      Health Integration   │
│   ↓↓↓↓↓↓↓↓                         ↓↓↓↓↓↓↓↓        │
│   ↓ Content ↓                     ↓ Content ↓      │
│   ↓↓↓↓↓↓↓↓                         ↓↓↓↓↓↓↓↓        │
├─────────────────────────────────────────────────────┤
│ ↓ Knowledge Capacity (Full Width - Secondary Focus)│
│ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓  │
├─────────────────────────────────────────────────────┤
│ ↓ Agent Activity (Full Width - Detailed Reference) │
│ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓  │
└─────────────────────────────────────────────────────┘
```

---

## 6. RESPONSIVE BEHAVIOR

### 6.1 Breakpoints
- **Mobile** (< 768px): All sections full-width, stacked vertically
- **Tablet** (768px - 1024px): Sections still full-width for clarity
- **Desktop** (1024px+): Sections 1 & 2 in 2-column grid, Sections 3 & 4 full-width

### 6.2 Content Adaptation
- **Mobile**: Reduce padding (p-4 instead of p-6), smaller font sizes
- **Tablet**: Moderate spacing, visible icons
- **Desktop**: Full padding, expanded layouts, visible action buttons

---

## 7. DARK MODE IMPLEMENTATION

The template uses CSS custom properties for seamless dark mode toggling:

- Light Background: `#FFFFFF` → Dark: `#0F0F12`
- Light Cards: `#FFFFFF` → Dark: `#0F0F12`
- Light Borders: `#E5E7EB` → Dark: `#1F1F23`
- Light Hover: `#F3F4F6` → Dark: `#1F1F23`

All sections automatically adapt without additional styling needed.

---

## 8. INTERACTION PATTERNS

### 8.1 Hover States
- **Cards**: Subtle border color shift, shadow enhancement (optional)
- **Rows/List Items**: bg-gray-50 (light) / bg-[#1F1F23] (dark)
- **Buttons**: Standard UI button behavior (already in template)
- **Badges**: Color intensification

### 8.2 Loading States
- **Section Loading**: Skeleton loaders (optional enhancement)
- **Real-time Updates**: Smooth transitions, no jarring jumps
- **Activity Updates**: Subtle highlight/flash on new items

### 8.3 Empty States
For sections with no data:
- Centered icon + message
- Sample action button
- Light gray background (bg-gray-50 / bg-[#1F1F23])

---

## 9. IMPLEMENTATION SEQUENCE

### Phase 1: Core Structure
1. Create section container components:
   - `OperationalStatusSection.tsx`
   - `HealthIntegrationSection.tsx`
   - `KnowledgeCapacitySection.tsx`
   - `AgentActivitySection.tsx`

2. Update main content area layout:
   - Implement 2-column grid for sections 1 & 2
   - Full-width layout for sections 3 & 4
   - Responsive grid-cols-1 for smaller screens

### Phase 2: Section-Specific Content
1. Create reusable list components
2. Add status indicators and badges
3. Implement metric displays and progress bars
4. Add action buttons and controls

### Phase 3: Polish & Refinement
1. Dark mode verification
2. Responsive design testing
3. Animation/transition additions (optional)
4. Performance optimization

---

## 10. PRESERVED ELEMENTS CHECKLIST

✅ **Colors**: All existing color palette maintained
✅ **Typography**: Inter font, sizing hierarchy preserved
✅ **Layout System**: Flexbox + grid grid patterns
✅ **Component Styling**: Rounded corners (rounded-xl), borders, shadows
✅ **Spacing Scale**: Tailwind spacing utilities (gap-4, p-6, etc.)
✅ **Dark Mode**: CSS custom properties + class-based toggle
✅ **Icon Library**: Lucide-react icons consistent
✅ **Sidebar Navigation**: Unchanged structure and positioning
✅ **Top Navigation**: Unchanged header with breadcrumbs, notifications
✅ **Theme Toggle**: Existing implementation preserved

---

## 11. VISUAL SPECIFICATIONS SUMMARY

| Element | Light Mode | Dark Mode | Font Size | Weight |
|---------|-----------|-----------|-----------|--------|
| Section Header | Gray-900 | White | 18px | Bold |
| Card Header | Gray-900 | White | 16px | Bold |
| Card Background | White | #0F0F12 | - | - |
| Card Border | Gray-200 | #1F1F23 | - | - |
| Body Text | Gray-600 | Gray-300 | 14px | Regular |
| Secondary Text | Gray-500 | Gray-400 | 12px | Regular |
| Padding (Cards) | p-6 (24px) | p-6 (24px) | - | - |
| Gap (Sections) | gap-6 (24px) | gap-6 (24px) | - | - |
| Border Radius | rounded-xl (0.5rem) | rounded-xl (0.5rem) | - | - |
| Icon Size | w-3.5 h-3.5 (14px) | w-3.5 h-3.5 (14px) | - | - |

---

## 12. DESIGN PRINCIPLES

1. **Clarity Over Density**: Information clearly organized, not overwhelming
2. **Consistent Spacing**: Maintains rhythm and visual breathing room
3. **Color-Coded Status**: Status immediately recognizable at a glance
4. **Responsive-First**: Works seamlessly across all screen sizes
5. **Accessibility**: High contrast ratios, clear labels, keyboard navigation
6. **Professional Aesthetic**: Clean, minimal, operational-focused
7. **Real-time Ready**: Smooth updates, loading states, activity indicators

---

## 13. NEXT STEPS FOR IMPLEMENTATION

1. Review this plan with stakeholders
2. Approve section titles and key metrics
3. Define sample data structures for each section
4. Begin component development following the structure outlined
5. Test responsive behavior across devices
6. Implement real-time data connections as needed
7. Add analytics and tracking if required

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-21  
**Status**: Ready for Implementation
