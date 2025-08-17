import { describe, it, expect } from 'vitest'
import { 
  validateVIN, 
  validateNIP, 
  validatePolishPostalCode,
  formatPrice,
  generateShortCode,
  cn
} from '@/lib/utils'

describe('Utils', () => {
  describe('validateVIN', () => {
    it('should validate correct VINs', () => {
      expect(validateVIN('WVWZZZ1JZXW386752')).toBe(true)
      expect(validateVIN('1HGBH41JXMN109186')).toBe(true)
      expect(validateVIN('JH4KA8260PC000001')).toBe(true)
    })

    it('should reject invalid VINs', () => {
      expect(validateVIN('WVWZZZ1JZXW38675')).toBe(false) // too short
      expect(validateVIN('WVWZZZ1JZXW3867522')).toBe(false) // too long
      expect(validateVIN('WVWZZZ1JZXW386I52')).toBe(false) // contains I
      expect(validateVIN('WVWZZZ1JZXW386O52')).toBe(false) // contains O
      expect(validateVIN('WVWZZZ1JZXW386Q52')).toBe(false) // contains Q
      expect(validateVIN('')).toBe(false) // empty
    })
  })

  describe('validateNIP', () => {
    it('should validate correct NIPs', () => {
      expect(validateNIP('1234563218')).toBe(true)
      expect(validateNIP('5260001246')).toBe(true)
    })

    it('should reject invalid NIPs', () => {
      expect(validateNIP('123456321')).toBe(false) // too short
      expect(validateNIP('12345632188')).toBe(false) // too long
      expect(validateNIP('1234563219')).toBe(false) // invalid checksum
      expect(validateNIP('abcdefghij')).toBe(false) // non-numeric
      expect(validateNIP('')).toBe(false) // empty
    })
  })

  describe('validatePolishPostalCode', () => {
    it('should validate correct postal codes', () => {
      expect(validatePolishPostalCode('00-001')).toBe(true)
      expect(validatePolishPostalCode('12-345')).toBe(true)
      expect(validatePolishPostalCode('99-999')).toBe(true)
    })

    it('should reject invalid postal codes', () => {
      expect(validatePolishPostalCode('00001')).toBe(false) // no dash
      expect(validatePolishPostalCode('0-001')).toBe(false) // too short first part
      expect(validatePolishPostalCode('00-01')).toBe(false) // too short second part
      expect(validatePolishPostalCode('ab-cde')).toBe(false) // non-numeric
      expect(validatePolishPostalCode('')).toBe(false) // empty
    })
  })

  describe('formatPrice', () => {
    it('should format prices correctly', () => {
      expect(formatPrice(1234.56)).toBe('1 234,56 zł')
      expect(formatPrice(0)).toBe('0,00 zł')
      expect(formatPrice(1000)).toBe('1 000,00 zł')
      expect(formatPrice(Number('1234.56'))).toBe('1 234,56 zł')
    })

    it('should handle different currencies', () => {
      expect(formatPrice(1234.56, 'USD')).toBe('1 234,56 $')
      expect(formatPrice(1234.56, 'EUR')).toBe('1 234,56 €')
    })
  })

  describe('generateShortCode', () => {
    it('should generate 8-character codes', () => {
      const code = generateShortCode()
      expect(code).toHaveLength(8)
      expect(code).toMatch(/^[A-Z0-9]+$/)
    })

    it('should generate unique codes', () => {
      const codes = new Set()
      for (let i = 0; i < 1000; i++) {
        codes.add(generateShortCode())
      }
      expect(codes.size).toBe(1000) // All unique
    })
  })

  describe('cn (className utility)', () => {
    it('should merge classes correctly', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
      expect(cn('px-4', 'px-2')).toBe('px-2') // Tailwind merge
      expect(cn('px-4', undefined, 'py-2')).toBe('px-4 py-2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })
  })
})






