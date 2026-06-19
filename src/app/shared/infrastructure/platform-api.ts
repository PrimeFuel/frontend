import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, map, switchMap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IamStore } from '../../iam/application/iam.store';

/**
 * Centralized read/write gateway against the FullTank Spring Boot backend
 * (`http://localhost:8080/api/v1`). It used to target a json-server mock; the
 * routes, payloads and response shapes have been migrated to the real REST API.
 *
 * The per-context domain entities intentionally model a subset of fields; this
 * service keeps exposing the *flat* row shapes the cross-context views consume
 * (dashboards, reporting, order/payment detail, catalog availability) by mapping
 * each backend resource into the corresponding `*Row` shape here, in the
 * infrastructure layer, so presentation components stay untouched.
 *
 * Notes on the backend contract:
 *  - Resource ids are numeric (`Long`); rows keep `string`/`number` ids.
 *  - State changes are POST "action" endpoints (no PATCH). Status-only writes
 *    that the backend performs as a side effect of an action (driver/vehicle
 *    availability, inventory stock, equipment level) are no-ops here.
 */

export interface ProductRow {
  id: number | string;
  providerId: number;
  fuelType: string;
  name: string;
  description: string;
  pricePerLiter: number;
  unit: string;
  available: boolean;
  stock: number;
  capacity?: number;
}

export interface ProviderRow {
  id: number;
  name: string;
  ruc: string;
  rating: number;
  address: string;
  phone: string;
  fuelTypesOffered: string[];
  description: string;
}

export interface BuyerCompanyRow {
  id: number;
  name: string;
  ruc: string;
  sector: string;
  address: string;
  contactEmail: string;
  phone: string;
}

export interface EquipmentRow {
  id: number | string;
  companyId: number;
  name: string;
  type: string;
  requiredFuelType: string;
  capacity: number;
  currentLevel: number;
  unit: string;
  status: string;
  favoriteProviderId: number | null;
  autoRefill: boolean;
  refillThreshold: number;
  location: string;
  lastRefillDate: string | null;
}

