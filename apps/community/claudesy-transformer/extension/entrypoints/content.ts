// Claudesy Transformer Engine V2 — Content Script
import { detectTextarea, injectText } from '../lib/detector'
import { createFloatingButton, removeFloatingButton } from '../lib/injector'

export default defineContentScript({
  matches: [
    'https://chat.openai.com/*',
    'https://chatgpt.com/*',
    'https://claude.ai/*',
    'https://gemini.google.com/*',
    'https://poe.com/*',
  ],
  main() {
    let currentTextarea: HTMLElement | null = null

    // Observe DOM for textarea/contenteditable elements
    const observer = new MutationObserver(() => {
      const textarea = detectTextarea()
      if (textarea && textarea !== currentTextarea) {
        currentTextarea = textarea
        createFloatingButton(textarea, () => {
          const text = getTextContent(textarea)
          if (text.trim()) {
            chrome.runtime.sendMessage({
              type: 'OPEN_SIDEPANEL_WITH_TEXT',
              text,
            })
          }
        })
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Listen for inject messages from sidepanel via background
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'INJECT_PROMPT' && currentTextarea) {
        injectText(currentTextarea, message.text)
      }
    })

    function getTextContent(el: HTMLElement): string {
      if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
        return el.value
      }
      return el.textContent || ''
    }
  },
})
