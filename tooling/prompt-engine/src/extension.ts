import * as vscode from 'vscode'

import { auditPrompt, type AuditResult } from './core/audit'
import {
  canWriteBackPromptSource,
  composePrompt,
  getPromptSourceLabel,
  resolveAuditTarget,
  type PromptConsoleView,
  type PromptMode,
  type PromptSourceKind,
} from './core/composer'
import { getLightweightContext } from './core/context'
import { appendPortalAuditLog, findMonorepoRoot } from './core/portal-audit-log'
import { buildPromptEngineHtml } from './webview/prompt-engine-view'

const AUDIT_PROMPT_COMMAND = 'sentraPrompt.auditCodexPrompt'
const LEGACY_GENERATE_MISSION_COMMAND = 'sentraPrompt.generateMission'
const OPEN_PROMPT_ENGINE_COMMAND = 'sentraPrompt.openPromptEngine'
const SIDEBAR_VIEW_ID = 'sentraPrompt.home'
const SIDEBAR_CONTAINER_COMMAND = 'workbench.view.extension.sentraPrompt'
const STATUS_BAR_TEXT = '$(shield-check) Sentra Prompt'

let promptConsolePanel: vscode.WebviewPanel | undefined

interface WriteBackTarget {
  documentUri: vscode.Uri
  range: vscode.Range
  originalText: string
  documentVersion: number
}

interface PromptSourceState {
  kind: PromptSourceKind
  label: string
  text: string
  writeBackTarget?: WriteBackTarget
}

interface AuditPanelState {
  source: PromptSourceState
  auditedText: string
  result: AuditResult
}

interface PromptEngineLaunchOptions {
  initialView?: PromptConsoleView
  initialSourceState?: PromptSourceState
  initialNotice?: string
  autoRunAudit?: boolean
}

function getFullDocumentRange(document: vscode.TextDocument): vscode.Range {
  return new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length))
}

function createBlankSourceState(): PromptSourceState {
  return {
    kind: 'blank',
    label: getPromptSourceLabel('blank'),
    text: '',
  }
}

function createSelectionSourceState(editor: vscode.TextEditor): PromptSourceState {
  const text = editor.document.getText(editor.selection)

  return {
    kind: 'selection',
    label: getPromptSourceLabel('selection'),
    text,
    writeBackTarget: {
      documentUri: editor.document.uri,
      range: editor.selection,
      originalText: text,
      documentVersion: editor.document.version,
    },
  }
}

function createDocumentSourceState(editor: vscode.TextEditor): PromptSourceState {
  const range = getFullDocumentRange(editor.document)
  const text = editor.document.getText()

  return {
    kind: 'document',
    label: getPromptSourceLabel('document'),
    text,
    writeBackTarget: {
      documentUri: editor.document.uri,
      range,
      originalText: text,
      documentVersion: editor.document.version,
    },
  }
}

function resolveInitialSourceState(editor: vscode.TextEditor | undefined): {
  sourceState: PromptSourceState
  notice: string
} {
  if (!editor) {
    return {
      sourceState: createBlankSourceState(),
      notice: 'No active editor found. Start from a blank draft or load from clipboard.',
    }
  }

  const auditTarget = resolveAuditTarget({
    selectionText: editor.document.getText(editor.selection),
    documentText: editor.document.getText(),
  })

  if (auditTarget.source === 'selection') {
    return {
      sourceState: createSelectionSourceState(editor),
      notice: '',
    }
  }

  if (auditTarget.source === 'document') {
    return {
      sourceState: createDocumentSourceState(editor),
      notice: auditTarget.notice,
    }
  }

  return {
    sourceState: createBlankSourceState(),
    notice: auditTarget.notice,
  }
}

