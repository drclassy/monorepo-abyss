import {
  getPromptSourceLabel,
  type ComposeResult,
  type PromptConsoleView,
  type PromptMode,
  type PromptSourceKind,
} from '../core/composer'

const WORKFLOWS: Array<{ id: PromptConsoleView; label: string }> = [
  { id: 'compose', label: 'Compose' },
  { id: 'audit', label: 'Audit' },
  { id: 'rewrite', label: 'Rewrite' },
]

const MODES: Array<{ id: PromptMode; label: string }> = [
  { id: 'implement', label: 'Implement' },
  { id: 'review', label: 'Review' },
  { id: 'debug', label: 'Debug' },
  { id: 'plan', label: 'Plan' },
  { id: 'verify', label: 'Verify' },
]

const SOURCES: Array<{ id: PromptSourceKind; label: string }> = [
  { id: 'selection', label: 'Use Selection' },
  { id: 'document', label: 'Use Current File' },
  { id: 'clipboard', label: 'Use Clipboard' },
  { id: 'blank', label: 'Start Blank' },
]

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildSharedStyles(): string {
  return `
    :root {
      --bg: #0d0d0d;
      --panel: #171717;
      --panel-alt: #1f1f1f;
      --text: #f3eadb;
      --muted: #b7ab98;
      --line: #343434;
      --line-strong: #4a4a4a;
      --accent: #eb5939;
      --accent-soft: rgba(235, 89, 57, 0.14);
      --success: #6b9b8a;
      --success-soft: rgba(107, 155, 138, 0.14);
      --warn: #d6a441;
      --warn-soft: rgba(214, 164, 65, 0.14);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at top right, rgba(235, 89, 57, 0.12), transparent 28%),
        radial-gradient(circle at bottom left, rgba(107, 155, 138, 0.08), transparent 24%),
        var(--bg);
      color: var(--text);
      font-family: "Segoe UI", system-ui, sans-serif;
      font-size: 14px;
    }
    .shell {
      width: min(1160px, calc(100% - 28px));
      margin: 0 auto;
      padding: 24px 0 32px;
      display: grid;
      gap: 16px;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 18px;
    }
    .eyebrow {
      color: var(--muted);
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    h1 { margin: 10px 0 8px; font-size: 28px; }
    h2, h3 { margin: 0; }
    h2 { font-size: 20px; }
    h3 { font-size: 15px; }
    .lede { color: var(--muted); max-width: 760px; line-height: 1.55; font-size: 13px; }
    .meta-grid, .workflow-row, .mode-row, .source-row, .actions, .result-grid {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .workflow-chip, .meta-pill, .mode-chip, .source-chip, .decision-badge, .surface-button {
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--panel-alt);
      color: var(--text);
      padding: 9px 13px;
      font-size: 13px;
    }
    .workflow-chip.active,
    .mode-chip.active,
    .source-chip.active {
      border-color: var(--accent);
      background: var(--accent-soft);
    }
    .decision-badge[data-mode="success"] {
      border-color: var(--success);
      background: var(--success-soft);
    }
    .decision-badge[data-mode="partial"] {
      border-color: var(--warn);
      background: var(--warn-soft);
    }
    .decision-badge[data-mode="error"] {
      border-color: var(--accent);
      background: var(--accent-soft);
    }
    .workflow-panel { display: none; }
    .workflow-panel.active { display: block; }
    .section-stack { display: grid; gap: 14px; }
    .split {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 16px;
    }
    .triple {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }
    textarea, pre, .summary-box, .list-box {
      width: 100%;
      border-radius: 16px;
      border: 1px solid var(--line);
      background: #121212;
      color: var(--text);
      padding: 14px;
      font: 13px/1.55 Consolas, "Cascadia Code", monospace;
    }
    textarea {
      min-height: 220px;
      resize: vertical;
    }
    pre, .summary-box, .list-box {
      min-height: 180px;
      white-space: pre-wrap;
      margin: 0;
    }
    .summary-box, .list-box {
      font-family: "Segoe UI", system-ui, sans-serif;
    }
    .summary-box p,
    .list-box ul {
      margin: 0;
    }
    .list-box ul {
      padding-left: 18px;
      color: var(--muted);
      line-height: 1.6;
    }
    button.cta,
    button.surface-button {
      border: 1px solid transparent;
      border-radius: 12px;
      background: var(--accent);
      color: white;
      padding: 10px 14px;
      cursor: pointer;
      font: inherit;
    }
    button.secondary {
      background: transparent;
      border-color: var(--line);
    }
    button.ghost {
      background: var(--panel-alt);
      border-color: var(--line-strong);
    }
    .status {
      color: var(--muted);
      min-height: 20px;
      font-size: 13px;
    }
    .status strong { color: var(--text); }
    .panel-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
    }
    .sidebar-shell {
      width: calc(100% - 20px);
      padding: 12px 0 16px;
    }
    .sidebar-shell h1 {
      font-size: 18px;
      line-height: 1.15;
    }
    .sidebar-shell .panel {
      border-radius: 18px;
      padding: 16px;
    }
    .sidebar-grid {
      display: grid;
      gap: 12px;
    }
    .surface-actions {
      display: grid;
      gap: 10px;
    }
    .surface-button.secondary {
      background: var(--panel-alt);
      border-color: var(--line);
      color: var(--text);
    }
    .surface-note {
      border-radius: 14px;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.02);
      padding: 14px;
      color: var(--muted);
      line-height: 1.6;
    }
    @media (max-width: 1050px) {
      .split, .triple { grid-template-columns: 1fr; }
    }
  `
}

