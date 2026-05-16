import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * @summary Resource DTO para ítems de inventario.
 * @remarks Define la estructura de respuesta del backend para inventario.
 * @author FullTank Platform
 */
export interface InventoryResource extends BaseResource {
  id: string;
  productId: string;
  providerId: string;
  availableQuantity: number;
  reservedQuantity: number;
  unit: string;
  lastUpdated: string;
}

export interface InventoriesResponse extends BaseResponse {
  inventories: InventoryResource[];
}
