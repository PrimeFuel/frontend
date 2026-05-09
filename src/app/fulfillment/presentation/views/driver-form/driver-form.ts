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
import { RegisterDriverRequest } from '../../../infrastructure/driver.request';

/**
 * @summary Vista de formulario para conductores.
 * @remarks Permite registrar nuevos conductores autorizados.
 * @author FullTank Platform
 */
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

  // TODO: Reemplazar con providerId real de IAM cuando se implemente
  private readonly TEMP_PROVIDER_ID = '1';

  protected driverForm: FormGroup;
  protected isEditMode = false;

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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      // TODO: Implementar carga de conductor para edición
    }
  }

  protected onSubmit(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    const formValue = this.driverForm.value;
    const request: RegisterDriverRequest = {
      providerId: this.TEMP_PROVIDER_ID,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      licenseNumber: formValue.licenseNumber,
      phoneNumber: formValue.phoneNumber,
      email: formValue.email,
    };

    this.store.registerDriver(request);

    // Navegar después de registro exitoso
    setTimeout(() => {
      if (this.store.successMsg()) {
        this.router.navigate(['/fulfillment/driver-list']);
      }
    }, 1000);
  }

  protected onCancel(): void {
    this.router.navigate(['/fulfillment/driver-list']);
  }

  protected getErrorMessage(field: string): string {
    const control = this.driverForm.get(field);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid phone format';
    }
    return '';
  }
}
