import * as vscode from 'vscode'

import { auditPrompt, type AuditResult } from './core/audit'
import { appendPortalAuditLog, findMonorepoRoot } from './core/portal-audit-log'

const AUDIT_PROMPT_COMMAND = 'sentraPrompt.auditCodexPrompt'
const LEGACY_GENERATE_MISSION_COMMAND = 'sentraPrompt.generateMission'
const STATUS_BAR_TEXT = '$(shield-check) Sentra Prompt'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildList(items: string[]): string {
  if (items.length === 0) return '<li>None</li>'
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
}

function buildFindings(findings: AuditResult['findings']): string {
  if (findings.length === 0) return '<li>No major findings.</li>'

  return findings
    .map(
      (finding) =>
        `<li>[${escapeHtml(finding.severity.toUpperCase())}] ${escapeHtml(finding.title)}: ${escapeHtml(
          finding.message
        )}</li>`
    )
    .join('')
}

function buildScoreCards(scores: AuditResult['dimensionScores']): string {
  return Object.values(scores)
    .map(
      (dimension) => `
        <article class="score-card">
          <div>
            <h3>${escapeHtml(dimension.title)}</h3>
            <p>Status: <strong>${escapeHtml(dimension.status)}</strong></p>
          </div>
          <strong>${dimension.score}/${dimension.weight}</strong>
        </article>
      `
    )
    .join('')
}

function buildStatus(decision: AuditResult['decision']): { label: string; mode: string } {
  if (decision === 'ready') return { label: 'Ready', mode: 'success' }
  if (decision === 'unsafe') return { label: 'Unsafe', mode: 'error' }
  return { label: 'Needs Work', mode: 'partial' }
}

