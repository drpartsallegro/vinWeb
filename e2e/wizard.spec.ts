import { test, expect } from '@playwright/test'

test.describe('Order Wizard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete the full wizard flow as guest', async ({ page }) => {
    // Start wizard
    await page.getByRole('link', { name: 'Start a New Request' }).click()
    await expect(page).toHaveURL('/wizard/identify')

    // Step 1: Identify
    await expect(page.getByRole('heading', { name: 'Vehicle Identification' })).toBeVisible()
    
    await page.getByLabel('VIN Number').fill('WVWZZZ1JZXW386752')
    await page.getByLabel('Email Address').fill('test@example.com')
    
    // Next button should be enabled
    const nextButton = page.getByRole('button', { name: 'Next: Select Parts' })
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    await expect(page).toHaveURL('/wizard/parts')

    // Step 2: Parts
    await expect(page.getByRole('heading', { name: 'Select Parts' })).toBeVisible()
    
    // Select category for first item
    await page.getByRole('combobox').first().selectOption('engine-parts')
    await page.getByLabel('Quantity').first().fill('2')
    await page.getByLabel('Additional Notes').first().fill('Synthetic oil preferred')

    // Add another item
    await page.getByRole('button', { name: 'Add Another Part' }).click()
    await page.getByRole('combobox').nth(1).selectOption('brake-parts')
    await page.getByLabel('Quantity').nth(1).fill('1')

    // Continue to review
    await page.getByRole('button', { name: 'Next: Review Order' }).click()
    await expect(page).toHaveURL('/wizard/review')

    // Step 3: Review
    await expect(page.getByRole('heading', { name: 'Review Your Request' })).toBeVisible()
    
    // Verify order details
    await expect(page.getByText('WVWZZZ1JZXW386752')).toBeVisible()
    await expect(page.getByText('test@example.com')).toBeVisible()
    await expect(page.getByText('2 parts requested')).toBeVisible()

    // Submit order
    await page.getByRole('button', { name: 'Submit Order Request' }).click()

    // Should redirect to success page or order page
    // await expect(page).toHaveURL(/\/orders\/[a-zA-Z0-9]+/)
    
    // Check for success message or confirmation
    await expect(page.getByText(/order.*submitted/i)).toBeVisible({ timeout: 10000 })
  })

  test('should validate VIN format', async ({ page }) => {
    await page.getByRole('link', { name: 'Start a New Request' }).click()
    
    // Try invalid VIN
    await page.getByLabel('VIN Number').fill('INVALID')
    await page.getByLabel('Email Address').fill('test@example.com')
    
    // Next button should be disabled or show error
    const nextButton = page.getByRole('button', { name: 'Next: Select Parts' })
    await expect(nextButton).toBeDisabled()
    
    // Or check for error message
    await expect(page.getByText(/VIN must be 17 characters/)).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.getByRole('link', { name: 'Start a New Request' }).click()
    
    await page.getByLabel('VIN Number').fill('WVWZZZ1JZXW386752')
    await page.getByLabel('Email Address').fill('invalid-email')
    
    const nextButton = page.getByRole('button', { name: 'Next: Select Parts' })
    await expect(nextButton).toBeDisabled()
    
    await expect(page.getByText(/Enter a valid email/)).toBeVisible()
  })

  test('should require at least one part', async ({ page }) => {
    await page.goto('/wizard/parts')
    
    // Try to continue without adding any parts
    const nextButton = page.getByRole('button', { name: 'Next: Review Order' })
    await expect(nextButton).toBeDisabled()
  })

  test('should handle photo upload', async ({ page }) => {
    await page.goto('/wizard/parts')
    
    // Add a part first
    await page.getByRole('combobox').first().selectOption('engine-parts')
    await page.getByLabel('Quantity').first().fill('1')
    
    // Upload a photo
    const fileInput = page.getByLabel('Upload Photo')
    await fileInput.setInputFiles('./e2e/fixtures/test-image.jpg')
    
    // Should show preview or success message
    await expect(page.getByText(/uploaded/i)).toBeVisible({ timeout: 5000 })
  })

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 })
    
    await page.getByRole('link', { name: 'Start a New Request' }).click()
    
    // Check that form is properly displayed on mobile
    await expect(page.getByLabel('VIN Number')).toBeVisible()
    await expect(page.getByLabel('Email Address')).toBeVisible()
    
    // Check that buttons are properly sized
    const nextButton = page.getByRole('button', { name: 'Next: Select Parts' })
    await expect(nextButton).toBeVisible()
    
    // Form should be usable on mobile
    await page.getByLabel('VIN Number').fill('WVWZZZ1JZXW386752')
    await page.getByLabel('Email Address').fill('test@example.com')
    await expect(nextButton).toBeEnabled()
  })
})







