import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationStore } from '../../../application/notification.store';
import { Notification } from '../../../domain/model/notification.entity';
import { IamStore } from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.css',
})
export class NotificationList implements OnInit {
  protected readonly store = inject(NotificationStore);
  private readonly iam = inject(IamStore);
  private readonly router = inject(Router);

  protected filterMode: 'all' | 'unread' = 'all';

  private get userId(): string {
    return this.iam.userId() ?? 'u1';
  }

  ngOnInit(): void {
    // Load the notifications addressed to the current segment's recipient.
    if (this.iam.isProvider()) {
      this.store.loadForProvider(this.iam.currentProviderId() ?? 1);
    } else {
      this.store.loadForBuyer(this.iam.currentCompanyId() ?? 1);
    }
  }

  protected get visible(): Notification[] {
    const list = this.store.notificationList();
    return this.filterMode === 'unread' ? list.filter((n) => !n.isRead) : list;
  }

  protected setFilter(mode: 'all' | 'unread'): void {
    this.filterMode = mode;
  }

  protected markAllRead(): void {
    if (this.iam.isProvider()) {
      this.store.markAllReadForProvider(this.iam.currentProviderId() ?? 1);
    } else {
      this.store.markAllReadForBuyer(this.iam.currentCompanyId() ?? 1);
    }
  }

  /** Marks read (no reload) and routes to the relevant context page. */
  protected open(n: Notification): void {
    if (!n.isRead) this.store.markAsRead(n.id);
    this.router.navigate(this.targetFor(n));
  }

  private targetFor(n: Notification): string[] {
    const type = (n.type || '').toUpperCase();
    const related = n.orderId || '';
    if (this.iam.isProvider()) {
      if (type === 'NEW_REQUEST' || type.includes('REQUEST')) return ['/ordering/pending'];
      if (type.includes('STOCK') || type.includes('INVENTORY')) return ['/inventory/products'];
      if (type.includes('VEHICLE') || type.includes('DRIVER') || type.includes('DELIVERY'))
        return ['/fulfillment/vehicles'];
      if (type.includes('PAYMENT') || type.includes('COLLECT')) return ['/ordering/collections'];
      if (type.includes('REPORT')) return ['/reporting/provider'];
      return ['/ordering/orders'];
    }
    // Buyer
    if (type === 'REQUEST_PENDING' || type.includes('REQUEST')) return ['/ordering/my-requests'];
    if (type === 'ORDER_REJECTED' || type.includes('REJECT'))
      return ['/ordering/my-requests'];
    if (type.includes('PAYMENT') || type.includes('INVOICE')) return ['/payment'];
    if (type.includes('FUEL') || type.includes('EQUIPMENT') || type.includes('REFILL'))
      return ['/equipment'];
    if (type.includes('CATALOG') || type.includes('PROVIDER')) return ['/catalog'];
    if (type.includes('REPORT')) return ['/reporting/buyer'];
    if ((type.includes('ORDER') || type.includes('DELIVERY')) && related)
      return ['/ordering/buyer-order', related];
    if (type.includes('ORDER') || type.includes('DELIVERY')) return ['/ordering/my-orders'];
    return ['/notification'];
  }

  protected iconFor(n: Notification): string {
    const t = (n.type || '').toUpperCase();
    if (t.includes('PAYMENT') || t.includes('INVOICE')) return 'payments';
    if (t.includes('REQUEST')) return 'inbox';
    if (t.includes('STOCK')) return 'inventory_2';
    if (t.includes('DELIVERY') || t.includes('DISPATCH')) return 'local_shipping';
    if (t.includes('FUEL') || t.includes('REFILL')) return 'local_gas_station';
    if (t.includes('ORDER')) return 'receipt_long';
    return 'notifications';
  }

  protected categoryClass(n: Notification): string {
    const t = (n.type || '').toUpperCase();
    if (t.includes('PAYMENT')) return 'cat-payment';
    if (t.includes('REQUEST') || t.includes('ORDER')) return 'cat-order';
    if (t.includes('STOCK') || t.includes('DELIVERY')) return 'cat-logistics';
    return 'cat-default';
  }

  protected timeAgo(createdAt: string): string {
    const time = new Date(createdAt).getTime();
    if (!createdAt || Number.isNaN(time)) return '';
    const diffMin = Math.max(0, Math.floor((Date.now() - time) / 60000));
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const h = Math.floor(diffMin / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return `${Math.floor(d / 30)}mo ago`;
  }

  protected title(n: Notification): string {
    const explicit = (n as unknown as { title?: string }).title;
    if (explicit) return explicit;
    return (n.type || 'Notification')
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}

