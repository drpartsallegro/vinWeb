import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpsellCarousel, type UpsellItem } from '@/components/features/UpsellCarousel'

const mockItems: UpsellItem[] = [
  {
    id: '1',
    title: 'Premium Oil Filter',
    description: 'High-quality oil filter for better engine performance',
    price: 29.99,
    image: '/test-image.jpg',
    category: 'Filters',
    inStock: true,
    maxQuantity: 5
  },
  {
    id: '2',
    title: 'Air Filter',
    description: 'Clean air filter for improved engine efficiency',
    price: 19.99,
    category: 'Filters',
    inStock: true,
    maxQuantity: 3
  },
  {
    id: '3',
    title: 'Brake Pads',
    description: 'Durable brake pads for reliable stopping power',
    price: 89.99,
    image: '/brake-pads.jpg',
    category: 'Brakes',
    inStock: false
  }
]

const mockOnQuantityChange = vi.fn()
const mockSelectedItems: Record<string, number> = { '1': 2 }

describe('UpsellCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    render(
      <UpsellCarousel
        items={mockItems}
        onQuantityChange={mockOnQuantityChange}
        selectedItems={mockSelectedItems}
        loading={true}
      />
    )

    // Should show loading skeletons (4 cards + header elements)
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(4)
  })

  it('renders empty state correctly', () => {
    render(
      <UpsellCarousel
        items={[]}
        onQuantityChange={mockOnQuantityChange}
        selectedItems={{}}
        emptyMessage="Custom empty message"
      />
    )

    expect(screen.getByText('Custom empty message')).toBeInTheDocument()
  })

  it('renders items correctly', () => {
    render(
      <UpsellCarousel
        items={mockItems}
        onQuantityChange={mockOnQuantityChange}
        selectedItems={mockSelectedItems}
      />
    )

    expect(screen.getByText('Premium Oil Filter')).toBeInTheDocument()
    expect(screen.getByText('Air Filter')).toBeInTheDocument()
    expect(screen.getByText('Brake Pads')).toBeInTheDocument()
    expect(screen.getByText('29,99')).toBeInTheDocument()
    expect(screen.getByText('19,99')).toBeInTheDocument()
    expect(screen.getByText('89,99')).toBeInTheDocument()
  })

  it('shows out of stock indicator', () => {
    render(
      <UpsellCarousel
        items={mockItems}
        onQuantityChange={mockOnQuantityChange}
        selectedItems={mockSelectedItems}
      />
    )

    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('handles quantity changes correctly', () => {
    render(
      <UpsellCarousel
        items={mockItems}
        onQuantityChange={mockOnQuantityChange}
        selectedItems={mockSelectedItems}
      />
    )

    const increaseButton = screen.getAllByLabelText(/Increase quantity/)[0]
    fireEvent.click(increaseButton)

    expect(mockOnQuantityChange).toHaveBeenCalledWith('1', 3)
  })

  it('respects max quantity limits', () => {
    const selectedItems = { '1': 5 } // At max quantity
    render(
      <UpsellCarousel
        items={mockItems}
        onQuantityChange={mockOnQuantityChange}
        selectedItems={selectedItems}
      />
    )

    const increaseButton = screen.getAllByLabelText(/Increase quantity/)[0]
    expect(increaseButton).toBeDisabled()
  })

  it('disables buttons for out of stock items', () => {
    render(
      <UpsellCarousel
        items={mockItems}
        onQuantityChange={mockOnQuantityChange}
        selectedItems={{}}
      />
    )

    const brakePadsCard = screen.getByText('Brake Pads').closest('.opacity-60')
    expect(brakePadsCard).toBeInTheDocument()

    const decreaseButton = screen.getAllByLabelText(/Decrease quantity/)[2]
    const increaseButton = screen.getAllByLabelText(/Increase quantity/)[2]
    
    expect(decreaseButton).toBeDisabled()
    expect(increaseButton).toBeDisabled()
  })

  it('shows category tags', () => {
    render(
      <UpsellCarousel
        items={mockItems}
        onQuantityChange={mockOnQuantityChange}
        selectedItems={mockSelectedItems}
      />
    )

    expect(screen.getAllByText('Filters')).toHaveLength(2)
    expect(screen.getByText('Brakes')).toBeInTheDocument()
  })

  it('shows max quantity info when available', () => {
    render(
      <UpsellCarousel
        items={mockItems}
        onQuantityChange={mockOnQuantityChange}
        selectedItems={mockSelectedItems}
      />
    )

    expect(screen.getByText('Max: 5')).toBeInTheDocument()
    expect(screen.getByText('Max: 3')).toBeInTheDocument()
  })
})
