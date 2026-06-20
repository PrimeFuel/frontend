import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import {
  InventoryItem,
  UpdateStockPayload,
  ReserveStockPayload
} from '../domain/model/inventory-item.entity';import { InventoryResource, InventoriesResponse } from './inventory-response';
import { InventoryAssembler } from './inventory-assembler';

const inventoryEndpointUrl = `${environment.serverBasePath}${environment.inventoryEndpointPath}`;

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
    return this.http.get<InventoryResource[]>(`${this.endpointUrl}/provider/${providerId}`).pipe(
      map((response) => this.extractInventory(response)),
      catchError(this.handleError(`Failed to fetch inventory for provider ${providerId}`)),
    );
  }

  getInventoryByProduct(productId: string): Observable<InventoryItem[]> {
    return this.http.get<InventoryResource>(`${this.endpointUrl}/${productId}`).pipe(
      map((response) => [this.assembler.toEntityFromResource(response)]),
      catchError(this.handleError(`Failed to fetch inventory for product ${productId}`)),
    );
  }

  updateStock(inventoryItemId: string, request: UpdateStockPayload): Observable<InventoryItem> {
    return this.http
      .post<InventoryResource>(`${this.endpointUrl}/${inventoryItemId}/update-stock`, {
        newStock: request.availableQuantity,
      })
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError(`Failed to update stock for inventory item ${inventoryItemId}`)),
      );
  }

  reserveStock(inventoryItemId: string, request: ReserveStockPayload): Observable<InventoryItem> {
    return this.getInventoryByProduct(inventoryItemId).pipe(
      map(([item]) => {
        if (!item) return this.emptyInventoryItem(inventoryItemId);
        return new InventoryItem({
          ...item,
          availableQuantity: Math.max(0, item.availableQuantity - request.quantityToReserve),
          reservedQuantity: item.reservedQuantity + request.quantityToReserve,
        });
      }),
      catchError(() => of(this.emptyInventoryItem(inventoryItemId))),
    );
  }

  private emptyInventoryItem(id: string): InventoryItem {
    return new InventoryItem({
      id,
      productId: id,
      providerId: '',
      availableQuantity: 0,
      reservedQuantity: 0,
      unit: 'LITERS',
      lastUpdated: '',
    });
  }
}
