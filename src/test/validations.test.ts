import { describe, it, expect } from 'vitest'
import {
  vinSchema,
  emailSchema,
  postalCodeSchema,
  phoneSchema,
  nameSchema,
  nipSchema,
  createOrderSchema,
  commentSchema,
  checkoutSchema,
} from '@/lib/validations'

describe('Validations', () => {
  describe('vinSchema', () => {
    it('should validate and transform VINs', () => {
      const result = vinSchema.parse('wvwzzz1jzxw386752')
      expect(result).toBe('WVWZZZ1JZXW386752')
    })

    it('should reject invalid VINs', () => {
      expect(() => vinSchema.parse('invalid')).toThrow()
      expect(() => vinSchema.parse('WVWZZZ1JZXW386I52')).toThrow()
    })
  })

  describe('emailSchema', () => {
    it('should validate emails', () => {
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com')
      expect(emailSchema.parse('user+tag@domain.co.uk')).toBe('user+tag@domain.co.uk')
    })

    it('should reject invalid emails', () => {
      expect(() => emailSchema.parse('invalid')).toThrow()
      expect(() => emailSchema.parse('test@')).toThrow()
      expect(() => emailSchema.parse('@domain.com')).toThrow()
    })
  })

  describe('postalCodeSchema', () => {
    it('should validate Polish postal codes', () => {
      expect(postalCodeSchema.parse('00-001')).toBe('00-001')
      expect(postalCodeSchema.parse('99-999')).toBe('99-999')
    })

    it('should reject invalid postal codes', () => {
      expect(() => postalCodeSchema.parse('00001')).toThrow()
      expect(() => postalCodeSchema.parse('0-001')).toThrow()
    })
  })

  describe('phoneSchema', () => {
    it('should validate phone numbers', () => {
      expect(phoneSchema.parse('+48123456789')).toBe('+48123456789')
      expect(phoneSchema.parse('123-456-789')).toBe('123-456-789')
      expect(phoneSchema.parse('(123) 456 789')).toBe('(123) 456 789')
    })

    it('should reject invalid phone numbers', () => {
      expect(() => phoneSchema.parse('abc')).toThrow()
      expect(() => phoneSchema.parse('12')).toThrow()
      expect(() => phoneSchema.parse('123456789012345678901')).toThrow()
    })
  })

  describe('nameSchema', () => {
    it('should validate names with Polish characters', () => {
      expect(nameSchema.parse('Jan Kowalski')).toBe('Jan Kowalski')
      expect(nameSchema.parse('Józef Żółć')).toBe('Józef Żółć')
      expect(nameSchema.parse("O'Connor")).toBe("O'Connor")
    })

    it('should reject invalid names', () => {
      expect(() => nameSchema.parse('')).toThrow()
      expect(() => nameSchema.parse('123')).toThrow()
      expect(() => nameSchema.parse('a'.repeat(61))).toThrow()
    })
  })

  describe('nipSchema', () => {
    it('should validate correct NIPs', () => {
      expect(nipSchema.parse('1234563218')).toBe('1234563218')
    })

    it('should reject invalid NIPs', () => {
      expect(() => nipSchema.parse('123456321')).toThrow()
      expect(() => nipSchema.parse('1234563219')).toThrow()
    })
  })

  describe('createOrderSchema', () => {
    it('should validate complete order data', () => {
      const validOrder = {
        vin: 'wvwzzz1jzxw386752',
        email: 'test@example.com',
        items: [
          {
            categoryId: 'engine-oil',
            quantity: 2,
            note: 'Synthetic oil preferred',
          },
        ],
      }

      const result = createOrderSchema.parse(validOrder)
      expect(result.vin).toBe('WVWZZZ1JZXW386752')
      expect(result.items).toHaveLength(1)
    })

    it('should reject invalid order data', () => {
      expect(() => createOrderSchema.parse({
        vin: 'invalid',
        email: 'test@example.com',
        items: [],
      })).toThrow()
    })
  })

  describe('commentSchema', () => {
    it('should validate comments', () => {
      const result = commentSchema.parse({
        body: 'This is a test comment',
        isInternal: false,
      })
      expect(result.body).toBe('This is a test comment')
      expect(result.isInternal).toBe(false)
    })

    it('should reject invalid comments', () => {
      expect(() => commentSchema.parse({ body: '' })).toThrow()
      expect(() => commentSchema.parse({ body: 'a'.repeat(2001) })).toThrow()
    })
  })

  describe('checkoutSchema', () => {
    it('should validate complete checkout data', () => {
      const validCheckout = {
        paymentProvider: 'P24',
        shipping: {
          method: 'INPOST_LOCKER',
          lockerId: 'KRA010',
        },
        address: {
          firstName: 'Jan',
          lastName: 'Kowalski',
          phone: '+48123456789',
          email: 'jan@example.com',
          line1: 'ul. Testowa 1',
          city: 'Kraków',
          postalCode: '30-001',
          country: 'PL',
        },
      }

      const result = checkoutSchema.parse(validCheckout)
      expect(result.paymentProvider).toBe('P24')
      expect(result.address.firstName).toBe('Jan')
    })

    it('should reject invalid checkout data', () => {
      expect(() => checkoutSchema.parse({
        paymentProvider: 'INVALID',
        shipping: { method: 'INVALID' },
        address: {},
      })).toThrow()
    })
  })
})











