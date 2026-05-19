import { type McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'

import type { AgentRegistry } from '../registry.js'

export function createAgentsResource(mcp: McpServer, registry: AgentRegistry): void {
  mcp.resource(
    'agents',
    new ResourceTemplate('unicom://agents', { list: undefined }),
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(registry.list(), null, 2),
        },
      ],
    })
  )
}
