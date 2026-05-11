import { computed, Injectable, Signal, signal } from '@angular/core';
import { Request } from '../domain/model/request.entity';
import { Order } from '../domain/model/order.entity';
import { OrderingApi } from '../infrastructure/ordering-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderingStore {
  private readonly requestsSignal = signal<Request[]>([]);
  private readonly ordersSignal = signal<Order[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly requests = this.requestsSignal.asReadonly();
  readonly requestCount = computed(() => this.requests().length);
  readonly orders = this.ordersSignal.asReadonly();
  readonly orderCount = computed(() => this.orders().length);
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed selectors by status
  readonly pendingRequests = computed(() =>
    this.requests().filter(r => r.status === 'PENDING_APPROVAL')
  );
  readonly approvedRequests = computed(() =>
    this.requests().filter(r => r.status === 'APPROVED')
  );
  readonly activeOrders = computed(() =>
    this.orders().filter(o => o.status === 'CREATED' || o.status === 'DISPATCHED')
  );
  readonly closedOrders = computed(() =>
    this.orders().filter(o => o.status === 'CLOSED')
  );

  constructor(private orderingApi: OrderingApi) {
    this.loadRequests();
    this.loadOrders();
  }

  private loadRequests() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.orderingApi.getRequests().pipe(takeUntilDestroyed()).subscribe({
      next: requests => {
        this.requestsSignal.set(requests);
        this.loadingSignal.set(false);
        this.errorSignal.set(null);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to load requests'));
        this.loadingSignal.set(false);
      }
    });
  }

  private loadOrders() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.orderingApi.getOrders().pipe(takeUntilDestroyed()).subscribe({
      next: orders => {
        this.ordersSignal.set(orders);
        this.loadingSignal.set(false);
        this.errorSignal.set(null);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to load orders'));
        this.loadingSignal.set(false);
      }
    });
  }

  getRequestById(id: string): Signal<Request | undefined> {
    return computed(() => id ? this.requests().find(r => r.id === id) : undefined);
  }

  getOrderById(id: string): Signal<Order | undefined> {
    return computed(() => id ? this.orders().find(o => o.id === id) : undefined);
  }

  addRequest(request: Request): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.orderingApi.createRequest(request).pipe(retry(2)).subscribe({
      next: createdRequest => {
        this.requestsSignal.update(requests => [...requests, createdRequest]);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to create request'));
        this.loadingSignal.set(false);
      }
    });
  }

  addOrder(order: Order): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.orderingApi.createOrder(order).pipe(retry(2)).subscribe({
      next: createdOrder => {
        this.ordersSignal.update(orders => [...orders, createdOrder]);
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to create order'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateRequest(updateRequest: Request): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.orderingApi.updateRequest(updateRequest).pipe(retry(2)).subscribe({
      next: request => {
        this.requestsSignal.update(requests =>
          requests.map(r => r.id === request.id ? request : r)
        );
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to update request'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateOrder(updateOrder: Order): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.orderingApi.updateOrder(updateOrder).pipe(retry(2)).subscribe({
      next: order => {
        this.ordersSignal.update(orders =>
          orders.map(o => o.id === order.id ? order : o)
        );
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to update order'));
        this.loadingSignal.set(false);
      }
    });
  }

  deleteRequest(id: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.orderingApi.deleteRequest(id).pipe(retry(2)).subscribe({
      next: () => {
        this.requestsSignal.update(requests =>
          requests.filter(r => r.id !== id)
        );
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to delete request'));
        this.loadingSignal.set(false);
      }
    });
  }

  deleteOrder(id: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.orderingApi.deleteOrder(id).pipe(retry(2)).subscribe({
      next: () => {
        this.ordersSignal.update(orders =>
          orders.filter(o => o.id !== id)
        );
        this.loadingSignal.set(false);
      },
      error: error => {
        this.errorSignal.set(this.formatError(error, 'Failed to delete order'));
        this.loadingSignal.set(false);
      }
    });
  }

  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}
