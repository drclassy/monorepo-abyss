// Claudesy Transformer Engine V2 — Background Service Worker
export default defineBackground(() => {
  // Open side panel on extension icon click
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id })
    }
  })

  // Handle messages from content script and sidepanel
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'GET_API_KEY') {
      chrome.storage.local.get(['cte_api_keys'], (result) => {
        const keys = result.cte_api_keys || {}
        sendResponse({ key: keys[message.provider] || null })
      })
      return true
    }

    if (message.type === 'SAVE_API_KEY') {
      chrome.storage.local.get(['cte_api_keys'], (result) => {
        const keys = result.cte_api_keys || {}
        keys[message.provider] = message.key
        chrome.storage.local.set({ cte_api_keys: keys }, () => {
          sendResponse({ success: true })
        })
      })
      return true
    }

    if (message.type === 'REMOVE_API_KEY') {
      chrome.storage.local.get(['cte_api_keys'], (result) => {
        const keys = result.cte_api_keys || {}
        delete keys[message.provider]
        chrome.storage.local.set({ cte_api_keys: keys }, () => {
          sendResponse({ success: true })
        })
      })
      return true
    }

    if (message.type === 'INJECT_PROMPT') {
      if (_sender.tab?.id) {
        chrome.tabs.sendMessage(_sender.tab.id, {
          type: 'INJECT_PROMPT',
          text: message.text,
        })
      }
      sendResponse({ success: true })
      return true
    }

    return false
  })
})
