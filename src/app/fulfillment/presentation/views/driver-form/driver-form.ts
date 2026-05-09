import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { FulfillmentStore } from '../../../application/fulfillment.store';
import { RegisterDriverRequest, UpdateDriverRequest } from '../../../infrastructure/driver.request';

@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './driver-form.html',
  styleUrl: './driver-form.css',
})
export class DriverForm implements OnInit {
  protected readonly store = inject(FulfillmentStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly TEMP_PROVIDER_ID = '1';

  protected driverForm: FormGroup;
  protected isEditMode = false;
  protected driverId: string | null = null;

  constructor() {
    this.driverForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      licenseNumber: ['', [Validators.required, Validators.minLength(8)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.driverId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.driverId;

    if (this.isEditMode && this.driverId) {
      this.store.loadDriverById(this.driverId);
      setTimeout(() => {
        const driver = this.store.selectedDriver();
        if (driver) {
          this.driverForm.patchValue({
            firstName: driver.firstName,
            lastName: driver.lastName,
            licenseNumber: driver.licenseNumber,
            phoneNumber: driver.phoneNumber,
            email: driver.email,
          });
        }
      }, 500);
    }
  }

  protected onSubmit(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode && this.driverId) {
      this.updateDriverData();
    } else {
      this.registerDriverData();
    }
  }

  private registerDriverData(): void {
    const request: RegisterDriverRequest = {
      providerId: this.TEMP_PROVIDER_ID,
      firstName: this.driverForm.value.firstName,
      lastName: this.driverForm.value.lastName,
      licenseNumber: this.driverForm.value.licenseNumber,
      phoneNumber: this.driverForm.value.phoneNumber,
      email: this.driverForm.value.email,
      status: 'AVAILABLE',
    };
    this.store.registerDriver(request, () => {
      this.router.navigate(['/fulfillment/driver-list']);
    });
  }

  private updateDriverData(): void {
    const request: UpdateDriverRequest = {
      firstName: this.driverForm.value.firstName,
      lastName: this.driverForm.value.lastName,
      licenseNumber: this.driverForm.value.licenseNumber,
      phoneNumber: this.driverForm.value.phoneNumber,
      email: this.driverForm.value.email,
    };
    this.store.updateDriver(this.driverId!, request, () => {
      this.router.navigate(['/fulfillment/driver-list']);
    });
  }

  protected onCancel(): void {
    this.router.navigate(['/fulfillment/driver-list']);
  }

  protected getErrorMessage(field: string): string {
    const control = this.driverForm.get(field);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('minlength'))
      return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    if (control?.hasError('email')) return 'Invalid email format';
    if (control?.hasError('pattern')) return 'Invalid phone format';
    return '';
  }
}
