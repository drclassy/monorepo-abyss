import { describe, expect, it } from 'vitest'
import { cn, getInitials } from './utils'

describe('cn', () => {
  it('merges tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('getInitials', () => {
  it('returns initials from a full name', () => {
    expect(getInitials('Dr. Jane Doe')).toBe('DJD')
  })

  it('returns ? for empty input', () => {
    expect(getInitials('   ')).toBe('?')
  })
})
