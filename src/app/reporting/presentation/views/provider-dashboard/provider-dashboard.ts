import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChartConfiguration } from 'chart.js';
import { ChartComponent } from '../../../../shared/presentation/component/chart/chart';
import { IamStore } from '../../../../iam/application/iam.store';
import {
  PlatformApi,
  OrderRow,
  RequestRow,
  BuyerCompanyRow,
  ProviderMonthlyRevenueRow,
} from '../../../../shared/infrastructure/platform-api';
import { money, num, fromLiters, toLiters } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, ChartComponent, TranslatePipe],
  templateUrl: './provider-dashboard.html',
  styleUrl: './provider-dashboard.css',
})
export class ProviderDashboard implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly money = money;
  readonly num = num;

  private readonly orders = signal<OrderRow[]>([]);
  private readonly requests = signal<RequestRow[]>([]);
  private readonly buyers = signal<BuyerCompanyRow[]>([]);
  private readonly revenueRows = signal<ProviderMonthlyRevenueRow[]>([]);
  readonly loading = signal(true);

  readonly fuelUnit = signal<'LITERS' | 'GALLONS'>('LITERS');
  readonly salesPeriod = signal<'daily' | 'weekly' | 'monthly'>('weekly');

  private get providerId(): number {
    return this.iam.currentProviderId() ?? 1;
  }

  readonly providerOrders = computed(() =>
    this.orders().filter((o) => String(o.providerId) === String(this.providerId)),
  );
  readonly providerRequests = computed(() =>
    this.requests().filter((r) => String(r.providerId) === String(this.providerId)),
  );

  readonly activeOrders = computed(() =>
    this.providerOrders().filter((o) =>
      ['ACCEPTED', 'CREATED', 'DISPATCHED', 'PENDING_PAYMENT'].includes(o.status),
    ),
  );

  readonly pendingRequests = computed(() =>
    this.providerRequests().filter((r) => r.status === 'PENDING' || r.status === 'PENDING_APPROVAL'),
  );

  readonly fuelInActiveLiters = computed(() =>
    this.activeOrders().reduce((s, o) => s + toLiters(o.quantity, o.unit), 0),
  );

  readonly fuelInActiveDisplay = computed(() => {
    const liters = this.fuelInActiveLiters();
    const value = this.fuelUnit() === 'GALLONS' ? fromLiters(liters, 'GALLONS') : liters;
    return `${num(value)} ${this.fuelUnit() === 'GALLONS' ? 'gal' : 'L'}`;
  });

  readonly toCollect = computed(() =>
    this.providerOrders()
      .filter((o) => o.status === 'PENDING_PAYMENT' || o.paymentStatus === 'PENDING')
      .reduce((s, o) => s + (o.totalAmount || 0), 0),
  );

  readonly topActiveOrders = computed(() => this.activeOrders().slice(0, 5));

  readonly salesTrend = computed<ChartConfiguration>(() => {
    const rows = [...this.revenueRows()]
      .filter((row) => String(row.providerId) === String(this.providerId))
      .sort((a, b) => a.month.localeCompare(b.month));
    return {
      type: 'bar',
      data: {
        labels: rows.map((row) => row.month),
        datasets: [
          {
            data: rows.map((row) => row.revenue),
            backgroundColor: '#2563eb',
            borderRadius: 6,
            barPercentage: 0.55,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { color: '#94a3b8', callback: (v) => 'S/ ' + Number(v).toLocaleString('en-US') },
          },
        },
      },
    };
  });

  buyerName(o: OrderRow): string {
    const buyer = this.buyers().find((x) => x.id === (o.companyId ?? -1));
    return buyer?.name ?? o.deliveryAddress ?? '-';
  }

  eta(o: OrderRow): string {
    if (o.deliveredAt) return this.translate.instant('dashboard-ui.eta-delivered');
    if (o.dispatchedAt) {
      const date = new Date(new Date(o.dispatchedAt).getTime() + 86400000);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return this.translate.instant('dashboard-ui.eta-scheduling');
  }

  statusClass(status: string): string {
    return (status || '').toLowerCase();
  }

  ngOnInit(): void {
    this.api.getProviderMonthlyRevenue().subscribe((rows) => this.revenueRows.set(rows));
    this.api.loadProviderBundle().subscribe({
      next: (bundle) => {
        this.orders.set(bundle.orders);
        this.requests.set(bundle.requests);
        this.buyers.set(bundle.buyers);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleUnit(): void {
    this.fuelUnit.set(this.fuelUnit() === 'LITERS' ? 'GALLONS' : 'LITERS');
  }

  go(path: string): void {
    this.router.navigate([path]);
  }

  openOrder(o: OrderRow): void {
    this.router.navigate(['/ordering/orders', o.id]);
  }
}
