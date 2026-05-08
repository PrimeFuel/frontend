import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { InventoryItem } from '../domain/model/inventory-item.entity';
import { InventoryResource, InventoriesResponse } from './inventory-response';
import { InventoryAssembler } from './inventory-assembler';
import { UpdateStockRequest, ReserveStockRequest } from './inventory.request';

const catalogEndpointUrl = `${environment.serverBasePath}${environment.catalogEndpointPath}`;

/**
 * @summary Endpoint API para gestión de inventario de combustible.
 * @remarks Expone operaciones para consultar y actualizar stock.
 * @author FullTank Platform
 */
export class InventoryApiEndpoint extends BaseApiEndpoint<
  InventoryItem,
  InventoryResource,
  InventoriesResponse,
  InventoryAssembler
> {
  constructor(http: HttpClient) {
    super(http, catalogEndpointUrl, new InventoryAssembler());
  }

  /**
   * Obtiene el inventario de un proveedor específico.
   */
  getInventoryByProvider(providerId: string): Observable<InventoryItem[]> {
    return this.http.get<InventoriesResponse>(`${this.endpointUrl}/inventory/provider/${providerId}`).pipe(
      map((response) => this.assembler.toEntitiesFromResponse(response)),
      catchError(this.handleError(`Failed to fetch inventory for provider ${providerId}`)),
    );
  }

  /**
   * Obtiene el inventario de un producto específico.
   */
  getInventoryByProduct(productId: string): Observable<InventoryItem[]> {
    return this.http.get<InventoriesResponse>(`${this.endpointUrl}/inventory/product/${productId}`).pipe(
      map((response) => this.assembler.toEntitiesFromResponse(response)),
      catchError(this.handleError(`Failed to fetch inventory for product ${productId}`)),
    );
  }

  /**
   * Actualiza el stock disponible.
   */
  updateStock(inventoryItemId: string, request: UpdateStockRequest): Observable<InventoryItem> {
    return this.http.put<InventoryResource>(`${this.endpointUrl}/inventory/${inventoryItemId}`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to update stock for inventory item ${inventoryItemId}`)),
    );
  }

  /**
   * Reserva stock durante el proceso de pedido.
   */
  reserveStock(inventoryItemId: string, request: ReserveStockRequest): Observable<InventoryItem> {
    return this.http.post<InventoryResource>(`${this.endpointUrl}/inventory/${inventoryItemId}/reserve`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to reserve stock for inventory item ${inventoryItemId}`)),
    );
  }
}
