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
import { IamStore } from '../../../../iam/application/iam.store';

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
  private readonly iam = inject(IamStore);

  private get providerId(): string {
    return String(this.iam.currentProviderId() ?? 1);
  }

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
    this.store.loadVehiclesByProvider(this.providerId);
    this.store.loadDriversByProvider(this.providerId);
    this.store.loadDeliveriesByProvider(this.providerId);
  }

  protected onRefresh(): void {
    this.loadDashboardData();
  }

  protected getStatusClass(status: string): string {
    return status.toLowerCase().replace(/_/g, '-');
  }

  protected getVehiclePlate(vehicleId: string): string {
    const vehicle = this.store.vehicleList().find(v => v.id === vehicleId);
    return vehicle ? vehicle.licensePlate : vehicleId;
  }

  protected getDriverName(driverId: string): string {
    const driver = this.store.driverList().find(d => d.id === driverId);
    return driver ? `${driver.firstName} ${driver.lastName}` : driverId;
  }
}
