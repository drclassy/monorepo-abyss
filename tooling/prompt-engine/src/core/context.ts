import * as path from 'node:path'

import * as vscode from 'vscode'

import type { LightweightContext } from './composer'

function getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
  const activeUri = vscode.window.activeTextEditor?.document.uri
  if (activeUri) {
    return vscode.workspace.getWorkspaceFolder(activeUri) ?? undefined
  }

  return vscode.workspace.workspaceFolders?.[0]
}

export function getLightweightContext(): LightweightContext {
  const folder = getWorkspaceFolder()
  const workspacePath = folder?.uri.fsPath ?? ''
  const repoName = workspacePath ? path.basename(workspacePath) : ''
  const activeFilePath = vscode.window.activeTextEditor?.document.uri.fsPath ?? ''

  return {
    repoName,
    workspacePath,
    activeFilePath,
    coreRuleSource: '.cursor/rules/00-core.mdc',
  }
}
