import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  PlatformApi,
  OrderRow,
  BuyerCompanyRow,
  DriverRow,
  VehicleRow,
  DeliveryRow,
} from '../../../../shared/infrastructure/platform-api';
import { OperationsFacade } from '../../../../shared/application/operations.facade';
import { money, num, fuelLabel, formatDate, mapEmbedUrl, toLiters } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly facade = inject(OperationsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly translate = inject(TranslateService);

  readonly money = money;
  readonly num = num;
  readonly fuelLabel = fuelLabel;
  readonly formatDate = formatDate;

  readonly order = signal<OrderRow | null>(null);
  readonly loading = signal(true);
  private readonly buyers = signal<BuyerCompanyRow[]>([]);
  readonly drivers = signal<DriverRow[]>([]);
  readonly vehicles = signal<VehicleRow[]>([]);
  readonly deliveries = signal<DeliveryRow[]>([]);

  readonly showDispatch = signal(false);
  selectedDriverId: string | null = null;
  selectedVehicleId: string | null = null;
  readonly dispatching = signal(false);
  readonly canceling = signal(false);

  readonly availableDrivers = computed(() => {
    const o = this.order();
    return this.drivers().filter(
      (d) =>
        o &&
        String(d.providerId) === String(o.providerId) &&
        this.isAvailable(d.status),
    );
  });

  readonly eligibleVehicles = computed(() => {
    const o = this.order();
    const liters = o ? toLiters(o.quantity, o.unit) : 0;
    return this.vehicles().filter(
      (v) =>
        o &&
        String(v.providerId) === String(o.providerId) &&
        this.isAvailable(v.status) &&
        v.capacity >= liters,
    );
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.api.getBuyerCompanies().subscribe((b) => this.buyers.set(b));
    this.api.getDrivers().subscribe((d) => this.drivers.set(d));
    this.api.getVehicles().subscribe((v) => this.vehicles.set(v));
    this.api.getDeliveries().subscribe((d) => this.deliveries.set(d));
    this.api.getOrders().subscribe({
      next: (orders) => {
        this.order.set(orders.find((o) => o.id === id) ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  buyerName(o: OrderRow): string {
    const b = this.buyers().find((x) => x.id === (o.companyId ?? -1));
    return b?.name ?? o.deliveryAddress ?? 'Sin cliente';
  }

  driverName(id: string | null | undefined): string {
    if (!id) return 'Sin asignar';
    const d = this.drivers().find((x) => x.id === id);
    return d ? `${d.firstName} ${d.lastName}` : 'Sin asignar';
  }

  vehicleLabel(id: string | null | undefined): string {
    if (!id) return 'Sin asignar';
    const v = this.vehicles().find((x) => x.id === id);
    return v ? `${v.brand} ${v.model} - ${v.licensePlate}` : 'Sin asignar';
  }


  deliveryFor(o: OrderRow): DeliveryRow | undefined {
    return this.deliveries().find((d) => String(d.orderId) === String(o.id));
  }

  driverIdFor(o: OrderRow): string | null {
    const deliveryDriverId = this.deliveryFor(o)?.driverId;
    return deliveryDriverId != null ? String(deliveryDriverId) : o.driverId ?? null;
  }

  vehicleIdFor(o: OrderRow): string | null {
    const deliveryVehicleId = this.deliveryFor(o)?.vehicleId;
    return deliveryVehicleId != null ? String(deliveryVehicleId) : o.vehicleId ?? null;
  }
  mapUrl(address: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(mapEmbedUrl(address));
  }

  mapsLink(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`;
  }

  statusClass(s: string): string {
    return (s || '').toLowerCase();
  }

  back(): void {
    this.router.navigate(['/ordering/orders']);
  }

  canDispatch(o: OrderRow): boolean {
    return o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'CREATED';
  }

  canCancel(o: OrderRow): boolean {
    return ['PENDING', 'ACCEPTED', 'CREATED', 'PENDING_PAYMENT'].includes((o.status || '').toUpperCase());
  }

  cancelOrder(): void {
    const o = this.order();
    if (!o || !this.canCancel(o)) return;
    if (!window.confirm('Cancelar esta orden?')) return;
    this.canceling.set(true);
    this.api.patchOrder(o.id, { status: 'CANCELLED' }).subscribe({
      next: (updated) => {
        this.canceling.set(false);
        this.order.set(updated);
        this.snackBar.open('Orden cancelada', this.translate.instant('messages.ok'), { duration: 3500 });
      },
      error: () => {
        this.canceling.set(false);
        this.snackBar.open('No se pudo cancelar la orden', this.translate.instant('messages.ok'), { duration: 4500 });
      },
    });
  }

  openDispatch(): void {
    this.showDispatch.set(true);
    this.selectedDriverId = this.availableDrivers()[0]?.id ?? null;
    this.selectedVehicleId = this.eligibleVehicles()[0]?.id ?? null;
  }

  closeDispatch(): void {
    this.showDispatch.set(false);
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
    const o = this.order();
    const driver = this.drivers().find((d) => d.id === this.selectedDriverId);
    const vehicle = this.vehicles().find((v) => v.id === this.selectedVehicleId);
    if (!o || !driver || !vehicle) return;
    this.dispatching.set(true);
    this.facade.dispatchOrder(o, driver, vehicle).subscribe({
      next: (result) => {
        this.dispatching.set(false);
        if (result.ok) {
          this.order.set({ ...o, status: 'DISPATCHED', dispatchedAt: new Date().toISOString(), driverId: driver.id, vehicleId: vehicle.id });
          this.api.getDrivers().subscribe((d) => this.drivers.set(d));
          this.api.getVehicles().subscribe((v) => this.vehicles.set(v));
          this.api.getDeliveries().subscribe((d) => this.deliveries.set(d));
          this.snackBar.open(
            this.translate.instant('messages.order-dispatched'),
            this.translate.instant('messages.ok'),
            { duration: 4000 },
          );
          this.closeDispatch();
          return;
        }
        this.snackBar.open(
          result.message || this.translate.instant('messages.dispatch-failed'),
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

  private isAvailable(status: string): boolean {
    return ['AVAILABLE', 'ACTIVE'].includes((status ?? '').toUpperCase());
  }
}
