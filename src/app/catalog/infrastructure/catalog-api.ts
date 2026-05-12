import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';

import {
  FuelProduct,
  CreateProductPayload,
  UpdateProductPayload
} from '../domain/model/fuel-product.entity';

import {
  InventoryItem,
  UpdateStockPayload,
  ReserveStockPayload
} from '../domain/model/inventory-item.entity';

import { ProductApiEndpoint } from './product-api-endpoint';
import { InventoryApiEndpoint } from './inventory-api-endpoint';

/**
 * @summary API gateway para el bounded context Catalog.
 * @remarks Agrega ProductApiEndpoint e InventoryApiEndpoint,
 * exponiendo operaciones de catálogo e inventario al application layer.
 * @author FullTank Platform
 */
@Injectable({ providedIn: 'root' })
export class CatalogApi extends BaseApi {

  private readonly _productEndpoint: ProductApiEndpoint;
  private readonly _inventoryEndpoint: InventoryApiEndpoint;

  constructor(http: HttpClient) {
    super();

    this._productEndpoint = new ProductApiEndpoint(http);
    this._inventoryEndpoint = new InventoryApiEndpoint(http);
  }

  // ── Products ─────────────────────────────────────────────────────────────

  getAllProducts(): Observable<FuelProduct[]> {
    return this._productEndpoint.getAll();
  }

  getActiveProducts(): Observable<FuelProduct[]> {
    return this._productEndpoint.getActiveProducts();
  }

  getProductById(productId: string): Observable<FuelProduct> {
    return this._productEndpoint.getById(productId);
  }

  createProduct(
    request: CreateProductPayload
  ): Observable<FuelProduct> {

    return this._productEndpoint.createProduct(request);
  }

  updateProduct(
    productId: string,
    request: UpdateProductPayload
  ): Observable<FuelProduct> {

    return this._productEndpoint.updateProduct(
      productId,
      request
    );
  }

  deleteProduct(productId: string): Observable<void> {
    return this._productEndpoint.delete(productId);
  }

  // ── Inventory ────────────────────────────────────────────────────────────

  getInventoryByProvider(
    providerId: string
  ): Observable<InventoryItem[]> {

    return this._inventoryEndpoint
      .getInventoryByProvider(providerId);
  }

  getInventoryByProduct(
    productId: string
  ): Observable<InventoryItem[]> {

    return this._inventoryEndpoint
      .getInventoryByProduct(productId);
  }

  updateStock(
    inventoryItemId: string,
    request: UpdateStockPayload
  ): Observable<InventoryItem> {

    return this._inventoryEndpoint
      .updateStock(inventoryItemId, request);
  }

  reserveStock(
    inventoryItemId: string,
    request: ReserveStockPayload
  ): Observable<InventoryItem> {

    return this._inventoryEndpoint
      .reserveStock(inventoryItemId, request);
  }
}
