import { describe, it, expect } from 'vitest';
import { computeNetLineTotal, computeProjectValue } from '@/features/project-pricing';
import { mockProjectServices, mockProjectValue } from './pricingMocks';

describe('Project Pricing — Domain Logic', () => {
  describe('computeNetLineTotal', () => {
    it('returns subtotal when adjustment_amount is 0', () => {
      const ps = mockProjectServices[0];
      expect(computeNetLineTotal(ps)).toBe(2500000);
    });

    it('subtracts negative adjustment_amount (discount)', () => {
      const ps = mockProjectServices[1]; // subtotal 3500000, adj -500000
      expect(computeNetLineTotal(ps)).toBe(3000000);
    });

    it('adds positive adjustment_amount (extra charge)', () => {
      const ps = { ...mockProjectServices[0], adjustment_amount: 200000 };
      expect(computeNetLineTotal(ps)).toBe(2700000);
    });

    it('handles zero unit_price custom line', () => {
      const ps = { ...mockProjectServices[2], unit_price: 0, subtotal: 0, quantity: 1 };
      expect(computeNetLineTotal(ps)).toBe(0);
    });
  });

  describe('computeProjectValue', () => {
    it('sums all net line totals', () => {
      expect(computeProjectValue(mockProjectServices)).toBe(mockProjectValue);
    });

    it('returns 0 for empty project services array', () => {
      expect(computeProjectValue([])).toBe(0);
    });

    it('handles single service', () => {
      expect(computeProjectValue([mockProjectServices[0]])).toBe(2500000);
    });

    it('handles negative adjustments correctly (no float errors)', () => {
      const services = [
        {
          ...mockProjectServices[0],
          unit_price: 1000000,
          subtotal: 1000000,
          quantity: 1,
          adjustment_amount: -333333,
        },
      ];
      expect(computeProjectValue(services)).toBe(666667);
    });
  });
});
