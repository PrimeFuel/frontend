import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FulfillmentStore } from '../../../application/fulfillment.store';
import { Driver } from '../../../domain/model/driver.entity';
import { IamStore } from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './driver-list.html',
  styleUrl: './driver-list.css',
})
export class DriverList implements OnInit {
  protected readonly store = inject(FulfillmentStore);
  private readonly iam = inject(IamStore);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly availableOnly = signal(false);

  private get providerId(): string {
    return String(this.iam.currentProviderId() ?? 1);
  }

  readonly filteredDrivers = computed(() => {
    const list = this.store.driverList();
    return this.availableOnly() ? list.filter((d) => d.status === 'AVAILABLE') : list;
  });

  fullName(d: Driver): string {
    return `${d.firstName} ${d.lastName}`;
  }

  ngOnInit(): void {
    this.store.loadDriversByProvider(this.providerId);
  }

  refresh(): void {
    this.store.loadDriversByProvider(this.providerId);
  }

  add(): void {
    this.router.navigate(['/fulfillment/drivers/new']);
  }

  edit(d: Driver): void {
    this.router.navigate(['/fulfillment/drivers', d.id, 'edit']);
  }

  remove(d: Driver): void {
    if (confirm(this.translate.instant('messages.delete-driver', { name: this.fullName(d) }))) {
      this.store.deleteDriver(d.id);
      this.snackBar.open(
        this.translate.instant('messages.driver-removed'),
        this.translate.instant('messages.ok'),
        { duration: 2500 },
      );
    }
  }

  statusClass(status: string): string {
    return (status || '').toLowerCase();
  }
}

