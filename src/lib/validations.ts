import { z } from 'zod'

// VIN validation schema
export const vinSchema = z
  .string()
  .length(17, 'VIN must be exactly 17 characters')
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN contains invalid characters (no I, O, Q allowed)')
  .transform(val => val.toUpperCase())

// Email validation
export const emailSchema = z
  .string()
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must not exceed 254 characters')
  .email('Please enter a valid email address')

// Polish postal code validation
export const postalCodeSchema = z
  .string()
  .regex(/^\d{2}-\d{3}$/, 'Postal code must be in format NN-NNN')

// Phone validation
export const phoneSchema = z
  .string()
  .min(4, 'Phone number must be at least 4 characters')
  .max(20, 'Phone number must not exceed 20 characters')
  .regex(/^[\d\s\+\-\(\)]+$/, 'Phone number contains invalid characters')

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(60, 'Name must not exceed 60 characters')
  .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-'\.]+$/, 'Name contains invalid characters')

// Address validation
export const addressSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  line1: z.string().min(1, 'Address line 1 is required').max(100, 'Address line 1 too long'),
  line2: z.string().max(100, 'Address line 2 too long').optional(),
  city: z.string().min(1, 'City is required').max(80, 'City name too long'),
  postalCode: postalCodeSchema,
  country: z.string().default('PL'),
  lockerId: z.string().max(64, 'Locker ID too long').optional(),
})

// NIP validation (Polish tax number)
export const nipSchema = z
  .string()
  .regex(/^\d{10}$/, 'NIP must be 10 digits')
  .refine(validateNIPChecksum, 'Invalid NIP checksum')

function validateNIPChecksum(nip: string): boolean {
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  let sum = 0
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(nip[i]) * weights[i]
  }
  
  const checksum = sum % 11
  const lastDigit = parseInt(nip[9])
  
  return checksum === lastDigit
}

// Order item validation
export const orderItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required').max(120),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(999, 'Quantity too high'),
  note: z.string().max(200, 'Note must not exceed 200 characters').optional(),
  photoUploadId: z.string().optional(),
})

// Order creation validation
export const createOrderSchema = z.object({
  vin: vinSchema,
  email: emailSchema,
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
})

// Comment validation
export const commentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must not exceed 2000 characters'),
  isInternal: z.boolean().default(false),
})

// Offer selection validation
export const offerSelectionSchema = z.object({
  selections: z.array(
    z.object({
      orderItemId: z.string(),
      offerId: z.string(),
      include: z.boolean(),
    })
  ),
})

// Checkout validation
export const checkoutSchema = z.object({
  paymentProvider: z.enum(['P24', 'MANUAL', 'COD']),
  couponCode: z.string().max(64).optional(),
  shipping: z.object({
    method: z.enum(['INPOST_LOCKER', 'INPOST_COURIER', 'DPD', 'DHL', 'POCZTA']),
    lockerId: z.string().max(64).optional(),
  }),
  address: addressSchema,
  invoiceDetails: z.object({
    required: z.boolean(),
    companyName: z.string().max(100).optional(),
    nip: nipSchema.optional(),
  }).optional(),
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    'Must be a valid file'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'File must be JPEG, PNG, or WebP image'
  ),
})

// User preferences validation
export const userPreferencesSchema = z.object({
  theme: z.enum(['dark', 'light']),
  marketingEmailConsent: z.boolean(),
})

// Admin settings validation schemas
export const paymentSettingsSchema = z.object({
  p24Enabled: z.boolean(),
  manualEnabled: z.boolean(),
  codEnabled: z.boolean(),
  p24Sandbox: z.boolean(),
  p24MerchantId: z.string().optional(),
  p24PosId: z.string().optional(),
  p24Crc: z.string().optional(),
  p24RestApiKey: z.string().optional(),
})

export const shopConfigSchema = z.object({
  freeShippingThreshold: z.number().min(0),
  couponsEnabled: z.boolean(),
  allowPartialAcceptance: z.boolean(),
  requireSameEmailAtCheckout: z.boolean(),
  requirePhone: z.boolean(),
  quoteExpiryHours: z.number().int().min(1).max(168), // Max 1 week
  shippingFreeQualifiers: z.array(z.enum(['INPOST_LOCKER', 'INPOST_COURIER', 'DPD', 'DHL', 'POCZTA'])),
})
