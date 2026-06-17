import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam.store';
import {
  PlatformApi,
  OrderRow,
  BuyerCompanyRow,
  DriverRow,
  VehicleRow,
} from '../../../../shared/infrastructure/platform-api';
import { OperationsFacade } from '../../../../shared/application/operations.facade';
import { num, money, fuelLabel, toLiters } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);
  private readonly facade = inject(OperationsFacade);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly num = num;
  readonly money = money;
  readonly fuelLabel = fuelLabel;

  readonly orders = signal<OrderRow[]>([]);
  readonly buyers = signal<BuyerCompanyRow[]>([]);
  readonly drivers = signal<DriverRow[]>([]);
  readonly vehicles = signal<VehicleRow[]>([]);
  readonly loading = signal(true);
  readonly filter = signal<string>('ALL');

  // Dispatch modal
  readonly dispatchOrderRow = signal<OrderRow | null>(null);
  selectedDriverId: string | null = null;
  selectedVehicleId: string | null = null;
  readonly dispatching = signal(false);

  private get providerId(): number {
    return this.iam.currentProviderId() ?? 1;
  }

  readonly providerOrders = computed(() =>
    [...this.orders()]
      .filter((o) => String(o.providerId) === String(this.providerId))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  );

  readonly visibleOrders = computed(() => {
    const f = this.filter();
    if (f === 'ALL') return this.providerOrders();
    if (f === 'ACTIVE')
      return this.providerOrders().filter((o) =>
        ['PENDING', 'ACCEPTED', 'DISPATCHED', 'PENDING_PAYMENT'].includes(o.status),
      );
    return this.providerOrders().filter((o) => o.status === f);
  });

  readonly availableDrivers = computed(() =>
    this.drivers().filter(
      (d) =>
        String(d.providerId) === String(this.providerId) && this.isAvailable(d.status),
    ),
  );

  /** Available vehicles of this provider that can carry the order quantity. */
  readonly eligibleVehicles = computed(() => {
    const o = this.dispatchOrderRow();
    const liters = o ? toLiters(o.quantity, o.unit) : 0;
    return this.vehicles().filter(
      (v) =>
        String(v.providerId) === String(this.providerId) &&
        this.isAvailable(v.status) &&
        v.capacity >= liters,
    );
  });

  ngOnInit(): void {
    this.api.getBuyerCompanies().subscribe((b) => this.buyers.set(b));
    this.reload();
  }

  reload(): void {
    this.api.getDrivers().subscribe((d) => this.drivers.set(d));
    this.api.getVehicles().subscribe((v) => this.vehicles.set(v));
    this.api.getOrders().subscribe({
      next: (o) => {
        this.orders.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  buyerName(o: OrderRow): string {
    const b = this.buyers().find((x) => x.id === (o.companyId ?? -1));
    return b?.name ?? o.deliveryAddress ?? 'Buyer';
  }

  canDispatch(o: OrderRow): boolean {
    return o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'CREATED';
  }

  openDispatch(o: OrderRow): void {
    this.dispatchOrderRow.set(o);
    this.selectedDriverId = this.availableDrivers()[0]?.id ?? null;
    this.selectedVehicleId = this.eligibleVehicles()[0]?.id ?? null;
  }

  closeDispatch(): void {
    this.dispatchOrderRow.set(null);
  }

  get canConfirmDispatch(): boolean {
    return (
      !this.dispatching() &&
      !!this.selectedDriverId &&
      !!this.selectedVehicleId &&
      this.availableDrivers().length > 0 &&
      this.eligibleVehicles().length > 0
    );
  }

  confirmDispatch(): void {
    const o = this.dispatchOrderRow();
    const driver = this.drivers().find((d) => d.id === this.selectedDriverId);
    const vehicle = this.vehicles().find((v) => v.id === this.selectedVehicleId);
    if (!o || !driver || !vehicle) return;
    this.dispatching.set(true);
    this.facade.dispatchOrder(o, driver, vehicle).subscribe({
      next: (result) => {
        this.dispatching.set(false);
        if (result.ok) {
          this.snackBar.open(
            this.translate.instant('messages.order-dispatched'),
            this.translate.instant('messages.ok'),
            { duration: 4000 },
          );
          this.closeDispatch();
          this.reload();
          return;
        }
        this.snackBar.open(
          this.dispatchErrorMessage(result.message),
          this.translate.instant('messages.ok'),
          { duration: 5000 },
        );
      },
      error: () => {
        this.dispatching.set(false);
        this.snackBar.open(
          this.translate.instant('messages.dispatch-failed'),
          this.translate.instant('messages.ok'),
          { duration: 5000 },
        );
      },
    });
  }

  view(o: OrderRow): void {
    this.router.navigate(['/ordering/orders', o.id]);
  }

  /** Maps a facade dispatch error to a localized message. */
  private dispatchErrorMessage(msg?: string): string {
    const m = (msg ?? '').toLowerCase();
    if (m.includes('driver')) return this.translate.instant('messages.no-driver');
    if (m.includes('stock') || m.includes('inventory'))
      return this.translate.instant('messages.no-stock-dispatch');
    if (m.includes('already exists'))
      return this.translate.instant('messages.delivery-already-exists');
    if (m.includes('order') && m.includes('not found'))
      return this.translate.instant('messages.order-not-found');
    if (m.includes('capacity')) return this.translate.instant('messages.no-capacity');
    if (m.includes('vehicle')) return this.translate.instant('messages.no-vehicle');
    return msg || this.translate.instant('messages.dispatch-failed');
  }

  statusClass(s: string): string {
    return (s || '').toLowerCase();
  }

  private isAvailable(status: string): boolean {
    return ['AVAILABLE', 'ACTIVE'].includes((status ?? '').toUpperCase());
  }
}
