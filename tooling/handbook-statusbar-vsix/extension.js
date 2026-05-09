const path = require('path')
const vscode = require('vscode')

const DOCS = [
  {
    id: 'classy',
    label: 'Classy Handbook',
    description: 'docs/handbook/classy.html',
    command: 'classyHandbook.openClassy',
    relativePath: 'docs/handbook/classy.html',
  },
  {
    id: 'commands',
    label: 'Classy Commands',
    description: 'docs/handbook/classy-commands.html',
    command: 'classyHandbook.openCommands',
    relativePath: 'docs/handbook/classy-commands.html',
  },
  {
    id: 'cursor',
    label: 'Classy Cursor',
    description: 'docs/handbook/classy-cursor.html',
    command: 'classyHandbook.openCursor',
    relativePath: 'docs/handbook/classy-cursor.html',
  },
  {
    id: 'cline2026',
    label: 'Classy Cline 2026',
    description: 'docs/handbook/classycline-2026.html',
    command: 'classyHandbook.openCline2026',
    relativePath: 'docs/handbook/classycline-2026.html',
  },
]

function resolveDocPath(relativePath) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
  if (!workspaceFolder) {
    return null
  }

  return path.join(workspaceFolder.uri.fsPath, relativePath)
}

async function openInSimpleBrowser(relativePath) {
  const absolutePath = resolveDocPath(relativePath)
  if (!absolutePath) {
    vscode.window.showErrorMessage(
      'Buka workspace abyss-monorepo terlebih dahulu untuk memakai Classy Docs.'
    )
    return
  }

  const fileUri = vscode.Uri.file(absolutePath)

  try {
    await vscode.workspace.fs.stat(fileUri)
  } catch {
    vscode.window.showErrorMessage(`File handbook tidak ditemukan: ${absolutePath}`)
    return
  }

  await vscode.commands.executeCommand('simpleBrowser.show', fileUri.toString(true))
}

function registerOpenCommand(context, commandId, relativePath) {
  const disposable = vscode.commands.registerCommand(commandId, async () => {
    await openInSimpleBrowser(relativePath)
  })
  context.subscriptions.push(disposable)
}

function registerMenuCommand(context) {
  const disposable = vscode.commands.registerCommand('classyHandbook.openMenu', async () => {
    const selected = await vscode.window.showQuickPick(
      DOCS.map((doc) => ({
        label: doc.label,
        description: doc.description,
        command: doc.command,
      })),
      {
        title: 'Pilih dokumen handbook',
        placeHolder: 'Buka di editor panel (Simple Browser)',
      }
    )

    if (!selected) {
      return
    }

    await vscode.commands.executeCommand(selected.command)
  })

  context.subscriptions.push(disposable)
}

function createStatusBarButton(context) {
  const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
  button.text = '$(book) Classy Docs'
  button.tooltip = 'Buka handbook Classy'
  button.command = 'classyHandbook.openMenu'
  button.show()
  context.subscriptions.push(button)
}

function activate(context) {
  registerMenuCommand(context)

  for (const doc of DOCS) {
    registerOpenCommand(context, doc.command, doc.relativePath)
  }

  createStatusBarButton(context)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
