import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { FulfillmentStore } from '../../../application/fulfillment.store';
import { Vehicle } from '../../../domain/model/vehicle.entity';
@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './vehicle-form.html',
  styleUrl: './vehicle-form.css',
})
export class VehicleForm implements OnInit {
  protected readonly store = inject(FulfillmentStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly TEMP_PROVIDER_ID = '1';

  protected vehicleForm: FormGroup;
  protected isEditMode = false;
  protected vehicleId: string | null = null;

  protected readonly units = [
    { value: 'LITERS', label: 'unit.liters' },
    { value: 'GALLONS', label: 'unit.gallons' },
  ];

  constructor() {
    this.vehicleForm = this.fb.group({
      licensePlate: ['', [Validators.required, Validators.minLength(6)]],
      brand: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      capacity: [0, [Validators.required, Validators.min(1)]],
      unit: ['LITERS', Validators.required],
      status: ['AVAILABLE', Validators.required],
    });
  }

  ngOnInit(): void {
    this.vehicleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.vehicleId;

    if (this.isEditMode && this.vehicleId) {
      this.store.loadVehicleById(this.vehicleId);
      setTimeout(() => {
        const vehicle = this.store.selectedVehicle();
        if (vehicle) {
          this.vehicleForm.patchValue({
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
            capacity: vehicle.capacity,
            unit: vehicle.unit,
            status: vehicle.status,
          });
        }
      }, 500);
    }
  }

  protected onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode && this.vehicleId) {
      this.updateVehicleData();
    } else {
      this.registerVehicleData();
    }
  }

  private registerVehicleData(): void {
    const request: Omit<Vehicle, 'id' | 'createdAt'> = {
      providerId: this.TEMP_PROVIDER_ID,
      licensePlate: this.vehicleForm.value.licensePlate,
      brand: this.vehicleForm.value.brand,
      model: this.vehicleForm.value.model,
      capacity: this.vehicleForm.value.capacity,
      unit: this.vehicleForm.value.unit,
      status: 'AVAILABLE',
    };
    this.store.registerVehicle(request, () => {
      this.router.navigate(['/fulfillment/vehicle-list']);
    });
  }

  private updateVehicleData(): void {
    const request: Partial<Omit<Vehicle, 'id' | 'providerId' | 'createdAt'>> = {
      licensePlate: this.vehicleForm.value.licensePlate,
      brand: this.vehicleForm.value.brand,
      model: this.vehicleForm.value.model,
      capacity: this.vehicleForm.value.capacity,
      unit: this.vehicleForm.value.unit,
      status: this.vehicleForm.value.status,
    };
    this.store.updateVehicle(this.vehicleId!, request, () => {
      this.router.navigate(['/fulfillment/vehicle-list']);
    });
  }

  protected onCancel(): void {
    this.router.navigate(['/fulfillment/vehicle-list']);
  }

  protected getErrorMessage(field: string): string {
    const control = this.vehicleForm.get(field);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('minlength'))
      return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    if (control?.hasError('min')) return 'Value must be greater than 0';
    return '';
  }
}
