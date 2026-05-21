import type { ComposeResult, PromptMode } from '../core/composer'

const MODES: Array<{ id: PromptMode; label: string }> = [
  { id: 'implement', label: 'Implement' },
  { id: 'review', label: 'Review' },
  { id: 'debug', label: 'Debug' },
  { id: 'plan', label: 'Plan' },
  { id: 'verify', label: 'Verify' },
]

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function buildPromptEngineHtml(initial: {
  repoName: string
  workspacePath: string
  activeFilePath: string
  coreRuleSource: string
  mode: PromptMode
  composed?: ComposeResult | null
}): string {
  const modeButtons = MODES.map(
    (mode) => `
      <button class="mode-chip${mode.id === initial.mode ? ' active' : ''}" data-mode="${mode.id}" type="button">
        ${escapeHtml(mode.label)}
      </button>
    `
  ).join('')

  const preview =
    initial.composed?.finalPrompt ?? 'Compose a prompt to preview the final output here.'
  const initialModeLabel = MODES.find((mode) => mode.id === initial.mode)?.label ?? initial.mode

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sentra Prompt Engine</title>
    <style>
      :root {
        --bg: #0d0d0d;
        --panel: #171717;
        --panel-alt: #1f1f1f;
        --text: #f3eadb;
        --muted: #b7ab98;
        --line: #343434;
        --accent: #eb5939;
        --accent-soft: rgba(235, 89, 57, 0.14);
        --ok: #6b9b8a;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: radial-gradient(circle at top right, rgba(235,89,57,0.12), transparent 28%), var(--bg);
        color: var(--text);
        font-family: "Segoe UI", system-ui, sans-serif;
      }
      .shell {
        width: min(1080px, calc(100% - 28px));
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
      h1 { margin: 10px 0 8px; font-size: 36px; }
      .lede { color: var(--muted); max-width: 760px; line-height: 1.6; }
      .meta-grid, .mode-row, .actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .meta-pill, .mode-chip {
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--panel-alt);
        color: var(--text);
        padding: 10px 14px;
      }
      .mode-chip.active {
        border-color: var(--accent);
        background: var(--accent-soft);
      }
      textarea, pre {
        width: 100%;
        border-radius: 16px;
        border: 1px solid var(--line);
        background: #121212;
        color: var(--text);
        padding: 16px;
        font: 14px/1.6 Consolas, "Cascadia Code", monospace;
      }
      textarea {
        min-height: 220px;
        resize: vertical;
      }
      pre {
        min-height: 260px;
        white-space: pre-wrap;
        margin: 0;
      }
      button.cta {
        border: 1px solid transparent;
        border-radius: 12px;
        background: var(--accent);
        color: white;
        padding: 12px 16px;
        cursor: pointer;
      }
      button.secondary {
        background: transparent;
        border-color: var(--line);
      }
      .status {
        color: var(--muted);
        min-height: 20px;
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="panel">
        <div class="eyebrow">Sentra local IDE utility</div>
        <h1>SENTRA PROMPT ENGINE</h1>
        <p class="lede">Type one free-form request, choose a mode, compose a ready-to-paste prompt, and copy it without leaving the IDE.</p>
      </section>

      <section class="panel">
        <div class="meta-grid">
          <span class="meta-pill">Repo: ${escapeHtml(initial.repoName || 'unknown')}</span>
          <span class="meta-pill">Workspace: ${escapeHtml(initial.workspacePath || 'unknown')}</span>
          <span class="meta-pill">Active file: ${escapeHtml(initial.activeFilePath || 'none')}</span>
          <span class="meta-pill">Rule: ${escapeHtml(initial.coreRuleSource || 'unknown')}</span>
          <span id="modeMeta" class="meta-pill">Mode: ${escapeHtml(initialModeLabel)}</span>
        </div>
      </section>

      <section class="panel">
        <div class="mode-row">${modeButtons}</div>
        <div style="height: 14px"></div>
        <textarea id="rawInput" placeholder="Jelaskan perubahan yang diinginkan, batasan, risiko, atau output yang diharapkan."></textarea>
        <div style="height: 14px"></div>
        <div class="actions">
          <button id="composeBtn" class="cta" type="button">Compose</button>
          <button id="copyBtn" class="cta secondary" type="button">Copy</button>
        </div>
        <div style="height: 10px"></div>
        <div id="status" class="status">Choose a mode, type a request, then compose.</div>
      </section>

      <section class="panel">
        <div class="eyebrow">Final prompt</div>
        <div style="height: 10px"></div>
        <pre id="preview">${escapeHtml(preview)}</pre>
      </section>
    </main>

    <script>
      const vscode = acquireVsCodeApi();
      let activeMode = ${JSON.stringify(initial.mode)};
      let lastPrompt = ${JSON.stringify(initial.composed?.finalPrompt ?? '')};

      function setStatus(message) {
        document.getElementById('status').textContent = message;
      }

      function setModeMeta(mode) {
        const active = ${JSON.stringify(MODES)}.find((item) => item.id === mode);
        document.getElementById('modeMeta').textContent = 'Mode: ' + (active ? active.label : mode);
      }

      function setMode(mode) {
        activeMode = mode;
        document.querySelectorAll('.mode-chip').forEach((button) => {
          button.classList.toggle('active', button.dataset.mode === mode);
        });
        setModeMeta(mode);
        setStatus('Mode set to ' + mode + '.');
      }

      document.querySelectorAll('.mode-chip').forEach((button) => {
        button.addEventListener('click', () => setMode(button.dataset.mode));
      });

      document.getElementById('composeBtn').addEventListener('click', () => {
        const rawInput = document.getElementById('rawInput').value;
        vscode.postMessage({ type: 'compose', mode: activeMode, rawInput });
      });

      document.getElementById('copyBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'copy', finalPrompt: lastPrompt });
      });

      window.addEventListener('message', (event) => {
        const message = event.data;
        if (message.type === 'composeResult') {
          lastPrompt = message.finalPrompt;
          document.getElementById('preview').textContent = message.finalPrompt;
          setStatus('Prompt composed and ready to copy.');
        }
        if (message.type === 'warning') {
          setStatus(message.message);
        }
        if (message.type === 'copied') {
          setStatus('Prompt copied to clipboard.');
        }
      });
    </script>
  </body>
  </html>`
}
