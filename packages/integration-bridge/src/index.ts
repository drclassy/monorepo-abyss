import { Client } from '@notionhq/client'
import { LinearClient } from '@linear/sdk'
import * as fs from 'fs-extra'
import * as path from 'path'
import dotenv from 'dotenv'

dotenv.config()

export class AbyssIntegrationBridge {
  private notion: Client | null = null
  private linear: LinearClient | null = null

  constructor() {
    if (process.env.NOTION_API_KEY) {
      this.notion = new Client({ auth: process.env.NOTION_API_KEY })
    }
    if (process.env.LINEAR_API_KEY) {
      this.linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY })
    }
  }

  /**
   * Sync a session's handoff.md to a Notion database
   */
  async syncHandoffToNotion(sessionPath: string) {
    if (!this.notion) {
      console.warn('⚠️ Notion API Key not found. Skipping Notion sync.')
      return
    }

    const handoffPath = path.join(sessionPath, 'handoff.md')
    if (!(await fs.pathExists(handoffPath))) {
      throw new Error(`handoff.md not found at ${sessionPath}`)
    }

    const content = await fs.readFile(handoffPath, 'utf-8')
    const sessionName = path.basename(sessionPath)

    // Extract basic info
    const statusMatch = content.match(/\*\*status:\*\* (.*)/i)
    const agentMatch = content.match(/\*\*agent:\*\* (.*)/i)
    const dateMatch = content.match(/\*\*date:\*\* (.*)/i)

    const status = statusMatch ? statusMatch[1].trim() : 'Unknown'
    const agent = agentMatch ? agentMatch[1].trim() : 'Unknown'
    const date = dateMatch ? dateMatch[1].trim() : new Date().toISOString()

    console.log(`🚀 Syncing session "${sessionName}" to Notion...`)

    try {
      // Find or create page in database
      // (Note: Requires NOTION_DATABASE_ID in .env)
      const databaseId = process.env.NOTION_DATABASE_ID
      if (!databaseId) {
        throw new Error('NOTION_DATABASE_ID not found in environment.')
      }

      // Check if page already exists
      const response = await this.notion.databases.query({
        database_id: databaseId,
        filter: {
          property: 'Session ID',
          title: {
            equals: sessionName,
          },
        },
      })

      if (response.results.length > 0) {
        // Update existing page
        const pageId = response.results[0].id
        await this.notion.pages.update({
          page_id: pageId,
          properties: {
            Status: { select: { name: status.includes('GO') ? 'Approved' : 'Pending' } },
            'Last Sync': { date: { start: new Date().toISOString() } },
          },
        })
        console.log(`✅ Updated existing Notion page: ${pageId}`)
      } else {
        // Create new page
        await this.notion.pages.create({
          parent: { database_id: databaseId },
          properties: {
            'Session ID': { title: [{ text: { content: sessionName } }] },
            Agent: { rich_text: [{ text: { content: agent } }] },
            Date: { date: { start: date } },
            Status: { select: { name: status.includes('GO') ? 'Approved' : 'Pending' } },
          },
        })
        console.log(`✅ Created new Notion page for session.`)
      }
    } catch (error: any) {
      console.error('❌ Failed to sync to Notion:', error.message)
    }
  }

  /**
   * Sync status to Linear ticket
   */
  async syncToLinear(ticketId: string, status: string) {
    if (!this.linear) {
      console.warn('⚠️ Linear API Key not found. Skipping Linear sync.')
      return
    }

    console.log(`🚀 Updating Linear ticket "${ticketId}" to status "${status}"...`)

    try {
      const issue = await this.linear.issue(ticketId)
      if (issue) {
        // This is a simplified example, actual status name might differ
        // await issue.update({ stateId: '...' }) 
        console.log(`✅ Linear ticket updated (simulated).`)
      }
    } catch (error: any) {
      console.error('❌ Failed to sync to Linear:', error.message)
    }
  }
}
