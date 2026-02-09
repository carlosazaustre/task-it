import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { apiClient } from '../api-client.js'

const TAG_COLORS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple',
  'fuchsia', 'pink', 'rose',
] as const

export function registerTagTools(server: McpServer) {
  // list_tags - List all available tags
  server.tool(
    'list_tags',
    'List all available tags for the current user',
    {},
    async () => {
      try {
        const tags = await apiClient.getTags()

        if (tags.length === 0) {
          return {
            content: [{ type: 'text' as const, text: 'No tags found. Create one with the create_tag tool.' }],
          }
        }

        const formatted = tags.map((t: any) =>
          `- ${t.name} (color: ${t.color}, id: ${t.id})`
        ).join('\n')

        return {
          content: [{
            type: 'text' as const,
            text: `${tags.length} tag(s) found:\n\n${formatted}`,
          }],
        }
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error listing tags: ${(error as Error).message}` }],
          isError: true,
        }
      }
    }
  )

  // create_tag - Create a new tag
  server.tool(
    'create_tag',
    'Create a new tag with a name and color',
    {
      name: z.string().describe('Tag name (max 20 characters)'),
      color: z.enum(TAG_COLORS).describe(
        'Tag color. Options: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose'
      ),
    },
    async ({ name, color }) => {
      try {
        const tag = await apiClient.createTag({ name, color })

        return {
          content: [{
            type: 'text' as const,
            text: `Tag created successfully:\n  Name: "${tag.name}"\n  Color: ${tag.color}\n  ID: ${tag.id}`,
          }],
        }
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error creating tag: ${(error as Error).message}` }],
          isError: true,
        }
      }
    }
  )
}
