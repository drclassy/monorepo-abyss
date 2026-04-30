# Cursor Handbook VSIX — Design Spec
Date: 2026-04-11

## Goal
Productivity-focused quick reference cheatsheet for Cursor IDE, packaged as a VSIX extension
that opens as a sidebar panel via an Activity Bar icon.

## Architecture
```
cursor-handbook/
├── package.json          # extension manifest
├── src/extension.ts      # activate() + WebviewViewProvider
├── media/
│   ├── icon.svg          # activity bar icon
│   └── handbook.html     # self-contained cheatsheet (inline CSS+content)
└── .vscodeignore
```

## UI
- Sidebar webview panel (Activity Bar icon → opens in sidebar)
- Background: #0d0d0d, font-size: 13px, accent: #eb5939
- Jump links at top for instant section navigation
- Filter/search input to highlight matching rows
- Compact 2-column tables for shortcuts

## Content Sections
1. Essential Shortcuts — keybindings (Ctrl+I, Ctrl+K, Tab, etc.)
2. Agent Modes — Agent / Ask / Plan with use cases
3. @ Context Symbols — @Files @Code @Docs @Web @Git @Link @Past Chats
4. Rules — 4 types (Always, Auto Attached, Agent Requested, Manual)
5. Slash Commands — /plan /ask /model /compress /new-chat /rules /mcp etc.
6. MCP Config — mcp.json quick setup
7. Power Tips — workflow best practices

## Implementation Stack
- TypeScript extension (no build step needed for HTML webview)
- Single self-contained handbook.html (offline capable)
- No external dependencies in webview

## Packaging
- vsce package → cursor-handbook-1.0.0.vsix
- Install via: Extensions → Install from VSIX
