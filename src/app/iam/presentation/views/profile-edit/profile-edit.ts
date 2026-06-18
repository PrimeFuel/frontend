import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { IamStore } from '../../../application/iam.store';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.css',
})
export class ProfileEdit {
  private readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);

  readonly loading = this.iamStore.loading;
  readonly error = this.iamStore.error;
  readonly session = this.iamStore.session;

  form = {
    companyName: this.session().companyName,
    ruc: this.session().ruc,
    phone: this.session().phone,
    email: this.session().email,
  };

  save(): void {
    this.iamStore.updateProfile(this.form).subscribe({
      next: () => this.router.navigate([
        this.session().role === 'PROVIDER'
          ? '/reporting/provider-dashboard'
          : '/reporting/buyer-dashboard',
      ]),
    });
  }
}
