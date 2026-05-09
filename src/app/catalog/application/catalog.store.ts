import { Injectable, signal, computed, inject } from '@angular/core';
import { retry } from 'rxjs';
import { CatalogApi } from '../infrastructure/catalog-api';
import { FuelProduct } from '../domain/model/fuel-product.entity';
import { InventoryItem } from '../domain/model/inventory-item.entity';
import { CreateProductCommand } from '../domain/model/create-product.command';
import { UpdateProductCommand } from '../domain/model/update-product.command';
import { UpdateStockCommand } from '../domain/model/update-stock.command';
import { ReserveStockCommand } from '../domain/model/reserve-stock.command';

/**
 * @summary Store para gestión de estado del BC Catalog.
 * @remarks Maneja productos de combustible e inventario usando signals.
 * Expone selectores computados y comandos para el presentation layer.
 * @author FullTank Platform
 */
@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly api = inject(CatalogApi);

  // ── State ────────────────────────────────────────────────────────────────
  private readonly _productList = signal<FuelProduct[]>([]);
  private readonly _selectedProduct = signal<FuelProduct | null>(null);
  private readonly _inventoryList = signal<InventoryItem[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _successMsg = signal<string | null>(null);

  // ── Selectors (readonly) ─────────────────────────────────────────────────
  readonly productList = this._productList.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();
  readonly inventoryList = this._inventoryList.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly successMsg = this._successMsg.asReadonly();

  // Selectores Computados
  readonly activeProducts = computed(() =>
    this._productList().filter((p) => p.isActive),
  );
  readonly dieselProducts = computed(() =>
    this._productList().filter((p) => p.type === 'DIESEL'),
  );
  readonly gasolineProducts = computed(() =>
    this._productList().filter((p) => p.type.startsWith('GASOLINE')),
  );
  readonly lowStockItems = computed(() =>
    this._inventoryList().filter((i) => i.availableQuantity < 1000),
  );

  // ── Products CRUD ────────────────────────────────────────────────────────

  loadAllProducts(): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.api
      .getAllProducts()
      .pipe(retry(2))
      .subscribe({
        next: (products: FuelProduct[]) => {
          this._productList.set(products);
          this._isLoading.set(false);
        },
        error: (err: any) => {
          this._error.set(this.formatError(err, 'Failed to load products'));
          this._isLoading.set(false);
        },
      });
  }

  loadActiveProducts(): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.api
      .getActiveProducts()
      .pipe(retry(2))
      .subscribe({
        next: (products: FuelProduct[]) => {
          this._productList.set(products);
          this._isLoading.set(false);
        },
        error: (err: any) => {
          this._error.set(this.formatError(err, 'Failed to load active products'));
          this._isLoading.set(false);
        },
      });
  }

  loadProductById(productId: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.api
      .getProductById(productId)
      .pipe(retry(2))
      .subscribe({
        next: (product: FuelProduct) => {
          this._selectedProduct.set(product);
          this._isLoading.set(false);
        },
        error: (err: any) => {
          this._error.set(this.formatError(err, `Failed to load product ${productId}`));
          this._isLoading.set(false);
        },
      });
  }

  createProduct(command: CreateProductCommand, onSuccess?: () => void): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.api
      .createProduct(command as any)
      .pipe(retry(2))
      .subscribe({
        next: (product: FuelProduct) => {
          this._productList.update((list) => [...list, product]);
          this._successMsg.set('Product created successfully');
          this._isLoading.set(false);
          onSuccess?.();
        },
        error: (err: any) => {
          this._error.set(this.formatError(err, 'Failed to create product'));
          this._isLoading.set(false);
        },
      });
  }

  updateProduct(productId: string, command: UpdateProductCommand, onSuccess?: () => void): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.api
      .updateProduct(productId, command as any)
      .pipe(retry(2))
      .subscribe({
        next: (product: FuelProduct) => {
          this._productList.update((list) =>
            list.map((p) => (p.id === productId ? product : p)),
          );
          this._successMsg.set('Product updated successfully');
          this._isLoading.set(false);
          onSuccess?.();
        },
        error: (err: any) => {
          this._error.set(this.formatError(err, 'Failed to update product'));
          this._isLoading.set(false);
        },
      });
  }

  deleteProduct(productId: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.api
      .deleteProduct(productId)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this._productList.update((list) => list.filter((p) => p.id !== productId));
          this._successMsg.set('Product deleted successfully');
          this._isLoading.set(false);
        },
        error: (err: any) => {
          this._error.set(this.formatError(err, 'Failed to delete product'));
          this._isLoading.set(false);
        },
      });
  }

  // ── Inventory ────────────────────────────────────────────────────────────

  loadInventoryByProvider(providerId: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.api
      .getInventoryByProvider(providerId)
      .pipe(retry(2))
      .subscribe({
        next: (inventory: InventoryItem[]) => {
          this._inventoryList.set(inventory);
          this._isLoading.set(false);
        },
        error: (err: any) => {
          this._error.set(this.formatError(err, 'Failed to load inventory'));
          this._isLoading.set(false);
        },
      });
  }

  loadInventoryByProduct(productId: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.api
      .getInventoryByProduct(productId)
      .pipe(retry(2))
      .subscribe({
        next: (inventory: InventoryItem[]) => {
          this._inventoryList.set(inventory);
          this._isLoading.set(false);
        },
        error: (err: any) => {
          this._error.set(this.formatError(err, 'Failed to load inventory'));
          this._isLoading.set(false);
        },
      });
  }

  updateStock(inventoryItemId: string, command: UpdateStockCommand): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.api
      .updateStock(inventoryItemId, command as any)
      .pipe(retry(2))
      .subscribe({
        next: (item: InventoryItem) => {
          this._inventoryList.update((list) =>
            list.map((i) => (i.id === inventoryItemId ? item : i)),
          );
          this._successMsg.set('Stock updated successfully');
          this._isLoading.set(false);
        },
        error: (err: any) => {
          this._error.set(this.formatError(err, 'Failed to update stock'));
          this._isLoading.set(false);
        },
      });
  }

  reserveStock(inventoryItemId: string, command: ReserveStockCommand): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.api
      .reserveStock(inventoryItemId, command as any)
      .pipe(retry(2))
      .subscribe({
        next: (item: InventoryItem) => {
          this._inventoryList.update((list) =>
            list.map((i) => (i.id === inventoryItemId ? item : i)),
          );
          this._successMsg.set('Stock reserved successfully');
          this._isLoading.set(false);
        },
        error: (err: any) => {
          this._error.set(this.formatError(err, 'Failed to reserve stock'));
          this._isLoading.set(false);
        },
      });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  clearMessages(): void {
    this._error.set(null);
    this._successMsg.set(null);
  }

  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not Found`
        : error.message;
    }
    return fallback;
  }
}
