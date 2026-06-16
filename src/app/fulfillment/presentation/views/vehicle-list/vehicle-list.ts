import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FulfillmentStore } from '../../../application/fulfillment.store';
import { Vehicle } from '../../../domain/model/vehicle.entity';
import { IamStore } from '../../../../iam/application/iam.store';
import { num } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.css',
})
export class VehicleList implements OnInit {
  protected readonly store = inject(FulfillmentStore);
  private readonly iam = inject(IamStore);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly num = num;
  readonly availableOnly = signal(false);

  private get providerId(): string {
    return String(this.iam.currentProviderId() ?? 1);
  }

  readonly filteredVehicles = computed(() => {
    const list = this.store.vehicleList();
    return this.availableOnly() ? list.filter((v) => v.status === 'AVAILABLE') : list;
  });

  ngOnInit(): void {
    this.store.loadVehiclesByProvider(this.providerId);
  }

  refresh(): void {
    this.store.loadVehiclesByProvider(this.providerId);
  }

  add(): void {
    this.router.navigate(['/fulfillment/vehicles/new']);
  }

  edit(v: Vehicle): void {
    this.router.navigate(['/fulfillment/vehicles', v.id, 'edit']);
  }

  remove(v: Vehicle): void {
    if (confirm(this.translate.instant('messages.delete-vehicle', { name: v.licensePlate }))) {
      this.store.deleteVehicle(v.id);
      this.snackBar.open(
        this.translate.instant('messages.vehicle-removed'),
        this.translate.instant('messages.ok'),
        { duration: 2500 },
      );
    }
  }

  statusClass(status: string): string {
    return (status || '').toLowerCase();
  }
}

