import { Injectable, signal, computed, inject } from '@angular/core';
import { retry } from 'rxjs';
import { NotificationApi } from '../infrastructure/notification-api';
import { Notification } from '../domain/model/notification.entity';

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly api = inject(NotificationApi);

  private readonly _notificationList = signal<Notification[]>([]);
  private readonly _selectedNotification = signal<Notification | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string>('');
  private readonly _successMsg = signal<string>('');

  public readonly notificationList = this._notificationList.asReadonly();
  public readonly selectedNotification = this._selectedNotification.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly successMsg = this._successMsg.asReadonly();

  public readonly unreadNotifications = computed(() =>
    this._notificationList().filter((n) => !n.isRead),
  );
  public readonly readNotifications = computed(() =>
    this._notificationList().filter((n) => n.isRead),
  );
  public readonly unreadCount = computed(() => this.unreadNotifications().length);
  public readonly orderNotifications = computed(() =>
    this._notificationList().filter((n) => n.isOrderEvent()),
  );
  public readonly paymentNotifications = computed(() =>
    this._notificationList().filter((n) => n.isPaymentEvent()),
  );
  public readonly deliveryNotifications = computed(() =>
    this._notificationList().filter((n) => n.isDeliveryEvent()),
  );

  loadNotificationsByUser(userId: string): void {
    this._isLoading.set(true);
    this._error.set('');
    this.api.getNotificationsByUser(userId).pipe(retry(2)).subscribe({
      next: (notifications) => {
        setTimeout(() => {
          this._notificationList.set(notifications);
          this._isLoading.set(false);
        }, 100);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load notifications');
        this._isLoading.set(false);
      },
    });
  }

  loadUnreadNotificationsByUser(userId: string): void {
    this._isLoading.set(true);
    this._error.set('');
    this.api.getUnreadNotificationsByUser(userId).pipe(retry(2)).subscribe({
      next: (notifications) => {
        setTimeout(() => {
          this._notificationList.set(notifications);
          this._isLoading.set(false);
        }, 100);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load unread notifications');
        this._isLoading.set(false);
      },
    });
  }

  loadNotificationsByOrder(orderId: string): void {
    this._isLoading.set(true);
    this._error.set('');
    this.api.getNotificationsByOrder(orderId).pipe(retry(2)).subscribe({
      next: (notifications) => {
        this._notificationList.set(notifications);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load notifications for order');
        this._isLoading.set(false);
      },
    });
  }

  loadNotificationById(notificationId: string): void {
    this._isLoading.set(true);
    this._error.set('');
    this.api.getNotificationById(notificationId).pipe(retry(2)).subscribe({
      next: (notification) => {
        this._selectedNotification.set(notification);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load notification');
        this._isLoading.set(false);
      },
    });
  }

  createNotification(
    request: Pick<Notification, 'userId' | 'orderId' | 'type' | 'message'>,
    onSuccess?: () => void,
  ): void {
    this._isLoading.set(true);
    this._error.set('');
    this._successMsg.set('');
    this.api.createNotification(request).pipe(retry(2)).subscribe({
      next: (notification) => {
        this._notificationList.update((list) => [notification, ...list]);
        this._successMsg.set('Notification created successfully');
        this._isLoading.set(false);
        onSuccess?.();
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to create notification');
        this._isLoading.set(false);
      },
    });
  }

  markAsRead(notificationId: string): void {
    this._isLoading.set(true);
    this._error.set('');
    this.api.markAsRead(notificationId).pipe(retry(2)).subscribe({
      next: (updated) => {
        this._notificationList.update((list) =>
          list.map((n) => { if (n.id === notificationId) { n.markAsRead(); } return n; }),
        );
        this._selectedNotification.set(updated);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to mark notification as read');
        this._isLoading.set(false);
      },
    });
  }

  markAsUnread(notificationId: string): void {
    this._isLoading.set(true);
    this._error.set('');
    this.api.markAsUnread(notificationId).pipe(retry(2)).subscribe({
      next: (updated) => {
        this._notificationList.update((list) =>
          list.map((n) => { if (n.id === notificationId) { n.markAsUnread(); } return n; }),
        );
        this._selectedNotification.set(updated);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to mark notification as unread');
        this._isLoading.set(false);
      },
    });
  }

  markAllAsRead(userId: string): void {
    this._isLoading.set(true);
    this._error.set('');
    this._successMsg.set('');
    this.api.markAllAsReadForUser(userId).pipe(retry(2)).subscribe({
      next: () => {
        this._notificationList.update((list) =>
          list.map((n) => { n.markAsRead(); return n; }),
        );
        this._successMsg.set('All notifications marked as read');
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to mark all notifications as read');
        this._isLoading.set(false);
      },
    });
  }

  deleteNotification(notificationId: string): void {
    this._isLoading.set(true);
    this._error.set('');
    this.api.deleteNotification(notificationId).pipe(retry(2)).subscribe({
      next: () => {
        this._notificationList.update((list) => list.filter((n) => n.id !== notificationId));
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to delete notification');
        this._isLoading.set(false);
      },
    });
  }

  clearMessages(): void {
    this._error.set('');
    this._successMsg.set('');
  }
}
