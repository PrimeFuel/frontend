import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs';
import { IamStore } from '../../../../iam/application/iam.store';
import { NotificationsFacade } from '../../../../shared/application/notifications.facade';
import {
  PlatformApi,
  OrderRow,
  PaymentRow,
  InvoiceRow,
  ProviderRow,
} from '../../../../shared/infrastructure/platform-api';
import { money, num, fuelLabel, formatDate } from '../../../../shared/domain/model/view-helpers';

type View = 'pending' | 'history';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TranslatePipe],
  templateUrl: './payment-list.html',
  styleUrl: './payment-list.css',
})
export class PaymentList implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);
  private readonly notify = inject(NotificationsFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly money = money;
  readonly num = num;
  readonly fuelLabel = fuelLabel;
  readonly formatDate = formatDate;

  readonly view = signal<View>('pending');
  readonly orders = signal<OrderRow[]>([]);
  readonly payments = signal<PaymentRow[]>([]);
  readonly invoices = signal<InvoiceRow[]>([]);
  readonly providers = signal<ProviderRow[]>([]);
  readonly loading = signal(true);

  // Pay modal
  readonly payOrder = signal<OrderRow | null>(null);
  method: 'CARD' | 'YAPE' = 'CARD';
  cardHolder = '';
  cardNumber = '';
  expiry = '';
  cvv = '';
  yapePhone = '';
  yapeCode = '';
  processing = signal(false);

  // Confirmation + invoice
  readonly confirmation = signal<{ order: OrderRow; invoice: InvoiceRow } | null>(null);
  readonly invoiceModal = signal<InvoiceRow | null>(null);

  private get companyId(): number {
    return this.iam.currentCompanyId() ?? 1;
  }

  readonly pendingOrders = computed(() =>
    this.orders().filter(
      (o) =>
        (o.companyId ?? 1) === this.companyId &&
        (o.status === 'PENDING_PAYMENT' || o.paymentStatus === 'PENDING'),
    ),
  );

  readonly companyPayments = computed(() =>
    [...this.payments()]
      .filter((p) => p.companyId === this.companyId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  );

  ngOnInit(): void {
    this.api.getProviders().subscribe((p) => this.providers.set(p));
    this.reload();
    if (this.route.snapshot.queryParamMap.get('orderId')) {
      // auto-open pay once orders load
      this.pendingFocus = this.route.snapshot.queryParamMap.get('orderId');
    }
  }

  private pendingFocus: string | null = null;

  private reload(): void {
    this.api.getOrders().subscribe((o) => {
      this.orders.set(o);
      this.loading.set(false);
      if (this.pendingFocus) {
        const target = o.find((x) => x.id === this.pendingFocus);
        if (target) this.openPay(target);
        this.pendingFocus = null;
      }
    });
    this.api.getPayments().subscribe((p) => this.payments.set(p));
    this.api.getInvoices().subscribe((i) => this.invoices.set(i));
  }

  providerName(id: string | number): string {
    return this.providers().find((p) => String(p.id) === String(id))?.name ?? '—';
  }

  providerRuc(id: string | number): string {
    return this.providers().find((p) => String(p.id) === String(id))?.ruc ?? '';
  }

  // ── Pay modal ───────────────────────────────────────────────────────────-
  openPay(o: OrderRow): void {
    this.payOrder.set(o);
    this.method = 'CARD';
    this.cardHolder = this.cardNumber = this.expiry = this.cvv = '';
    this.yapePhone = this.yapeCode = '';
  }

  closePay(): void {
    this.payOrder.set(null);
  }

  get canSubmit(): boolean {
    if (this.processing()) return false;
    if (this.method === 'CARD')
      return this.cardHolder.trim().length > 1 && this.cardNumber.replace(/\s/g, '').length >= 12;
    return this.yapePhone.trim().length >= 6 && this.yapeCode.trim().length >= 4;
  }

  submitPay(): void {
    const o = this.payOrder();
    if (!o || !this.canSubmit) return;
    this.processing.set(true);
    const now = new Date().toISOString();
    const cardNum = this.cardNumber.replace(/\s/g, '');
    const total = o.totalAmount;
    const subtotal = +(total / 1.18).toFixed(2);
    const igv = +(total - subtotal).toFixed(2);
    // Invoice line data is sent with the payment so the backend generates the
    // invoice (CreatePaymentResource carries the denormalized fields).
    const invoice: Partial<InvoiceRow> = {
      orderId: o.id,
      invoiceNumber: `F001-${String(Math.floor(100000 + Math.random() * 899999))}`,
      providerRuc: this.providerRuc(o.providerId),
      providerName: this.providerName(o.providerId),
      buyerRuc: '',
      buyerName: this.iam.companyName(),
      fuelType: o.fuelType ?? '',
      quantity: o.quantity,
      unit: o.unit,
      unitPrice: o.unitPrice ?? 0,
      subtotal,
      igv,
      total,
      issueDate: now,
      status: 'PAID',
    };
    const payment: Partial<PaymentRow> = {
      orderId: o.id,
      companyId: this.companyId,
      providerId: Number(o.providerId),
      method: this.method,
      amount: o.totalAmount,
      status: 'COMPLETED',
      maskedCard: this.method === 'CARD' ? `**** **** **** ${cardNum.slice(-4)}` : null,
      cardHolder: this.method === 'CARD' ? this.cardHolder.toUpperCase() : null,
      reference: this.method === 'CARD' ? `PAY-${Date.now()}` : `YAPE-${Date.now()}`,
      createdAt: now,
    };

    // createPayment → mark order paid → fetch the backend-generated invoice.
    this.api
      .createPayment(payment, invoice)
      .pipe(
        switchMap((createdPayment) => this.api.getInvoiceByPayment(createdPayment.id)),
        finalize(() => this.processing.set(false)),
      )
      .subscribe({
        next: (serverInvoice) => {
          const inv = serverInvoice ?? ({ ...invoice, paymentId: 0 } as InvoiceRow);
          this.notify.notifyProvider(
            o.providerId,
            'PAYMENT_RECEIVED',
            'Payment received',
            `Order ${o.id} was paid (${this.money(total)}).`,
            o.id,
          );
          this.notify.notifyBuyer(
            this.companyId,
            'PAYMENT_COMPLETED',
            'Payment completed',
            `Your payment for order ${o.id} was processed and the invoice is ready.`,
            o.id,
          );
          this.closePay();
          this.confirmation.set({ order: o, invoice: inv });
          this.view.set('history');
          this.reload();
        },
        error: () => {
          this.closePay();
        },
      });
  }

  // ── Confirmation / invoice ──────────────────────────────────────────────-
  dismissConfirmation(): void {
    this.confirmation.set(null);
  }

  goToOrders(): void {
    this.router.navigate(['/ordering/my-orders']);
  }

  viewInvoice(inv: InvoiceRow | null): void {
    if (inv) this.invoiceModal.set(inv);
  }

  invoiceForPayment(p: PaymentRow): InvoiceRow | undefined {
    return this.invoices().find((i) => String(i.paymentId) === String(p.id) || i.orderId === p.orderId);
  }

  closeInvoice(): void {
    this.invoiceModal.set(null);
  }

  printInvoice(): void {
    window.print();
  }

  // ── CSV export ──────────────────────────────────────────────────────────-
  exportCsv(): void {
    const rows = this.companyPayments();
    const header = ['Payment', 'Order Ref', 'Method', 'Amount', 'Date', 'Status'];
    const lines = rows.map((p) =>
      [
        p.reference ?? p.id,
        p.orderId,
        p.method,
        p.amount,
        formatDate(p.createdAt),
        p.status,
      ].join(','),
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payment-history-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  statusClass(s: string): string {
    return (s || '').toLowerCase();
  }
}
