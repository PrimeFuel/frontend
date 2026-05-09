import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ReportingStore } from '../../../application/reporting.store';

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
