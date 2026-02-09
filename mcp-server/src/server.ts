import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

export function createServer() {
  const server = new McpServer({
    name: 'task-it',
    version: '1.0.0',
  })
  return server
}

export async function startServer(server: McpServer) {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
