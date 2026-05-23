import { describe, expect, it } from 'vitest'

import { GuardEngine } from '../src/compliance/guard'

describe('GuardEngine.sanitize', () => {
  const guard = new GuardEngine()

  it('redacts 16-digit NIK', () => {
    expect(guard.sanitize('NIK: 3201234567890001')).toContain('[NIK_REDACTED]')
  })

  it('redacts Indonesian phone number', () => {
    expect(guard.sanitize('Telp: 081234567890')).toContain('[PHONE_REDACTED]')
  })

  it('redacts email', () => {
    expect(guard.sanitize('Email: john@hospital.com')).toContain('[EMAIL_REDACTED]')
  })

  it('redacts MRN when preceded by "No RM:"', () => {
    const result = guard.sanitize('No RM: 123456')
    expect(result).toContain('[MRN_REDACTED]')
    expect(result).not.toContain('123456')
  })

  it('redacts MRN when preceded by "No. Rekam Medis"', () => {
    const result = guard.sanitize('No. Rekam Medis 7890123')
    expect(result).toContain('[MRN_REDACTED]')
  })

  it('does not redact 6-digit numbers without MRN context', () => {
    const result = guard.sanitize('ICD count: 123456')
    expect(result).not.toContain('[MRN_REDACTED]')
    expect(result).toContain('123456')
  })

  it('redacts date of birth in dd/mm/yyyy format', () => {
    const result = guard.sanitize('Lahir: 15/03/1985')
    expect(result).toContain('[DOB_REDACTED]')
    expect(result).not.toContain('15/03/1985')
  })

  it('redacts date of birth in yyyy-mm-dd format', () => {
    const result = guard.sanitize('DOB: 1985-03-15')
    expect(result).toContain('[DOB_REDACTED]')
  })

  it('does not redact ICD-10 codes from content and records audit flag', () => {
    const guard2 = new GuardEngine()
    const result = guard2.sanitize('Diagnosis: E11.9 diabetes mellitus')
    expect(result).toContain('E11.9')
    expect(guard2.auditLog.some((entry) => entry.pattern === 'icd10' && entry.action === 'flagged')).toBe(true)
  })
})

describe('GuardEngine.auditLog', () => {
  it('records each redaction with timestamp and action', () => {
    const guard = new GuardEngine()
    guard.sanitize('NIK: 3201234567890001 Telp: 081234567890')

    expect(guard.auditLog.length).toBeGreaterThanOrEqual(2)
    expect(guard.auditLog[0]).toMatchObject({ action: 'redacted' })
  })
})
