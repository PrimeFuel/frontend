import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { FulfillmentStore } from '../../../application/fulfillment.store';
import { Driver } from '../../../domain/model/driver.entity';
import { IamStore } from '../../../../iam/application/iam.store';
@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslatePipe],
  templateUrl: './driver-form.html',
  styleUrl: './driver-form.css',
})
export class DriverForm implements OnInit {
  protected readonly store = inject(FulfillmentStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly iam = inject(IamStore);

  private get providerId(): string {
    return String(this.iam.currentProviderId() ?? 1);
  }

  protected driverForm: FormGroup;
  protected isEditMode = false;
  protected driverId: string | null = null;
  protected readonly statuses = ['AVAILABLE', 'ASSIGNED'];

  constructor() {
    this.driverForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      licenseNumber: ['', [Validators.required, Validators.minLength(8)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      status: ['AVAILABLE', Validators.required],
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
            status: driver.status,
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
    const request: Omit<Driver, 'id' | 'createdAt'> = {
      providerId: this.providerId,
      firstName: this.driverForm.value.firstName,
      lastName: this.driverForm.value.lastName,
      licenseNumber: this.driverForm.value.licenseNumber,
      phoneNumber: this.driverForm.value.phoneNumber,
      email: this.driverForm.value.email,
      status: this.driverForm.value.status || 'AVAILABLE',
    };
    this.store.registerDriver(request, () => {
      this.router.navigate(['/fulfillment/drivers']);
    });
  }

  private updateDriverData(): void {
    const request: Partial<Omit<Driver, 'id' | 'providerId' | 'createdAt'>> = {
      firstName: this.driverForm.value.firstName,
      lastName: this.driverForm.value.lastName,
      licenseNumber: this.driverForm.value.licenseNumber,
      phoneNumber: this.driverForm.value.phoneNumber,
      email: this.driverForm.value.email,
      status: this.driverForm.value.status,
    };
    this.store.updateDriver(this.driverId!, request, () => {
      this.router.navigate(['/fulfillment/drivers']);
    });
  }

  protected onCancel(): void {
    this.router.navigate(['/fulfillment/drivers']);
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

