import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam.store';
import {
  PlatformApi,
  OrderRow,
  PaymentRow,
  BuyerCompanyRow,
} from '../../../../shared/infrastructure/platform-api';
import { money, num, fuelLabel, formatDate } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './collections.html',
  styleUrl: './collections.css',
})
export class Collections implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);
  private readonly router = inject(Router);

  readonly money = money;
  readonly num = num;
  readonly fuelLabel = fuelLabel;
  readonly formatDate = formatDate;

  readonly orders = signal<OrderRow[]>([]);
  readonly payments = signal<PaymentRow[]>([]);
  readonly buyers = signal<BuyerCompanyRow[]>([]);
  readonly loading = signal(true);
  readonly tab = signal<'pending' | 'collected'>('pending');

  private get providerId(): number {
    return this.iam.currentProviderId() ?? 1;
  }

  readonly providerOrders = computed(() =>
    this.orders().filter((o) => String(o.providerId) === String(this.providerId)),
  );

  readonly pendingCollection = computed(() =>
    this.providerOrders().filter(
      (o) => o.status === 'PENDING_PAYMENT' || o.paymentStatus === 'PENDING',
    ),
  );
  readonly collected = computed(() =>
    this.providerOrders().filter(
      (o) => o.status === 'PAID' || o.status === 'CLOSED' || o.paymentStatus === 'PAID',
    ),
  );

  readonly toCollectTotal = computed(() =>
    this.pendingCollection().reduce((s, o) => s + (o.totalAmount || 0), 0),
  );
  readonly collectedTotal = computed(() =>
    this.collected().reduce((s, o) => s + (o.totalAmount || 0), 0),
  );

  readonly rows = computed(() =>
    this.tab() === 'pending' ? this.pendingCollection() : this.collected(),
  );

  buyerName(o: OrderRow): string {
    const b = this.buyers().find((x) => x.id === (o.companyId ?? -1));
    return b?.name ?? o.deliveryAddress ?? 'Buyer';
  }

  ngOnInit(): void {
    this.api.getBuyerCompanies().subscribe((b) => this.buyers.set(b));
    this.api.getPayments().subscribe((p) => this.payments.set(p));
    this.api.getOrders().subscribe({
      next: (o) => {
        this.orders.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  view(o: OrderRow): void {
    this.router.navigate(['/ordering/orders', o.id]);
  }

  statusClass(s: string): string {
    return (s || '').toLowerCase();
  }
}
