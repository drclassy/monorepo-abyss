// Claudesy Transformer Engine V2 — Extension API Client

interface OptimizeRequest {
  rawIdea: string
  taskType?: string
  tone?: string
  format?: string
  targetLlm?: string
  provider?: string
}

interface OptimizeResponse {
  superPrompt: {
    role: string
    task: string
    context: string
    chainOfThought: string
    constraints: string[]
    formatSpec: string
    fullPrompt: string
  }
  metadata: {
    provider: string
    model: string
    templateUsed: string | null
    tokenEstimate: number
    processingTimeMs: number
  }
}

const DEFAULT_BASE_URL = 'http://localhost:3003'

/**
 * Call the CTE V2 web API to optimize a prompt.
 */
export async function optimizeViaApi(
  request: OptimizeRequest,
  baseUrl?: string,
): Promise<OptimizeResponse> {
  const url = `${baseUrl || DEFAULT_BASE_URL}/api/optimize`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new Error(
      errorBody?.error || `API error: ${res.status} ${res.statusText}`,
    )
  }

  return res.json()
}

/**
 * Get stored API key from chrome.storage via background script.
 */
export async function getStoredApiKey(
  provider: string,
): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'GET_API_KEY', provider },
      (response) => {
        resolve(response?.key || null)
      },
    )
  })
}

/**
 * Save API key to chrome.storage via background script.
 */
export async function saveStoredApiKey(
  provider: string,
  key: string,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'SAVE_API_KEY', provider, key },
      () => resolve(),
    )
  })
}

/**
 * Send optimized prompt to content script for injection.
 */
export function injectOptimizedPrompt(text: string): void {
  chrome.runtime.sendMessage({ type: 'INJECT_PROMPT', text })
}
