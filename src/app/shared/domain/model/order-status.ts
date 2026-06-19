/**
 * Normalized order lifecycle shared across bounded contexts.
 *
 * Flow: ACCEPTED → DISPATCHED → PENDING_PAYMENT → PAID → CLOSED
 */
export type OrderStatus =
  | 'ACCEPTED'
  | 'DISPATCHED'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED';

export const ORDER_STATUS = {
  ACCEPTED: 'ACCEPTED',
  DISPATCHED: 'DISPATCHED',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  CLOSED: 'CLOSED',
} as const;

/** CSS class suffix (maps to a .ft-badge.* variant) for an order status. */
export function orderStatusClass(status: string | null | undefined): string {
  return (status ?? 'neutral').toLowerCase();
}

/** Human-readable label for an order status. */
export function orderStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
