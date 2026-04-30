/**
 * [C] Compliance & Guard Engine
 * PHI/PII sanitization sebelum data diproses AI.
 * Local-first GuardEngine, extended untuk konteks medis Indonesia.
 */
export class GuardEngine {
  sanitize(text: string): string {
    let clean = text
    clean = clean.replace(/\d{16}/g, '[NIK_REDACTED]')
    clean = clean.replace(/08\d{8,11}/g, '[PHONE_REDACTED]')
    clean = clean.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
    return clean
  }

  audit(action: string): void {
    console.log(`[Guard] ${action} at ${new Date().toISOString()}`)
  }
}
