import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FulfillmentStore } from '../../../application/fulfillment.store';

/**
 * @summary Vista de lista de vehículos.
 * @remarks Muestra vehículos de la flota del proveedor con filtros por estado.
 * @author FullTank Platform
 */
@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    RouterModule,
    TranslatePipe,
  ],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.css',
})
export class VehicleList implements OnInit {
  protected readonly store = inject(FulfillmentStore);

  // TODO: Reemplazar con providerId real de IAM cuando se implemente
  private readonly TEMP_PROVIDER_ID = '1';

  protected readonly displayedColumns: string[] = [
    'licensePlate',
    'brand',
    'model',
    'capacity',
    'status',
    'actions',
  ];

  ngOnInit(): void {
    this.store.loadVehiclesByProvider(this.TEMP_PROVIDER_ID);
  }

  protected onRefresh(): void {
    this.store.loadVehiclesByProvider(this.TEMP_PROVIDER_ID);
  }

  protected onShowAvailable(): void {
    this.store.loadAvailableVehicles(this.TEMP_PROVIDER_ID);
  }

  protected onShowAll(): void {
    this.store.loadVehiclesByProvider(this.TEMP_PROVIDER_ID);
  }

  protected onDelete(vehicleId: string): void {
    this.store.deleteVehicle(vehicleId);
  }

  protected getStatusClass(status: string): string {
    return status.toLowerCase().replace(/_/g, '-');
  }
}
