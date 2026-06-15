/**
 * Shared fuel-type catalog used across bounded contexts (Catalog, Inventory,
 * Equipment, Ordering, Payment). Centralizing it keeps the vocabulary
 * consistent without coupling contexts to each other.
 */
export interface FuelType {
  code: string;
  label: string;
}

export const FUEL_TYPES: FuelType[] = [
  { code: 'GASOLINE_84', label: 'Gasohol 84' },
  { code: 'GASOLINE_90', label: 'Gasohol 90' },
  { code: 'GASOLINE_95', label: 'Gasohol 95' },
  { code: 'GASOLINE_97', label: 'Gasohol 97' },
  { code: 'DIESEL', label: 'Diesel B5' },
  { code: 'DIESEL_B5', label: 'Diesel B5' },
  { code: 'GLP', label: 'LPG (GLP)' },
  { code: 'GNV', label: 'CNG (GNV)' },
];

/** Resolves a human-readable label for a fuel-type code. */
export function fuelTypeLabel(code: string | null | undefined): string {
  if (!code) return '—';
  return FUEL_TYPES.find((f) => f.code === code)?.label ?? code;
}

export interface MeasurementUnit {
  code: string;
  label: string;
}

export const MEASUREMENT_UNITS: MeasurementUnit[] = [
  { code: 'LITERS', label: 'Liters' },
  { code: 'GALLONS', label: 'Gallons' },
];

/** Distinct fuel-type options for filters (de-duplicated by label). */
export const FUEL_TYPE_OPTIONS: FuelType[] = [
  { code: 'GASOLINE_84', label: 'Gasohol 84' },
  { code: 'GASOLINE_90', label: 'Gasohol 90' },
  { code: 'GASOLINE_95', label: 'Gasohol 95' },
  { code: 'GASOLINE_97', label: 'Gasohol 97' },
  { code: 'DIESEL', label: 'Diesel B5' },
  { code: 'GLP', label: 'LPG (GLP)' },
  { code: 'GNV', label: 'CNG (GNV)' },
];
