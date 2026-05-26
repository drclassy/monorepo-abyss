import { z } from 'zod'

export const RiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical'])
export type RiskLevel = z.infer<typeof RiskLevelSchema>

export const UnicomActorTypeSchema = z.enum(['human', 'agent', 'system'])
export type UnicomActorType = z.infer<typeof UnicomActorTypeSchema>

export const UnicomActorSchema = z.object({
  type: UnicomActorTypeSchema,
  id: z.string(),
  displayName: z.string(),
  role: z.string().optional(),
  capabilities: z.array(z.string()).default([]),
})
export type UnicomActor = z.infer<typeof UnicomActorSchema>

export const UnicomRoomModeSchema = z.enum([
  'observe',
  'collaborative',
  'approval-gated',
  'autonomous-safe',
  'clinical-safety',
  'freeze',
])
export type UnicomRoomMode = z.infer<typeof UnicomRoomModeSchema>

export const UnicomRoomStatusSchema = z.enum([
  'idle',
  'active',
  'paused',
  'waiting-approval',
  'blocked',
  'completed',
  'failed',
  'frozen',
])
export type UnicomRoomStatus = z.infer<typeof UnicomRoomStatusSchema>

export const UnicomRoomSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  mode: UnicomRoomModeSchema.default('approval-gated'),
  status: UnicomRoomStatusSchema.default('active'),
  objective: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  risk: RiskLevelSchema.default('medium'),
  allowedPaths: z.array(z.string()).default([]),
  forbiddenPaths: z.array(z.string()).default([]),
})
export type UnicomRoom = z.infer<typeof UnicomRoomSchema>

export const UnicomTaskStatusSchema = z.enum([
  'planned',
  'active',
  'blocked',
  'completed',
  'failed',
])
export type UnicomTaskStatus = z.infer<typeof UnicomTaskStatusSchema>

export const UnicomTaskSchema = z.object({
  id: z.string(),
  objective: z.string(),
  scope: z.array(z.string()).default([]),
  nonScope: z.array(z.string()).default([]),
  allowedPaths: z.array(z.string()).default([]),
  forbiddenPaths: z.array(z.string()).default([]),
  verificationCommands: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string()).default([]),
  risk: RiskLevelSchema.default('medium'),
  status: UnicomTaskStatusSchema.default('planned'),
  assignedTo: z.array(z.string()).default([]),
})
export type UnicomTask = z.infer<typeof UnicomTaskSchema>

export const UnicomMessageKindSchema = z.enum([
  'note',
  'question',
  'proposal',
  'warning',
  'evidence',
  'handoff',
  'decision',
  'completion-claim',
  'approval',
  'veto',
  'policy-block',
])
export type UnicomMessageKind = z.infer<typeof UnicomMessageKindSchema>

export const UnicomMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  actorRole: z.string().optional(),
  kind: UnicomMessageKindSchema,
  body: z.string(),
  createdAt: z.string(),
  relatedEventId: z.string().optional(),
})
export type UnicomMessage = z.infer<typeof UnicomMessageSchema>

export const UnicomEvidenceSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  summary: z.string(),
  command: z.string().optional(),
  result: z.string().optional(),
  filesTouched: z.array(z.string()).default([]),
  verificationCommands: z.array(z.string()).default([]),
  createdAt: z.string(),
})
export type UnicomEvidence = z.infer<typeof UnicomEvidenceSchema>

export const UnicomDecisionStatusSchema = z.enum(['proposed', 'approved', 'rejected', 'blocked'])
export type UnicomDecisionStatus = z.infer<typeof UnicomDecisionStatusSchema>

export const UnicomDecisionSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  title: z.string(),
  summary: z.string(),
  status: UnicomDecisionStatusSchema.default('proposed'),
  targetEventId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  requiresApproval: z.boolean().default(false),
})
export type UnicomDecision = z.infer<typeof UnicomDecisionSchema>

export const UnicomInterventionTypeSchema = z.enum([
  'pause-room',
  'resume-room',
  'freeze-room',
  'redirect-task',
  'approve-proposal',
  'reject-proposal',
  'assign-agent',
  'remove-agent',
  'force-final-audit',
  'mark-unsafe',
])
export type UnicomInterventionType = z.infer<typeof UnicomInterventionTypeSchema>

export const UnicomInterventionSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  type: UnicomInterventionTypeSchema,
  note: z.string().optional(),
  targetEventId: z.string().optional(),
  targetAgentId: z.string().optional(),
  createdAt: z.string(),
})
export type UnicomIntervention = z.infer<typeof UnicomInterventionSchema>

export const UnicomEventTypeSchema = z.enum([
  'room.created',
  'room.paused',
  'room.resumed',
  'room.frozen',
  'participant.joined',
  'participant.left',
  'message.sent',
  'agent.registered',
  'agent.heartbeat',
  'agent.proposal',
  'agent.question',
  'agent.warning',
  'agent.handoff',
  'agent.evidence',
  'agent.completion_claim',
  'task.created',
  'task.assigned',
  'task.blocked',
  'task.completed',
  'decision.proposed',
  'decision.approved',
  'decision.rejected',
  'human.intervention',
  'policy.allowed',
  'policy.blocked',
  'system.error',
])
export type UnicomEventType = z.infer<typeof UnicomEventTypeSchema>

export const UnicomEventSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  taskId: z.string().optional(),
  type: UnicomEventTypeSchema,
  actor: UnicomActorSchema,
  payload: z.unknown(),
  risk: RiskLevelSchema,
  requiresApproval: z.boolean(),
  createdAt: z.string(),
  correlationId: z.string().optional(),
  parentEventId: z.string().optional(),
  evidenceIds: z.array(z.string()).default([]),
})
export type UnicomEvent = z.infer<typeof UnicomEventSchema>

export const RoomCreatedPayloadSchema = UnicomRoomSchema
export const ParticipantPayloadSchema = z.object({
  participant: UnicomActorSchema,
})
export const AgentRegisteredPayloadSchema = z.object({
  agent: UnicomActorSchema,
})
export const MessageSentPayloadSchema = z.object({
  message: UnicomMessageSchema,
})
export const EvidencePayloadSchema = z.object({
  evidence: UnicomEvidenceSchema,
})
export const DecisionPayloadSchema = z.object({
  decision: UnicomDecisionSchema,
})
export const InterventionPayloadSchema = z.object({
  intervention: UnicomInterventionSchema,
})
export const TaskPayloadSchema = z.object({
  task: UnicomTaskSchema,
})
export const TaskAssignmentPayloadSchema = z.object({
  taskId: z.string(),
  assigneeIds: z.array(z.string()).default([]),
})
export const DecisionActionPayloadSchema = z.object({
  decisionId: z.string(),
  targetEventId: z.string().optional(),
  note: z.string().optional(),
})
export const CompletionClaimPayloadSchema = z.object({
  summary: z.string(),
  verificationSummary: z.string().optional(),
  residualRisk: z.string().optional(),
  scopeSummary: z.string().optional(),
})
export const PolicyPayloadSchema = z.object({
  matchedRule: z.string(),
  reason: z.string(),
})

export const UnicomCompletionClaimSchema = z.object({
  id: z.string(),
  summary: z.string(),
  verificationSummary: z.string().optional(),
  residualRisk: z.string().optional(),
  scopeSummary: z.string().optional(),
  evidenceIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  actorId: z.string(),
})
export type UnicomCompletionClaim = z.infer<typeof UnicomCompletionClaimSchema>
