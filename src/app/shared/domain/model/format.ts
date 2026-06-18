/**
 * Cross-cutting presentation helpers shared by every bounded context.
 * Centralized to avoid duplicating unit conversion, money formatting and the
 * (simulated) Google Maps embed URL across contexts.
 */

export const LITERS_PER_GALLON = 3.78541;

/** Converts a quantity to liters for unit-agnostic comparisons. */
export function toLiters(quantity: number, unit: string): number {
  return unit === 'GALLONS' ? Number(quantity || 0) * LITERS_PER_GALLON : Number(quantity || 0);
}

/** Converts a quantity expressed in liters into the target unit. */
export function fromLiters(liters: number, unit: string): number {
  return unit === 'GALLONS' ? Number(liters || 0) / LITERS_PER_GALLON : Number(liters || 0);
}

/** Formats a value as Peruvian Soles. */
export function money(value: number | null | undefined, minimumFractionDigits = 2): string {
  return `S/ ${Number(value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  })}`;
}

/** Formats a plain number with thousands separators. */
export function num(value: number | null | undefined, maximumFractionDigits = 0): string {
  return Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits });
}

/** Short unit suffix for display. */
export function unitSuffix(unit: string | null | undefined): string {
  return unit === 'GALLONS' ? 'gal' : 'L';
}

/**
 * Builds a keyless Google Maps embed URL for a delivery address.
 * Pure iframe pattern — no API key, SDK or JS API required (simulated map).
 */
export function mapEmbedUrl(address: string | null | undefined): string {
  const query = encodeURIComponent(address || 'Lima, Peru');
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

/** Formats a date for display without timezone drift. */
export function formatDate(
  value: string | Date | null | undefined,
  withTime: boolean | null = null,
): string {
  if (!value) return '—';
  const isDateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  let date: Date;
  if (isDateOnly) {
    const [y, m, d] = (value as string).split('-').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(value);
  }
  if (isNaN(date.getTime())) return '—';
  const showTime = withTime === null ? !isDateOnly : withTime;
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  if (showTime) {
    opts.hour = '2-digit';
    opts.minute = '2-digit';
  }
  return date.toLocaleString('en-US', opts);
}