async function resolveExplicitSourceState(
  sourceKind: PromptSourceKind,
  editor: vscode.TextEditor | undefined
): Promise<{ sourceState?: PromptSourceState; warning?: string }> {
  if (sourceKind === 'clipboard') {
    const text = await vscode.env.clipboard.readText()
    if (!text.trim()) {
      return { warning: 'Clipboard is empty. Copy a prompt draft first.' }
    }

    return {
      sourceState: {
        kind: 'clipboard',
        label: getPromptSourceLabel('clipboard'),
        text,
      },
    }
  }

  if (sourceKind === 'blank') {
    return {
      sourceState: createBlankSourceState(),
    }
  }

  if (!editor) {
    return { warning: 'Open an editor first if you want to load from selection or file.' }
  }

  if (sourceKind === 'selection') {
    const text = editor.document.getText(editor.selection)
    if (!text.trim()) {
      return { warning: 'Select a prompt in the active editor first.' }
    }

    return {
      sourceState: createSelectionSourceState(editor),
    }
  }

  const text = editor.document.getText()
  if (!text.trim()) {
    return { warning: 'The current file is empty. Load another source or start blank.' }
  }

  return {
    sourceState: createDocumentSourceState(editor),
  }
}

async function postAuditSourceLoaded(
  panel: vscode.WebviewPanel,
  sourceState: PromptSourceState,
  notice: string
): Promise<void> {
  await panel.webview.postMessage({
    type: 'auditSourceLoaded',
    sourceKind: sourceState.kind,
    sourceLabel: sourceState.label,
    sourceText: sourceState.text,
    notice: notice || `Loaded ${sourceState.label.toLowerCase()} into the Prompt Console.`,
  })
}

function buildDecisionStatus(decision: AuditResult['decision']): { label: string; mode: string } {
  if (decision === 'ready') return { label: 'Ready', mode: 'success' }
  if (decision === 'unsafe') return { label: 'Unsafe', mode: 'error' }
  return { label: 'Needs Work', mode: 'partial' }
}

async function postAuditResult(
  panel: vscode.WebviewPanel,
  promptText: string,
  sourceState: PromptSourceState,
  result: AuditResult
): Promise<void> {
  const decision = buildDecisionStatus(result.decision)
  const canApplyRewrite =
    Boolean(result.suggestedRewrite?.prompt) &&
    canWriteBackPromptSource(sourceState.kind) &&
    Boolean(sourceState.writeBackTarget) &&
    promptText === sourceState.text

  const rewriteStatus = canApplyRewrite
    ? 'Rewrite is ready to apply back to the editor source.'
    : canWriteBackPromptSource(sourceState.kind)
      ? 'Copy the rewrite, or reload the source before applying it back to the editor.'
      : 'This source is not editor-backed. Copy the rewrite manually if you want to reuse it.'

  await panel.webview.postMessage({
    type: 'auditResult',
    sourceKind: sourceState.kind,
    sourceLabel: sourceState.label,
    auditedText: promptText,
    decisionLabel: decision.label,
    decisionMode: decision.mode,
    totalScore: result.totalScore,
    summary: result.summary,
    findings: result.findings.map(
      (finding) => `[${finding.severity.toUpperCase()}] ${finding.title}: ${finding.message}`
    ),
    recommendedActions: result.recommendedActions,
    suggestedRewrite: result.suggestedRewrite?.prompt ?? '',
    statusMessage: `Audit complete for ${sourceState.label.toLowerCase()}.`,
    rewriteStatus,
  })
}

function appendAuditLogIfPossible(sourceState: PromptSourceState, result: AuditResult): void {
  const filePath = sourceState.writeBackTarget?.documentUri.fsPath
  if (!filePath) return

  const repoRoot = findMonorepoRoot(filePath)
  if (!repoRoot) return

  try {
    appendPortalAuditLog(repoRoot, result, filePath)
  } catch (error) {
    console.error(
      '[prompt-engine] audit log append failed:',
      error instanceof Error ? error.message : String(error)
    )
  }
}

