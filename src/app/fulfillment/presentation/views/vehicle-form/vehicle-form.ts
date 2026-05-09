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
import { RegisterVehicleRequest } from '../../../infrastructure/vehicle.request';

/**
 * @summary Vista de formulario para vehículos.
 * @remarks Permite registrar nuevos vehículos de la flota.
 * @author FullTank Platform
 */
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

  // TODO: Reemplazar con providerId real de IAM cuando se implemente
  private readonly TEMP_PROVIDER_ID = '1';

  protected vehicleForm: FormGroup;
  protected isEditMode = false;

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
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      // TODO: Implementar carga de vehículo para edición
    }
  }

  protected onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const formValue = this.vehicleForm.value;
    const request: RegisterVehicleRequest = {
      providerId: this.TEMP_PROVIDER_ID,
      licensePlate: formValue.licensePlate,
      brand: formValue.brand,
      model: formValue.model,
      capacity: formValue.capacity,
      unit: formValue.unit,
    };

    this.store.registerVehicle(request);

    // Navegar después de registro exitoso
    setTimeout(() => {
      if (this.store.successMsg()) {
        this.router.navigate(['/fulfillment/vehicle-list']);
      }
    }, 1000);
  }

  protected onCancel(): void {
    this.router.navigate(['/fulfillment/vehicle-list']);
  }

  protected getErrorMessage(field: string): string {
    const control = this.vehicleForm.get(field);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    }
    if (control?.hasError('min')) {
      return 'Value must be greater than 0';
    }
    return '';
  }
}
