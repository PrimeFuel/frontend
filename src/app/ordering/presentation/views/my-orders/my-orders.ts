import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam.store';
import {
  PlatformApi,
  OrderRow,
  ProviderRow,
} from '../../../../shared/infrastructure/platform-api';
import { OperationsFacade } from '../../../../shared/application/operations.facade';
import { money, num, fuelLabel } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
})
export class MyOrders implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);
  private readonly facade = inject(OperationsFacade);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  readonly busy = signal<string | null>(null);

  readonly money = money;
  readonly num = num;
  readonly fuelLabel = fuelLabel;

  readonly orders = signal<OrderRow[]>([]);
  readonly providers = signal<ProviderRow[]>([]);
  readonly loading = signal(true);

  private get companyId(): number {
    return this.iam.currentCompanyId() ?? 1;
  }

  readonly buyerOrders = computed(() =>
    [...this.orders()]
      .filter((o) => (o.companyId ?? 1) === this.companyId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  );

  ngOnInit(): void {
    this.api.getProviders().subscribe((p) => this.providers.set(p));
    this.reload();
  }

  private reload(): void {
    this.api.getOrders().subscribe({
      next: (o) => {
        this.orders.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  providerName(id: string | number): string {
    return this.providers().find((p) => String(p.id) === String(id))?.name ?? '—';
  }

  /** Normalized payment-status code: 'paid' | 'pending' | 'not_due'. */
  paymentStatus(o: OrderRow): string {
    if (o.paymentStatus === 'PAID' || o.status === 'PAID' || o.status === 'CLOSED') return 'paid';
    if (o.paymentStatus === 'PENDING' || o.status === 'PENDING_PAYMENT') return 'pending';
    return 'not_due';
  }

  canPay(o: OrderRow): boolean {
    return this.paymentStatus(o) === 'pending';
  }

  canConfirm(o: OrderRow): boolean {
    return o.status === 'DISPATCHED';
  }

  confirmDelivery(o: OrderRow): void {
    if (this.busy()) return;
    this.busy.set(o.id);
    this.facade.confirmDelivery(o).subscribe((result) => {
      this.busy.set(null);
      if (result.ok) {
        this.snackBar.open(
          this.translate.instant('messages.delivery-confirmed'),
          this.translate.instant('messages.ok'),
          { duration: 4000 },
        );
        this.reload();
      } else {
        this.snackBar.open(
          this.translate.instant('messages.confirm-failed'),
          this.translate.instant('messages.ok'),
          { duration: 4000 },
        );
      }
    });
  }

  pay(o: OrderRow): void {
    this.router.navigate(['/payment'], { queryParams: { orderId: o.id } });
  }

  open(o: OrderRow): void {
    this.router.navigate(['/ordering/buyer-order', o.id]);
  }

  statusClass(s: string): string {
    return (s || '').toLowerCase();
  }
}
