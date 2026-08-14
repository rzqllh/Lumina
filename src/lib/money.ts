/**
 * Currency utilities for Lumina.
 * All monetary amounts are stored in database as BIGINT integer minor units (e.g. IDR Rupiah).
 */

export function formatMoney(
  amountMinor: number | string | null | undefined,
  currency = 'IDR'
): string {
  const numeric = typeof amountMinor === 'string' ? parseInt(amountMinor, 10) : amountMinor;
  if (numeric == null || isNaN(numeric)) {
    return currency === 'IDR' ? 'Rp 0' : `${currency} 0`;
  }

  // Format with standard numbering (dots for thousands in id-ID)
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(numeric);

  return currency === 'IDR' ? `Rp ${formatted}` : `${currency} ${formatted}`;
}

export const formatIDR = formatMoney;

export function parseMoneyInput(input: string | number): number {
  if (typeof input === 'number') {
    return Math.max(0, Math.round(input));
  }
  // Strip non-digit characters
  const clean = input.replace(/[^\d]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}
