// Claudesy Transformer Engine V2 — WXT Configuration
import { defineConfig } from 'wxt'

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'CTE V2 — Prompt Optimizer',
    description: 'Transform raw ideas into optimized Super Prompts for any LLM',
    version: '1.0.0',
    permissions: ['activeTab', 'storage', 'sidePanel'],
    host_permissions: [
      'https://chat.openai.com/*',
      'https://chatgpt.com/*',
      'https://claude.ai/*',
      'https://gemini.google.com/*',
      'https://poe.com/*',
    ],
    side_panel: {
      default_path: 'sidepanel/index.html',
    },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
})
