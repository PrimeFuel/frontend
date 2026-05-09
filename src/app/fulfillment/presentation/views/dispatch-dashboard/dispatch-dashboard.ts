import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FulfillmentStore } from '../../../application/fulfillment.store';

/**
 * @summary Vista de dashboard de despacho.
 * @remarks Muestra resumen de recursos disponibles y entregas activas.
 * @author FullTank Platform
 */
@Component({
  selector: 'app-dispatch-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterModule,
    TranslatePipe,
  ],
  templateUrl: './dispatch-dashboard.html',
  styleUrl: './dispatch-dashboard.css',
})
export class DispatchDashboard implements OnInit {
  protected readonly store = inject(FulfillmentStore);

  // TODO: Reemplazar con providerId real de IAM cuando se implemente
  private readonly TEMP_PROVIDER_ID = '1';

  protected readonly displayedColumns: string[] = [
    'orderId',
    'vehicleId',
    'driverId',
    'status',
    'scheduledDate',
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  protected loadDashboardData(): void {
    this.store.loadVehiclesByProvider(this.TEMP_PROVIDER_ID);
    this.store.loadDriversByProvider(this.TEMP_PROVIDER_ID);
    this.store.loadDeliveriesByProvider(this.TEMP_PROVIDER_ID);
  }

  protected onRefresh(): void {
    this.loadDashboardData();
  }

  protected getStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }
}
