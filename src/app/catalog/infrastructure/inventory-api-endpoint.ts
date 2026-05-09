import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { InventoryItem } from '../domain/model/inventory-item.entity';
import { InventoryResource, InventoriesResponse } from './inventory-response';
import { InventoryAssembler } from './inventory-assembler';
import { UpdateStockRequest, ReserveStockRequest } from './inventory.request';

const inventoryEndpointUrl = `${environment.serverBasePath}${environment.catalogInventoryEndpointPath}`;

export class InventoryApiEndpoint extends BaseApiEndpoint<
  InventoryItem,
  InventoryResource,
  InventoriesResponse,
  InventoryAssembler
> {
  constructor(http: HttpClient) {
    super(http, inventoryEndpointUrl, new InventoryAssembler());
  }

  private extractInventory(response: any): InventoryItem[] {
    const items: InventoryResource[] = Array.isArray(response)
      ? response
      : (response.inventory ?? response.inventories ?? []);
    return items.map((i) => this.assembler.toEntityFromResource(i));
  }

  getInventoryByProvider(providerId: string): Observable<InventoryItem[]> {
    return this.http.get<any>(this.endpointUrl).pipe(
      map((response) =>
        this.extractInventory(response).filter((i) => i.providerId === providerId),
      ),
      catchError(this.handleError(`Failed to fetch inventory for provider ${providerId}`)),
    );
  }

  getInventoryByProduct(productId: string): Observable<InventoryItem[]> {
    return this.http.get<any>(this.endpointUrl).pipe(
      map((response) =>
        this.extractInventory(response).filter((i) => i.productId === productId),
      ),
      catchError(this.handleError(`Failed to fetch inventory for product ${productId}`)),
    );
  }

  updateStock(inventoryItemId: string, request: UpdateStockRequest): Observable<InventoryItem> {
    return this.http
      .put<InventoryResource>(`${this.endpointUrl}/${inventoryItemId}`, request)
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError(`Failed to update stock for inventory item ${inventoryItemId}`)),
      );
  }

  reserveStock(inventoryItemId: string, request: ReserveStockRequest): Observable<InventoryItem> {
    return this.http
      .post<InventoryResource>(`${this.endpointUrl}/${inventoryItemId}/reserve`, request)
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError(`Failed to reserve stock for inventory item ${inventoryItemId}`)),
      );
  }
}