function buildWebviewHtml(result: AuditResult, selectedText: string): string {
  const status = buildStatus(result.decision)
  const suggestedRewrite = result.suggestedRewrite?.prompt || 'No rewrite required.'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sentra Prompt Prototype</title>
  <style>
    :root {
      --bg: #f6f2e8;
      --panel: #fffdf9;
      --line: #ddd6c8;
      --ink: #1f2937;
      --muted: #6b7280;
      --accent: #b45309;
      --accent-soft: #ffedd5;
      --success: #166534;
      --success-soft: #dcfce7;
      --warn: #92400e;
      --warn-soft: #fef3c7;
      --error: #991b1b;
      --error-soft: #fee2e2;
      --shadow: 0 16px 48px rgba(49, 33, 9, 0.08);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(255, 237, 213, 0.85), transparent 28%),
        radial-gradient(circle at bottom right, rgba(219, 234, 254, 0.85), transparent 28%),
        var(--bg);
    }
    .page { max-width: 1400px; margin: 0 auto; padding: 24px 18px 40px; }
    .hero, .panel, .subpanel, .score-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 22px;
      box-shadow: var(--shadow);
    }
    .hero { padding: 24px; margin-bottom: 18px; }
    .eyebrow {
      margin: 0 0 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent);
      font-weight: 700;
    }
    .hero h1 { margin: 0; font-size: 32px; }
    .lede { margin-top: 10px; max-width: 900px; color: var(--muted); line-height: 1.6; }
    .workspace { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 18px; margin-top: 18px; }
    .workspace-bottom { grid-template-columns: 0.95fr 1.05fr; }
    .panel { padding: 20px; }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 16px;
    }
    .panel-header h2, .subpanel h3, .score-card h3 { margin: 0; }
    .badge {
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: #e5e7eb;
      color: #374151;
    }
    .badge[data-mode="partial"] { background: var(--warn-soft); color: var(--warn); }
    .badge[data-mode="success"] { background: var(--success-soft); color: var(--success); }
    .badge[data-mode="error"] { background: var(--error-soft); color: var(--error); }
    .score-box { min-width: 120px; text-align: right; }
    .score-box span { display: block; color: var(--muted); font-size: 12px; }
    .score-box strong { font-size: 30px; }
    .overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .subpanel { padding: 16px; }
    .list { margin: 10px 0 0; padding-left: 18px; color: var(--muted); line-height: 1.6; }
    .actions { display: flex; gap: 12px; margin-top: 16px; }
    button {
      font: inherit;
      border-radius: 999px;
      padding: 10px 16px;
      border: 1px solid transparent;
      cursor: pointer;
    }
    .button-primary { background: var(--accent); color: #fff; }
    .button-secondary { background: #fff; border-color: #d1d5db; color: var(--ink); }
    .block-scores { display: grid; gap: 12px; }
    .score-card {
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }
    .score-card p { margin: 6px 0 0; color: var(--muted); }
    .prompt-output {
      margin: 0;
      min-height: 440px;
      padding: 18px;
      border-radius: 18px;
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      white-space: pre-wrap;
      line-height: 1.6;
      overflow: auto;
    }
    @media (max-width: 1100px) {
      .workspace, .workspace-bottom, .overview-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Sentra Prompt Prototype</p>
      <h1>Audit Codex Prompt</h1>
      <p class="lede">Selection audited against Codex-native guidance for Cursor, verification discipline, and prompt safety.</p>
    </section>

    <section class="workspace">
      <div class="panel">
        <div class="panel-header">
          <h2>Decision</h2>
          <span class="badge" data-mode="${escapeHtml(status.mode)}">${escapeHtml(status.label)}</span>
        </div>
        <div class="score-box" style="text-align:left;margin-bottom:16px;">
          <span>Total Score</span>
          <strong>${result.totalScore}/100</strong>
        </div>
        <div class="overview-grid">
          <div class="subpanel">
            <h3>Summary</h3>
            <p class="lede" style="margin:10px 0 0;max-width:none;">${escapeHtml(result.summary)}</p>
          </div>
          <div class="subpanel">
            <h3>Recommended Actions</h3>
            <ul class="list">${buildList(result.recommendedActions)}</ul>
          </div>
        </div>
        <div class="subpanel">
          <h3>Critical Findings</h3>
          <ul class="list">${buildFindings(result.findings)}</ul>
        </div>
        <div class="actions">
          <button id="applyRewrite" class="button button-primary" type="button">Apply Suggested Rewrite</button>
          <button id="copyRewrite" class="button button-secondary" type="button">Copy Suggested Rewrite</button>
          <button id="copySummary" class="button button-secondary" type="button">Copy Audit Summary</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Suggested Rewrite</h2>
        </div>
        <pre class="prompt-output">${escapeHtml(suggestedRewrite)}</pre>
      </div>
    </section>

    <section class="workspace workspace-bottom">
      <div class="panel">
        <div class="panel-header">
          <h2>Dimension Scores</h2>
        </div>
        <div class="block-scores">${buildScoreCards(result.dimensionScores)}</div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <h2>Selected Prompt</h2>
        </div>
        <pre class="prompt-output">${escapeHtml(selectedText)}</pre>
      </div>
    </section>
  </main>

  <script>
    const vscode = acquireVsCodeApi();
    document.getElementById('applyRewrite').addEventListener('click', () => vscode.postMessage({ type: 'applyRewrite' }));
    document.getElementById('copyRewrite').addEventListener('click', () => vscode.postMessage({ type: 'copyRewrite' }));
    document.getElementById('copySummary').addEventListener('click', () => vscode.postMessage({ type: 'copySummary' }));
  </script>
</body>
</html>`
}

async function replaceSelectionInEditor(
  editor: vscode.TextEditor,
  selection: vscode.Selection,
  value: string
): Promise<boolean> {
  return editor.edit((editBuilder) => {
    editBuilder.replace(selection, value)
  })
}

async function runPromptAudit(editor: vscode.TextEditor): Promise<void> {
  const selection = editor.selection

  if (selection.isEmpty) {
    void vscode.window.showWarningMessage(
      'Select a prompt in the editor first, then run Sentra Prompt audit.'
    )
    return
  }

  const selectedText = editor.document.getText(selection)
  const result = auditPrompt({
    selectedText,
    activeFilePath: editor.document.uri.fsPath,
    languageId: editor.document.languageId,
    manualInstruction: 'Official Sentra Codex prompt for Cursor',
    timestamp: new Date().toISOString(),
  })

  const repoRoot = findMonorepoRoot(editor.document.uri.fsPath)
  if (repoRoot) {
    try {
      appendPortalAuditLog(repoRoot, result, editor.document.uri.fsPath)
    } catch (error) {
      console.error(
        '[prompt-engine] audit log append failed:',
        error instanceof Error ? error.message : String(error)
      )
      // Portal log is best-effort; audit UI must still open
    }
  }

  const panel = vscode.window.createWebviewPanel(
    'sentraPromptAudit',
    'Sentra Prompt Prototype',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  )

  panel.webview.html = buildWebviewHtml(result, selectedText)
  const messageHandlers: Record<string, () => Promise<void>> = {
    async applyRewrite() {
      if (!result.suggestedRewrite?.prompt) {
        void vscode.window.showInformationMessage('No suggested rewrite is needed for this prompt.')
        return
      }
      const success = await replaceSelectionInEditor(
        editor,
        selection,
        result.suggestedRewrite.prompt
      )
      if (success) {
        void vscode.window.showInformationMessage('Selection replaced with the suggested rewrite.')
      } else {
        void vscode.window.showWarningMessage('Could not replace the selection.')
      }
    },
    async copyRewrite() {
      if (!result.suggestedRewrite?.prompt) {
        void vscode.window.showInformationMessage('No suggested rewrite is needed for this prompt.')
        return
      }
      await vscode.env.clipboard.writeText(result.suggestedRewrite.prompt)
      void vscode.window.showInformationMessage('Suggested rewrite copied.')
    },
    async copySummary() {
      await vscode.env.clipboard.writeText(result.auditSummary)
      void vscode.window.showInformationMessage('Audit summary copied.')
    },
  }

  const messageListener = panel.webview.onDidReceiveMessage(async (message: { type?: string }) => {
    if (!message?.type) return
    const handler = messageHandlers[message.type]
    if (handler) await handler()
  })
  panel.onDidDispose(() => {
    messageListener.dispose()
  })
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(AUDIT_PROMPT_COMMAND, async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        void vscode.window.showWarningMessage('Open a text editor with a prompt selection first.')
        return
      }

      await runPromptAudit(editor)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(LEGACY_GENERATE_MISSION_COMMAND, async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        void vscode.window.showWarningMessage('Open a text editor with a prompt selection first.')
        return
      }

      void vscode.window.showInformationMessage(
        'Sentra Prompt now audits selected Codex prompts. Running the new audit flow.'
      )
      await runPromptAudit(editor)
    })
  )

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
  statusBarItem.text = STATUS_BAR_TEXT
  statusBarItem.tooltip = 'Audit selected Codex prompt for Sentra in Cursor or VS Code'
  statusBarItem.command = AUDIT_PROMPT_COMMAND
  statusBarItem.show()

  context.subscriptions.push(statusBarItem)
}

export function deactivate(): void {}
