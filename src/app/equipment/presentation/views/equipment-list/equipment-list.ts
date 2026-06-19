import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EquipmentStore } from '../../../application/equipment.store';
import { Equipment } from '../../../domain/model/equipment.entity';
import { PlatformApi, ProviderRow, EquipmentRow } from '../../../../shared/infrastructure/platform-api';
import { OperationsFacade } from '../../../../shared/application/operations.facade';
import { fuelLabel, num } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './equipment-list.html',
  styleUrl: './equipment-list.css',
})
export class EquipmentList implements OnInit {
  protected readonly store = inject(EquipmentStore);
  private readonly api = inject(PlatformApi);
  private readonly facade = inject(OperationsFacade);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly refilling = signal<string | null>(null);

  readonly fuelLabel = fuelLabel;
  readonly num = num;
  private readonly providers = signal<ProviderRow[]>([]);

  ngOnInit(): void {
    this.store.loadAll();
    this.api.getProviders().subscribe((p) => this.providers.set(p));
  }

  providerName(id: number | null): string {
    if (!id) return this.translate.instant('equipment.not-set');
    return this.providers().find((p) => p.id === id)?.name ?? this.translate.instant('equipment.not-set');
  }

  /** Auto-creates a refill request from the favorite provider, or guides to Catalog. */
  requestRefill(e: Equipment): void {
    if (this.refilling()) return;
    const row: EquipmentRow = {
      id: e.id,
      companyId: e.companyId,
      name: e.name,
      type: e.type,
      requiredFuelType: e.requiredFuelType,
      capacity: e.capacity,
      currentLevel: e.currentLevel,
      unit: e.unit,
      status: e.status,
      favoriteProviderId: e.favoriteProviderId,
      autoRefill: e.autoRefill,
      refillThreshold: e.refillThreshold,
      location: e.location,
      lastRefillDate: e.lastRefillDate,
    };
    this.refilling.set(e.id);
    this.facade.requestRefill(row).subscribe((result) => {
      this.refilling.set(null);
      if (result.ok) {
        this.snackBar
          .open(
            this.translate.instant('messages.refill-created'),
            this.translate.instant('messages.view-requests'),
            { duration: 5000 },
          )
          .onAction()
          .subscribe(() => this.router.navigate(['/ordering/my-requests']));
      } else {
        const msgKey =
          result.reason === 'no-favorite'
            ? 'messages.no-favorite'
            : result.reason === 'full'
              ? 'messages.equipment-full'
              : result.reason === 'no-stock'
                ? 'messages.no-stock'
                : 'messages.refill-failed';
        this.snackBar
          .open(
            this.translate.instant(msgKey),
            this.translate.instant('common.actions.go-to-catalog'),
            { duration: 6000 },
          )
          .onAction()
          .subscribe(() =>
            this.router.navigate(['/catalog'], {
              queryParams: { equipmentId: e.id, fuelType: e.requiredFuelType },
            }),
          );
      }
    });
  }

  addEquipment(): void {
    this.router.navigate(['/equipment/new']);
  }

  editEquipment(e: Equipment): void {
    this.router.navigate(['/equipment', e.id, 'edit']);
  }

  deleteEquipment(e: Equipment): void {
    if (confirm(this.translate.instant('messages.delete-equipment', { name: e.name }))) {
      this.store.delete(e.id);
      this.snackBar.open(
        this.translate.instant('messages.equipment-removed'),
        this.translate.instant('messages.ok'),
        { duration: 2500 },
      );
    }
  }

  levelClass(e: Equipment): string {
    const pct = e.fillPercentage;
    if (pct > 50) return 'green';
    if (pct > e.refillThreshold) return 'amber';
    return 'red';
  }

  statusClass(status: string): string {
    return (status || '').toLowerCase();
  }
}


