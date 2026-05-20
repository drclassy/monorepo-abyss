import * as fs from 'fs'
import * as path from 'path'

import * as vscode from 'vscode'

const HANDBOOK_DIR = path.join('docs', 'handbook')

interface HandbookItem extends vscode.QuickPickItem {
  fileUri: vscode.Uri
}

function isHandbookFile(file: string): boolean {
  return file.endsWith('.html') && !file.startsWith('_')
}

function toLabel(filename: string): string {
  return filename
    .replace('.html', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getHandbookFiles(workspaceFolder: vscode.WorkspaceFolder): HandbookItem[] {
  const handbookPath = path.join(workspaceFolder.uri.fsPath, HANDBOOK_DIR)
  try {
    if (!fs.existsSync(handbookPath)) return []
    return fs
      .readdirSync(handbookPath)
      .filter(isHandbookFile)
      .sort()
      .map((file) => ({
        label: toLabel(file),
        description: `${HANDBOOK_DIR}${path.sep}${file}`,
        fileUri: vscode.Uri.file(path.join(handbookPath, file)),
      }))
  } catch {
    return []
  }
}

async function showHandbookPalette(): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('Buka workspace abyss-monorepo untuk memakai Classy Docs.')
    return
  }
  const docs = getHandbookFiles(workspaceFolder)
  if (docs.length === 0) {
    vscode.window.showWarningMessage('Tidak ada file handbook ditemukan di docs/handbook/')
    return
  }
  const selected = await vscode.window.showQuickPick(docs, {
    title: '📚 Classy Handbook — Pilih Dokumen',
    placeHolder: 'Pilih dokumen untuk dibuka di Simple Browser...',
    matchOnDescription: true,
  })
  if (selected) {
    await vscode.commands.executeCommand('simpleBrowser.show', selected.fileUri.toString(true))
  }
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('classyHandbook.openPalette', showHandbookPalette)
  )

  const handbookButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
  handbookButton.text = '$(book) Classy Docs'
  handbookButton.tooltip = 'Buka handbook Classy (palette semua dokumen)'
  handbookButton.command = 'classyHandbook.openPalette'
  handbookButton.show()

  context.subscriptions.push(handbookButton)
}

export function deactivate(): void {}
