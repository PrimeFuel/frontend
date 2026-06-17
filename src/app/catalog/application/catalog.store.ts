import { Injectable, signal, computed, inject } from '@angular/core';
import { forkJoin, retry } from 'rxjs';
import { CatalogApi, ProviderRatingResource } from '../infrastructure/catalog-api';
import { Provider } from '../domain/model/provider.entity';
import { CatalogProduct } from '../domain/model/catalog-product.entity';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly api = inject(CatalogApi);

  private readonly _providers = signal<Provider[]>([]);
  private readonly _selectedProvider = signal<Provider | null>(null);
  private readonly _selectedProviderProducts = signal<CatalogProduct[]>([]);
  private readonly _ratings = signal<ProviderRatingResource[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string>('');
  private readonly _searchQuery = signal<string>('');

  readonly providers = this._providers.asReadonly();
  readonly selectedProvider = this._selectedProvider.asReadonly();
  readonly selectedProviderProducts = this._selectedProviderProducts.asReadonly();
  readonly ratings = this._ratings.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filteredProviders = computed(() => {
    const query = this._searchQuery().toLowerCase();
    if (!query) return this._providers();
    return this._providers().filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.fuelTypesOffered.some((ft) => ft.toLowerCase().includes(query)),
    );
  });

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  loadProviders(): void {
    this._isLoading.set(true);
    this._error.set('');
    forkJoin({
      providers: this.api.getProviders(),
      ratings: this.api.getRatings(),
    }).pipe(retry(2)).subscribe({
      next: ({ providers, ratings }) => {
        this._ratings.set(ratings);
        this._providers.set(providers.map((provider) => this.withAverageRating(provider, ratings)));
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load providers');
        this._isLoading.set(false);
      },
    });
  }

  loadProviderById(id: string | number): void {
    this._isLoading.set(true);
    this._error.set('');
    forkJoin({
      provider: this.api.getProviderById(String(id)),
      products: this.api.getProductsByProvider(Number(id)),
      ratings: this.api.getRatings(Number(id)),
    }).pipe(retry(2)).subscribe({
      next: ({ provider, products, ratings }) => {
        this._ratings.update((current) => [
          ...current.filter((rating) => rating.providerId !== Number(id)),
          ...ratings,
        ]);
        this._selectedProvider.set(this.withAverageRating(provider, ratings));
        // Inactive products are not published to buyers.
        this._selectedProviderProducts.set(products.filter((p) => p.available));
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load provider');
        this._isLoading.set(false);
      },
    });
  }

  loadProviderProducts(providerId: number): void {
    this.api.getProductsByProvider(providerId).pipe(retry(2)).subscribe({
      next: (products) => {
        this._selectedProviderProducts.set(products.filter((p) => p.available));
      },
      error: (err) => {
        this._error.set(err.message || 'Failed to load products');
      },
    });
  }

  clearSelectedProvider(): void {
    this._selectedProvider.set(null);
    this._selectedProviderProducts.set([]);
  }

  ratingForBuyer(companyId: number, providerId: number): number {
    return this._ratings().find(
      (rating) => rating.companyId === companyId && rating.providerId === providerId,
    )?.rating ?? 0;
  }

  rateProvider(companyId: number, providerId: number, rating: number): void {
    const value = Math.max(1, Math.min(5, rating));
    const existing = this._ratings().find(
      (item) => item.companyId === companyId && item.providerId === providerId,
    );
    const request = existing
      ? this.api.updateRating(existing.id, { companyId, providerId, rating: value })
      : this.api.createRating({ companyId, providerId, rating: value });

    request.subscribe({
      next: (saved) => {
        this._ratings.update((ratings) =>
          existing
            ? ratings.map((item) => (item.id === saved.id ? saved : item))
            : [...ratings, saved],
        );
        const providerRatings = this._ratings().filter((item) => item.providerId === providerId);
        const selected = this._selectedProvider();
        if (selected && Number(selected.id) === providerId) {
          this._selectedProvider.set(this.withAverageRating(selected, providerRatings));
        }
        this._providers.update((providers) =>
          providers.map((provider) =>
            Number(provider.id) === providerId
              ? this.withAverageRating(provider, providerRatings)
              : provider,
          ),
        );
      },
      error: (err) => this._error.set(err.message || 'Failed to save rating'),
    });
  }

  private withAverageRating(provider: Provider, ratings: ProviderRatingResource[]): Provider {
    const providerRatings = ratings.filter((rating) => rating.providerId === Number(provider.id));
    if (providerRatings.length === 0) return provider;
    const average = providerRatings.reduce((sum, item) => sum + item.rating, 0) / providerRatings.length;
    return new Provider({ ...provider, rating: Number(average.toFixed(1)) });
  }
}
