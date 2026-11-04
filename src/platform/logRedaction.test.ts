import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  logger,
  sanitizeLogMessage,
  registerSensitiveTokens,
} from './logger.ts'

describe('Privacy-Safe Logger & Synthetic Persona Redaction (Task N5.2)', () => {
  beforeEach(() => {
    logger._resetForTesting()
  })

  it('redacts URL query strings containing parameters or tokens', () => {
    const raw =
      'Fetching update from https://api.github.com/repos/maganis/app/releases?token=secret12345&user=ahmed'
    const clean = sanitizeLogMessage(raw)
    expect(clean).toContain(
      'https://api.github.com/repos/maganis/app/releases?[REDACTED_QUERY]',
    )
    expect(clean).not.toContain('secret12345')
    expect(clean).not.toContain('user=ahmed')
  })

  it('redacts email addresses and Egyptian phone numbers', () => {
    const dummyPhone1 = ['+20', '1012345678'].join(' ')
    const dummyPhone2 = ['012', '98765432'].join('')
    const msg = `User contact test user@example.com and phone ${dummyPhone1} or ${dummyPhone2}`
    const clean = sanitizeLogMessage(msg)
    expect(clean).toContain('[REDACTED_EMAIL]')
    expect(clean).toContain('[REDACTED_PHONE]')
    expect(clean).not.toContain('user@example.com')
    expect(clean).not.toContain(dummyPhone1)
    expect(clean).not.toContain(dummyPhone2)
  })

  it('redacts physical metrics like weight and height with units', () => {
    const msg =
      'Client updated stats to 80 kg and height 180 cm burning 2500 kcal'
    const clean = sanitizeLogMessage(msg)
    expect(clean).not.toContain('80 kg')
    expect(clean).not.toContain('180 cm')
    expect(clean).not.toContain('2500 kcal')
  })

  it('guarantees ZERO leakage of synthetic persona data across log outputs', () => {
    const fixturePath = path.resolve(
      __dirname,
      '../../fixtures/persona.synthetic.json',
    )
    const persona = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))

    // Register persona specific tokens
    registerSensitiveTokens([
      persona.profile.name,
      persona.profile.id,
      persona.profile.body.weightKg,
      persona.profile.body.heightCm,
    ])

    // Log messages referencing persona fields
    logger.info(
      'PROFILE',
      'LOAD',
      `Loaded profile for user "${persona.profile.name}" id=${persona.profile.id}`,
    )
    logger.info(
      'BODY',
      'METRIC',
      `Measured weight ${persona.profile.body.weightKg} kg, height ${persona.profile.body.heightCm} cm`,
    )
    logger.error(
      'STORAGE',
      'SAVE',
      `Failed saving custom note: "إصابة قديمة في الكتف الأيمن"`,
    )

    const buffer = logger._getBuffer()
    expect(buffer.length).toBe(3)

    for (const line of buffer) {
      // Must not leak the user's name
      expect(line).not.toContain(persona.profile.name)
      // Must not leak user notes in quotes
      expect(line).not.toContain('إصابة قديمة في الكتف الأيمن')
      // Format checks: single line, starts with timestamp, level, module, code
      expect(line).toMatch(
        /^\[\d{4}-\d{2}-\d{2}T.*\] \[(INFO|WARN|ERROR)\] \[[A-Z0-9_-]+\] \[[A-Z0-9_-]+\] .*/,
      )
    }
  })
})
