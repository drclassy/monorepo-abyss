import { z } from 'zod'

export const AgentStatusSchema = z.enum(['connected', 'idle', 'streaming', 'busy'])
export type AgentStatus = z.infer<typeof AgentStatusSchema>

export const AgentEntrySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  capabilities: z.array(z.string()),
  status: AgentStatusSchema,
  connectedAt: z.number(),
  lastSeen: z.number(),
})
export type AgentEntry = z.infer<typeof AgentEntrySchema>

export const UNICOMMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  content: z.string(),
  type: z.enum(['message', 'status_update', 'ack']),
  replyTo: z.string().optional(),
  timestamp: z.number(),
})
export type UNICOMMessage = z.infer<typeof UNICOMMessageSchema>
