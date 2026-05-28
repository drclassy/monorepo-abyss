import type { UnicomEvent } from '@the-abyss/unicom-core'

function normalizeText(value: string): string {
  return value.trim().toLowerCase()
}

export function getMessageBody(event: UnicomEvent): string | null {
  if (event.type !== 'message.sent') {
    return null
  }

  const payload = event.payload as { message?: { body?: string } }
  return typeof payload.message?.body === 'string' ? payload.message.body : null
}

export function eventMentionsAliases(event: UnicomEvent, aliases: string[]): boolean {
  const body = getMessageBody(event)
  if (!body) {
    return false
  }

  const normalizedBody = normalizeText(body)
  return aliases.some((alias) => normalizedBody.includes(normalizeText(alias)))
}

export function buildWakeAcknowledgement(agentLabel: string, originalBody: string): string {
  const compactBody = originalBody.replace(/\s+/g, ' ').trim()
  const snippet = compactBody.length > 140 ? `${compactBody.slice(0, 137)}...` : compactBody
  return `${agentLabel} online di UNICOM. Saya menerima panggilan ini dan sekarang memonitor room: "${snippet}"`
}
