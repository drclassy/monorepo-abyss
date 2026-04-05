// Claudesy Transformer Engine V2 — Textarea Detection per Site

interface SiteConfig {
  host: string
  selectors: string[]
}

const SITE_CONFIGS: SiteConfig[] = [
  {
    host: 'chat.openai.com',
    selectors: ['#prompt-textarea', 'textarea[data-id="root"]', 'div[contenteditable="true"]'],
  },
  {
    host: 'chatgpt.com',
    selectors: ['#prompt-textarea', 'textarea[data-id="root"]', 'div[contenteditable="true"]'],
  },
  {
    host: 'claude.ai',
    selectors: ['div.ProseMirror[contenteditable="true"]', 'div[contenteditable="true"]'],
  },
  {
    host: 'gemini.google.com',
    selectors: ['div.ql-editor[contenteditable="true"]', 'rich-textarea div[contenteditable="true"]'],
  },
  {
    host: 'poe.com',
    selectors: ['textarea[class*="ChatMessageInput"]', 'textarea'],
  },
]

/**
 * Detect the primary text input area on the current page.
 */
export function detectTextarea(): HTMLElement | null {
  const hostname = window.location.hostname

  const config = SITE_CONFIGS.find((c) => hostname.includes(c.host))
  if (config) {
    for (const selector of config.selectors) {
      const el = document.querySelector<HTMLElement>(selector)
      if (el) return el
    }
  }

  // Fallback: find any visible textarea or contenteditable
  const textarea = document.querySelector<HTMLTextAreaElement>('textarea:not([hidden])')
  if (textarea) return textarea

  const contentEditable = document.querySelector<HTMLElement>('[contenteditable="true"]')
  if (contentEditable) return contentEditable

  return null
}

/**
 * Inject text into a detected text element.
 */
export function injectText(el: HTMLElement, text: string): void {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    // For native textarea/input elements
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      'value',
    )?.set
    nativeInputValueSetter?.call(el, text)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  } else {
    // For contenteditable elements (ChatGPT, Claude, Gemini)
    el.focus()
    el.textContent = text
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }))
  }
}
