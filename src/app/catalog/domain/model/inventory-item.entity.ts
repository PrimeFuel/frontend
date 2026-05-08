import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * @summary Entidad de dominio que representa un ítem de inventario.
 * @remarks Almacena el stock disponible de cada producto de combustible
 * por proveedor. Permite controlar disponibilidad antes de procesar pedidos.
 * @author FullTank Platform
 */
export class InventoryItem implements BaseEntity {
  id: string;
  productId: string;
  providerId: string;
  availableQuantity: number;
  reservedQuantity: number;
  unit: string; // LITERS, GALLONS
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
