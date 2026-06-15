import { Injectable, inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { PlatformApi } from '../infrastructure/platform-api';
import { NotificationStore } from '../../notification/application/notification.store';
import { IamStore } from '../../iam/application/iam.store';

/**
 * Thin application facade for emitting domain notifications against the Spring
 * Boot backend (`POST /api/v1/notifications`). It replaces the local db.json
 * notification creation: every helper is fire-and-forget and swallows errors so
 * a failed notification NEVER blocks or rolls back the primary action (creating a
 * request, accepting an order, paying, dispatching, â€¦).
 *
 * `relatedId`/`targetRoute` let the notification list deep-link to the right view.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsFacade {
  private readonly api = inject(PlatformApi);
  private readonly store = inject(NotificationStore);
  private readonly iam = inject(IamStore);

  /** Notification addressed to a provider company. */
  notifyProvider(
    providerId: number | string | null | undefined,
    type: string,
    title: string,
    message: string,
    relatedId?: string | number | null,
  ): void {
    if (providerId == null) return;
    this.send('PROVIDER', null, Number(providerId), type, title, message, relatedId);
  }

  /** Notification addressed to a buyer company. */
  notifyBuyer(
    buyerCompanyId: number | string | null | undefined,
    type: string,
    title: string,
    message: string,
    relatedId?: string | number | null,
  ): void {
    if (buyerCompanyId == null) return;
    this.send('BUYER', Number(buyerCompanyId), null, type, title, message, relatedId);
  }

  private send(
    recipientType: 'BUYER' | 'PROVIDER',
    companyId: number | null,
    providerId: number | null,
    type: string,
    title: string,
    message: string,
    relatedId?: string | number | null,
  ): void {
    this.api
      .createNotification({
        recipientType,
        companyId,
        providerId,
        type,
        title,
        message,
        relatedId: relatedId != null ? String(relatedId) : null,
        createdAt: new Date().toISOString(),
      })
      .pipe(catchError((err) => {
        console.error('Notification failed', err);
        return of(null);
      }))
      .subscribe((notification) => {
        if (!notification) return;
        if (recipientType === 'BUYER' && this.iam.isBuyer() && companyId != null && companyId === this.iam.currentCompanyId()) {
          this.store.loadForBuyer(companyId);
        }
        if (recipientType === 'PROVIDER' && this.iam.isProvider() && providerId != null && providerId === this.iam.currentProviderId()) {
          this.store.loadForProvider(providerId);
        }
      });
  }
}




