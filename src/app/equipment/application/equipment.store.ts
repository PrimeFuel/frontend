import { Injectable, signal, computed, inject } from '@angular/core';
import { retry } from 'rxjs';
import { EquipmentApi } from '../infrastructure/equipment-api';
import { Equipment } from '../domain/model/equipment.entity';
import { IamStore } from '../../iam/application/iam.store';

@Injectable({ providedIn: 'root' })
export class EquipmentStore {
  private readonly api = inject(EquipmentApi);
  private readonly iam = inject(IamStore);

  private readonly _equipmentList = signal<Equipment[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string>('');

  readonly equipmentList = this._equipmentList.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly lowFuelEquipment = computed(() =>
    this._equipmentList().filter((e) => e.isLowFuel),
  );

  readonly operationalEquipment = computed(() =>
    this._equipmentList().filter((e) => e.status === 'operational'),
  );

  readonly autoRefillCount = computed(() =>
    this._equipmentList().filter((e) => e.autoRefill).length,
  );

  readonly avgFuelLevel = computed(() => {
    const list = this._equipmentList();
    if (!list.length) return 0;
    return Math.round(list.reduce((s, e) => s + e.fillPercentage, 0) / list.length);
  });

  loadAll(): void {
    this._isLoading.set(true);
    this._error.set('');
    const companyId = this.iam.currentCompanyId() ?? 1;
    this.api.getByCompanyId(companyId).pipe(retry(2)).subscribe({
      next: (list) => {
        this._equipmentList.set(list);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load equipment');
        this._isLoading.set(false);
      },
    });
  }

  getById(id: string): Equipment | undefined {
    return this._equipmentList().find((e) => e.id === id);
  }

  create(equipment: Equipment): void {
    this._isLoading.set(true);
    this.api.create(equipment).pipe(retry(2)).subscribe({
      next: (created) => {
        this._equipmentList.update((list) => [...list, created]);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to create equipment');
        this._isLoading.set(false);
      },
    });
  }

  update(equipment: Equipment): void {
    this._isLoading.set(true);
    this.api.update(equipment).pipe(retry(2)).subscribe({
      next: (updated) => {
        this._equipmentList.update((list) =>
          list.map((e) => (e.id === updated.id ? updated : e)),
        );
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to update equipment');
        this._isLoading.set(false);
      },
    });
  }

  delete(id: string): void {
    this._isLoading.set(true);
    this.api.delete(id).pipe(retry(2)).subscribe({
      next: () => {
        this._equipmentList.update((list) => list.filter((e) => e.id !== id));
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to delete equipment');
        this._isLoading.set(false);
      },
    });
  }

  updateLevel(id: string, newLevel: number): void {
    this.api.patch(id, { currentLevel: newLevel }).pipe(retry(2)).subscribe({
      next: (updated) => {
        this._equipmentList.update((list) =>
          list.map((e) => (e.id === updated.id ? updated : e)),
        );
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to update equipment level');
      },
    });
  }
}
