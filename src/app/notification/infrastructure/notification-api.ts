import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Notification } from '../domain/model/notification.entity';
import { NotificationApiEndpoint } from './notification-api-endpoint';

@Injectable({ providedIn: 'root' })
export class NotificationApi extends BaseApi {
  private readonly _notificationEndpoint: NotificationApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this._notificationEndpoint = new NotificationApiEndpoint(http);
  }

  getNotificationsByUser(userId: string): Observable<Notification[]> {
    return this._notificationEndpoint.getNotificationsByUser(userId);
  }

  getBuyerNotifications(buyerCompanyId: number | string): Observable<Notification[]> {
    return this._notificationEndpoint.getByBuyer(buyerCompanyId);
  }

  getProviderNotifications(providerId: number | string): Observable<Notification[]> {
    return this._notificationEndpoint.getByProvider(providerId);
  }

  markAllReadForBuyer(buyerCompanyId: number | string): Observable<unknown> {
    return this._notificationEndpoint.markAllReadBuyer(buyerCompanyId);
  }

  markAllReadForProvider(providerId: number | string): Observable<unknown> {
    return this._notificationEndpoint.markAllReadProvider(providerId);
  }

  getUnreadNotificationsByUser(userId: string): Observable<Notification[]> {
    return this._notificationEndpoint.getUnreadNotificationsByUser(userId);
  }

  getNotificationsByOrder(orderId: string): Observable<Notification[]> {
    return this._notificationEndpoint.getNotificationsByOrder(orderId);
  }

  getNotificationById(notificationId: string): Observable<Notification> {
    return this._notificationEndpoint.getById(notificationId);
  }

  createNotification(
    request: Pick<Notification, 'userId' | 'orderId' | 'type' | 'message'>,
  ): Observable<Notification> {
    return this._notificationEndpoint.createNotification(request);
  }

  markAsRead(notificationId: string): Observable<Notification> {
    return this._notificationEndpoint.updateReadState(notificationId, { isRead: true });
  }

  markAsUnread(notificationId: string): Observable<Notification> {
    return this._notificationEndpoint.updateReadState(notificationId, { isRead: false });
  }

  markAllAsReadForUser(userId: string): Observable<Notification[]> {
    return this._notificationEndpoint.getUnreadNotificationsByUser(userId).pipe(
      switchMap((unread) => {
        if (unread.length === 0) {
          return forkJoin([] as Observable<Notification>[]).pipe(map(() => [] as Notification[]));
        }
        const updates = unread.map((n) =>
          this._notificationEndpoint.updateReadState(n.id, { isRead: true }),
        );
        return forkJoin(updates);
      }),
    );
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this._notificationEndpoint.delete(notificationId);
  }
}