async function applyRewriteToSource(auditState: AuditPanelState): Promise<{
  ok: boolean
  message: string
}> {
  if (!auditState.result.suggestedRewrite?.prompt) {
    return {
      ok: false,
      message: 'No suggested rewrite is available yet.',
    }
  }

  if (!canWriteBackPromptSource(auditState.source.kind) || !auditState.source.writeBackTarget) {
    return {
      ok: false,
      message: 'This audit source is not editor-backed. Copy the rewrite instead.',
    }
  }

  if (auditState.auditedText !== auditState.source.text) {
    return {
      ok: false,
      message:
        'The audit draft no longer matches the loaded source. Reload the source first for a safe replace.',
    }
  }

  const target = auditState.source.writeBackTarget
  const document = await vscode.workspace.openTextDocument(target.documentUri)
  const currentText = document.getText(target.range)

  if (document.version !== target.documentVersion || currentText !== target.originalText) {
    return {
      ok: false,
      message:
        'The editor source changed after the audit was loaded. Reload the source before applying the rewrite.',
    }
  }

  const edit = new vscode.WorkspaceEdit()
  edit.replace(target.documentUri, target.range, auditState.result.suggestedRewrite.prompt)
  const success = await vscode.workspace.applyEdit(edit)

  if (!success) {
    return {
      ok: false,
      message: 'Could not apply the rewrite to the editor source.',
    }
  }

  return {
    ok: true,
    message: 'Rewrite applied to the editor source. Reload it before auditing again.',
  }
}

async function launchAuditPanel(
  context: vscode.ExtensionContext,
  sourceState: PromptSourceState,
  notice: string
): Promise<void> {
  await openPromptEnginePanel(context, {
    initialView: 'audit',
    initialSourceState: sourceState,
    initialNotice: notice,
    autoRunAudit: Boolean(sourceState.text.trim()),
  })
}

