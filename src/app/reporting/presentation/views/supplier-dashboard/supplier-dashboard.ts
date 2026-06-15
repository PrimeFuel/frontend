import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../../../environments/environment';
import { ReportingStore } from '../../../application/reporting.store';

Chart.register(...registerables);

// ── Datos de fallback por si el endpoint falla ───────────────────────────
const FALLBACK_DATA = [
  { month: 'January',  monthIndex: 1, revenue: 680000  },
  { month: 'February', monthIndex: 2, revenue: 720000  },
  { month: 'March',    monthIndex: 3, revenue: 890000  },
  { month: 'April',    monthIndex: 4, revenue: 950000  },
  { month: 'May',      monthIndex: 5, revenue: 1150000 },
  { month: 'June',     monthIndex: 6, revenue: 439400  },
];

// ── Sales Bar Chart (componente inline) ──────────────────────────────────
@Component({
  selector: 'app-sales-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #chartCanvas style="max-height: 180px;"></canvas>`,
})
export class SalesBarChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private destroy$ = new Subject<void>();
  private http = inject(HttpClient);

  ngOnInit(): void {
    this.http
      .get<any[]>(`${environment.serverBasePath}${environment.reportingMonthlyRevenueEndpointPath}?providerId=1`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.render(data.sort((a, b) => a.monthIndex - b.monthIndex)),
        error: () => this.render(FALLBACK_DATA),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }

  private render(data: any[]): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.month.substring(0, 3).toUpperCase()),
        datasets: [
          {
            data: data.map((d) => d.revenue),
            backgroundColor: data.map((_, i) =>
              i === data.length - 1
                ? '#1e3a5f'
                : i === data.length - 2
                  ? '#2e6bc4'
                  : '#adc8e8',
            ),
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#95a5a6', font: { size: 11 } },
          },
          y: { display: false, beginAtZero: true },
        },
      },
    });
  }
}

// ── Supplier Dashboard ───────────────────────────────────────────────────

/**
 * @summary Vista de dashboard de reportes para proveedores.
 * @remarks Muestra Total Sales Revenue, Avg Fulfillment Rate, Avg Lead Time
 * y tabla de Client Sales Performance. Pantalla principal de reportes.
 * @author FullTank Platform
 */
@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    RouterModule,
    TranslatePipe,
    SalesBarChartComponent,
  ],
  templateUrl: './supplier-dashboard.html',
  styleUrl: './supplier-dashboard.css',
})
export class SupplierDashboard implements OnInit {
  protected readonly store = inject(ReportingStore);

  // TODO: Reemplazar con providerId real de IAM cuando se implemente
  private readonly TEMP_PROVIDER_ID = '1';
  private readonly CURRENT_PERIOD = 'Q3_2024';

  protected readonly displayedColumns: string[] = [
    'companyName',
    'totalVolume',
    'status',
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  protected loadDashboardData(): void {
    this.store.loadSalesMetrics(this.TEMP_PROVIDER_ID, this.CURRENT_PERIOD);
    this.store.loadFulfillmentMetrics(this.TEMP_PROVIDER_ID, this.CURRENT_PERIOD);
    this.store.loadClientPortfolio(this.TEMP_PROVIDER_ID);
  }

  protected onRefresh(): void {
    this.loadDashboardData();
  }

  protected onViewAllClients(): void {
    // Navegación manejada por routerLink en template
  }

  protected getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
