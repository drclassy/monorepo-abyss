import * as vscode from 'vscode'

const SENTRA_PROMPT_COMMAND = 'sentraPrompt.generateMission'
const SENTRA_PROMPT_BUTTON_TEXT = '$(sparkle) Sentra Prompt'

function toMissionTitle(input: string): string {
  const firstLine = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstLine) {
    return 'Replace with a short mission title'
  }

  return firstLine.length <= 80 ? firstLine : `${firstLine.slice(0, 77).trimEnd()}...`
}

function toMissionId(title: string): string {
  if (title === 'Replace with a short mission title') {
    return 'replace-with-short-kebab-case-id'
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

  return slug || 'replace-with-short-kebab-case-id'
}

function formatSentraPrompt(input: string): string {
  const normalizedInput = input.trim().replace(/\r\n/g, '\n')
  const missionTitle = toMissionTitle(normalizedInput)
  const missionId = toMissionId(missionTitle)

  return [
    'Turn the request below into a focused implementation mission.',
    '',
    'MISSION_ID:',
    missionId,
    '',
    'MISSION_TITLE:',
    missionTitle,
    '',
    'REQUEST:',
    normalizedInput,
    '',
    'DELIVERABLE:',
    '- Produce only the requested outcome.',
    '- Prefer the smallest complete change that satisfies the request.',
    '',
    'SCOPE_HINTS:',
    '- Work only in the area directly mentioned by the request.',
    '- If a required change falls outside that area, stop and report the blocker.',
    '',
    'CONSTRAINTS:',
    '- Do not assume any repository layout, package manager, framework, or file path unless the request states it.',
    '- Avoid unrelated refactors, renames, dependency changes, or speculative cleanup.',
    '',
    'VERIFICATION:',
    '- Run the smallest relevant verification for the touched area.',
    '- Report exact pass/fail results and any blocker commands verbatim.',
    '',
    'OUTPUT_FORMAT:',
    '- Summary',
    '- Files changed',
    '- Verification evidence',
    '- Risks or rollback note',
  ].join('\n')
}

async function generateSentraPrompt(): Promise<void> {
  const rawInput = await vscode.window.showInputBox({
    title: 'Sentra Prompt',
    prompt: 'Masukkan kebutuhan untuk diubah menjadi prompt misi Codex yang ringkas',
    placeHolder: 'Contoh: tambah command baru untuk menyalin hasil validasi ke clipboard',
    ignoreFocusOut: true,
    validateInput: (value: string) =>
      value.trim().length === 0 ? 'Teks misi tidak boleh kosong.' : undefined,
  })

  if (rawInput === undefined) {
    return
  }

  const prompt = formatSentraPrompt(rawInput)
  await vscode.env.clipboard.writeText(prompt)
  void vscode.window.showInformationMessage('Prompt misi Codex berhasil disalin ke clipboard.')
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(SENTRA_PROMPT_COMMAND, generateSentraPrompt)
  )

  const sentraPromptButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
  sentraPromptButton.text = SENTRA_PROMPT_BUTTON_TEXT
  sentraPromptButton.tooltip =
    'Ubah kebutuhan bebas menjadi prompt misi Codex dan salin ke clipboard'
  sentraPromptButton.command = SENTRA_PROMPT_COMMAND
  sentraPromptButton.show()

  context.subscriptions.push(sentraPromptButton)
}

export function deactivate(): void {}