async function openPromptEnginePanel(
  context: vscode.ExtensionContext,
  options: PromptEngineLaunchOptions = {}
): Promise<void> {
  promptConsolePanel?.dispose()

  const promptContext = getLightweightContext()
  let activeMode: PromptMode = 'implement'
  let latestPrompt = ''
  let activeSourceState = options.initialSourceState ?? createBlankSourceState()
  let latestAuditState: AuditPanelState | null = null

  const panel = vscode.window.createWebviewPanel(
    'sentraPromptEngine',
    'Sentra Prompt Console',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  )
  promptConsolePanel = panel

  panel.webview.html = buildPromptEngineHtml({
    ...promptContext,
    mode: activeMode,
    view: options.initialView ?? 'compose',
    auditSourceKind: activeSourceState.kind,
    auditSourceText: activeSourceState.text,
    composed: null,
    surface: 'panel',
  })

  if (activeSourceState.text || options.initialNotice) {
    await postAuditSourceLoaded(panel, activeSourceState, options.initialNotice ?? '')
  }

  if (options.autoRunAudit && activeSourceState.text.trim()) {
    const result = auditPrompt({
      selectedText: activeSourceState.text,
      activeFilePath:
        activeSourceState.writeBackTarget?.documentUri.fsPath ?? promptContext.activeFilePath,
      languageId: 'text',
      manualInstruction: 'Official Sentra Codex prompt for Cursor',
      timestamp: new Date().toISOString(),
    })

    latestAuditState = {
      source: activeSourceState,
      auditedText: activeSourceState.text,
      result,
    }
    appendAuditLogIfPossible(activeSourceState, result)
    await postAuditResult(panel, activeSourceState.text, activeSourceState, result)
  }

  const messageListener = panel.webview.onDidReceiveMessage(
    async (message: {
      type?: string
      mode?: PromptMode
      rawInput?: string
      finalPrompt?: string
      sourceKind?: PromptSourceKind
      promptText?: string
      suggestedRewrite?: string
    }) => {
      if (!message?.type) return

      if (message.type === 'compose') {
        const rawInput = message.rawInput?.trim() ?? ''
        if (!rawInput) {
          await panel.webview.postMessage({
            type: 'composeWarning',
            message: 'Textarea masih kosong. Tulis request dulu.',
          })
          return
        }

        activeMode = message.mode ?? 'implement'
        const currentContext = getLightweightContext()
        const result = composePrompt({
          mode: activeMode,
          rawInput,
          context: currentContext,
        })

        latestPrompt = result.finalPrompt
        await panel.webview.postMessage({
          type: 'composeResult',
          finalPrompt: result.finalPrompt,
          modeLabel: result.modeLabel,
        })
        return
      }

      if (message.type === 'copy') {
        const finalPrompt = message.finalPrompt?.trim() || latestPrompt
        if (!finalPrompt) {
          await panel.webview.postMessage({
            type: 'composeWarning',
            message: 'Belum ada hasil compose untuk di-copy.',
          })
          return
        }

        latestPrompt = finalPrompt
        await vscode.env.clipboard.writeText(finalPrompt)
        await panel.webview.postMessage({ type: 'composeCopied' })
        return
      }

      if (message.type === 'loadAuditSource') {
        const sourceKind = message.sourceKind ?? 'selection'
        const resolved = await resolveExplicitSourceState(
          sourceKind,
          vscode.window.activeTextEditor
        )

        if (!resolved.sourceState) {
          await panel.webview.postMessage({
            type: 'auditWarning',
            message: resolved.warning ?? 'Could not load that source right now.',
          })
          return
        }

        activeSourceState = resolved.sourceState
        latestAuditState = null
        await postAuditSourceLoaded(
          panel,
          activeSourceState,
          `Loaded ${activeSourceState.label.toLowerCase()} for audit.`
        )
        return
      }

      if (message.type === 'runAudit') {
        const promptText = message.promptText ?? ''
        if (!promptText.trim()) {
          await panel.webview.postMessage({
            type: 'auditWarning',
            message: 'Audit draft is empty. Load a source or paste a prompt first.',
          })
          return
        }

        const sourceKind = message.sourceKind ?? activeSourceState.kind
        activeSourceState = {
          ...activeSourceState,
          kind: sourceKind,
          label: getPromptSourceLabel(sourceKind),
        }

        const result = auditPrompt({
          selectedText: promptText,
          activeFilePath:
            activeSourceState.writeBackTarget?.documentUri.fsPath ?? promptContext.activeFilePath,
          languageId: 'text',
          manualInstruction: 'Official Sentra Codex prompt for Cursor',
          timestamp: new Date().toISOString(),
        })

        latestAuditState = {
          source: activeSourceState,
          auditedText: promptText,
          result,
        }
        appendAuditLogIfPossible(activeSourceState, result)
        await postAuditResult(panel, promptText, activeSourceState, result)
        return
      }

      if (message.type === 'copyAuditSummary') {
        if (!latestAuditState) {
          await panel.webview.postMessage({
            type: 'auditWarning',
            message: 'Run an audit first before copying the summary.',
          })
          return
        }

        await vscode.env.clipboard.writeText(latestAuditState.result.auditSummary)
        await panel.webview.postMessage({ type: 'auditSummaryCopied' })
        return
      }

      if (message.type === 'copyAuditRewrite') {
        const suggestedRewrite =
          message.suggestedRewrite?.trim() ||
          latestAuditState?.result.suggestedRewrite?.prompt ||
          ''
        if (!suggestedRewrite) {
          await panel.webview.postMessage({
            type: 'auditWarning',
            message: 'No suggested rewrite is available yet.',
          })
          return
        }

        await vscode.env.clipboard.writeText(suggestedRewrite)
        await panel.webview.postMessage({ type: 'auditRewriteCopied' })
        return
      }

      if (message.type === 'applyAuditRewrite') {
        if (!latestAuditState) {
          await panel.webview.postMessage({
            type: 'auditWarning',
            message: 'Run an audit first before applying a rewrite.',
          })
          return
        }

        const outcome = await applyRewriteToSource(latestAuditState)
        if (!outcome.ok) {
          await panel.webview.postMessage({
            type: 'auditWarning',
            message: outcome.message,
          })
          return
        }

        await panel.webview.postMessage({
          type: 'auditRewriteApplied',
          message: outcome.message,
        })
      }
    }
  )

  panel.onDidDispose(() => {
    if (promptConsolePanel === panel) {
      promptConsolePanel = undefined
    }
    messageListener.dispose()
  })

  context.subscriptions.push(panel)
}

