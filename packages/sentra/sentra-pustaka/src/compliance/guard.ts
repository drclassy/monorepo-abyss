// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
/**
 * [C] Compliance & Guard Engine
 * PHI/PII sanitization sebelum data diproses AI.
 * Local-first GuardEngine, extended untuk konteks medis Indonesia.
 */
export interface GuardAuditEntry {
  timestamp: string
  pattern: string
  action: 'redacted' | 'flagged'
  offset: number
}

export class GuardEngine {
  readonly auditLog: GuardAuditEntry[] = []

  sanitize(text: string): string {
    let clean = text

    const redact = (pattern: RegExp, replacement: string, patternName: string): void => {
      clean = clean.replace(pattern, (_match, ...args) => {
        const offset = typeof args[args.length - 2] === 'number' ? args[args.length - 2] : 0
        this.auditLog.push({
          timestamp: new Date().toISOString(),
          pattern: patternName,
          action: 'redacted',
          offset,
        })
        return replacement
      })
    }

    const flag = (pattern: RegExp, patternName: string): void => {
      const scoped = new RegExp(pattern.source, pattern.flags)
      let match: RegExpExecArray | null

      while ((match = scoped.exec(clean)) !== null) {
        this.auditLog.push({
          timestamp: new Date().toISOString(),
          pattern: patternName,
          action: 'flagged',
          offset: match.index,
        })
      }
    }

    redact(/\d{16}/g, '[NIK_REDACTED]', 'nik')
    redact(/08\d{8,11}/g, '[PHONE_REDACTED]', 'phone')
    redact(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL_REDACTED]', 'email')
    redact(
      /(?<=No\.?\s*(?:RM|MR|Rekam\s*Medis)[:\s]*)\d{6,12}/gi,
      '[MRN_REDACTED]',
      'mrn',
    )
    redact(
      /\b(0?[1-9]|[12]\d|3[01])[/-](0?[1-9]|1[012])[/-](19|20)\d{2}\b/g,
      '[DOB_REDACTED]',
      'dob',
    )
    redact(
      /\b(19|20)\d{2}[/-](0?[1-9]|1[012])[/-](0?[1-9]|[12]\d|3[01])\b/g,
      '[DOB_REDACTED]',
      'dob',
    )
    flag(/\b[A-Z]\d{2}(?:\.\d{1,4})?\b/g, 'icd10')

    return clean
  }

  audit(action: string): void {
    console.log(`[Guard] ${action} at ${new Date().toISOString()}`)
  }
}
