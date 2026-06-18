import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, of } from 'rxjs';
import { IamStore } from '../../../../iam/application/iam.store';
import { NotificationsFacade } from '../../../../shared/application/notifications.facade';
import {
  CatalogApi,
  ProviderRatingResource,
} from '../../../infrastructure/catalog-api';
import {
  PlatformApi,
  ProviderRow,
  ProductRow,
  EquipmentRow,
} from '../../../../shared/infrastructure/platform-api';
import {
  fuelLabel,
  money,
  num,
  toLiters,
  FUEL_TYPE_OPTIONS,
} from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-catalog-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './catalog-view.html',
  styleUrl: './catalog-view.css',
})
export class CatalogView implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly catalogApi = inject(CatalogApi);
  private readonly iam = inject(IamStore);
  private readonly notify = inject(NotificationsFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly fuelLabel = fuelLabel;
  readonly money = money;
  readonly num = num;
  readonly fuelOptions = FUEL_TYPE_OPTIONS;
  readonly stars = [1, 2, 3, 4, 5];

  readonly providers = signal<ProviderRow[]>([]);
  readonly products = signal<ProductRow[]>([]);
  readonly equipment = signal<EquipmentRow[]>([]);
  readonly ratings = signal<ProviderRatingResource[]>([]);
  readonly loading = signal(true);
  readonly hoveredRating = signal<{ providerId: number; value: number } | null>(null);

  readonly search = signal('');
  readonly fuelFilter = signal('');
  readonly favoritesOnly = signal(false);
  readonly compatibleOnly = signal(false);
  readonly favorites = signal<Set<number>>(new Set());

  // Request panel state
  readonly panelProvider = signal<ProviderRow | null>(null);
  readonly selectedProduct = signal<ProductRow | null>(null);
  reqQty = signal(100);
  reqUnit = signal('LITERS');
  reqEquipmentId: string | number | null = null;
  reqAddress = '';
  reqDate = '';

  private get companyId(): number {
    return this.iam.currentCompanyId() ?? 1;
  }

  private favKey(): string {
    return `fulltank.favorites.${this.companyId}`;
  }

  readonly myFuelTypes = computed(
    () => new Set(this.myEquipment().map((e) => e.requiredFuelType)),
  );

  readonly myEquipment = computed(() =>
    this.equipment().filter((e) => (e.companyId ?? 1) === this.companyId),
  );

  /** Providers that have at least one available product in inventory. */
  readonly providersWithProducts = computed(() => {
    const withStock = new Set(
      this.products()
        .filter((p) => p.available && (p.stock ?? 0) > 0)
        .map((p) => p.providerId),
    );
    return this.providers().filter((p) => withStock.has(p.id));
  });

  readonly filteredProviders = computed(() => {
    const q = this.search().toLowerCase().trim();
    const fuel = this.fuelFilter();
    const favOnly = this.favoritesOnly();
    const compatOnly = this.compatibleOnly();
    const myFuels = this.myFuelTypes();

    return this.providersWithProducts().filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q))
        return false;
      if (fuel && !this.providerFuelTypes(p).includes(fuel)) return false;
      if (favOnly && !this.favorites().has(p.id)) return false;
      if (compatOnly && !this.providerFuelTypes(p).some((f) => myFuels.has(f))) return false;
      return true;
    });
  });

  providerProducts(provider: ProviderRow): ProductRow[] {
    return this.products().filter(
      (p) => p.providerId === provider.id && p.available && (p.stock ?? 0) > 0,
    );
  }

  providerFuelTypes(provider: ProviderRow): string[] {
    return [...new Set(this.providerProducts(provider).map((p) => p.fuelType))];
  }

  fromPrice(provider: ProviderRow): number {
    const prices = this.providerProducts(provider).map((p) => p.pricePerLiter);
    return prices.length ? Math.min(...prices) : 0;
  }

  ngOnInit(): void {
    this.loadFavorites();
    forkJoin({
      providers: this.api.getProviders(),
      ratings: this.catalogApi.getRatings().pipe(catchError(() => of([]))),
    }).subscribe(({ providers, ratings }) => {
      this.ratings.set(ratings);
      this.providers.set(this.withAverageRatings(providers, ratings));
    });
    this.api.getEquipment().subscribe((e) => this.equipment.set(e));
    this.api.getProducts().subscribe((p) => {
      this.products.set(p);
      this.loading.set(false);
    });

    // From "Request refill" on an equipment card.
    const fuel = this.route.snapshot.queryParamMap.get('fuelType');
    const eqId = this.route.snapshot.queryParamMap.get('equipmentId');
    if (fuel) {
      this.fuelFilter.set(fuel);
      this.compatibleOnly.set(true);
    }
    if (eqId) this.reqEquipmentId = eqId;
  }

  private loadFavorites(): void {
    try {
      const raw = localStorage.getItem(this.favKey());
      this.favorites.set(new Set(raw ? JSON.parse(raw) : []));
    } catch {
      this.favorites.set(new Set());
    }
  }

  toggleFavorite(provider: ProviderRow, event: Event): void {
    event.stopPropagation();
    const set = new Set(this.favorites());
    set.has(provider.id) ? set.delete(provider.id) : set.add(provider.id);
    this.favorites.set(set);
    localStorage.setItem(this.favKey(), JSON.stringify([...set]));
  }

  isFavorite(provider: ProviderRow): boolean {
    return this.favorites().has(provider.id);
  }

  viewProvider(provider: ProviderRow): void {
    this.router.navigate(['/catalog/providers', provider.id]);
  }

  currentRating(providerId: number): number {
    return this.ratings().find(
      (rating) => rating.companyId === this.companyId && rating.providerId === providerId,
    )?.rating ?? 0;
  }

  displayedRating(providerId: number): number {
    const hovered = this.hoveredRating();
    return hovered?.providerId === providerId ? hovered.value : this.currentRating(providerId);
  }

  rateProvider(provider: ProviderRow, value: number, event: Event): void {
    event.stopPropagation();
    const existing = this.ratings().find(
      (rating) =>
        rating.companyId === this.companyId && rating.providerId === provider.id,
    );
    const resource = { companyId: this.companyId, providerId: provider.id, rating: value };
    const request = existing
      ? this.catalogApi.updateRating(existing.id, resource)
      : this.catalogApi.createRating(resource);

    request.subscribe({
      next: (saved) => {
        this.ratings.update((ratings) =>
          existing
            ? ratings.map((rating) => (rating.id === saved.id ? saved : rating))
            : [...ratings, saved],
        );
        this.providers.update((providers) => this.withAverageRatings(providers, this.ratings()));
        this.snackBar.open(
          this.translate.instant('messages.rating-saved'),
          this.translate.instant('messages.ok'),
          { duration: 2500 },
        );
      },
      error: () =>
        this.snackBar.open(
          this.translate.instant('messages.rating-failed'),
          this.translate.instant('messages.ok'),
          { duration: 3000 },
        ),
    });
  }

  // â”€â”€ Request panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€--
  openRequest(provider: ProviderRow): void {
    this.panelProvider.set(provider);
    const products = this.providerProducts(provider);
    const preferred = this.fuelFilter()
      ? products.find((p) => p.fuelType === this.fuelFilter())
      : null;
    this.selectProduct(preferred ?? products[0] ?? null);
    this.reqDate = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  }

  closePanel(): void {
    this.panelProvider.set(null);
    this.selectedProduct.set(null);
  }

  selectProduct(p: ProductRow | null): void {
    this.selectedProduct.set(p);
    this.reqUnit.set(p?.unit ?? 'LITERS');
    this.reqQty.set(300);
    // Preselect a compatible equipment for the product's fuel type.
    const compat = this.compatibleEquipment();
    this.reqEquipmentId = compat[0]?.id ?? null;
    this.syncAddress();
  }

  compatibleEquipment(): EquipmentRow[] {
    const p = this.selectedProduct();
    if (!p) return [];
    return this.myEquipment().filter((e) => e.requiredFuelType === p.fuelType);
  }

  private syncAddress(): void {
    const eq = this.myEquipment().find((e) => String(e.id) === String(this.reqEquipmentId));
    this.reqAddress = eq?.location ?? this.reqAddress;
  }

  onEquipmentChange(): void {
    this.syncAddress();
  }

  readonly requestedLiters = computed(() => toLiters(this.reqQty(), this.reqUnit()));

  get selectedEquipment(): EquipmentRow | undefined {
    return this.myEquipment().find((e) => String(e.id) === String(this.reqEquipmentId));
  }

  get totalAmount(): number {
    const p = this.selectedProduct();
    return p ? this.requestedLiters() * p.pricePerLiter : 0;
  }

  get validationError(): string | null {
    const p = this.selectedProduct();
    if (!p) return this.translate.instant('catalog.err-select-product');
    if (!this.reqQty() || this.reqQty() <= 0) return this.translate.instant('catalog.err-quantity');
    if (this.requestedLiters() > (p.stock ?? 0))
      return this.translate.instant('catalog.err-stock', { qty: num(p.stock) });
    const eq = this.selectedEquipment;
    if (eq) {
      const remaining = eq.capacity - eq.currentLevel;
      if (this.requestedLiters() > remaining)
        return this.translate.instant('catalog.err-capacity', { qty: num(remaining) });
    }
    return null;
  }

  submitRequest(): void {
    if (this.validationError) return;
    const p = this.selectedProduct()!;
    const provider = this.panelProvider()!;
    const now = new Date().toISOString();
    this.api
      .createRequest({
        clientId: String(this.companyId),
        companyId: this.companyId,
        providerId: provider.id,
        productId: p.id,
        fuelType: p.fuelType,
        productName: p.name,
        quantity: this.reqQty(),
        unit: this.reqUnit(),
        unitPrice: p.pricePerLiter,
        equipmentId: this.reqEquipmentId,
        desiredDeliveryDate: this.reqDate ? this.reqDate : now,
        deliveryAddress: this.reqAddress || this.iam.companyName(),
        source: 'Catalog',
        status: 'PENDING',
        rejectionReason: null,
        createdAt: now,
        updatedAt: now,
      })
      .subscribe({
        next: (request) => {
          this.notify.notifyBuyer(
            this.companyId,
            'REQUEST_PENDING',
            'Solicitud pendiente',
            `Tu solicitud de ${p.name} fue enviada y esta pendiente de aprobacion.`,
            request?.id,
          );
          this.notify.notifyProvider(
            provider.id,
            'NEW_REQUEST',
            'Nueva solicitud de combustible',
            `${this.iam.companyName()} solicito ${num(this.requestedLiters())} L de ${p.name}.`,
            request?.id,
          );
          this.snackBar.open(
            this.translate.instant('messages.request-submitted'),
            this.translate.instant('messages.view-requests'),
            { duration: 4000 },
          )
            .onAction()
            .subscribe(() => this.router.navigate(['/ordering/my-requests']));
          this.closePanel();
        },
        error: () =>
          this.snackBar.open(
            this.translate.instant('messages.request-failed'),
            this.translate.instant('messages.ok'),
            { duration: 3000 },
          ),
      });
  }

  clearFilters(): void {
    this.search.set('');
    this.fuelFilter.set('');
    this.favoritesOnly.set(false);
    this.compatibleOnly.set(false);
  }

  private withAverageRatings(
    providers: ProviderRow[],
    ratings: ProviderRatingResource[],
  ): ProviderRow[] {
    return providers.map((provider) => {
      const values = ratings
        .filter((rating) => rating.providerId === provider.id)
        .map((rating) => rating.rating);
      return {
        ...provider,
        rating: values.length
          ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
          : provider.rating,
      };
    });
  }
}