class PromptHomeViewProvider implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined

  constructor(private readonly context: vscode.ExtensionContext) {}

  async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    this.view = webviewView
    webviewView.webview.options = { enableScripts: true }

    const messageListener = webviewView.webview.onDidReceiveMessage(
      async (message: { type?: string }) => {
        if (!message?.type) return

        if (message.type === 'openFullConsole') {
          const { sourceState, notice } = resolveInitialSourceState(vscode.window.activeTextEditor)
          await openPromptEnginePanel(this.context, {
            initialView: 'compose',
            initialSourceState: sourceState,
            initialNotice: notice,
          })
          return
        }

        if (message.type === 'auditActivePrompt') {
          const { sourceState, notice } = resolveInitialSourceState(vscode.window.activeTextEditor)
          await launchAuditPanel(this.context, sourceState, notice)
          return
        }

        if (message.type === 'auditClipboard') {
          const resolved = await resolveExplicitSourceState(
            'clipboard',
            vscode.window.activeTextEditor
          )
          if (!resolved.sourceState) {
            void vscode.window.showWarningMessage(
              resolved.warning ?? 'Clipboard is empty. Copy a prompt draft first.'
            )
            return
          }

          await launchAuditPanel(this.context, resolved.sourceState, 'Loaded clipboard for audit.')
        }
      }
    )

    this.context.subscriptions.push(messageListener)
    await this.refresh()
  }

  async refresh(): Promise<void> {
    if (!this.view) return

    const promptContext = getLightweightContext()
    const { sourceState } = resolveInitialSourceState(vscode.window.activeTextEditor)

    this.view.webview.html = buildPromptEngineHtml({
      ...promptContext,
      mode: 'implement',
      view: 'compose',
      auditSourceKind: sourceState.kind,
      auditSourceText: sourceState.text,
      composed: null,
      surface: 'sidebar',
    })
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const promptHomeViewProvider = new PromptHomeViewProvider(context)

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SIDEBAR_VIEW_ID, promptHomeViewProvider)
  )

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      void promptHomeViewProvider.refresh()
    })
  )

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(() => {
      void promptHomeViewProvider.refresh()
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(AUDIT_PROMPT_COMMAND, async () => {
      const { sourceState, notice } = resolveInitialSourceState(vscode.window.activeTextEditor)
      await launchAuditPanel(context, sourceState, notice)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(LEGACY_GENERATE_MISSION_COMMAND, async () => {
      void vscode.window.showInformationMessage(
        'Sentra Prompt now opens the unified Prompt Console. Running the audit workflow there.'
      )

      const { sourceState, notice } = resolveInitialSourceState(vscode.window.activeTextEditor)
      await launchAuditPanel(context, sourceState, notice)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(OPEN_PROMPT_ENGINE_COMMAND, async () => {
      const { sourceState, notice } = resolveInitialSourceState(vscode.window.activeTextEditor)
      await openPromptEnginePanel(context, {
        initialView: 'compose',
        initialSourceState: sourceState,
        initialNotice: notice,
      })
    })
  )

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
  statusBarItem.text = STATUS_BAR_TEXT
  statusBarItem.tooltip = 'Open Sentra Prompt Home in the sidebar'
  statusBarItem.command = SIDEBAR_CONTAINER_COMMAND
  statusBarItem.show()

  context.subscriptions.push(statusBarItem)
}

export function deactivate(): void {}
