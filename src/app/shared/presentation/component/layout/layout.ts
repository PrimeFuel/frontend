import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterOutlet } from '@angular/router';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TranslatePipe,
    RouterOutlet,
    LanguageSwitcher,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  @ViewChild(MatSidenav) drawer!: MatSidenav;

  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;

  options = [
    { label: 'nav.dashboard', icon: 'dashboard', link: '/dashboard' },
    {
      label: 'nav.catalog',
      icon: 'inventory',
      link: '/catalog',
      children: [
        { label: 'catalog.products', link: '/catalog/product-list' },
        { label: 'catalog.add-product', link: '/catalog/product-form' },
        { label: 'catalog.inventory', link: '/catalog/inventory-list' },
      ],
    },
    {
      label: 'nav.ordering',
      icon: 'shopping_cart',
      link: '/ordering',
      children: [
        { label: 'ordering.requests', link: '/ordering/request-list' },
        { label: 'ordering.create-request', link: '/ordering/request-form' },
        { label: 'ordering.orders', link: '/ordering/order-list' },
      ],
    },
    {
      label: 'nav.fulfillment',
      icon: 'local_shipping',
      link: '/fulfillment',
      children: [
        { label: 'fulfillment.vehicles', link: '/fulfillment/vehicle-list' },
        { label: 'fulfillment.drivers', link: '/fulfillment/driver-list' },
        { label: 'fulfillment.dispatch', link: '/fulfillment/dispatch-dashboard' },
      ],
    },
    {
      label: 'nav.payment',
      icon: 'payments',
      link: '/payment',
      children: [
        { label: 'payment.transactions', link: '/payment/transaction-list' },
        { label: 'payment.process', link: '/payment/payment-form' },
      ],
    },
    {
      label: 'nav.notifications',
      icon: 'notifications',
      link: '/notification/notification-panel',
    },
    {
      label: 'nav.reports',
      icon: 'analytics',
      link: '/reporting',
      children: [
        { label: 'reporting.dashboard', link: '/reporting/dashboard' },
        { label: 'reporting.sales', link: '/reporting/sales-report' },
        { label: 'reporting.consumption', link: '/reporting/consumption-report' },
      ],
    },
  ];

  constructor(
    private router: Router,
    private observer: BreakpointObserver,
  ) {
    this.observer.observe(['(max-width: 768px)']).subscribe((result) => {
      if (result.matches) {
        this.sidenavMode = 'over';
        this.sidenavOpened = false;
      } else {
        this.sidenavMode = 'side';
        this.sidenavOpened = true;
      }
    });
  }

  navigateTo(link: string): void {
    this.router.navigate([link]).then();
    if (this.sidenavMode === 'over') {
      this.drawer.toggle().then();
    }
  }

  isActive(link: string): boolean {
    return this.router.url.startsWith(link);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
