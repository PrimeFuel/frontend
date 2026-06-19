import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { Chart, registerables } from 'chart.js';

import { DashboardStore } from '../../../application/dashboard.store';
import { DashboardApiService } from '../../../infrastructure/dashboard-api.service';
import { OrderingStore } from '../../../../ordering/application/ordering.store';
import { Order } from '../../../../ordering/domain/model/order.entity';

Chart.register(...registerables);

// ── Trend Bar Chart (inline component) ──────────────────────────────────────
@Component({
  selector: 'app-trend-chart',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule],
  template: `
    <div class="chart-header">
      <div>
        <div class="chart-title">Selling trend</div>
        <div class="chart-subtitle">Graphics of the selling through time</div>
      </div>
      <mat-button-toggle-group [(value)]="selectedPeriod" (change)="onPeriodChange($event.value)" class="period-toggle">
        <mat-button-toggle value="daily">Daily</mat-button-toggle>
        <mat-button-toggle value="weekly">Weekly</mat-button-toggle>
        <mat-button-toggle value="monthly">Monthly</mat-button-toggle>
      </mat-button-toggle-group>
    </div>
    <div class="chart-area" (click)="onChartClick()">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a2744;
    }
    .chart-subtitle {
      font-size: 13px;
      color: #8b9ab5;
      margin-top: 2px;
    }
    .period-toggle {
      --mdc-outlined-button-label-text-size: 13px;
    }
    .chart-area {
      cursor: pointer;
      height: 220px;
    }
    canvas {
      height: 220px !important;
    }
  `]
})
export class TrendChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  selectedPeriod = 'weekly';
  private chart: Chart | null = null;
  private destroy$ = new Subject<void>();
  private router = inject(Router);

  private readonly datasets: Record<string, { labels: string[]; week1: number[]; week2: number[] }> = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      week1: [3200, 4100, 5800, 6200, 4900, 2100, 1800],
      week2: [2800, 3600, 4200, 7100, 5300, 2400, 1600],
    },
    weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      week1: [12000, 15000, 22000, 18000, 25000, 9000, 7000, 14000, 11000, 19000, 21000, 13000],
      week2: [9000, 11000, 16000, 28000, 13000, 6000, 5000, 17000, 8000, 23000, 30000, 10000],
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      week1: [68000, 72000, 89000, 95000, 115000, 43940],
      week2: [55000, 80000, 76000, 102000, 98000, 61000],
    }
  };

  ngOnInit(): void {
    this.render('weekly');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }

  onPeriodChange(period: string): void {
    this.render(period);
  }

  onChartClick(): void {
    this.router.navigate(['/reporting']);
  }

  private render(period: string): void {
    const data = this.datasets[period];
    this.chart?.destroy();

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.week1,
            backgroundColor: data.week1.map((_, i) =>
              i % 5 === 3 ? '#1a2e6b' : '#adc4e8'
            ),
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.45,
          },
          {
            data: data.week2,
            backgroundColor: data.week2.map((_, i) =>
              i % 5 === 0 ? '#2563eb' : '#d4e4f7'
            ),
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.45,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#8b9ab5', font: { size: 11 } }
          },
          y: { display: false, beginAtZero: true }
        }
      }
    });
  }
}

// ── Dashboard Component ──────────────────────────────────────────────────────
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    TrendChartComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly store = inject(DashboardStore);
  private readonly api = inject(DashboardApiService);
  private readonly orderingStore = inject(OrderingStore);
  private readonly router = inject(Router);

  // From existing DashboardStore
  totalFuel = this.store.totalFuel;
  pendingOrders = this.store.pendingOrders;

  // From OrderingStore — real orders from db.json
  activeOrders = this.orderingStore.activeOrders;
  pendingRequests = this.orderingStore.pendingRequests;

  protected readonly displayedColumns = ['orderId', 'destination', 'volume', 'eta', 'actions'];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    forkJoin({
      inventory: this.api.getInventory(),
      orders: this.api.getOrders()
    }).subscribe(({ inventory, orders }) => {
      const totalFuel = inventory.reduce((sum: number, item: any) => sum + Number(item.pricePerLiter || 0), 0);
      const pending = orders.filter((o: any) => o.status === 'CREATED').length;
      this.store.totalFuel.set(
        // Calculate total liters from all orders
        orders.reduce((sum: number, o: any) => sum + Number(o.quantity || 0), 0)
      );
      this.store.pendingOrders.set(pending);
    });
  }

  formatVolume(quantity: number, unit: string): string {
    return `${quantity.toLocaleString()} ${unit === 'LITERS' ? 'L' : unit}`;
  }

  formatEta(order: Order): string {
    if (order.status === 'DELIVERED' || order.status === 'CLOSED') return 'Completed';
    if (order.dispatchedAt) {
      const date = new Date(order.dispatchedAt);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (order.createdAt) {
      const eta = new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000);
      return eta.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return '—';
  }

  getStatusClass(status: string): string {
    return status?.toLowerCase().replace('_', '-') ?? '';
  }

  goToOrders(): void {
    this.router.navigate(['/ordering/order-list']);
  }

  goToReports(): void {
    this.router.navigate(['/reporting']);
  }

  viewOrder(order: Order): void {
    this.router.navigate(['/ordering/order-detail', order.id]);
  }
}
