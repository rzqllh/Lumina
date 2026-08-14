import { describe, it, expect } from 'vitest';
import { calculateFinancialSummary } from '@/features/finance';

describe('Financial Calculations — Canonical Logic & Dashboard Consistency', () => {
  it('calculates Project Value from services with subtotals and adjustments', () => {
    const summary = calculateFinancialSummary({
      services: [
        { unit_price: 2500000, quantity: 1, subtotal: 2500000, adjustment_amount: 0 },
        { unit_price: 3500000, quantity: 1, subtotal: 3500000, adjustment_amount: -500000 }, // discount
        { unit_price: 1000000, quantity: 2, subtotal: 2000000, adjustment_amount: 200000 }, // extra charge
      ],
      payments: [],
    });

    // 2.5m + (3.5m - 0.5m) + (2.0m + 0.2m) = 2.5m + 3.0m + 2.2m = 7.7m
    expect(summary.contractValue).toBe(7700000);
    expect(summary.totalPaid).toBe(0);
    expect(summary.remainingBalance).toBe(7700000);
    expect(summary.isFullyPaid).toBe(false);
  });

  it('derives correct receivable (Project Value - Paid Amount) regardless of payment schedule existence', () => {
    // Example from audit requirement:
    // Project Value = Rp10.000.000
    // Payment schedule only created for Rp5.000.000
    // Paid = Rp2.000.000
    // Receivable MUST be: Rp8.000.000
    const summary = calculateFinancialSummary({
      services: [{ unit_price: 10000000, quantity: 1, subtotal: 10000000, adjustment_amount: 0 }],
      payments: [
        { amount: 2000000, status: 'paid' },
        { amount: 3000000, status: 'pending' },
      ],
    });

    expect(summary.contractValue).toBe(10000000);
    expect(summary.totalPaid).toBe(2000000);
    expect(summary.remainingBalance).toBe(8000000);
    expect(summary.isFullyPaid).toBe(false);
  });

  it('correctly computes costs, projected profit, and profit margin', () => {
    const summary = calculateFinancialSummary({
      services: [{ unit_price: 10000000, quantity: 1, subtotal: 10000000, adjustment_amount: 0 }],
      payments: [{ amount: 10000000, status: 'paid' }],
      expenses: [{ amount: 1500000 }, { amount: 500000 }], // 2.0m generic
      collaboratorEngagements: [{ agreed_fee: 2000000 }], // 2.0m crew
      deliverables: [{ status: 'approved' }],
    });

    expect(summary.contractValue).toBe(10000000);
    expect(summary.genericExpensesTotal).toBe(2000000);
    expect(summary.collaboratorFeesTotal).toBe(2000000);
    expect(summary.totalExpenses).toBe(4000000);
    expect(summary.netProfit).toBe(6000000);
    expect(summary.profitMarginPercent).toBe(60);
    expect(summary.isFullyPaid).toBe(true);
    expect(summary.canNormalClose).toBe(true);
  });

  it('prevents normal close if any deliverable is not approved', () => {
    const summary = calculateFinancialSummary({
      services: [{ unit_price: 5000000, quantity: 1, subtotal: 5000000 }],
      payments: [{ amount: 5000000, status: 'paid' }],
      deliverables: [{ status: 'approved' }, { status: 'awaiting_review' }],
    });

    expect(summary.isFullyPaid).toBe(true);
    expect(summary.canNormalClose).toBe(false);
  });
});
