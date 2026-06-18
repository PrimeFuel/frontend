import { Injectable, signal, computed, inject } from '@angular/core';
import { retry } from 'rxjs';
import { PaymentApi } from '../infrastructure/payment-api';
import { OrderingApi } from '../../ordering/infrastructure/ordering-api';
import { Payment } from '../domain/model/payment.entity';
import { Invoice } from '../domain/model/invoice.entity';
import { Order } from '../../ordering/domain/model/order.entity';

@Injectable({ providedIn: 'root' })
export class PaymentStore {
  private readonly api = inject(PaymentApi);
  private readonly orderingApi = inject(OrderingApi);

  private readonly _payments = signal<Payment[]>([]);
  private readonly _invoices = signal<Invoice[]>([]);
  private readonly _pendingOrders = signal<Order[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string>('');

  readonly payments = this._payments.asReadonly();
  readonly invoices = this._invoices.asReadonly();
  readonly pendingOrders = this._pendingOrders.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly completedPayments = computed(() =>
    this._payments().filter((p) => p.status === 'COMPLETED'),
  );

  loadPayments(): void {
    this._isLoading.set(true);
    this.api.getPaymentsByCompany(1).pipe(retry(2)).subscribe({
      next: (payments) => {
        this._payments.set(payments);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load payments');
        this._isLoading.set(false);
      },
    });
  }

  loadPendingOrders(): void {
    this.orderingApi.getOrders().pipe(retry(2)).subscribe({
      next: (orders) => {
        this._pendingOrders.set(
          orders.filter((o) => o.status === 'PENDING_PAYMENT'),
        );
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load pending orders');
      },
    });
  }

  loadInvoices(): void {
    this.api.getAllInvoices().pipe(retry(2)).subscribe({
      next: (invoices) => {
        this._invoices.set(invoices);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load invoices');
      },
    });
  }

  processPayment(
    order: Order,
    method: string,
    paymentData: { cardHolder?: string; maskedCard?: string; reference?: string },
  ): void {
    this._isLoading.set(true);
    const now = new Date().toISOString();
    const refNum = `PAY-${Date.now()}`;

    const payment = new Payment({
      id: String(Date.now()),
      orderId: order.id,
      companyId: 1,
      providerId: 1,
      method,
      amount: order.totalAmount,
      status: 'COMPLETED',
      maskedCard: paymentData.maskedCard ?? null,
      cardHolder: paymentData.cardHolder ?? null,
      reference: paymentData.reference ?? refNum,
      createdAt: now,
    });

    this.api.createPayment(payment).pipe(retry(2)).subscribe({
      next: (createdPayment) => {
        this._payments.update((list) => [createdPayment, ...list]);
        this._pendingOrders.update((list) => list.filter((o) => o.id !== order.id));

        // Update order to PAID
        const updatedOrder = new Order({
          id: order.id,
          requestId: order.requestId,
          clientId: order.clientId,
          providerId: order.providerId,
          productId: order.productId,
          quantity: order.quantity,
          unit: order.unit,
          totalAmount: order.totalAmount,
          deliveryAddress: order.deliveryAddress,
          status: 'PAID',
          dispatchedAt: order.dispatchedAt,
          deliveredAt: order.deliveredAt,
          closedAt: order.closedAt,
          createdAt: order.createdAt,
          updatedAt: now,
        });
        this.orderingApi.updateOrder(updatedOrder).subscribe();

        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to process payment');
        this._isLoading.set(false);
      },
    });
  }

  getInvoiceByPaymentId(paymentId: string): Invoice | undefined {
    return this._invoices().find((inv) => String(inv.paymentId) === paymentId);
  }
}
