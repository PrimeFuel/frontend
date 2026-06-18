import { Component, inject, signal, computed, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { IamStore } from '../../../../iam/application/iam.store';
import { NotificationStore } from '../../../../notification/application/notification.store';

interface NavChild {
  label: string;
  link: string;
}
interface NavItem {
  key: string;
  label: string;
  icon: string;
  link?: string;
  children?: NavChild[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterOutlet, LanguageSwitcher, TranslatePipe],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly iamStore = inject(IamStore);
  private readonly notificationStore = inject(NotificationStore);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly expanded = signal<Record<string, boolean>>({});

  readonly role = this.iamStore.role;
  readonly isBuyer = this.iamStore.isBuyer;
  readonly isProvider = this.iamStore.isProvider;
  readonly displayName = this.iamStore.displayName;
  readonly companyName = this.iamStore.companyName;
  readonly unreadCount = this.notificationStore.unreadCount;

  readonly initials = computed(() => {
    const name = this.displayName() || 'FT';
    return name
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  readonly roleLabel = computed(() =>
    this.isProvider() ? 'Provider / Distributor' : 'Buyer / Applicant',
  );

  private readonly buyerNav: NavItem[] = [
    { key: 'reporting', label: 'nav.dashboard', icon: 'dashboard', link: '/reporting/buyer-dashboard' },
    { key: 'catalog', label: 'nav.catalog', icon: 'storefront', link: '/catalog' },
    { key: 'equipment', label: 'nav.equipment', icon: 'engineering', link: '/equipment' },
    {
      key: 'ordering',
      label: 'nav.ordering',
      icon: 'shopping_cart',
      children: [
        { label: 'ordering.my-requests', link: '/ordering/my-requests' },
        { label: 'ordering.my-orders', link: '/ordering/my-orders' },
      ],
    },
    { key: 'payment', label: 'nav.payment', icon: 'credit_card', link: '/payment' },
    {
      key: 'notification',
      label: 'nav.notifications',
      icon: 'notifications',
      link: '/notification',
    },
    { key: 'reporting-reports', label: 'nav.reports', icon: 'analytics', link: '/reporting/buyer' },
  ];

  private readonly providerNav: NavItem[] = [
    { key: 'reporting', label: 'nav.dashboard', icon: 'dashboard', link: '/reporting/provider-dashboard' },
    { key: 'inventory', label: 'nav.inventory', icon: 'inventory_2', link: '/inventory/products' },
    {
      key: 'ordering',
      label: 'nav.ordering',
      icon: 'shopping_cart',
      children: [
        { label: 'ordering.pending-requests', link: '/ordering/pending' },
        { label: 'ordering.orders', link: '/ordering/orders' },
        { label: 'ordering.collections', link: '/ordering/collections' },
      ],
    },
    {
      key: 'fulfillment',
      label: 'nav.fulfillment',
      icon: 'local_shipping',
      children: [
        { label: 'fulfillment.vehicles', link: '/fulfillment/vehicles' },
        { label: 'fulfillment.drivers', link: '/fulfillment/drivers' },
      ],
    },
    {
      key: 'notification',
      label: 'nav.notifications',
      icon: 'notifications',
      link: '/notification',
    },
    { key: 'reporting-reports', label: 'nav.reports', icon: 'analytics', link: '/reporting/provider' },
  ];

  get navItems(): NavItem[] {
    return this.isProvider() ? this.providerNav : this.buyerNav;
  }

  constructor() {
    effect(() => {
      if (this.iamStore.isProvider()) {
        const providerId = this.iamStore.currentProviderId();
        if (providerId) this.notificationStore.loadForProvider(providerId);
        return;
      }

      const companyId = this.iamStore.currentCompanyId();
      if (companyId) this.notificationStore.loadForBuyer(companyId);
    });
  }

  toggleSidebar(): void {
    this.collapsed.update((c) => !c);
  }

  toggleGroup(key: string): void {
    this.expanded.update((e) => ({ ...e, [key]: !e[key] }));
  }

  isGroupOpen(key: string): boolean {
    const e = this.expanded();
    if (e[key] !== undefined) return e[key];
    return this.router.url.startsWith('/' + key);
  }

  navigateTo(link: string): void {
    this.router.navigate([link]);
  }

  isActive(link: string): boolean {
    // Match on full path segments so e.g. `/reporting/buyer` (Reports) does not
    // also light up while on `/reporting/buyer-dashboard` (Dashboard).
    const url = this.router.url.split(/[?#]/)[0];
    return url === link || url.startsWith(link + '/');
  }

  isGroupActive(key: string): boolean {
    return this.router.url.startsWith('/' + key);
  }

  goNotifications(): void {
    this.router.navigate(['/notification']);
  }

  goProfile(): void {
    this.router.navigate(['/iam/profile']);
  }

  logout(): void {
    this.iamStore.logout();
    this.router.navigate(['/iam']);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}



