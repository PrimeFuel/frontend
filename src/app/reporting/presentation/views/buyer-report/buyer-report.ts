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
  ProviderRow,
  EquipmentRow,
  MonthlySpendingRow,
} from '../../../../shared/infrastructure/platform-api';
import { money, num, fuelLabel, toLiters } from '../../../../shared/domain/model/view-helpers';

interface EquipmentSpendRow {
  equipment: string;
  fuelType: string;
  orders: number;
  volume: number;
  spent: number;
}

const PALETTE = ['#2563eb', '#059669', '#f59e0b', '#dc2626', '#8b5cf6', '#0ea5e9', '#64748b'];

@Component({
  selector: 'app-buyer-report',
  standalone: true,
  imports: [CommonModule, MatIconModule, ChartComponent, TranslatePipe],
  templateUrl: './buyer-report.html',
  styleUrl: './buyer-report.css',
})
export class BuyerReport implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);

  readonly money = money;
  readonly num = num;
  readonly fuelLabel = fuelLabel;

  private readonly orders = signal<OrderRow[]>([]);
  private readonly providers = signal<ProviderRow[]>([]);
  private readonly equipment = signal<EquipmentRow[]>([]);
  private readonly monthly = signal<MonthlySpendingRow[]>([]);
  readonly loading = signal(true);

  private get companyId(): number {
    return this.iam.currentCompanyId() ?? 1;
  }

  readonly buyerOrders = computed(() =>
    this.orders().filter((o) => (o.companyId ?? 1) === this.companyId),
  );
  readonly billable = computed(() =>
    this.buyerOrders().filter(
      (o) => o.status === 'PAID' || o.status === 'CLOSED' || o.paymentStatus === 'PAID',
    ),
  );

  readonly totalSpending = computed(() =>
    this.billable().reduce((s, o) => s + (o.totalAmount || 0), 0),
  );
  readonly paid = computed(() =>
    this.buyerOrders()
      .filter((o) => o.status === 'PAID' || o.status === 'CLOSED' || o.paymentStatus === 'PAID')
      .reduce((s, o) => s + (o.totalAmount || 0), 0),
  );
  readonly totalOrders = computed(() => this.billable().length);
  readonly avgOrder = computed(() =>
    this.totalOrders() ? this.totalSpending() / this.totalOrders() : 0,
  );

  providerName(id: string | number): string {
    return this.providers().find((p) => String(p.id) === String(id))?.name ?? '-';
  }
  equipmentName(id: string | number | null | undefined): string {
    if (!id) return 'Unassigned';
    return this.equipment().find((e) => String(e.id) === String(id))?.name ?? 'Unassigned';
  }

  // Spending by equipment+fuel (separate row when fuel changes).
  readonly byEquipment = computed<EquipmentSpendRow[]>(() => {
    const map = new Map<string, EquipmentSpendRow>();
    for (const o of this.billable()) {
      const eqName = this.equipmentName(o.equipmentId);
      const fuel = fuelLabel(o.fuelType);
      const key = `${eqName}__${fuel}`;
      const row = map.get(key) ?? { equipment: eqName, fuelType: fuel, orders: 0, volume: 0, spent: 0 };
      row.orders += 1;
      row.volume += toLiters(o.quantity, o.unit);
      row.spent += o.totalAmount || 0;
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  });

  readonly monthlyChart = computed<ChartConfiguration>(() => {
    const rows = [...this.monthly()]
      .filter((m) => (m.companyId ?? 1) === this.companyId)
      .sort((a, b) => a.monthIndex - b.monthIndex);
    return {
      type: 'bar',
      data: {
        labels: rows.map((r) => r.month),
        datasets: [
          {
            data: rows.map((r) => r.amount),
            backgroundColor: '#2563eb',
            borderRadius: 6,
            barPercentage: 0.6,
          },
        ],
      },
      options: this.barOpts(),
    };
  });

  readonly byFuelChart = computed<ChartConfiguration>(() =>
    this.doughnut(this.groupSum((o) => fuelLabel(o.fuelType))),
  );
  readonly byProviderChart = computed<ChartConfiguration>(() =>
    this.doughnut(this.groupSum((o) => this.providerName(o.providerId))),
  );
  readonly byEquipmentChart = computed<ChartConfiguration>(() =>
    this.doughnut(this.byEquipment().map((r) => [`${r.equipment} (${r.fuelType})`, r.spent])),
  );

  private groupSum(keyFn: (o: OrderRow) => string): [string, number][] {
    const map = new Map<string, number>();
    for (const o of this.billable()) {
      const k = keyFn(o);
      map.set(k, (map.get(k) ?? 0) + (o.totalAmount || 0));
    }
    return [...map.entries()];
  }

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
        cutout: '62%',
      },
    };
    return cfg as unknown as ChartConfiguration;
  }

  private barOpts(): ChartConfiguration['options'] {
    return {
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
    };
  }

  ngOnInit(): void {
    this.api.loadBuyerBundle().subscribe({
      next: (b) => {
        this.orders.set(b.orders);
        this.providers.set(b.providers);
        this.equipment.set(b.equipment);
        this.monthly.set(b.monthly);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
