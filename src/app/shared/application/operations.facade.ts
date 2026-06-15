import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin, switchMap, map, catchError, tap } from 'rxjs';
import {
  PlatformApi,
  EquipmentRow,
  ProductRow,
  OrderRow,
  RequestRow,
  DriverRow,
  VehicleRow,
} from '../infrastructure/platform-api';
import { IamStore } from '../../iam/application/iam.store';
import { toLiters } from '../domain/model/view-helpers';

export interface RefillResult {
  ok: boolean;
  reason?: 'no-favorite' | 'full' | 'no-stock';
  message?: string;
  request?: RequestRow;
}

export interface DispatchResult {
  ok: boolean;
  message?: string;
  order?: OrderRow;
}

/**
 * Application-level coordinator for flows that span several bounded contexts
 * (Ordering ↔ Equipment ↔ Inventory ↔ Fulfillment ↔ Notification). Components
 * call these methods instead of reaching into another context's store, keeping
 * presentation thin and the cross-context rules in one place.
 */
@Injectable({ providedIn: 'root' })
export class OperationsFacade {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);

  // ── Buyer: automatic refill from an equipment's favorite provider ─────────
  requestRefill(equipment: EquipmentRow): Observable<RefillResult> {
    if (!equipment.favoriteProviderId) {
      return of({
        ok: false,
        reason: 'no-favorite',
        message: 'This equipment has no favorite provider yet. Choose one in the Catalog.',
      });
    }
    const needed = equipment.capacity - equipment.currentLevel;
    if (needed <= 0) {
      return of({ ok: false, reason: 'full', message: 'This equipment is already full.' });
    }

    return this.api.getProducts().pipe(
      switchMap((products) => {
        const candidates = products
          .filter(
            (p) =>
              p.providerId === equipment.favoriteProviderId &&
              p.fuelType === equipment.requiredFuelType &&
              p.available &&
              (p.stock ?? 0) > 0,
          )
          .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));

        const product = candidates[0];
        if (!product || (product.stock ?? 0) < needed) {
          return of<RefillResult>({
            ok: false,
            reason: 'no-stock',
            message:
              'Your favorite provider does not have enough stock for this refill. Try the Catalog.',
          });
        }

        const now = new Date().toISOString();
        const companyId = this.iam.currentCompanyId() ?? equipment.companyId ?? 1;
        const quantity = Math.min(needed, product.stock ?? needed);
        return this.api
          .createRequest({
            clientId: String(companyId),
            companyId,
            providerId: product.providerId,
            productId: product.id,
            fuelType: product.fuelType,
            productName: product.name,
            quantity,
            unit: 'LITERS',
            unitPrice: product.pricePerLiter,
            equipmentId: equipment.id,
            desiredDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
            deliveryAddress: equipment.location || this.iam.companyName(),
            source: 'auto_refill',
            status: 'PENDING',
            rejectionReason: null,
            createdAt: now,
            updatedAt: now,
          })
          .pipe(
            switchMap((request) =>
              this.notifyProvider(
                product.providerId,
                'NEW_REQUEST',
                'New fuel request',
                `Auto-refill request for ${Math.round(quantity)} L of ${product.name}.`,
                request.id,
              ).pipe(map(() => ({ ok: true, request }) as RefillResult)),
            ),
          );
      }),
    );
  }

  // ── Provider: dispatch an accepted order ─────────────────────────────────-
  /** Validates capacity/availability/stock, reduces stock, marks resources busy. */
  dispatchOrder(order: OrderRow, driver: DriverRow, vehicle: VehicleRow): Observable<DispatchResult> {
    const liters = toLiters(order.quantity, order.unit);
    if (!this.isAvailable(driver.status))
      return of({ ok: false, message: 'Selected driver is not available.' });
    if (!this.isAvailable(vehicle.status))
      return of({ ok: false, message: 'Selected vehicle is not available.' });
    if (vehicle.capacity < liters)
      return of({ ok: false, message: 'Selected vehicle does not have enough capacity.' });

    return this.api.getProducts().pipe(
      switchMap((products) => {
        const product = products.find((p) => String(p.id) === String(order.productId));
        if (product && (product.stock ?? 0) < liters)
          return of<DispatchResult>({ ok: false, message: 'Not enough stock to dispatch this order.' });

        const now = new Date().toISOString();
        return this.api.createDelivery({
            id: `dlv-${Date.now()}`,
            orderId: order.id,
            providerId: order.providerId,
            driverId: driver.id,
            vehicleId: vehicle.id,
            status: 'IN_TRANSIT',
            dispatchedAt: now,
            deliveredAt: null,
            createdAt: now,
          }).pipe(
            tap(() => {
              this.notifyBuyer(
                order.companyId ?? null,
                'ORDER_DISPATCHED',
                'Order dispatched',
                `Order ${order.id} was dispatched and is on its way.`,
                order.id,
              ).subscribe();
            }),
            map(() => ({ ok: true } as DispatchResult)),
            catchError((error: HttpErrorResponse) =>
              of({
                ok: false,
                message: this.httpErrorMessage(error),
              } as DispatchResult),
            ),
          );
      }),
    );
  }

  // ── Buyer: confirm reception of a dispatched order ───────────────────────-
  confirmDelivery(order: OrderRow): Observable<DispatchResult> {
    const now = new Date().toISOString();
    return forkJoin({
      equipment: this.api.getEquipment(),
      deliveries: this.api.getDeliveries(),
    }).pipe(
      switchMap(({ equipment, deliveries }) => {
        const delivery = deliveries.find((d) => d.orderId === order.id);
        if (!delivery) return of({ ok: false, message: 'Delivery not found.' });
        return this.api.patchDelivery(delivery.id, { status: 'DELIVERED', deliveredAt: now }).pipe(
          switchMap(() => this.notifyProvider(
            Number(order.providerId),
            'ORDER_DELIVERED',
            'Delivery confirmed',
            `Order ${order.id} was received by the buyer and is ready for collection.`,
            order.id,
          )),
          map(() => ({ ok: true } as DispatchResult)),
        );
      }),
    );
  }

  // ── Notification helpers ─────────────────────────────────────────────────-
  private notifyProvider(
    providerId: number,
    type: string,
    title: string,
    message: string,
    relatedId: string | null,
  ): Observable<unknown> {
    return this.api.createNotification({
      id: `ntf-${Date.now()}`,
      recipientType: 'PROVIDER',
      providerId,
      companyId: null,
      type,
      title,
      message,
      read: false,
      relatedId,
      createdAt: new Date().toISOString(),
    });
  }

  private notifyBuyer(
    companyId: number | null,
    type: string,
    title: string,
    message: string,
    relatedId: string | null,
  ): Observable<unknown> {
    return this.api.createNotification({
      id: `ntf-${Date.now()}`,
      recipientType: 'BUYER',
      companyId,
      providerId: null,
      type,
      title,
      message,
      read: false,
      relatedId,
      createdAt: new Date().toISOString(),
    });
  }

  private isAvailable(status: string): boolean {
    return ['AVAILABLE', 'ACTIVE'].includes((status ?? '').toUpperCase());
  }

  private httpErrorMessage(error: HttpErrorResponse): string {
    const body = error.error;
    if (typeof body === 'string' && body.trim()) return body;
    if (body?.details) return body.details;
    if (body?.message) return body.message;
    return error.message || 'Could not dispatch the order.';
  }
}
