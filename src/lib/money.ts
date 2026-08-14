/**
 * Currency utilities for Lumina.
 * All monetary amounts are stored in database as BIGINT integer minor units (e.g. IDR Rupiah).
 */

export function formatIDR(amountMinor: number | string | null | undefined): string {
  const numeric = typeof amountMinor === 'string' ? parseInt(amountMinor, 10) : amountMinor;
  if (numeric == null || isNaN(numeric)) {
    return 'Rp 0';
  }

  // Format with standard Indonesian numbering (dots for thousands)
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(numeric);

  return `Rp ${formatted}`;
}

export function parseMoneyInput(input: string | number): number {
  if (typeof input === 'number') {
    return Math.max(0, Math.round(input));
  }
  // Strip non-digit characters
  const clean = input.replace(/[^\d]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}
