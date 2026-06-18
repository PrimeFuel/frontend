import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ChartConfiguration } from 'chart.js';
import { ChartComponent } from '../../../../shared/presentation/component/chart/chart';
import { IamStore } from '../../../../iam/application/iam.store';
import {
  PlatformApi,
  OrderRow,
  ProviderRow,
  EquipmentRow,
  MonthlySpendingRow,
} from '../../../../shared/infrastructure/platform-api';
import { money, num, fuelLabel } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, ChartComponent, TranslatePipe],
  templateUrl: './buyer-dashboard.html',
  styleUrl: './buyer-dashboard.css',
})
export class BuyerDashboard implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);
  private readonly router = inject(Router);

  readonly money = money;
  readonly num = num;
  readonly fuelLabel = fuelLabel;

  private readonly orders = signal<OrderRow[]>([]);
  private readonly equipment = signal<EquipmentRow[]>([]);
  private readonly providers = signal<ProviderRow[]>([]);
  private readonly monthly = signal<MonthlySpendingRow[]>([]);
  readonly loading = signal(true);

  private readonly companyId = computed(() => this.iam.currentCompanyId() ?? 1);

  readonly buyerOrders = computed(() =>
    this.orders().filter((o) => (o.companyId ?? 1) === this.companyId()),
  );

  readonly activeOrders = computed(() =>
    this.buyerOrders().filter((o) =>
      ['ACCEPTED', 'CREATED', 'DISPATCHED', 'PENDING_PAYMENT'].includes(o.status),
    ),
  );

  readonly pendingPayments = computed(() =>
    this.buyerOrders().filter(
      (o) => o.status === 'PENDING_PAYMENT' || o.paymentStatus === 'PENDING',
    ),
  );
  readonly pendingPaymentsTotal = computed(() =>
    this.pendingPayments().reduce((s, o) => s + (o.totalAmount || 0), 0),
  );

  readonly needsRefill = computed(() =>
    this.equipment()
      .filter((e) => (e.companyId ?? 1) === this.companyId())
      .filter((e) => e.capacity > 0 && (e.currentLevel / e.capacity) * 100 <= e.refillThreshold),
  );

  readonly totalSpent = computed(() =>
    this.buyerOrders()
      .filter((o) => o.status === 'PAID' || o.status === 'CLOSED' || o.paymentStatus === 'PAID')
      .reduce((s, o) => s + (o.totalAmount || 0), 0),
  );

  readonly recentOrders = computed(() =>
    [...this.buyerOrders()]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5),
  );

  readonly spendingTrend = computed<ChartConfiguration>(() => {
    const rows = [...this.monthly()]
      .filter((m) => (m.companyId ?? 1) === this.companyId())
      .sort((a, b) => a.monthIndex - b.monthIndex);
    return {
      type: 'line',
      data: {
        labels: rows.map((r) => r.month),
        datasets: [
          {
            data: rows.map((r) => r.amount),
            label: 'Spending',
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.12)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#1e3a8a',
            pointRadius: 4,
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
            ticks: {
              color: '#94a3b8',
              callback: (v) => 'S/ ' + Number(v).toLocaleString('en-US'),
            },
          },
        },
      },
    };
  });

  providerName(id: string | number): string {
    return this.providers().find((p) => String(p.id) === String(id))?.name ?? '—';
  }

  ngOnInit(): void {
    this.api.loadBuyerBundle().subscribe({
      next: (b) => {
        this.orders.set(b.orders);
        this.equipment.set(b.equipment);
        this.providers.set(b.providers);
        this.monthly.set(b.monthly);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  go(path: string): void {
    this.router.navigate([path]);
  }

  openOrder(o: OrderRow): void {
    this.router.navigate(['/ordering/buyer-order', o.id]);
  }

  statusClass(s: string): string {
    return (s || '').toLowerCase();
  }
}
