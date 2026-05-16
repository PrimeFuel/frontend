import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationStore } from '../../../application/notification.store';
import { Notification } from '../../../domain/model/notification.entity';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatCardModule,
    MatDividerModule,
    RouterModule,
    TranslatePipe,
  ],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.css',
})
export class NotificationList implements OnInit {
  protected readonly store = inject(NotificationStore);

  // TODO: Reemplazar con userId real de IAM cuando se implemente
  private readonly TEMP_USER_ID = 'u1';

  protected filterMode: 'all' | 'unread' = 'all';

  ngOnInit(): void {
    this.store.loadNotificationsByUser(this.TEMP_USER_ID);
  }

  protected onShowAll(): void {
    this.filterMode = 'all';
    this.store.loadNotificationsByUser(this.TEMP_USER_ID);
  }

  protected onShowUnread(): void {
    this.filterMode = 'unread';
    this.store.loadUnreadNotificationsByUser(this.TEMP_USER_ID);
  }

  protected onRefresh(): void {
    if (this.filterMode === 'unread') {
      this.store.loadUnreadNotificationsByUser(this.TEMP_USER_ID);
    } else {
      this.store.loadNotificationsByUser(this.TEMP_USER_ID);
    }
  }

  protected onMarkAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.store.markAsRead(notification.id);
    }
  }

  protected onMarkAsUnread(notification: Notification): void {
    if (notification.isRead) {
      this.store.markAsUnread(notification.id);
    }
  }

  protected onToggleRead(notification: Notification): void {
    if (notification.isRead) {
      this.store.markAsUnread(notification.id);
    } else {
      this.store.markAsRead(notification.id);
    }
  }

  protected onMarkAllAsRead(): void {
    this.store.markAllAsRead(this.TEMP_USER_ID);
  }

  protected onDelete(notificationId: string): void {
    this.store.deleteNotification(notificationId);
  }

  /**
   * Determina el ícono Material a mostrar según el tipo de notificación.
   * @remarks Usa los métodos de dominio de la entidad para clasificar.
   */
  protected getIconFor(notification: Notification): string {
    if (notification.isOrderEvent()) return 'receipt_long';
    if (notification.isPaymentEvent()) return 'payments';
    if (notification.isDeliveryEvent()) return 'local_shipping';
    return 'notifications';
  }

  protected getTypeClass(type: string): string {
    return type.toLowerCase().replace(/_/g, '-');
  }

  protected getCategoryClass(notification: Notification): string {
    if (notification.isOrderEvent()) return 'category-order';
    if (notification.isPaymentEvent()) return 'category-payment';
    if (notification.isDeliveryEvent()) return 'category-delivery';
    return 'category-default';
  }

  /**
   * Devuelve un texto relativo "hace X" para la fecha de creación.
   */
  protected timeAgo(createdAt: string): string {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - created);
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'hace unos segundos';
    if (diffMin < 60) return `hace ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `hace ${diffH} h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return `hace ${diffD} d`;
    const diffMo = Math.floor(diffD / 30);
    return `hace ${diffMo} mes${diffMo > 1 ? 'es' : ''}`;
  }

  protected trackById(_index: number, notification: Notification): string {
    return notification.id;
  }
}

