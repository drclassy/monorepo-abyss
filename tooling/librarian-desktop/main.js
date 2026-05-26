function loadElectronMain() {
  const candidates = ['electron/main', 'node:electron', 'electron']

  for (const candidate of candidates) {
    try {
      const loaded = require(candidate)
      if (loaded?.app && loaded?.BrowserWindow && loaded?.ipcMain) {
        return loaded
      }
    } catch {
      // Keep probing until a valid Electron main surface is found.
    }
  }

  throw new Error(
    'Electron main process APIs are unavailable. Check ELECTRON_RUN_AS_NODE and startup shell.'
  )
}

const { app, BrowserWindow, ipcMain } = loadElectronMain()

const OLLAMA_CHAT_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/chat'
const LITERATURE_WORKER_URL = process.env.LITERATURE_WORKER_URL || 'http://127.0.0.1:8787'

ipcMain.handle('ollama:chat', async (_event, payload) => {
  const response = await fetch(OLLAMA_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Ollama chat failed (${response.status}): ${details}`)
  }

  return response.json()
})

ipcMain.handle('worker:harvest', async (_event, payload) => {
  const query = typeof payload?.query === 'string' ? payload.query.trim() : ''

  if (!query) {
    throw new Error('Worker harvest requires a query.')
  }

  const response = await fetch(`${LITERATURE_WORKER_URL}/harvest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit: typeof payload?.limit === 'number' ? payload.limit : undefined,
      openAccessOnly: typeof payload?.openAccessOnly === 'boolean' ? payload.openAccessOnly : true,
      yearFrom: typeof payload?.yearFrom === 'number' ? payload.yearFrom : undefined,
      yearTo: typeof payload?.yearTo === 'number' ? payload.yearTo : undefined,
      email: typeof payload?.email === 'string' ? payload.email : undefined,
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Worker harvest failed (${response.status}): ${details}`)
  }

  return response.json()
})

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 660,
    x: 0, // Force Top Left
    y: 0, // Force Top Left
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    title: 'Classy Guardian Console',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    backgroundColor: '#00000000',
  })

  win.loadFile('index.html')

  // Allow dragging from any point (configured in CSS)
  win.setMenuBarVisibility(false)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
