import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam.store';
import {
  PlatformApi,
  RequestRow,
  ProviderRow,
} from '../../../../shared/infrastructure/platform-api';
import { num, fuelLabel, formatDate } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css',
})
export class MyRequests implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);
  private readonly router = inject(Router);

  readonly num = num;
  readonly fuelLabel = fuelLabel;
  readonly formatDate = formatDate;

  readonly requests = signal<RequestRow[]>([]);
  readonly providers = signal<ProviderRow[]>([]);
  readonly loading = signal(true);

  private get companyId(): number {
    return this.iam.currentCompanyId() ?? 1;
  }

  readonly myRequests = computed(() =>
    [...this.requests()]
      .filter((r) => (r.companyId ?? 1) === this.companyId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  );

  ngOnInit(): void {
    this.api.getProviders().subscribe((p) => this.providers.set(p));
    this.api.getRequests().subscribe({
      next: (r) => {
        this.requests.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  providerName(id: string | number): string {
    return this.providers().find((p) => String(p.id) === String(id))?.name ?? 'â€”';
  }

  statusClass(s: string): string {
    return (s || '').toLowerCase();
  }

  newRequest(): void {
    this.router.navigate(['/catalog']);
  }
}