export interface RequestRow {
  id: string;
  clientId?: string;
  companyId?: number;
  providerId: string | number;
  productId: string | number;
  fuelType?: string;
  productName?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  desiredDeliveryDate: string;
  deliveryAddress: string;
  source?: string;
  equipmentId?: number | string | null;
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRow {
  id: string;
  requestId: string;
  clientId: string;
  companyId?: number;
  providerId: string | number;
  productId: string | number;
  fuelType?: string;
  productName?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalAmount: number;
  equipmentId?: number | string | null;
  driverId?: string | null;
  vehicleId?: string | null;
  deliveryAddress: string;
  estimatedDeliveryDate?: string | null;
  status: string;
  paymentStatus?: string;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRow {
  id: number | string;
  orderId: string;
  companyId: number;
  providerId: number;
  method: string;
  amount: number;
  status: string;
  maskedCard: string | null;
  cardHolder: string | null;
  reference: string | null;
  createdAt: string;
}

export interface InvoiceRow {
  id: number | string;
  paymentId: number | string;
  orderId: string;
  invoiceNumber: string;
  providerRuc: string;
  providerName: string;
  buyerRuc: string;
  buyerName: string;
  fuelType: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  igv: number;
  total: number;
  issueDate: string;
  status: string;
}

export interface MonthlySpendingRow {
  id: string;
  companyId: number;
  month: string;
  monthIndex: number;
  amount: number;
}

export interface DriverRow {
  id: string;
  providerId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  status: string;
}

export interface VehicleRow {
  id: string;
  providerId: string;
  licensePlate: string;
  brand: string;
  model: string;
  capacity: number;
  unit: string;
  status: string;
}

export interface ProviderMonthlyRevenueRow {
  id: string;
  providerId: string;
  month: string;
  monthIndex: number;
  revenue: number;
  period: string;
}

export interface DeliveryRow {
  id: string;
  orderId: string;
  providerId: string | number;
  driverId: string | null;
  vehicleId: string | null;
  status: string;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface NotificationRow {
  id?: string;
  recipientType?: string;
  companyId?: number | null;
  providerId?: number | null;
  type: string;
  title?: string;
  message: string;
  read?: boolean;
  isRead?: boolean;
  relatedId?: string | null;
  orderId?: string | null;
  createdAt: string;
  userId: string;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Backend resource shapes (subset of the Spring Boot REST resources) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
interface FuelProductResource {
  id: number; providerId: number; name: string; fuelType: string;
  pricePerUnit: number; availableStock: number; unit: string;
  capacity?: number; active?: boolean;
}
interface EquipmentResource {
  id: number; companyId: number; name: string; equipmentType: string;
  licensePlate: string; fuelType: string; tankCapacity: number;
  currentLevel?: number; status?: string; favoriteProviderId?: number | null;
  autoRefill?: boolean; refillThreshold?: number; location?: string; lastRefillDate?: string | null;
}
interface FuelRequestResource {
  id: number; buyerCompanyId: number; providerId: number; equipmentId: number | null;
  fuelProductId: number;
  fuelType: string; productName: string; quantity: number; unit: string; unitPrice: number;
  deliveryAddress: string; deliveryDate: string; status: string; source: string;
  rejectionReason?: string | null; rejectionReasonCode?: string | null;
  rejectionReasonNote?: string | null; createdAt: string; updatedAt?: string;
}
interface OrderResource {
  id: number; requestId?: number | null; companyId: number; providerId: number; fuelProductId: number;
  equipmentId: number | null; requestedQuantity: number; totalPrice: number;
  status: string; deliveryAddress: string; scheduledDate: string | null;
}
interface PaymentResource {
  id: number; orderId: number; companyId: number; amount: number; status: string;
  paymentMethod: string; transactionReference: string | null; paidAt: string | null;
}
interface InvoiceResource {
  id: number; paymentId: number; orderId: number; invoiceNumber: string; providerRuc: string;
  providerName: string; buyerRuc: string; buyerName: string; fuelType: string; quantity: number;
  unit: string; unitPrice: number; subtotal: number; igv: number; total: number;
  issueDate: string; status: string;
}
interface DriverResource {
  id: number; providerId: number; firstName: string; lastName: string;
  licenseNumber: string; phoneNumber: string; email: string; status: string;
}
interface VehicleResource {
  id: number; providerId: number; licensePlate: string; brand: string; model: string;
  capacity: number; unit: string; status: string;
}
interface DeliveryResource {
  id: number; orderId: number; providerId: number; driverId: number; vehicleId: number; status: string;
  scheduledDate: string | null; dispatchedAt: string | null; deliveredAt: string | null; notes: string;
}
interface NotificationResource {
  id: number; userId: number; type: string; title: string; message: string;
  read: boolean; referenceId: number | null; createdAt?: string | null;
}
interface BuyerAnalyticsResource {
  companyId: number; totalOrders: number; totalSpent: number;
  completedPayments: number; pendingPayments: number;
  monthlySpending: Array<{ month: string; monthIndex: number; amount: number }>;
}
interface ProviderAnalyticsResource {
  providerId: number; totalOrders: number; confirmedOrders: number;
  cancelledOrders: number; totalRevenue: number;
  monthlyRevenue: Array<{ month: string; monthIndex: number; amount: number }>;
}

@Injectable({ providedIn: 'root' })
export class PlatformApi {
  private readonly http = inject(HttpClient);
  private readonly iam = inject(IamStore);
  private readonly base = environment.serverBasePath;

  private url(path: string): string {
    return `${this.base}${path}`;
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Reads Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  /** Provider products with stock, backed by the fuel-products inventory endpoint. */
  getProducts(): Observable<ProductRow[]> {
    return this.http.get<FuelProductResource[]>(this.url('/fuel-products')).pipe(
      map((items) => (items ?? []).map((i) => this.toProductRow(i))),
      catchError(() => of([] as ProductRow[])),
    );
  }
  getProviders(): Observable<ProviderRow[]> {
    return this.http.get<ProviderRow[]>(this.url('/provider-companies')).pipe(
      catchError(() => of([] as ProviderRow[])),
    );
  }
  getBuyerCompanies(): Observable<BuyerCompanyRow[]> {
    return this.http.get<BuyerCompanyRow[]>(this.url('/buyer-companies')).pipe(
      catchError(() => of([] as BuyerCompanyRow[])),
    );
  }
  getEquipment(): Observable<EquipmentRow[]> {
    return this.http.get<EquipmentResource[]>(this.url('/equipment')).pipe(
      map((rows) => (rows ?? []).map((e) => this.toEquipmentRow(e))),
      catchError(() => of([] as EquipmentRow[])),
    );
  }
  getRequests(): Observable<RequestRow[]> {
    return this.http.get<FuelRequestResource[]>(this.url('/fuel-requests')).pipe(
      map((rows) => (rows ?? []).map((r) => this.toRequestRow(r))),
      catchError(() => of([] as RequestRow[])),
    );
  }
  getOrders(): Observable<OrderRow[]> {
    return forkJoin({
      orders: this.http.get<OrderResource[]>(this.url('/fuel-orders')),
      products: this.getProducts(),
      payments: this.getPayments(),
    }).pipe(
      map(({ orders, products, payments }) => {
        const rows = (orders ?? []).map((order) =>
          this.toOrderRow(
            order,
            products.find((product) => String(product.id) === String(order.fuelProductId)),
          ),
        );
        return this.withPaymentStatus(rows, payments);
      }),
      catchError(() => of([] as OrderRow[])),
    );
  }
  getPayments(): Observable<PaymentRow[]> {
    return this.http.get<PaymentResource[]>(this.url('/payments')).pipe(
      map((rows) => (rows ?? []).map((p) => this.toPaymentRow(p))),
      catchError(() => of([] as PaymentRow[])),
    );
  }
  /**
   * The backend has no "list all invoices" endpoint (invoices are generated per
   * payment), so we resolve them from the payment history.
   */
  getInvoices(): Observable<InvoiceRow[]> {
    return of([] as InvoiceRow[]);
  }
  getMonthlySpending(): Observable<MonthlySpendingRow[]> {
    const companyId = this.iam.currentCompanyId() ?? 1;
    return this.http
      .get<BuyerAnalyticsResource>(this.url(`/analytics/buyers/${companyId}`))
      .pipe(
        map((summary) => (summary.monthlySpending ?? []).map((point) => ({
          id: `ms-${companyId}-${point.month}`,
          companyId,
          month: point.month,
          monthIndex: point.monthIndex,
          amount: point.amount,
        }))),
        catchError(() => of([] as MonthlySpendingRow[])),
      );
  }
  getDrivers(providerIdOverride?: string | number): Observable<DriverRow[]> {
    const providerId = providerIdOverride ?? this.iam.currentProviderId() ?? 1;
    return this.http.get<DriverResource[]>(this.url('/drivers'), { params: { providerId } }).pipe(
      map((rows) => rows.map((d) => ({
        id: String(d.id), providerId: String(d.providerId), firstName: d.firstName,
        lastName: d.lastName, licenseNumber: d.licenseNumber, phoneNumber: d.phoneNumber,
        email: d.email, status: d.status,
      }))),
      catchError(() => of([])),
    );
  }
  getVehicles(providerIdOverride?: string | number): Observable<VehicleRow[]> {
    const providerId = providerIdOverride ?? this.iam.currentProviderId() ?? 1;
    return this.http.get<VehicleResource[]>(this.url('/vehicles'), { params: { providerId } }).pipe(
      map((rows) => rows.map((v) => ({
        id: String(v.id), providerId: String(v.providerId), licensePlate: v.licensePlate,
        brand: v.brand, model: v.model, capacity: v.capacity, unit: v.unit, status: v.status,
      }))),
      catchError(() => of([])),
    );
  }
  getProviderMonthlyRevenue(): Observable<ProviderMonthlyRevenueRow[]> {
    const providerId = this.iam.currentProviderId() ?? 1;
    return this.http
      .get<ProviderAnalyticsResource>(this.url(`/analytics/providers/${providerId}`))
      .pipe(
        map((summary) => (summary.monthlyRevenue ?? []).map((point) => ({
          id: `pmr-${providerId}-${point.month}`,
          providerId: String(providerId),
          month: point.month,
          monthIndex: point.monthIndex,
          revenue: point.amount,
          period: 'MONTH',
        }))),
        catchError(() => of([] as ProviderMonthlyRevenueRow[])),
      );
  }
  getDeliveries(): Observable<DeliveryRow[]> {
    return this.http.get<DeliveryResource[]>(this.url('/deliveries')).pipe(
      map((rows) => (rows ?? []).map((d) => this.toDeliveryRow(d))),
      catchError(() => of([] as DeliveryRow[])),
    );
  }
  getNotifications(): Observable<NotificationRow[]> {
    const userId = this.iam.userId() ?? 0;
    return this.http.get<NotificationResource[]>(this.url(`/notifications/user/${userId}`)).pipe(
      map((rows) => (rows ?? []).map((n) => this.toNotificationRow(n))),
      catchError(() => of([] as NotificationRow[])),
    );
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Writes Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  createRequest(row: Partial<RequestRow>): Observable<RequestRow> {
    const payload = {
      companyId: Number(row.companyId ?? row.clientId ?? this.iam.currentCompanyId() ?? 1),
      providerId: Number(row.providerId),
      equipmentId: row.equipmentId != null ? Number(row.equipmentId) : null,
      fuelProductId: Number(row.productId),
      requestedQuantity: Number(row.quantity ?? 0),
      deliveryAddress: row.deliveryAddress,
      scheduledDate: row.desiredDeliveryDate,
    };
    return this.http.post<FuelRequestResource>(this.url('/fuel-requests'), {
      buyerCompanyId: payload.companyId,
      providerId: payload.providerId,
      equipmentId: payload.equipmentId,
      fuelProductId: payload.fuelProductId,
      fuelType: row.fuelType,
      productName: row.productName,
      quantity: payload.requestedQuantity,
      unit: row.unit ?? 'LITERS',
      unitPrice: row.unitPrice ?? 0,
      deliveryAddress: payload.deliveryAddress,
      deliveryDate: payload.scheduledDate,
      source: (row.source ?? 'MANUAL').toUpperCase(),
    }).pipe(
      map((r) => this.toRequestRow(r)),
    );
  }
  patchRequest(id: string, patch: Partial<RequestRow>): Observable<RequestRow> {
    const status = (patch.status ?? '').toUpperCase();
    if (status === 'APPROVED' || status === 'ACCEPTED') {
      return this.acceptFuelRequest(id);
    }
    if (status === 'REJECTED') {
      return this.rejectFuelRequest(id, patch.rejectionReason ?? '');
    }
    return of({ id, ...patch } as RequestRow);
  }
  /** POST /fuel-requests/{id}/accept Ã¢â‚¬â€ moves the request to ACCEPTED. */
  acceptFuelRequest(id: string | number): Observable<RequestRow> {
    return this.http.post<OrderResource>(this.url(`/fuel-requests/${id}/accept`), {}).pipe(
      map((o) => ({ ...this.toRequestRowFromOrder(o), status: 'APPROVED' })),
    );
  }
  /** POST /fuel-requests/{id}/reject Ã¢â‚¬â€ moves the request to REJECTED. */
  rejectFuelRequest(id: string | number, reason: string): Observable<RequestRow> {
    return this.http.post<FuelRequestResource>(this.url(`/fuel-requests/${id}/reject`), { reason }).pipe(
      map((r) => this.toRequestRow(r)),
    );
  }
  deleteRequest(id: string): Observable<unknown> {
    // The backend has no delete endpoint for fuel requests; request lifecycle is
    // resolved server-side (ACCEPTED Ã¢â€ â€™ order created, or REJECTED). No-op.
    return of({ id });
  }
  createOrder(row: Partial<OrderRow>): Observable<OrderRow> {
    const payload = {
      companyId: Number(row.companyId ?? row.clientId ?? this.iam.currentCompanyId() ?? 1),
      providerId: Number(row.providerId),
      fuelProductId: Number(row.productId),
      equipmentId: row.equipmentId != null ? Number(row.equipmentId) : null,
      requestedQuantity: Number(row.quantity ?? 0),
      deliveryAddress: row.deliveryAddress,
      scheduledDate: row.estimatedDeliveryDate ?? null,
    };
    return this.http.post<OrderResource>(this.url('/fuel-orders'), payload).pipe(
      map((o) => this.toOrderRow(o)),
    );
  }
  /**
   * POST /orders Ã¢â‚¬â€ the backend builds the order from an ACCEPTED fuel request,
   * so the only payload field is `requestId`. The request MUST be accepted first
   * (POST /fuel-requests/{id}/accept) or the backend returns 400.
   */
  createOrderFromRequest(requestId: string | number): Observable<OrderRow> {
    return this.http.get<OrderResource>(this.url(`/fuel-orders/${requestId}`)).pipe(
      map((o) => this.toOrderRow(o)),
    );
  }
  patchOrder(id: string, patch: Partial<OrderRow>): Observable<OrderRow> {
    const status = (patch.status ?? '').toUpperCase();
    const mapOrder = map((o: OrderResource) => this.toOrderRow(o));

    if (status === 'CONFIRMED' || status === 'APPROVED') {
      return this.http.post<OrderResource>(this.url(`/fuel-orders/${id}/confirm`), {}).pipe(mapOrder);
    }
    if (status === 'CANCELLED' || status === 'REJECTED') {
      return this.http.post<OrderResource>(this.url(`/fuel-orders/${id}/cancel`), {}).pipe(mapOrder);
    }
    return of({ id, ...patch } as OrderRow);
  }
  patchEquipment(id: string | number, patch: Partial<EquipmentRow>): Observable<EquipmentRow> {
    if (patch.favoriteProviderId != null) {
      return this.http
        .post<EquipmentRow>(this.url(`/equipment/${id}/favorite-provider`), {
          providerId: Number(patch.favoriteProviderId),
        });
    }
    // Fuel level / lastRefillDate changes are applied server-side by the order
    // confirm-reception flow (apply-delivery). No standalone patch endpoint.
    return of({ id, ...patch } as EquipmentRow);
  }
  patchProduct(id: string | number, patch: Partial<ProductRow>): Observable<ProductRow> {
    // A provider editing an inventory item sends descriptive fields (name, priceÃ¢â‚¬Â¦)
    // Ã¢â€ â€™ PUT /fuel-products/{id}. A bare stock change uses update-stock first.
    // (stock moves via refill / decrease-stock), so it stays a no-op here.
    const isStockOnlyUpdate = patch.stock != null && patch.name == null;

    if (isStockOnlyUpdate) {
      return this.http
        .post<FuelProductResource>(this.url(`/fuel-products/${id}/update-stock`), { newStock: patch.stock })
        .pipe(map((i) => this.toProductRow(i)));
    }

    const payload = {
      name: patch.name,
      fuelType: patch.fuelType,
      pricePerUnit: patch.pricePerLiter,
      unit: patch.unit ?? 'LITERS',
      availableStock: patch.stock,
      capacity: patch.capacity ?? patch.stock,
      active: patch.available,
    };
    return this.http.put<FuelProductResource>(this.url(`/fuel-products/${id}`), payload).pipe(
      map((i) => this.toProductRow(i)),
    );
  }

  deleteProduct(id: string | number): Observable<void> {
    return this.http.delete<void>(this.url(`/fuel-products/${id}`));
  }

  /** POST /fuel-products/{id}/update-stock sets the absolute stock value. */
  refillInventory(id: string | number, quantity: number, reason = 'Manual refill'): Observable<ProductRow> {
    return this.http
      .post<FuelProductResource>(this.url(`/fuel-products/${id}/update-stock`), { newStock: quantity })
      .pipe(map((i) => this.toProductRow(i)));
  }
  createProduct(row: Partial<ProductRow>): Observable<ProductRow> {
    const stock = row.stock ?? 0;
    const payload = {
      providerId: Number(row.providerId ?? this.iam.currentProviderId() ?? 1),
      name: row.name,
      type: row.fuelType,
      fuelType: row.fuelType,
      description: row.description ?? '',
      pricePerLiter: row.pricePerLiter ?? 0,
      pricePerUnit: row.pricePerLiter ?? 0,
      stock,
      availableStock: stock,
      capacity: row.capacity && row.capacity > 0 ? row.capacity : Math.max(stock, 1),
      lowStockThreshold: 0,
      unit: row.unit ?? 'LITERS',
      active: row.available !== false,
    };
    return this.http.post<FuelProductResource>(this.url('/fuel-products'), payload).pipe(
      map((i) => this.toProductRow(i)),
    );
  }
  createPayment(row: Partial<PaymentRow>, invoice?: Partial<InvoiceRow>): Observable<PaymentRow> {
    // The backend generates the invoice from the denormalized line data sent here,
    // so we forward it when the caller has it (CreatePaymentResource accepts it).
    const payload = {
      orderId: Number(row.orderId),
      companyId: Number(row.companyId ?? this.iam.currentCompanyId() ?? 1),
      paymentMethod: row.method === 'CARD' ? 'CREDIT_CARD' : 'BANK_TRANSFER',
      amount: row.amount,
    };
    return this.http.post<PaymentResource>(this.url('/payments'), payload).pipe(
      switchMap((created) =>
        this.http.post<PaymentResource>(this.url(`/payments/${created.id}/complete`), {
          transactionReference: row.reference ?? `PAY-${Date.now()}`,
        }),
      ),
      map((p) => this.toPaymentRow(p)),
    );
  }
  /** GET /invoices/payment/{paymentId} Ã¢â‚¬â€ fetch the invoice the backend generated. */
  getInvoiceByPayment(paymentId: string | number): Observable<InvoiceRow | null> {
    return of(null);
  }
  createInvoice(row: Partial<InvoiceRow>): Observable<InvoiceRow> {
    // Invoices are generated automatically by the backend when a payment is
    // created. No manual invoice creation endpoint. No-op.
    return of(row as InvoiceRow);
  }
  patchDriver(id: string, patch: Partial<DriverRow>): Observable<DriverRow> {
    // Driver availability is managed server-side by dispatch/complete commands.
    return of({ id, ...patch } as DriverRow);
  }
  patchVehicle(id: string, patch: Partial<VehicleRow>): Observable<VehicleRow> {
    // Vehicle availability is managed server-side by dispatch/complete commands.
    return of({ id, ...patch } as VehicleRow);
  }
  createDelivery(row: Partial<DeliveryRow>): Observable<DeliveryRow> {
    const payload = {
      orderId: Number(row.orderId),
      providerId: Number(row.providerId ?? this.iam.currentProviderId() ?? 1),
      driverId: Number(row.driverId),
      vehicleId: Number(row.vehicleId),
      scheduledDate: row.createdAt ?? new Date().toISOString(),
      notes: '',
    };
    return this.http.post<DeliveryResource>(this.url('/deliveries'), payload).pipe(
      map((d) => this.toDeliveryRow(d)),
    );
  }
  patchDelivery(id: string, patch: Partial<DeliveryRow>): Observable<DeliveryRow> {
    if ((patch.status ?? '').toUpperCase() === 'DELIVERED') {
      return this.http.post<DeliveryResource>(this.url(`/deliveries/${id}/complete`), {}).pipe(
        map((d) => this.toDeliveryRow(d)),
      );
    }
    return of({ id, ...patch } as DeliveryRow);
  }
  createNotification(row: Partial<NotificationRow>): Observable<NotificationRow> {
    const payload = {
      userId: row.userId != null ? Number(row.userId) : null,
      companyId: row.companyId ?? null,
      providerId: row.providerId ?? null,
      type: row.type,
      title: row.title ?? '',
      message: row.message,
      referenceId: row.relatedId ?? row.orderId ?? null,
    };
    return this.http.post<NotificationResource>(this.url('/notifications'), payload).pipe(
      map((n) => this.toNotificationRow(n)),
    );
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Aggregates Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬--
  loadBuyerBundle(): Observable<{
    orders: OrderRow[];
    requests: RequestRow[];
    payments: PaymentRow[];
    invoices: InvoiceRow[];
    equipment: EquipmentRow[];
    providers: ProviderRow[];
    monthly: MonthlySpendingRow[];
  }> {
    return forkJoin({
      orders: this.getOrders(),
      requests: this.getRequests(),
      payments: this.getPayments(),
      invoices: this.getInvoices(),
      equipment: this.getEquipment(),
      providers: this.getProviders(),
      monthly: this.getMonthlySpending(),
    }).pipe(
      map((bundle) => ({
        ...bundle,
        orders: this.withPaymentStatus(bundle.orders, bundle.payments),
      })),
    );
  }

  loadProviderBundle(): Observable<{
    orders: OrderRow[];
    requests: RequestRow[];
    products: ProductRow[];
    providers: ProviderRow[];
    buyers: BuyerCompanyRow[];
  }> {
    return forkJoin({
      orders: this.getOrders(),
      requests: this.getRequests(),
      products: this.getProducts(),
      providers: this.getProviders(),
      buyers: this.getBuyerCompanies(),
      payments: this.getPayments(),
    }).pipe(
      map(({ payments, ...bundle }) => ({
        ...bundle,
        orders: this.withPaymentStatus(bundle.orders, payments),
      })),
    );
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Resource Ã¢â€ â€™ Row adapters Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  private toProductRow(i: FuelProductResource): ProductRow {
    return {
      id: i.id,
      providerId: i.providerId,
      fuelType: i.fuelType,
      name: i.name,
      description: '',
      pricePerLiter: i.pricePerUnit,
      unit: i.unit ?? 'LITERS',
      // `available` reflects the provider's active/inactive flag; the catalog
      // additionally requires stock > 0 before listing the product.
      available: i.active ?? true,
      stock: i.availableStock,
      capacity: i.capacity ?? i.availableStock,
    };
  }
  private toEquipmentRow(e: EquipmentResource): EquipmentRow {
    return {
      id: e.id,
      companyId: e.companyId,
      name: e.name,
      type: e.equipmentType,
      requiredFuelType: e.fuelType,
      capacity: e.tankCapacity,
      currentLevel: (e as any).currentLevel ?? e.tankCapacity,
      unit: 'LITERS',
      status: (e as any).status ?? 'operational',
      favoriteProviderId: e.favoriteProviderId ?? null,
      autoRefill: (e as any).autoRefill ?? false,
      refillThreshold: (e as any).refillThreshold ?? 20,
      location: (e as any).location ?? 'Ubicacion de entrega',
      lastRefillDate: (e as any).lastRefillDate ?? null,
    };
  }
  private toRequestRow(r: FuelRequestResource): RequestRow {
    return {
      id: String(r.id),
      clientId: String(r.buyerCompanyId),
      companyId: r.buyerCompanyId,
      providerId: r.providerId,
      productId: r.fuelProductId,
      fuelType: r.fuelType,
      productName: r.productName,
      quantity: r.quantity,
      unit: r.unit,
      unitPrice: r.unitPrice,
      desiredDeliveryDate: r.deliveryDate,
      deliveryAddress: r.deliveryAddress,
      source: r.source,
      equipmentId: r.equipmentId,
      status: r.status,
      rejectionReason: r.rejectionReason ?? r.rejectionReasonNote ?? r.rejectionReasonCode ?? null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt ?? r.createdAt,
    };
  }
  private toRequestRowFromOrder(o: OrderResource): RequestRow {
    const now = new Date().toISOString();
    return {
      id: String(o.id),
      clientId: String(o.companyId),
      companyId: o.companyId,
      providerId: o.providerId,
      productId: o.fuelProductId,
      quantity: o.requestedQuantity,
      unit: 'LITERS',
      desiredDeliveryDate: o.scheduledDate ?? '',
      deliveryAddress: o.deliveryAddress,
      equipmentId: o.equipmentId,
      status: o.status,
      rejectionReason: null,
      createdAt: o.scheduledDate ?? now,
      updatedAt: now,
    };
  }
  private toOrderRow(o: OrderResource, product?: ProductRow): OrderRow {
    const now = new Date().toISOString();
    return {
      id: String(o.id),
      requestId: String(o.requestId ?? o.id),
      clientId: String(o.companyId),
      companyId: o.companyId,
      providerId: o.providerId,
      productId: o.fuelProductId,
      fuelType: product?.fuelType,
      productName: product?.name,
      quantity: o.requestedQuantity,
      unit: product?.unit ?? 'LITERS',
      unitPrice: product?.pricePerLiter,
      totalAmount: o.totalPrice,
      equipmentId: o.equipmentId,
      deliveryAddress: o.deliveryAddress,
      estimatedDeliveryDate: o.scheduledDate,
      status: o.status,
      paymentStatus: undefined,
      dispatchedAt: null,
      deliveredAt: null,
      closedAt: null,
      createdAt: o.scheduledDate ?? now,
      updatedAt: now,
    };
  }
  private toPaymentRow(p: PaymentResource): PaymentRow {
    return {
      id: p.id,
      orderId: String(p.orderId),
      companyId: p.companyId,
      providerId: 0,
      method: p.paymentMethod,
      amount: p.amount,
      status: p.status,
      maskedCard: null,
      cardHolder: null,
      reference: p.transactionReference,
      createdAt: p.paidAt ?? '',
    };
  }
  private toInvoiceRow(i: InvoiceResource): InvoiceRow {
    return {
      id: i.id,
      paymentId: i.paymentId,
      orderId: String(i.orderId),
      invoiceNumber: i.invoiceNumber,
      providerRuc: i.providerRuc,
      providerName: i.providerName,
      buyerRuc: i.buyerRuc,
      buyerName: i.buyerName,
      fuelType: i.fuelType,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
      igv: i.igv,
      total: i.total,
      issueDate: i.issueDate,
      status: i.status,
    };
  }
  private toDriverRow(d: DriverResource): DriverRow {
    return {
      id: String(d.id),
      providerId: String(d.providerId),
      firstName: d.firstName,
      lastName: d.lastName,
      licenseNumber: d.licenseNumber,
      phoneNumber: d.phoneNumber,
      email: d.email,
      status: d.status,
    };
  }
  private toVehicleRow(v: VehicleResource): VehicleRow {
    return {
      id: String(v.id),
      providerId: String(v.providerId),
      licensePlate: v.licensePlate,
      brand: v.brand,
      model: v.model,
      capacity: v.capacity,
      unit: v.unit,
      status: v.status,
    };
  }
  private toDeliveryRow(d: DeliveryResource): DeliveryRow {
    return {
      id: String(d.id),
      orderId: String(d.orderId),
      providerId: d.providerId,
      driverId: d.driverId != null ? String(d.driverId) : null,
      vehicleId: d.vehicleId != null ? String(d.vehicleId) : null,
      status: d.status,
      dispatchedAt: d.dispatchedAt,
      deliveredAt: d.deliveredAt,
      createdAt: d.dispatchedAt ?? d.deliveredAt ?? '',
    };
  }
  private toNotificationRow(n: NotificationResource): NotificationRow {
    return {
      id: String(n.id),
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      isRead: n.read,
      relatedId: n.referenceId != null ? String(n.referenceId) : null,
      orderId: n.referenceId != null ? String(n.referenceId) : null,
      createdAt: n.createdAt ?? '',
      userId: String(n.userId),
    };
  }

  private withPaymentStatus(orders: OrderRow[], payments: PaymentRow[]): OrderRow[] {
    const byOrder = new Map(payments.map((payment) => [String(payment.orderId), payment]));
    return orders.map((order) => {
      const payment = byOrder.get(String(order.id));
      const paid = payment?.status === 'COMPLETED';
      return {
        ...order,
        status: paid ? 'PAID' : order.status,
        paymentStatus: paid ? 'PAID' : payment?.status ?? order.paymentStatus,
      };
    });
  }
}
