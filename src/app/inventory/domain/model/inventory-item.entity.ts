import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class InventoryItem implements BaseEntity {
  id: string;
  productId: string;
  providerId: string;
  availableQuantity: number;
  reservedQuantity: number;
  unit: string;
  lastUpdated: string;

  constructor(params: {
    id: string;
    productId: string;
    providerId: string;
    availableQuantity: number;
    reservedQuantity: number;
    unit: string;
    lastUpdated: string;
  }) {
    this.id = params.id;
    this.productId = params.productId;
    this.providerId = params.providerId;
    this.availableQuantity = params.availableQuantity;
    this.reservedQuantity = params.reservedQuantity;
    this.unit = params.unit;
    this.lastUpdated = params.lastUpdated;
  }
}

export interface UpdateStockPayload {
  availableQuantity: number;
}

export interface ReserveStockPayload {
  quantityToReserve: number;
}
