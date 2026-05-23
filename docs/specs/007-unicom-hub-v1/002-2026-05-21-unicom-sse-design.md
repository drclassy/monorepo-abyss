# UNICOM Hub v2 — SSE-based Real-time Agent Discussion

**Date:** 2026-05-21  
**Package:** `packages/platform/unicom`  
**Status:** Approved for implementation

---

## Goal

Agents (Claude Code, Roocode, Codex CLI) harus bisa **langsung berdiskusi** satu sama lain secara real-time — tanpa Chief sebagai relay setiap pesan, tanpa polling.

v1 salah arah: poll-based `receive_messages` bukan diskusi, itu kotak surat.

---

## Architecture

Setiap agent membuka satu koneksi SSE `GET /subscribe/:agentId` yang tetap terbuka. Ketika pesan masuk, UNICOM langsung push ke stream tersebut. Agent menerima, proses, balas via `POST /send` atau MCP `send_message`.

```
Agent A                     UNICOM Hub                     Agent B
  │── register ────────────▶│◀──────────────── register ───│
  │── GET /subscribe/a ─────▶│◀──── GET /subscribe/b ──────│
  │                          │                              │
  │── send_message ─────────▶│── SSE push ────────────────▶│
  │                          │   event: message             │
  │◀── SSE push ─────────────│◀── POST /send ───────────────│
  │    event: message        │                              │
```

**Delivery logic:**
- Target agent SSE aktif → push langsung (<100ms)
- Target agent offline → buffer ke inbox (fallback, bisa diambil saat reconnect)

---

## Components

### `src/sse-manager.ts` *(baru)*

Satu tanggung jawab: kelola koneksi SSE aktif dan push events.

```typescript
interface SseManager {
  connect(agentId: string, res: http.ServerResponse): void
  disconnect(agentId: string): void
  push(agentId: string, event: string, data: unknown): boolean
  broadcast(event: string, data: unknown, excludeId?: string): void
  isConnected(agentId: string): boolean
}
```

- `connect()`: set SSE headers, daftarkan `res` ke map, handle `close` event untuk auto-disconnect
- `push()`: tulis `event: X\ndata: JSON\n\n` ke response stream; return false jika tidak connected
- `broadcast()`: push ke semua connected agent kecuali `excludeId`
- Keepalive: `setInterval` 15s kirim `event: ping\ndata: {}\n\n` ke semua koneksi
- Satu koneksi per agent: jika agent subscribe ulang, tutup koneksi lama dulu

### `src/router.ts` *(update)*

Tambah parameter `sseManager: SseManager`. Delivery logic:

```typescript
if (sseManager.isConnected(to)) {
  sseManager.push(to, 'message', message)   // real-time
} else {
  inbox.enqueue(to, message)                 // fallback
}
```

Broadcast: push via SSE ke semua connected agents, inbox untuk yang offline.

### `src/server.ts` *(update)*

Tambah endpoint:

```
GET /subscribe/:agentId
  → set headers: Content-Type: text/event-stream, Cache-Control: no-cache
  → sseManager.connect(agentId, res)
  → (koneksi tetap terbuka)
```

Inject `sseManager` ke semua route yang membutuhkan routing.

### `src/index.ts` *(update)*

Export `SseManager` dan `createSseManager`.

---

## SSE Event Format

```
event: message
data: {"id":"uuid","from":"codex","to":"claude-code","content":"...","timestamp":1234}

event: status_update  
data: {"agentId":"claude-code","status":"busy"}

event: agent_joined
data: {"id":"codex","displayName":"Codex CLI","status":"connected"}

event: agent_left
data: {"id":"codex"}

event: ping
data: {}
```

---

## Agent Connection Guide

**Claude Code / Roocode:**
```
1. register_agent via MCP tool
2. GET http://localhost:59849/subscribe/claude-code  (di luar MCP, koneksi terbuka)
3. Pesan masuk otomatis muncul di stream
4. Balas via send_message MCP tool
```

**Codex CLI:**
```bash
# Terminal 1 — listen
curl -N -H "Accept: text/event-stream" http://localhost:59849/subscribe/codex

# Terminal 2 — send
curl -X POST http://localhost:59849/send \
  -H "Content-Type: application/json" \
  -d '{"from":"codex","to":"claude-code","content":"review src/server.ts"}'
```

---

## Files Changed

| Action | File |
|---|---|
| CREATE | `src/sse-manager.ts` |
| CREATE | `tests/sse-manager.test.ts` |
| CREATE | `tests/server-sse.test.ts` |
| MODIFY | `src/router.ts` — inject SseManager, dual-path delivery |
| MODIFY | `src/server.ts` — add GET /subscribe/:agentId |
| MODIFY | `src/index.ts` — export SseManager |
| KEEP | `src/tools/receive-messages.ts` — fallback tetap ada |

---

## Non-Functional

- Keepalive ping setiap 15 detik (cegah timeout)
- Graceful disconnect: koneksi putus → hapus dari map, tidak crash server
- Satu SSE koneksi per agent (subscribe ulang = ganti koneksi lama)
- No new npm dependencies — murni `node:http`

---

## Out of Scope

- Persistensi pesan ke disk/DB
- Autentikasi agent
- Message history replay
- WebSocket

---

## Definition of Done

- [ ] Agent A kirim → Agent B terima via SSE <100ms
- [ ] `curl -N /subscribe/codex` menerima pesan real-time
- [ ] Disconnect tidak crash server, agent lain tidak terganggu
- [ ] 29 test lama tetap pass
- [ ] Test baru: `SseManager` unit + SSE endpoint integration
