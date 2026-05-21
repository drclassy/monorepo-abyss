import type { MessageInbox } from './inbox.js'
import type { UNICOMMessage } from './types.js'

export interface FeedEntry {
  id: string
  from: string
  to: string
  timestamp: number
  type: UNICOMMessage['type']
}

const MAX_FEED = 50
const feed: FeedEntry[] = []

export function recordFeedMessage(message: UNICOMMessage): void {
  feed.push({
    id: message.id,
    from: message.from,
    to: message.to,
    timestamp: message.timestamp,
    type: message.type,
  })
  if (feed.length > MAX_FEED) {
    feed.splice(0, feed.length - MAX_FEED)
  }
}

export function getRecentFeed(limit = 25): FeedEntry[] {
  return feed.slice(-limit).reverse()
}

export function getInboxDepths(inbox: MessageInbox): Record<string, number> {
  return inbox.getQueueDepths()
}
