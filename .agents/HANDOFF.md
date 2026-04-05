# HANDOFF: Pieces MCP Integration

## Diagnosis
- User requested adding the Pieces MCP server script/integration after reviewing the provided deep-dive guideline.
- Workspace currently has no root `.mcp.json` and no checked-in `packages/pieces-mcp-server` package.
- Existing `.agents/MCP-CONFIG.json` is an internal workflow config and does not currently register external MCP servers.

## Proposed Architecture
- Add a root MCP host config file, most likely `.mcp.json`, with a `pieces` stdio server entry.
- The server command should point at:
  - `D:\Devop\abyss-monorepo\packages\pieces-mcp-server\dist\index.js`
- The server environment should include:
  - `PIECES_OS_URL=http://localhost:1000`
- Keep the config minimal and local-first, matching the Pieces OS model described in the guideline.

## Verification Plan
- Validate JSON syntax after editing the MCP config.
- Confirm the configured path matches the intended Pieces MCP build output.
- Verify Pieces OS is reachable at `http://localhost:1000/health` before enabling the host config.
- Restart the MCP host/client and confirm the `pieces` server appears.

## Approval Gate
- Waiting for `GO APPROVED` before editing the actual MCP config.

