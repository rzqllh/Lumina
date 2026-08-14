import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PricingSummary } from '@/features/project-pricing';
import { mockProjectServices, mockProjectValue } from './pricingMocks';

describe('PricingSummary (F-PRICING-001)', () => {
  it('renders Project Value correctly for multiple services', () => {
    render(<PricingSummary projectServices={mockProjectServices} />);
    expect(screen.getByTestId('project-value-total')).toHaveTextContent('Rp 7.000.000');
  });

  it('renders 0 when no project services', () => {
    render(<PricingSummary projectServices={[]} />);
    expect(screen.getByTestId('project-value-total')).toHaveTextContent('Rp 0');
  });

  it('shows correct service count (plural)', () => {
    render(<PricingSummary projectServices={mockProjectServices} />);
    expect(screen.getByText(/3 services/)).toBeInTheDocument();
  });

  it('shows singular service count', () => {
    render(<PricingSummary projectServices={[mockProjectServices[0]]} />);
    expect(screen.getByText(/1 service\b/)).toBeInTheDocument();
  });

  it('matches mockProjectValue constant', () => {
    render(<PricingSummary projectServices={mockProjectServices} />);
    // Rp 7.000.000 = 7000000
    const el = screen.getByTestId('project-value-total');
    // Extract numeric content
    const text = el.textContent ?? '';
    // Parse digits only
    const numericValue = parseInt(text.replace(/[^0-9]/g, ''), 10);
    expect(numericValue).toBe(mockProjectValue);
  });
});
