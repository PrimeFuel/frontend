import { Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderingStore } from '../../../application/ordering.store';
import { Order } from '../../../domain/model/order.entity';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatError } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-order-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    MatButton,
    MatIconButton,
    MatIcon,
    MatCard,
    MatCardContent,
    MatChip,
    MatChipSet,
    MatProgressSpinner,
    MatError,
    MatTooltip,
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail {
  readonly store = inject(OrderingStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderId: string | null = null;
  order: Signal<Order | undefined> = computed(() => undefined);

  constructor() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'] ?? null;
      if (this.orderId) {
        this.order = this.store.getOrderById(this.orderId);
      }
    });
  }

  back() {
    this.router.navigate(['/ordering/order-list']).then();
  }

  dispatch(order: Order) {
    const now = new Date().toISOString();
    order.status = 'DISPATCHED';
    order.dispatchedAt = now;
    order.updatedAt = now;
    this.store.updateOrder(order);
  }

  confirmDelivery(order: Order) {
    const now = new Date().toISOString();
    order.status = 'DELIVERED';
    order.deliveredAt = now;
    order.updatedAt = now;
    this.store.updateOrder(order);
  }

  closeOrder(order: Order) {
    const now = new Date().toISOString();
    order.status = 'CLOSED';
    order.closedAt = now;
    order.updatedAt = now;
    this.store.updateOrder(order);
  }

  statusClass(status: string): string {
    return status.toLowerCase();
  }
}
