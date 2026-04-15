# Cursor Handbook VSIX — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Cursor IDE quick-reference handbook as a VSIX extension with an Activity Bar icon that opens a sidebar webview panel.

**Architecture:** TypeScript VS Code extension with a `WebviewViewProvider` that serves a single self-contained `handbook.html` file. The HTML embeds all CSS, content, and JavaScript inline — no external network calls, works fully offline.

**Tech Stack:** TypeScript 5.x, VS Code Extension API, @vscode/vsce (packaging), tsc (compile), no framework dependencies.

---

### Task 1: Scaffold Project

**Files:**
- Create: `D:/Devop/cursor-handbook/package.json`
- Create: `D:/Devop/cursor-handbook/tsconfig.json`
- Create: `D:/Devop/cursor-handbook/.vscodeignore`

- [ ] **Step 1: Initialize package.json**

Create `D:/Devop/cursor-handbook/package.json`:

```json
{
  "name": "cursor-handbook",
  "displayName": "Cursor Handbook",
  "description": "Quick-reference productivity cheatsheet for Cursor IDE",
  "version": "1.0.0",
  "publisher": "local",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./out/extension.js",
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "cursor-handbook-container",
          "title": "Cursor Handbook",
          "icon": "media/icon.svg"
        }
      ]
    },
    "views": {
      "cursor-handbook-container": [
        {
          "type": "webview",
          "id": "cursorHandbook.panel",
          "name": "Quick Reference"
        }
      ]
    }
  },
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "package": "vsce package"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@vscode/vsce": "^3.0.0",
    "typescript": "^5.3.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

Create `D:/Devop/cursor-handbook/tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "Node16",
    "target": "ES2022",
    "outDir": "out",
    "rootDir": "src",
    "strict": true,
    "lib": ["ES2022"],
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", ".vscode-test"]
}
```

- [ ] **Step 3: Create .vscodeignore**

Create `D:/Devop/cursor-handbook/.vscodeignore`:

```
.vscode/**
src/**
node_modules/**
.gitignore
tsconfig.json
docs/**
**/*.map
```

- [ ] **Step 4: Install dependencies**

```powershell
cd D:/Devop/cursor-handbook
pnpm init -y
pnpm add -D @types/vscode @vscode/vsce typescript
```

Expected: `node_modules/` created, no errors.

---

### Task 2: Create Activity Bar Icon

**Files:**
- Create: `D:/Devop/cursor-handbook/media/icon.svg`

- [ ] **Step 1: Create the SVG icon**

Create `D:/Devop/cursor-handbook/media/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="18" height="18" rx="2"/>
  <line x1="7" y1="8" x2="17" y2="8"/>
  <line x1="7" y1="12" x2="14" y2="12"/>
  <line x1="7" y1="16" x2="11" y2="16"/>
  <circle cx="19" cy="19" r="4" fill="#eb5939" stroke="none"/>
  <text x="19" y="22" text-anchor="middle" font-size="5" fill="white" font-family="monospace">C</text>
</svg>
```

- [ ] **Step 2: Verify icon looks correct**

Open the SVG in a browser. Should show: a document icon with a small orange-red circle badge in the bottom right containing "C".

---

### Task 3: Implement Extension Entry Point

**Files:**
- Create: `D:/Devop/cursor-handbook/src/extension.ts`

- [ ] **Step 1: Write extension.ts**

Create `D:/Devop/cursor-handbook/src/extension.ts`:

```typescript
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new HandbookViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('cursorHandbook.panel', provider)
  );
}

export function deactivate(): void {}

class HandbookViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'media')
      ]
    };
    webviewView.webview.html = this.getHtml();
  }

  private getHtml(): string {
    const htmlPath = path.join(this.extensionUri.fsPath, 'media', 'handbook.html');
    return fs.readFileSync(htmlPath, 'utf8');
  }
}
```

- [ ] **Step 2: Compile and verify no TypeScript errors**

```powershell
cd D:/Devop/cursor-handbook
pnpm run compile
```

Expected: `out/extension.js` created, zero errors, zero warnings.

---

### Task 4: Create Handbook HTML

**Files:**
- Create: `D:/Devop/cursor-handbook/media/handbook.html`

This is the main deliverable — a fully self-contained single-file cheatsheet.

- [ ] **Step 1: Write handbook.html**

Create `D:/Devop/cursor-handbook/media/handbook.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cursor Handbook</title>
<style>
  /* ─── Reset & Base ─── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0d0d0d;
    --bg2:      #161616;
    --bg3:      #1e1e1e;
    --border:   #2a2a2a;
    --accent:   #eb5939;
    --accent2:  #ff7a5c;
    --text:     #b7ab98;
    --text-dim: #6b6b6b;
    --green:    #4ec994;
    --blue:     #5b9bd5;
    --yellow:   #d4a96a;
    --font:     'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --mono:     'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    --fs:       13px;
    --radius:   6px;
  }

  html, body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: var(--fs);
    line-height: 1.5;
    height: 100%;
    overflow-x: hidden;
  }

  /* ─── Layout ─── */
  .wrapper { display: flex; flex-direction: column; height: 100vh; }

  /* ─── Header ─── */
  .header {
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    padding: 10px 10px 8px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ─── Filter ─── */
  .filter-wrap { position: relative; margin-bottom: 8px; }
  .filter-wrap svg {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.4;
    pointer-events: none;
  }
  #filter {
    width: 100%;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 12px;
    font-family: var(--font);
    padding: 5px 8px 5px 28px;
    outline: none;
    transition: border-color 0.15s;
  }
  #filter:focus { border-color: var(--accent); }
  #filter::placeholder { color: var(--text-dim); }

  /* ─── Jump Nav ─── */
  .jump-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .jump-nav a {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 3px;
    background: var(--bg3);
    color: var(--text-dim);
    text-decoration: none;
    border: 1px solid var(--border);
    transition: all 0.1s;
    white-space: nowrap;
  }
  .jump-nav a:hover { color: var(--accent); border-color: var(--accent); }

  /* ─── Content ─── */
  .content { overflow-y: auto; flex: 1; padding: 8px 10px 24px; }

  /* ─── Section ─── */
  .section { margin-bottom: 20px; }
  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
  }
  .section-header span { opacity: 0.6; font-size: 13px; }

  /* ─── Table ─── */
  table { width: 100%; border-collapse: collapse; }
  tr { border-bottom: 1px solid #1a1a1a; }
  tr:last-child { border-bottom: none; }
  tr.hidden { display: none; }
  tr.highlight td { background: #1f1500; }
  td { padding: 4px 4px; vertical-align: top; line-height: 1.45; }
  td:first-child { width: 42%; padding-right: 8px; }

  /* ─── Kbd ─── */
  kbd {
    display: inline-block;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-bottom-width: 2px;
    border-radius: 3px;
    padding: 1px 5px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--blue);
    white-space: nowrap;
  }

  /* ─── Badges / Tags ─── */
  .tag {
    display: inline-block;
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: var(--mono);
    font-weight: 600;
  }
  .tag-agent  { background: #1a2e1a; color: var(--green); }
  .tag-ask    { background: #1a1a2e; color: var(--blue); }
  .tag-plan   { background: #2e2a1a; color: var(--yellow); }
  .tag-always { background: #2e1a1a; color: #ff6b6b; }
  .tag-auto   { background: #1a2a2a; color: #5bcfcf; }
  .tag-req    { background: #2a1a2e; color: #b06cd4; }
  .tag-manual { background: #1e1e1e; color: var(--text-dim); }

  /* ─── Code block ─── */
  .code-block {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 10px;
    font-family: var(--mono);
    font-size: 11.5px;
    color: #c9d1d9;
    margin: 6px 0;
    overflow-x: auto;
    white-space: pre;
    line-height: 1.6;
  }
  .code-block .key   { color: var(--blue); }
  .code-block .str   { color: var(--green); }
  .code-block .cmt   { color: var(--text-dim); font-style: italic; }

  /* ─── Tip box ─── */
  .tip {
    display: flex;
    gap: 8px;
    background: var(--bg2);
    border-left: 2px solid var(--accent);
    border-radius: 0 var(--radius) var(--radius) 0;
    padding: 6px 8px;
    margin: 4px 0;
    font-size: 12px;
    line-height: 1.5;
  }
  .tip-icon { flex-shrink: 0; font-size: 13px; }
  .tip-text { color: var(--text); }
  .tip-text strong { color: #e0d8cc; }

  /* ─── At symbol ─── */
  .at { color: var(--accent); font-weight: 700; font-family: var(--mono); }

  /* ─── Cmd ─── */
  .cmd { color: var(--green); font-family: var(--mono); font-size: 12px; }

  /* ─── Description text ─── */
  .dim { color: var(--text-dim); font-size: 12px; }

  /* ─── Scrollbar ─── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }

  /* ─── Filter highlight ─── */
  mark {
    background: #3d2800;
    color: var(--yellow);
    border-radius: 2px;
    padding: 0 1px;
  }
</style>
</head>
<body>
<div class="wrapper">

  <!-- ═══ HEADER ═══ -->
  <div class="header">
    <div class="title">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eb5939" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
      Cursor Handbook
    </div>

    <div class="filter-wrap">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input id="filter" type="text" placeholder="Filter shortcuts, commands..." autocomplete="off" spellcheck="false">
    </div>

    <nav class="jump-nav">
      <a href="#shortcuts">⌨️ Keys</a>
      <a href="#modes">🤖 Modes</a>
      <a href="#context">@ Context</a>
      <a href="#rules">📋 Rules</a>
      <a href="#slash">/ Commands</a>
      <a href="#mcp">🔌 MCP</a>
      <a href="#tips">⚡ Tips</a>
    </nav>
  </div>

  <!-- ═══ CONTENT ═══ -->
  <div class="content">

    <!-- ── 1. KEYBOARD SHORTCUTS ── -->
    <div class="section" id="shortcuts">
      <div class="section-header"><span>⌨️</span> Essential Shortcuts</div>
      <table id="tbl-shortcuts">
        <tr><td><kbd>Ctrl</kbd>+<kbd>I</kbd></td><td>Open Agent Chat panel</td></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>K</kbd></td><td>Inline Edit (at cursor)</td></tr>
        <tr><td><kbd>Tab</kbd></td><td>Accept Tab suggestion</td></tr>
        <tr><td><kbd>Esc</kbd></td><td>Reject suggestion</td></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>→</kbd></td><td>Accept next word of suggestion</td></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd></td><td>Add selection to Chat</td></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>Enter</kbd></td><td>Submit / Apply chat response</td></tr>
        <tr><td><kbd>Shift</kbd>+<kbd>Tab</kbd></td><td>Switch to Plan mode in Agent</td></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd></td><td>Open new chat in editor panel</td></tr>
        <tr><td><kbd>Alt</kbd>+<kbd>Enter</kbd></td><td>Apply inline edit suggestion</td></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd></td><td>Jump between chat checkpoints</td></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>Z</kbd> (post-accept)</td><td>Undo last Tab suggestion</td></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd></td><td>Command palette</td></tr>
        <tr><td><kbd>Ctrl</kbd>+<kbd>`</kbd></td><td>Open integrated terminal</td></tr>
      </table>
      <div class="tip" style="margin-top:6px">
        <span class="tip-icon">💡</span>
        <span class="tip-text">Mac: swap <strong>Ctrl → Cmd</strong> for all shortcuts above.</span>
      </div>
    </div>

    <!-- ── 2. AGENT MODES ── -->
    <div class="section" id="modes">
      <div class="section-header"><span>🤖</span> Agent Modes</div>
      <table id="tbl-modes">
        <tr>
          <td><span class="tag tag-agent">Agent</span></td>
          <td>Full autonomy — edits files, runs terminal, searches web. Use for implementing features.</td>
        </tr>
        <tr>
          <td><span class="tag tag-ask">Ask</span></td>
          <td>Read-only exploration. Answers questions about your codebase without modifying anything.</td>
        </tr>
        <tr>
          <td><span class="tag tag-plan">Plan</span></td>
          <td>Researches, asks clarifying questions, generates a plan — then <strong>waits for your approval</strong> before coding. Use for complex multi-file tasks.</td>
        </tr>
      </table>
      <div class="tip" style="margin-top:6px">
        <span class="tip-icon">🎯</span>
        <span class="tip-text"><strong>Rule of thumb:</strong> Ask → understand, Plan → multi-file work, Agent → execute.</span>
      </div>

      <div style="margin-top:10px; font-size:11px; font-weight:600; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px;">Agent Tools Available</div>
      <table>
        <tr><td class="dim">Semantic search</td><td class="dim">Find relevant code by meaning</td></tr>
        <tr><td class="dim">Web search</td><td class="dim">Live search + fetch URLs</td></tr>
        <tr><td class="dim">Read / Edit files</td><td class="dim">Including images</td></tr>
        <tr><td class="dim">Run shell commands</td><td class="dim">Terminal access</td></tr>
        <tr><td class="dim">Browser control</td><td class="dim">Headless browser automation</td></tr>
        <tr><td class="dim">Image generation</td><td class="dim">Generate assets inline</td></tr>
      </table>
    </div>

    <!-- ── 3. CONTEXT SYMBOLS ── -->
    <div class="section" id="context">
      <div class="section-header"><span>@</span> Context Symbols</div>
      <table id="tbl-context">
        <tr><td><span class="at">@Files</span></td><td>Attach a specific file to context</td></tr>
        <tr><td><span class="at">@Folders</span></td><td>Attach entire folder recursively</td></tr>
        <tr><td><span class="at">@Code</span></td><td>Reference a specific function / class / symbol</td></tr>
        <tr><td><span class="at">@Docs</span></td><td>External documentation (e.g. <span class="cmd">@docs React</span>)</td></tr>
        <tr><td><span class="at">@Web</span></td><td>Live web search result</td></tr>
        <tr><td><span class="at">@Git</span></td><td>Git history, diffs, blame</td></tr>
        <tr><td><span class="at">@Link</span></td><td>Fetch any URL as context</td></tr>
        <tr><td><span class="at">@Past Chats</span></td><td>Reference a previous chat session</td></tr>
        <tr><td><span class="at">@Cursor Rules</span></td><td>Explicitly include a specific rule</td></tr>
        <tr><td><span class="at">@Codebase</span></td><td>Semantic search across entire repo</td></tr>
      </table>
      <div class="tip" style="margin-top:6px">
        <span class="tip-icon">💡</span>
        <span class="tip-text">In Cursor 2.0+, Agent auto-gathers context — <strong>@ is optional</strong> but speeds things up when you know the relevant files.</span>
      </div>
    </div>

    <!-- ── 4. RULES ── -->
    <div class="section" id="rules">
      <div class="section-header"><span>📋</span> Rules</div>

      <div style="margin-bottom:6px; font-size:12px; color:var(--text-dim)">
        Location: <span class="cmd">.cursor/rules/</span> (per-project) or <span class="cmd">Cursor Settings → Rules</span> (global)
      </div>

      <table id="tbl-rules">
        <tr>
          <td><span class="tag tag-always">Always</span></td>
          <td>Injected into every agent context, every time.</td>
        </tr>
        <tr>
          <td><span class="tag tag-auto">Auto Attached</span></td>
          <td>Included when files match a glob pattern (e.g. <span class="cmd">*.ts</span>).</td>
        </tr>
        <tr>
          <td><span class="tag tag-req">Agent Requested</span></td>
          <td>Agent decides whether to include it. Requires a description.</td>
        </tr>
        <tr>
          <td><span class="tag tag-manual">Manual</span></td>
          <td>Only included when you explicitly type <span class="cmd">@ruleName</span>.</td>
        </tr>
      </table>

      <div style="margin-top:8px; margin-bottom:4px; font-size:11px; color:var(--text-dim); font-weight:600; text-transform:uppercase; letter-spacing:0.06em;">Rule File Anatomy (MDC)</div>
      <div class="code-block"><span class="cmt">---</span>
<span class="key">description</span>: <span class="str">"TypeScript strict conventions"</span>
<span class="key">globs</span>: <span class="str">["**/*.ts", "**/*.tsx"]</span>
<span class="key">alwaysApply</span>: <span class="str">false</span>
<span class="cmt">---</span>

Always use strict TypeScript.
No `any`. Prefer `unknown`.
Use Zod for external data validation.</div>
    </div>

    <!-- ── 5. SLASH COMMANDS ── -->
    <div class="section" id="slash">
      <div class="section-header"><span>/</span> Slash Commands</div>
      <table id="tbl-slash">
        <tr><td><span class="cmd">/plan</span></td><td>Switch to Plan mode</td></tr>
        <tr><td><span class="cmd">/ask</span></td><td>Switch to Ask (read-only) mode</td></tr>
        <tr><td><span class="cmd">/model &lt;name&gt;</span></td><td>Change active model</td></tr>
        <tr><td><span class="cmd">/compress</span></td><td>Summarize chat to free context space</td></tr>
        <tr><td><span class="cmd">/new-chat</span></td><td>Start fresh chat session</td></tr>
        <tr><td><span class="cmd">/resume &lt;folder&gt;</span></td><td>Resume a previous chat</td></tr>
        <tr><td><span class="cmd">/rules</span></td><td>Create or edit rules</td></tr>
        <tr><td><span class="cmd">/commands</span></td><td>Create or edit custom commands</td></tr>
        <tr><td><span class="cmd">/mcp list</span></td><td>Browse & configure MCP servers</td></tr>
        <tr><td><span class="cmd">/mcp enable &lt;name&gt;</span></td><td>Enable an MCP server</td></tr>
        <tr><td><span class="cmd">/auto-run [on|off]</span></td><td>Toggle agent auto-run</td></tr>
        <tr><td><span class="cmd">/max-mode [on|off]</span></td><td>Toggle max mode (extended thinking)</td></tr>
        <tr><td><span class="cmd">/sandbox</span></td><td>Configure sandbox / network access</td></tr>
        <tr><td><span class="cmd">/vim</span></td><td>Toggle Vim keybindings</td></tr>
        <tr><td><span class="cmd">/usage</span></td><td>View streaks & usage stats</td></tr>
        <tr><td><span class="cmd">/feedback &lt;msg&gt;</span></td><td>Send feedback to Cursor team</td></tr>
      </table>
    </div>

    <!-- ── 6. MCP ── -->
    <div class="section" id="mcp">
      <div class="section-header"><span>🔌</span> MCP — Model Context Protocol</div>
      <div style="margin-bottom:6px; font-size:12px; color:var(--text-dim)">Config file: <span class="cmd">~/.cursor/mcp.json</span> (global) or <span class="cmd">.cursor/mcp.json</span> (project)</div>

      <div class="code-block"><span class="cmt">// ~/.cursor/mcp.json</span>
{
  <span class="key">"mcpServers"</span>: {
    <span class="key">"my-server"</span>: {
      <span class="key">"command"</span>: <span class="str">"npx"</span>,
      <span class="key">"args"</span>: [<span class="str">"-y"</span>, <span class="str">"@modelcontextprotocol/server-name"</span>],
      <span class="key">"env"</span>: { <span class="key">"API_KEY"</span>: <span class="str">"your-key"</span> }
    }
  }
}</div>

      <table style="margin-top:6px">
        <tr><td class="dim">Via UI</td><td class="dim">Cursor Settings → Features → MCP → Add New</td></tr>
        <tr><td class="dim">Via CLI</td><td><span class="cmd">agent mcp add &lt;name&gt; -- &lt;command&gt;</span></td></tr>
        <tr><td class="dim">List servers</td><td><span class="cmd">/mcp list</span> in chat</td></tr>
        <tr><td class="dim">Transports</td><td class="dim">stdio (local), SSE / HTTP (remote)</td></tr>
      </table>
    </div>

    <!-- ── 7. POWER TIPS ── -->
    <div class="section" id="tips">
      <div class="section-header"><span>⚡</span> Power Tips</div>

      <div class="tip">
        <span class="tip-icon">🧠</span>
        <span class="tip-text"><strong>Plan before complex tasks.</strong> Press <kbd>Shift</kbd>+<kbd>Tab</kbd> or type <span class="cmd">/plan</span> → Agent researches → you approve → then it codes. Prevents wrong-direction sprints.</span>
      </div>
      <div class="tip">
        <span class="tip-icon">📎</span>
        <span class="tip-text"><strong>Use @Codebase for cross-repo questions.</strong> Better than @Files when you don't know exactly where the relevant code lives.</span>
      </div>
      <div class="tip">
        <span class="tip-icon">📋</span>
        <span class="tip-text"><strong>Rules = persistent memory.</strong> Put team conventions, stack preferences, and code style in <span class="cmd">Always</span> rules. Agent will follow them without you re-explaining every session.</span>
      </div>
      <div class="tip">
        <span class="tip-icon">🔄</span>
        <span class="tip-text"><strong>Use checkpoints to undo Agent changes.</strong> Ctrl+Shift+J to jump between checkpoints if the Agent went in the wrong direction.</span>
      </div>
      <div class="tip">
        <span class="tip-icon">🗜️</span>
        <span class="tip-text"><strong>Long sessions get slow?</strong> Type <span class="cmd">/compress</span> to summarize chat and free up context window without losing key info.</span>
      </div>
      <div class="tip">
        <span class="tip-icon">🔒</span>
        <span class="tip-text"><strong>Privacy mode.</strong> Enable in Settings → disable telemetry + code indexing sent to servers. Codebase indexing runs locally only.</span>
      </div>
      <div class="tip">
        <span class="tip-icon">⚡</span>
        <span class="tip-text"><strong>Inline Edit (Ctrl+K) for small changes.</strong> Don't open Agent Chat for single-function edits — Ctrl+K is faster and stays in context.</span>
      </div>
      <div class="tip">
        <span class="tip-icon">🌐</span>
        <span class="tip-text"><strong>@Link for live docs.</strong> Paste any URL as <span class="cmd">@https://docs.example.com/api</span> — Agent fetches and reads it as context.</span>
      </div>
    </div>

  </div><!-- /content -->
</div><!-- /wrapper -->

<script>
(function() {
  const input = document.getElementById('filter');
  const allRows = document.querySelectorAll('table tr');

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function clearHighlights() {
    document.querySelectorAll('mark').forEach(m => {
      const parent = m.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(m.textContent || ''), m);
        parent.normalize();
      }
    });
  }

  function highlightText(node, re) {
    if (node.nodeType === 3) {
      const text = node.textContent || '';
      if (!re.test(text)) return;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = re.exec(text)) !== null) {
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = re.lastIndex;
      }
      frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1 && node.nodeName !== 'MARK') {
      Array.from(node.childNodes).forEach(c => highlightText(c, re));
    }
  }

  input.addEventListener('input', function() {
    const q = this.value.trim();
    clearHighlights();

    if (!q) {
      allRows.forEach(r => r.classList.remove('hidden', 'highlight'));
      return;
    }

    const re = new RegExp(escapeRe(q), 'gi');

    allRows.forEach(function(row) {
      const text = row.textContent || '';
      if (re.test(text)) {
        re.lastIndex = 0;
        row.classList.remove('hidden');
        row.classList.add('highlight');
        Array.from(row.querySelectorAll('td')).forEach(td => highlightText(td, new RegExp(escapeRe(q), 'gi')));
      } else {
        re.lastIndex = 0;
        row.classList.add('hidden');
        row.classList.remove('highlight');
      }
    });
  });

  // Smooth scroll for jump links
  document.querySelectorAll('.jump-nav a').forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify HTML renders correctly**

Open `D:/Devop/cursor-handbook/media/handbook.html` directly in a browser.
Verify:
- Background is `#0d0d0d`
- Font size 13px, Inter font
- All 7 sections visible and formatted
- Filter input works (type "ctrl" → highlights keyboard rows)
- Jump nav scrolls to correct section

---

### Task 5: Build & Package VSIX

**Files:**
- Modify: `D:/Devop/cursor-handbook/package.json` (already complete from Task 1)

- [ ] **Step 1: Compile TypeScript**

```powershell
cd D:/Devop/cursor-handbook
pnpm run compile
```

Expected: `out/extension.js` exists, `out/extension.js.map` exists, no errors.

- [ ] **Step 2: Verify directory structure**

```powershell
ls D:/Devop/cursor-handbook/out/
ls D:/Devop/cursor-handbook/media/
```

Expected:
```
out/
  extension.js
  extension.js.map
media/
  icon.svg
  handbook.html
```

- [ ] **Step 3: Package as VSIX**

```powershell
cd D:/Devop/cursor-handbook
pnpm exec vsce package --no-dependencies
```

Expected: `cursor-handbook-1.0.0.vsix` created in `D:/Devop/cursor-handbook/`.

- [ ] **Step 4: Install in Cursor**

1. Open Cursor
2. `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
3. Select `D:/Devop/cursor-handbook/cursor-handbook-1.0.0.vsix`
4. Reload when prompted

- [ ] **Step 5: Verify in Cursor**

- Activity bar shows a document icon (scroll down on the left sidebar icons)
- Click it → sidebar opens with "Quick Reference" panel
- All 7 sections visible, dark theme, 13px font
- Filter works, jump links work

---

## Self-Review

**Spec coverage:**
- ✅ Activity Bar icon → sidebar webview panel
- ✅ Background #0d0d0d, font 13px
- ✅ 7 productivity sections with complete content
- ✅ Search/filter, jump nav
- ✅ Packaged as .vsix

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:**
- `HandbookViewProvider` used consistently
- `cursorHandbook.panel` view ID consistent between `package.json` and `extension.ts`
- `cursor-handbook-container` container ID consistent
