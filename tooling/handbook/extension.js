const path = require('path')
const fs = require('fs')
const vscode = require('vscode')

/**
 * Classy Handbook Launcher — Dynamic palette for all handbook docs.
 * Automatically discovers all .html files in docs/handbook/.
 * No hardcoded list — git can't break this.
 */

const HANDBOOK_DIR = 'docs' + path.sep + 'handbook'

function isHandbookFile(file) {
  return file.endsWith('.html') && !file.startsWith('_')
}

function getHandbookFiles(workspaceFolder) {
  const handbookPath = path.join(workspaceFolder.uri.fsPath, HANDBOOK_DIR)
  try {
    if (!fs.existsSync(handbookPath)) return []
    return fs
      .readdirSync(handbookPath)
      .filter(isHandbookFile)
      .sort()
      .map((file) => ({
        label: file
          .replace('.html', '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        description: `${HANDBOOK_DIR}/${file}`,
        filePath: path.join(handbookPath, file),
        fileUri: vscode.Uri.file(path.join(handbookPath, file)),
      }))
  } catch {
    return []
  }
}

async function openInSimpleBrowser(fileUri) {
  await vscode.commands.executeCommand('simpleBrowser.show', fileUri.toString(true))
}

async function showHandbookPalette(context) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
  if (!workspaceFolder) {
    vscode.window.showErrorMessage(
      'Buka workspace abyss-monorepo terlebih dahulu untuk memakai Classy Docs.'
    )
    return
  }

  const docs = getHandbookFiles(workspaceFolder)
  if (docs.length === 0) {
    vscode.window.showWarningMessage('Tidak ada file handbook ditemukan di docs/handbook/')
    return
  }

  const items = docs.map((doc) => ({
    label: doc.label,
    description: doc.description,
    filePath: doc.filePath,
    fileUri: doc.fileUri,
  }))

  const selected = await vscode.window.showQuickPick(items, {
    title: '📚 Classy Handbook — Pilih Dokumen',
    placeHolder: 'Pilih dokumen handbook untuk dibuka di Simple Browser...',
    matchOnDescription: true,
  })

  if (selected) {
    await openInSimpleBrowser(selected.fileUri)
  }
}

// Legacy individual commands (backward compatible)
function registerLegacyCommand(context, commandId, relativePath) {
  const disposable = vscode.commands.registerCommand(commandId, async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
    if (!workspaceFolder) {
      vscode.window.showErrorMessage(
        'Buka workspace abyss-monorepo terlebih dahulu untuk memakai Classy Docs.'
      )
      return
    }
    const absolutePath = path.join(workspaceFolder.uri.fsPath, relativePath)
    const fileUri = vscode.Uri.file(absolutePath)
    try {
      await vscode.workspace.fs.stat(fileUri)
    } catch {
      vscode.window.showErrorMessage(`File handbook tidak ditemukan: ${absolutePath}`)
      return
    }
    await openInSimpleBrowser(fileUri)
  })
  context.subscriptions.push(disposable)
}

function activate(context) {
  // Main palette button
  const paletteDisposable = vscode.commands.registerCommand('classyHandbook.openPalette', () =>
    showHandbookPalette(context)
  )
  context.subscriptions.push(paletteDisposable)

  // Legacy individual commands
  registerLegacyCommand(context, 'classyHandbook.openClassy', 'docs/handbook/classy.html')
  registerLegacyCommand(
    context,
    'classyHandbook.openCommands',
    'docs/handbook/classy-commands.html'
  )
  registerLegacyCommand(context, 'classyHandbook.openCursor', 'docs/handbook/classy-cursor.html')
  registerLegacyCommand(
    context,
    'classyHandbook.openCline2026',
    'docs/handbook/classy-cline-2026.html'
  )

  // Status bar button with icon
  const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
  button.text = '$(book) Classy Docs'
  button.tooltip = 'Buka handbook Classy (palette semua dokumen)'
  button.command = 'classyHandbook.openPalette'
  button.show()
  context.subscriptions.push(button)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