function buildSidebarHtml(initial: {
  repoName: string
  workspacePath: string
  activeFilePath: string
  coreRuleSource: string
  mode: PromptMode
  view: PromptConsoleView
  auditSourceKind: PromptSourceKind
  auditSourceText: string
}): string {
  const initialSourceLabel = getPromptSourceLabel(initial.auditSourceKind)
  const sourceStateSummary = initial.auditSourceText.trim()
    ? `Ready from ${initialSourceLabel.toLowerCase()}.`
    : 'No prompt content loaded yet.'

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sentra Prompt Home</title>
    <style>${buildSharedStyles()}</style>
  </head>
  <body>
    <main class="shell sidebar-shell">
      <section class="panel">
        <div class="eyebrow">Sentra prompt inside IDE</div>
        <h1>SENTRA PROMPT HOME</h1>
        <p class="lede">Buka console HTML penuh, audit prompt aktif, atau tarik draft dari clipboard tanpa ritual Command Palette.</p>
      </section>

      <section class="panel sidebar-grid">
        <div class="surface-actions">
          <button id="openComposeBtn" class="surface-button" type="button">Open Full Console</button>
          <button id="auditActiveBtn" class="surface-button secondary" type="button">Audit Active Prompt</button>
          <button id="auditClipboardBtn" class="surface-button secondary" type="button">Audit Clipboard</button>
        </div>
      </section>

      <section class="panel sidebar-grid">
        <div class="label">Status</div>
        <div class="surface-note">
          ${escapeHtml(sourceStateSummary)}
        </div>
      </section>
    </main>

    <script>
      const vscode = acquireVsCodeApi();

      document.getElementById('openComposeBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'openFullConsole' });
      });

      document.getElementById('auditActiveBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'auditActivePrompt' });
      });

      document.getElementById('auditClipboardBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'auditClipboard' });
      });
    </script>
  </body>
  </html>`
}

function buildPanelHtml(initial: {
  repoName: string
  workspacePath: string
  activeFilePath: string
  coreRuleSource: string
  mode: PromptMode
  view: PromptConsoleView
  auditSourceKind: PromptSourceKind
  auditSourceText: string
  composed?: ComposeResult | null
}): string {
  const workflowButtons = WORKFLOWS.map(
    (workflow) => `
      <button class="workflow-chip${workflow.id === initial.view ? ' active' : ''}" data-workflow="${workflow.id}" type="button">
        ${escapeHtml(workflow.label)}
      </button>
    `
  ).join('')

  const modeButtons = MODES.map(
    (mode) => `
      <button class="mode-chip${mode.id === initial.mode ? ' active' : ''}" data-mode="${mode.id}" type="button">
        ${escapeHtml(mode.label)}
      </button>
    `
  ).join('')

  const sourceButtons = SOURCES.map(
    (source) => `
      <button class="source-chip${source.id === initial.auditSourceKind ? ' active' : ''}" data-source="${source.id}" type="button">
        ${escapeHtml(source.label)}
      </button>
    `
  ).join('')

  const preview =
    initial.composed?.finalPrompt ?? 'Compose a prompt to preview the final output here.'

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sentra Prompt Engine</title>
    <style>${buildSharedStyles()}</style>
  </head>
  <body>
    <main class="shell">
      <section class="panel">
        <div class="eyebrow">Sentra local IDE utility</div>
        <h1>SENTRA PROMPT CONSOLE</h1>
        <p class="lede">Compose a new prompt, audit an existing draft from your editor or clipboard, then rewrite and apply the safer version without leaving the IDE.</p>
      </section>

      <section class="panel">
        <div class="workflow-row">${workflowButtons}</div>
      </section>

      <section id="composePanel" class="panel workflow-panel${initial.view === 'compose' ? ' active' : ''}">
        <div class="section-stack">
          <div class="panel-title">
            <h2>Compose Prompt</h2>
            <span class="label">Mode-aware builder</span>
          </div>
          <div class="mode-row">${modeButtons}</div>
          <textarea id="rawInput" placeholder="Jelaskan perubahan yang diinginkan, batasan, risiko, atau output yang diharapkan."></textarea>
          <div class="actions">
            <button id="composeBtn" class="cta" type="button">Compose</button>
            <button id="copyBtn" class="cta secondary" type="button">Copy Final Prompt</button>
          </div>
          <div id="composeStatus" class="status">Choose a mode, type a request, then compose.</div>
          <div>
            <div class="label">Final Prompt</div>
            <div style="height: 10px"></div>
            <pre id="preview">${escapeHtml(preview)}</pre>
          </div>
        </div>
      </section>

      <section id="auditPanel" class="panel workflow-panel${initial.view === 'audit' ? ' active' : ''}">
        <div class="section-stack">
          <div class="panel-title">
            <h2>Audit Prompt</h2>
            <span class="label">Selection, file, clipboard, or blank</span>
          </div>
          <div class="source-row">${sourceButtons}</div>
          <div class="actions">
            <button id="loadSourceBtn" class="cta ghost" type="button">Load Source</button>
            <button id="auditBtn" class="cta" type="button">Run Audit</button>
            <button id="copySummaryBtn" class="cta secondary" type="button">Copy Audit Summary</button>
          </div>
          <div id="auditStatus" class="status">Load a source or type a prompt draft, then run the audit.</div>
          <div>
            <div class="label">Audit Draft</div>
            <div style="height: 10px"></div>
            <textarea id="auditInput" placeholder="Load from selection, file, clipboard, or paste a prompt draft here.">${escapeHtml(
              initial.auditSourceText
            )}</textarea>
          </div>
          <div class="triple">
            <div class="summary-box">
              <div class="label">Decision</div>
              <div style="height: 10px"></div>
              <div class="result-grid" style="align-items:center;justify-content:space-between;">
                <span id="decisionBadge" class="decision-badge" data-mode="partial">Not Run</span>
                <strong id="totalScore">--/100</strong>
              </div>
              <div style="height: 12px"></div>
              <p id="summaryText" style="color: var(--muted); line-height: 1.6;">Run an audit to see findings and a suggested rewrite.</p>
            </div>
            <div class="list-box">
              <div class="label">Findings</div>
              <div style="height: 10px"></div>
              <ul id="findingsList">
                <li>No findings yet.</li>
              </ul>
            </div>
            <div class="list-box">
              <div class="label">Recommended Actions</div>
              <div style="height: 10px"></div>
              <ul id="actionsList">
                <li>No actions yet.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="rewritePanel" class="panel workflow-panel${initial.view === 'rewrite' ? ' active' : ''}">
        <div class="section-stack">
          <div class="panel-title">
            <h2>Rewrite Prompt</h2>
            <span class="label">Review original vs suggested rewrite</span>
          </div>
          <div class="actions">
            <button id="copyRewriteBtn" class="cta secondary" type="button">Copy Suggested Rewrite</button>
            <button id="applyRewriteBtn" class="cta" type="button">Apply Rewrite to Source</button>
          </div>
          <div id="rewriteStatus" class="status">Run an audit first to populate the rewrite panel.</div>
          <div class="split">
            <div>
              <div class="label">Original Prompt</div>
              <div style="height: 10px"></div>
              <pre id="originalPromptPreview">${escapeHtml(initial.auditSourceText || 'No source loaded yet.')}</pre>
            </div>
            <div>
              <div class="label">Suggested Rewrite</div>
              <div style="height: 10px"></div>
              <pre id="rewritePreview">No rewrite generated yet.</pre>
            </div>
          </div>
        </div>
      </section>
    </main>

    <script>
      const vscode = acquireVsCodeApi();
      const modes = ${JSON.stringify(MODES)};
      const sources = ${JSON.stringify(SOURCES)};
      const workflows = ${JSON.stringify(WORKFLOWS)};
      let activeMode = ${JSON.stringify(initial.mode)};
      let activeWorkflow = ${JSON.stringify(initial.view)};
      let activeSource = ${JSON.stringify(initial.auditSourceKind)};
      let lastPrompt = ${JSON.stringify(initial.composed?.finalPrompt ?? '')};
      let lastSuggestedRewrite = '';

      function byId(id) {
        return document.getElementById(id);
      }

      function renderList(id, items, emptyMessage) {
        const list = byId(id);
        list.innerHTML = '';
        if (!items || items.length === 0) {
          const li = document.createElement('li');
          li.textContent = emptyMessage;
          list.appendChild(li);
          return;
        }
        items.forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          list.appendChild(li);
        });
      }

      function setComposeStatus(message) {
        byId('composeStatus').textContent = message;
      }

      function setAuditStatus(message) {
        byId('auditStatus').textContent = message;
      }

      function setRewriteStatus(message) {
        byId('rewriteStatus').textContent = message;
      }

      function setModeMeta(mode) {
        const active = modes.find((item) => item.id === mode);
        const element = byId('modeMeta');
        if (element) {
          element.textContent = 'Mode: ' + (active ? active.label : mode);
        }
      }

      function showWorkflow(workflow) {
        activeWorkflow = workflow;
        document.querySelectorAll('.workflow-chip').forEach((button) => {
          button.classList.toggle('active', button.dataset.workflow === workflow);
        });
        document.querySelectorAll('.workflow-panel').forEach((panel) => {
          panel.classList.toggle('active', panel.id === workflow + 'Panel');
        });
      }

      function setMode(mode) {
        activeMode = mode;
        document.querySelectorAll('.mode-chip').forEach((button) => {
          button.classList.toggle('active', button.dataset.mode === mode);
        });
        setModeMeta(mode);
        setComposeStatus('Mode set to ' + mode + '.');
      }

      function setSource(sourceKind) {
        activeSource = sourceKind;
        document.querySelectorAll('.source-chip').forEach((button) => {
          button.classList.toggle('active', button.dataset.source === sourceKind);
        });
      }

      function updateAuditResult(message) {
        byId('decisionBadge').dataset.mode = message.decisionMode;
        byId('decisionBadge').textContent = message.decisionLabel;
        byId('totalScore').textContent = message.totalScore + '/100';
        byId('summaryText').textContent = message.summary;
        renderList('findingsList', message.findings, 'No findings.');
        renderList('actionsList', message.recommendedActions, 'No actions.');
        byId('rewritePreview').textContent = message.suggestedRewrite || 'No rewrite generated yet.';
        byId('originalPromptPreview').textContent = message.auditedText || 'No source loaded yet.';
        lastSuggestedRewrite = message.suggestedRewrite || '';
        setAuditStatus(message.statusMessage);
        setRewriteStatus(message.rewriteStatus);
      }

      document.querySelectorAll('.workflow-chip').forEach((button) => {
        button.addEventListener('click', () => showWorkflow(button.dataset.workflow));
      });

      document.querySelectorAll('.mode-chip').forEach((button) => {
        button.addEventListener('click', () => setMode(button.dataset.mode));
      });

      document.querySelectorAll('.source-chip').forEach((button) => {
        button.addEventListener('click', () => setSource(button.dataset.source));
      });

      byId('composeBtn').addEventListener('click', () => {
        const rawInput = byId('rawInput').value;
        vscode.postMessage({ type: 'compose', mode: activeMode, rawInput });
      });

      byId('copyBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'copy', finalPrompt: lastPrompt });
      });

      byId('loadSourceBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'loadAuditSource', sourceKind: activeSource });
      });

      byId('auditBtn').addEventListener('click', () => {
        const promptText = byId('auditInput').value;
        showWorkflow('audit');
        vscode.postMessage({ type: 'runAudit', sourceKind: activeSource, promptText });
      });

      byId('copySummaryBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'copyAuditSummary' });
      });

      byId('copyRewriteBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'copyAuditRewrite', suggestedRewrite: lastSuggestedRewrite });
      });

      byId('applyRewriteBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'applyAuditRewrite' });
      });

      window.addEventListener('message', (event) => {
        const message = event.data;

        if (message.type === 'composeResult') {
          lastPrompt = message.finalPrompt;
          byId('preview').textContent = message.finalPrompt;
          setComposeStatus('Prompt composed and ready to copy.');
          return;
        }

        if (message.type === 'composeWarning') {
          setComposeStatus(message.message);
          return;
        }

        if (message.type === 'composeCopied') {
          setComposeStatus('Prompt copied to clipboard.');
          return;
        }

        if (message.type === 'auditSourceLoaded') {
          setSource(message.sourceKind);
          byId('auditInput').value = message.sourceText;
          byId('originalPromptPreview').textContent = message.sourceText || 'No source loaded yet.';
          byId('rewritePreview').textContent = 'No rewrite generated yet.';
          lastSuggestedRewrite = '';
          setAuditStatus(message.notice);
          setRewriteStatus('Run an audit first to populate the rewrite panel.');
          return;
        }

        if (message.type === 'auditWarning') {
          setAuditStatus(message.message);
          setRewriteStatus(message.message);
          return;
        }

        if (message.type === 'auditResult') {
          updateAuditResult(message);
          showWorkflow('rewrite');
          return;
        }

        if (message.type === 'auditSummaryCopied') {
          setAuditStatus('Audit summary copied to clipboard.');
          return;
        }

        if (message.type === 'auditRewriteCopied') {
          setRewriteStatus('Suggested rewrite copied to clipboard.');
          return;
        }

        if (message.type === 'auditRewriteApplied') {
          setRewriteStatus(message.message);
        }
      });

      showWorkflow(activeWorkflow);
      setMode(activeMode);
      setSource(activeSource);
    </script>
  </body>
  </html>`
}

export function buildPromptEngineHtml(initial: {
  repoName: string
  workspacePath: string
  activeFilePath: string
  coreRuleSource: string
  mode: PromptMode
  view: PromptConsoleView
  auditSourceKind: PromptSourceKind
  auditSourceText: string
  composed?: ComposeResult | null
  surface?: 'panel' | 'sidebar'
}): string {
  if (initial.surface === 'sidebar') {
    return buildSidebarHtml(initial)
  }

  return buildPanelHtml(initial)
}
