import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EquipmentStore } from '../../../application/equipment.store';
import { Equipment, EQUIPMENT_TYPES, EQUIPMENT_STATUSES } from '../../../domain/model/equipment.entity';
import { IamStore } from '../../../../iam/application/iam.store';
import { PlatformApi, ProviderRow } from '../../../../shared/infrastructure/platform-api';
import { FUEL_TYPE_OPTIONS, fuelLabel } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './equipment-form.html',
  styleUrl: './equipment-form.css',
})
export class EquipmentForm implements OnInit {
  private readonly store = inject(EquipmentStore);
  private readonly iam = inject(IamStore);
  private readonly api = inject(PlatformApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly fuelTypes = FUEL_TYPE_OPTIONS;
  readonly equipmentTypes = EQUIPMENT_TYPES;
  readonly equipmentStatuses = EQUIPMENT_STATUSES;
  readonly fuelLabel = fuelLabel;
  readonly providers = signal<ProviderRow[]>([]);

  isEditMode = false;
  equipmentId: string | null = null;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['GENERATOR', Validators.required],
    requiredFuelType: ['DIESEL', Validators.required],
    capacity: [1000, [Validators.required, Validators.min(1)]],
    currentLevel: [0, [Validators.required, Validators.min(0)]],
    unit: ['LITERS', Validators.required],
    status: ['operational', Validators.required],
    location: ['', Validators.required],
    refillThreshold: [20, [Validators.required, Validators.min(5), Validators.max(50)]],
    autoRefill: [false],
    favoriteProviderId: [null as number | null],
  });

  ngOnInit(): void {
    this.api.getProviders().subscribe((p) => this.providers.set(p));
    this.equipmentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.equipmentId;
    if (this.isEditMode && this.equipmentId) {
      const existing = this.store.getById(this.equipmentId);
      if (existing) {
        this.patchForm(existing);
      } else {
        this.store.loadAll();
        setTimeout(() => {
          const found = this.store.getById(this.equipmentId!);
          if (found) this.patchForm(found);
        }, 800);
      }
    }
  }

  private patchForm(e: Equipment): void {
    this.form.patchValue({
      name: e.name,
      type: e.type,
      requiredFuelType: e.requiredFuelType,
      capacity: e.capacity,
      currentLevel: e.currentLevel,
      unit: e.unit,
      status: e.status,
      location: e.location,
      refillThreshold: e.refillThreshold,
      autoRefill: e.autoRefill,
      favoriteProviderId: e.favoriteProviderId,
    });
  }

  get capacityError(): boolean {
    const v = this.form.value;
    return Number(v.currentLevel) > Number(v.capacity);
  }

  submit(): void {
    if (this.form.invalid || this.capacityError) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const existing = this.equipmentId ? this.store.getById(this.equipmentId) : undefined;
    const fav = v.favoriteProviderId ? Number(v.favoriteProviderId) : null;

    const equipment = new Equipment({
      id: this.equipmentId ?? `eq-${Date.now()}`,
      companyId: existing?.companyId ?? this.iam.currentCompanyId() ?? 1,
      name: v.name,
      type: v.type,
      requiredFuelType: v.requiredFuelType,
      capacity: Number(v.capacity),
      currentLevel: Math.min(Number(v.currentLevel), Number(v.capacity)),
      unit: v.unit,
      status: v.status,
      // New equipment starts with no favorite provider; edit can set/keep one.
      favoriteProviderId: this.isEditMode ? fav : fav,
      autoRefill: v.autoRefill,
      refillThreshold: v.refillThreshold,
      location: v.location,
      lastRefillDate: existing?.lastRefillDate ?? null,
    });

    if (this.isEditMode) {
      this.store.update(equipment);
      this.snackBar.open(
        this.translate.instant('messages.equipment-updated'),
        this.translate.instant('messages.ok'),
        { duration: 3000 },
      );
    } else {
      this.store.create(equipment);
      this.snackBar.open(
        this.translate.instant('messages.equipment-created'),
        this.translate.instant('messages.ok'),
        { duration: 3000 },
      );
    }
    this.router.navigate(['/equipment']);
  }

  cancel(): void {
    this.router.navigate(['/equipment']);
  }
}
