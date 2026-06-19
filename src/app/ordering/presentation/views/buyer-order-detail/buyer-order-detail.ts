import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  PlatformApi,
  OrderRow,
  ProviderRow,
  DriverRow,
  VehicleRow,
  DeliveryRow,
} from '../../../../shared/infrastructure/platform-api';
import { OperationsFacade } from '../../../../shared/application/operations.facade';
import { money, num, fuelLabel, formatDate, mapEmbedUrl } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-buyer-order-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './buyer-order-detail.html',
  styleUrl: './buyer-order-detail.css',
})
export class BuyerOrderDetail implements OnInit {
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
  private readonly providers = signal<ProviderRow[]>([]);
  private readonly drivers = signal<DriverRow[]>([]);
  private readonly vehicles = signal<VehicleRow[]>([]);
  private readonly deliveries = signal<DeliveryRow[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.api.getProviders().subscribe((p) => this.providers.set(p));
    this.api.getDeliveries().subscribe((d) => this.deliveries.set(d));
    this.api.getOrders().subscribe({
      next: (orders) => {
        const order = orders.find((o) => o.id === id) ?? null;
        this.order.set(order);
        if (order) {
          this.api.getDrivers(order.providerId).subscribe((d) => this.drivers.set(d));
          this.api.getVehicles(order.providerId).subscribe((v) => this.vehicles.set(v));
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  providerName(id: string | number): string {
    return this.providers().find((p) => String(p.id) === String(id))?.name ?? 'Sin proveedor';
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

  driverName(id: string | null | undefined): string {
    if (!id) return 'Sin asignar';
    const d = this.drivers().find((x) => String(x.id) === String(id));
    return d ? `${d.firstName} ${d.lastName}` : 'Sin asignar';
  }

  vehicleLabel(id: string | null | undefined): string {
    if (!id) return 'Sin asignar';
    const v = this.vehicles().find((x) => String(x.id) === String(id));
    return v ? `${v.licensePlate} - ${v.brand} ${v.model}` : 'Sin asignar';
  }

  mapUrl(address: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(mapEmbedUrl(address));
  }

  mapsLink(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`;
  }

  paymentStatus(o: OrderRow): string {
    if (o.paymentStatus === 'PAID' || o.status === 'PAID' || o.status === 'CLOSED') return 'paid';
    if (o.paymentStatus === 'PENDING' || o.status === 'PENDING_PAYMENT') return 'pending';
    return 'not_due';
  }

  statusClass(s: string): string {
    return (s || '').toLowerCase();
  }

  back(): void {
    this.router.navigate(['/ordering/my-orders']);
  }

  canConfirm(o: OrderRow): boolean {
    return o.status === 'DISPATCHED';
  }

  canPay(o: OrderRow): boolean {
    return o.status === 'PENDING_PAYMENT' || this.paymentStatus(o) === 'pending';
  }

  pay(o: OrderRow): void {
    this.router.navigate(['/payment'], { queryParams: { orderId: o.id } });
  }

  confirmReception(o: OrderRow): void {
    this.facade.confirmDelivery(o).subscribe((result) => {
      if (result.ok) {
        this.order.set({ ...o, status: 'PENDING_PAYMENT', deliveredAt: new Date().toISOString() });
        this.api.getDeliveries().subscribe((d) => this.deliveries.set(d));
        this.snackBar.open(
          this.translate.instant('messages.reception-confirmed'),
          this.translate.instant('messages.ok'),
          { duration: 4000 },
        );
      } else {
        this.snackBar.open(
          this.translate.instant('messages.confirm-failed'),
          this.translate.instant('messages.ok'),
          { duration: 4000 },
        );
      }
    });
  }
}
