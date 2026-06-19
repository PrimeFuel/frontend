import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam.store';
import { PlatformApi, ProductRow } from '../../../../shared/infrastructure/platform-api';
import { money, num, fuelLabel, FUEL_TYPE_OPTIONS } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-product-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './product-inventory.html',
  styleUrl: './product-inventory.css',
})
export class ProductInventory implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly iam = inject(IamStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly money = money;
  readonly num = num;
  readonly fuelLabel = fuelLabel;
  readonly fuelOptions = FUEL_TYPE_OPTIONS;

  readonly products = signal<ProductRow[]>([]);
  readonly loading = signal(true);

  // Edit / create modal
  readonly editing = signal<ProductRow | null>(null);
  readonly creating = signal(false);
  draft: Partial<ProductRow> = {};

  // Refill modal
  readonly refilling = signal<ProductRow | null>(null);
  refillAmount = 0;

  private get providerId(): number {
    return this.iam.currentProviderId() ?? 1;
  }

  readonly myProducts = computed(() =>
    this.products().filter((p) => p.providerId === this.providerId),
  );

  readonly lowStockCount = computed(
    () => this.myProducts().filter((p) => this.isLow(p)).length,
  );

  ngOnInit(): void {
    this.reload();
  }

  private reload(): void {
    this.api.getProducts().subscribe({
      next: (p) => {
        this.products.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  isLow(p: ProductRow): boolean {
    const cap = p.capacity ?? 50000;
    return (p.stock ?? 0) <= 0 || (p.stock ?? 0) / cap <= 0.15;
  }

  stockPct(p: ProductRow): number {
    const cap = p.capacity ?? 50000;
    return Math.min(100, Math.round(((p.stock ?? 0) / cap) * 100));
  }

  availablePct(p: ProductRow): number {
    return this.stockPct(p);
  }

  stockClass(p: ProductRow): string {
    if ((p.stock ?? 0) <= 0) return 'red';
    if (this.isLow(p)) return 'amber';
    return 'green';
  }

  // ── Create / edit ───────────────────────────────────────────────────────-
  openCreate(): void {
    this.draft = {
      providerId: this.providerId,
      fuelType: 'GASOLINE_90',
      name: '',
      description: '',
      pricePerLiter: 0,
      unit: 'LITERS',
      available: true,
      stock: 0,
      capacity: 50000,
    };
    this.creating.set(true);
    this.editing.set(null);
  }

  openEdit(p: ProductRow): void {
    this.draft = { ...p };
    this.editing.set(p);
    this.creating.set(false);
  }

  closeEdit(): void {
    this.editing.set(null);
    this.creating.set(false);
  }

  saveProduct(): void {
    const d = this.draft;
    if (!d.name || !d.fuelType) return;
    d.available = (d.stock ?? 0) > 0 ? (d.available ?? true) : false;
    const done = () => {
      this.snackBar.open(
        this.translate.instant('messages.product-saved'),
        this.translate.instant('messages.ok'),
        { duration: 2500 },
      );
      this.closeEdit();
      this.reload();
    };
    if (this.creating()) {
      this.api.createProduct(d).subscribe(done);
    } else {
      this.api.patchProduct(this.editing()!.id, d).subscribe(done);
    }
  }

  deleteProduct(p: ProductRow): void {
    if (!window.confirm(this.translate.instant('messages.delete-product', { name: p.name }))) return;

    this.api.deleteProduct(p.id).subscribe({
      next: () => {
        this.products.update((items) => items.filter((item) => item.id !== p.id));
        this.snackBar.open(
          this.translate.instant('messages.product-removed'),
          this.translate.instant('messages.ok'),
          { duration: 2500 },
        );
      },
      error: (error) => {
        this.snackBar.open(
          error?.status === 409
            ? this.translate.instant('messages.product-delete-conflict')
            : this.translate.instant('messages.request-failed'),
          this.translate.instant('messages.ok'),
          { duration: 3000 },
        );
      },
    });
  }

  // ── Refill ──────────────────────────────────────────────────────────────-
  openRefill(p: ProductRow): void {
    this.refilling.set(p);
    this.refillAmount = 10000;
  }
  closeRefill(): void {
    this.refilling.set(null);
  }
  confirmRefill(): void {
    const p = this.refilling();
    if (!p || this.refillAmount <= 0) return;
    this.api.refillInventory(p.id, (p.stock ?? 0) + this.refillAmount, 'Manual refill').subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('messages.refilled'),
          this.translate.instant('messages.ok'),
          { duration: 2500 },
        );
        this.closeRefill();
        this.reload();
      },
      error: () => {
        this.snackBar.open(
          this.translate.instant('messages.request-failed'),
          this.translate.instant('messages.ok'),
          { duration: 3000 },
        );
        this.closeRefill();
      },
    });
  }
}
