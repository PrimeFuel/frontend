import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { IamStore } from '../../../application/iam.store';
import { UserRole } from '../../../domain/model/session.entity';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './role-selection.html',
  styleUrl: './role-selection.css',
})
export class RoleSelection {
  private readonly iamStore = inject(IamStore);
  private readonly router = inject(Router);

  readonly mode = signal<AuthMode>('login');
  readonly selectedRole = signal<UserRole>('BUYER');
  readonly loading = this.iamStore.loading;
  readonly error = this.iamStore.error;

  form = {
    companyName: '',
    ruc: '',
    phone: '',
    email: '',
    password: '',
    description: '',
    address: '',
  };

  isProvider(): boolean {
    return this.selectedRole() === 'PROVIDER';
  }

  canSubmit(): boolean {
    const hasAccess = !!this.form.email && !!this.form.password;
    if (this.mode() === 'login') return hasAccess;
    const hasCompany = !!this.form.companyName && !!this.form.ruc && !!this.form.phone;
    if (this.isProvider()) {
      return hasAccess && hasCompany && !!this.form.description && !!this.form.address;
    }
    return hasAccess && hasCompany;
  }

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
  }

  pickRole(role: UserRole): void {
    this.selectedRole.set(role);
  }

  submit(): void {
    if (!this.canSubmit() || this.loading()) return;
    const request =
      this.mode() === 'login'
        ? this.iamStore.login(this.form.email, this.form.password)
        : this.iamStore.register({ ...this.form, role: this.selectedRole() });

    request.subscribe({
      next: (session) => {
        const target = session.role === 'PROVIDER'
          ? '/reporting/provider-dashboard'
          : '/reporting/buyer-dashboard';
        this.router.navigate([target]);
      },
    });
  }
}
