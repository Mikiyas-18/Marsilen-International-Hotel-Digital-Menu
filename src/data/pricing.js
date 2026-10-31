import { CURRENCIES, TAX_RATE } from './mock';

const r2 = (n) => Math.round(n * 100) / 100;

/** Convert an ETB amount into the target currency (rounded to 2 dp). */
export const convert = (etb, cur = 'ETB') => r2(etb * CURRENCIES[cur].rate);

/**
 * Totals are computed in the display currency so the figures the guest sees
 * always add up exactly (no 0.01 drift between lines and total).
 */
export function calcTotals(subtotalEtb, tipPct, cur = 'ETB') {
  const subtotal = convert(subtotalEtb, cur);
  const tax = r2(subtotal * TAX_RATE);
  const tip = r2((subtotal * tipPct) / 100);
  return { subtotal, tax, tip, total: r2(subtotal + tax + tip) };
}

export function formatAmount(amount, cur = 'ETB', lang = 'en') {
  const min = cur === 'ETB' && Number.isInteger(amount) ? 0 : 2;
  try {
    return new Intl.NumberFormat(lang === 'am' ? 'am-ET' : 'en-US', {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: min,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(min)} ${cur}`;
  }
}
