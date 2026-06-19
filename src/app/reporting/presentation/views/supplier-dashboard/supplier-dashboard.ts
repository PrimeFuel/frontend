import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
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
import { money, num, fuelLabel, toLiters } from '../../../../shared/domain/model/view-helpers';

interface CustomerRow {
  name: string;
  sector: string;
  volume: number;
  revenue: number;
  status: string;
}

const PALETTE = ['#2563eb', '#059669', '#f59e0b', '#dc2626', '#8b5cf6', '#0ea5e9', '#64748b'];

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, ChartComponent, TranslatePipe],
  templateUrl: './supplier-dashboard.html',
  styleUrl: './supplier-dashboard.css',
})
export class SupplierDashboard implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);

  readonly money = money;
  readonly num = num;

  private readonly orders = signal<OrderRow[]>([]);
  private readonly requests = signal<RequestRow[]>([]);
  private readonly buyers = signal<BuyerCompanyRow[]>([]);
  private readonly revenueRows = signal<ProviderMonthlyRevenueRow[]>([]);
  readonly loading = signal(true);

  private get providerId(): number {
    return this.iam.currentProviderId() ?? 1;
  }

  readonly providerOrders = computed(() =>
    this.orders().filter((o) => String(o.providerId) === String(this.providerId)),
  );
  readonly providerRequests = computed(() =>
    this.requests().filter((r) => String(r.providerId) === String(this.providerId)),
  );

  readonly paidOrders = computed(() =>
    this.providerOrders().filter(
      (o) => o.status === 'PAID' || o.status === 'CLOSED' || o.paymentStatus === 'PAID',
    ),
  );
  readonly totalRevenue = computed(() =>
    this.paidOrders().reduce((s, o) => s + (o.totalAmount || 0), 0),
  );
  readonly totalOrders = computed(() => this.providerOrders().length);
  readonly rejectedRequests = computed(
    () => this.providerRequests().filter((r) => r.status === 'REJECTED').length,
  );
  readonly customerCount = computed(() => this.customers().length);

  readonly customers = computed<CustomerRow[]>(() => {
    const map = new Map<number, CustomerRow>();
    for (const o of this.providerOrders()) {
      const cid = o.companyId ?? -1;
      const buyer = this.buyers().find((b) => b.id === cid);
      const name = buyer?.name ?? o.deliveryAddress ?? 'Buyer';
      const sector = buyer?.sector ?? '—';
      const row = map.get(cid) ?? { name, sector, volume: 0, revenue: 0, status: 'ACTIVE' };
      row.volume += toLiters(o.quantity, o.unit);
      if (o.status === 'PAID' || o.status === 'CLOSED' || o.paymentStatus === 'PAID')
        row.revenue += o.totalAmount || 0;
      map.set(cid, row);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  });

  readonly revenueChart = computed<ChartConfiguration>(() => {
    const rows = [...this.revenueRows()]
      .filter((r) => String(r.providerId) === String(this.providerId))
      .sort((a, b) => a.monthIndex - b.monthIndex);
    return {
      type: 'line',
      data: {
        labels: rows.map((r) => r.month),
        datasets: [
          {
            data: rows.map((r) => r.revenue),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#1e3a8a',
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

  readonly statusChart = computed<ChartConfiguration>(() => {
    const counts = new Map<string, number>();
    for (const o of this.providerOrders()) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
    return this.doughnut([...counts.entries()]);
  });

  readonly fuelChart = computed<ChartConfiguration>(() => {
    const map = new Map<string, number>();
    for (const o of this.paidOrders())
      map.set(fuelLabel(o.fuelType), (map.get(fuelLabel(o.fuelType)) ?? 0) + (o.totalAmount || 0));
    return this.doughnut([...map.entries()]);
  });

  readonly sectorChart = computed<ChartConfiguration>(() => {
    const map = new Map<string, number>();
    for (const c of this.customers()) map.set(c.sector, (map.get(c.sector) ?? 0) + 1);
    return this.doughnut([...map.entries()]);
  });

  private doughnut(entries: [string, number][]): ChartConfiguration {
    const cfg: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: entries.map((e) => e[0]),
        datasets: [{ data: entries.map((e) => e[1]), backgroundColor: PALETTE, borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
        cutout: '60%',
      },
    };
    return cfg as unknown as ChartConfiguration;
  }

  ngOnInit(): void {
    this.api.getProviderMonthlyRevenue().subscribe((r) => this.revenueRows.set(r));
    this.api.loadProviderBundle().subscribe({
      next: (b) => {
        this.orders.set(b.orders);
        this.requests.set(b.requests);
        this.buyers.set(b.buyers);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusClass(s: string): string {
    return (s || '').toLowerCase();
  }
}
