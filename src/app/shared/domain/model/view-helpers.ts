/**
 * Convenience barrel re-exporting the cross-cutting presentation helpers so
 * view components import them from a single, stable path.
 */
export {
  money,
  num,
  unitSuffix,
  mapEmbedUrl,
  formatDate,
  toLiters,
  fromLiters,
  LITERS_PER_GALLON,
} from './format';

export { fuelTypeLabel as fuelLabel, FUEL_TYPES, FUEL_TYPE_OPTIONS, MEASUREMENT_UNITS } from './fuel-types';

export { orderStatusLabel, orderStatusClass, ORDER_STATUS } from './order-status';
