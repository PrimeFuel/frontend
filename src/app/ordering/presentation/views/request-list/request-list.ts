import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { IamStore } from '../../../../iam/application/iam.store';
import { NotificationsFacade } from '../../../../shared/application/notifications.facade';
import {
  PlatformApi,
  RequestRow,
  BuyerCompanyRow,
} from '../../../../shared/infrastructure/platform-api';
import { num, fuelLabel, formatDate, money } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './request-list.html',
  styleUrl: './request-list.css',
})
export class RequestList implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);
  private readonly notify = inject(NotificationsFacade);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly num = num;
  readonly money = money;
  readonly fuelLabel = fuelLabel;
  readonly formatDate = formatDate;

  readonly requests = signal<RequestRow[]>([]);
  readonly buyers = signal<BuyerCompanyRow[]>([]);
  readonly loading = signal(true);
  readonly busy = signal<string | null>(null);

  private get providerId(): number {
    return this.iam.currentProviderId() ?? 1;
  }

  readonly pendingRequests = computed(() =>
    this.requests()
      .filter((r) => String(r.providerId) === String(this.providerId))
      .filter((r) => r.status === 'PENDING' || r.status === 'PENDING_APPROVAL'),
  );

  ngOnInit(): void {
    this.api.getBuyerCompanies().subscribe((b) => this.buyers.set(b));
    this.reload();
  }

  private reload(): void {
    this.api.getRequests().subscribe({
      next: (r) => {
        this.requests.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  buyerName(r: RequestRow): string {
    const b = this.buyers().find((x) => x.id === (r.companyId ?? -1));
    return b?.name ?? 'Buyer';
  }

  accept(r: RequestRow): void {
    this.busy.set(r.id);
    this.api
      .acceptFuelRequest(r.id)
      .pipe(finalize(() => this.busy.set(null)))
      .subscribe({
        next: (order) => {
          this.notify.notifyBuyer(
            r.companyId,
            'ORDER_ACCEPTED',
            'Request accepted',
            `Your fuel request for ${this.fuelLabel(r.fuelType ?? '')} was accepted and an order was created.`,
            order.id,
          );
          this.snackBar.open(
            this.translate.instant('messages.request-accepted'),
            this.translate.instant('messages.ok'),
            { duration: 3000 },
          );
          this.reload();
        },
        error: () => {
          this.snackBar.open(
            this.translate.instant('messages.request-failed'),
            this.translate.instant('messages.ok'),
            { duration: 3000 },
          );
        },
      });
  }

  reject(r: RequestRow): void {
    const reason = prompt(this.translate.instant('messages.reject-reason'), '') ?? '';
    this.busy.set(r.id);
    this.api
      .rejectFuelRequest(r.id, reason)
      .pipe(finalize(() => this.busy.set(null)))
      .subscribe({
        next: () => {
          this.notify.notifyBuyer(
            r.companyId,
            'ORDER_REJECTED',
            'Request rejected',
            `Your fuel request for ${this.fuelLabel(r.fuelType ?? '')} was rejected.${reason ? ' Reason: ' + reason : ''}`,
            r.id,
          );
          this.snackBar.open(
            this.translate.instant('messages.request-rejected'),
            this.translate.instant('messages.ok'),
            { duration: 2500 },
          );
          this.reload();
        },
        error: () => {
          this.snackBar.open(
            this.translate.instant('messages.request-failed'),
            this.translate.instant('messages.ok'),
            { duration: 3000 },
          );
        },
      });
  }
}
