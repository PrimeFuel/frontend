/**
 * @summary Request DTO para operaciones de inventario.
 * @remarks Define los payloads para actualizar y reservar stock.
 * @author FullTank Platform
 */
export interface UpdateStockRequest {
  availableQuantity: number;
}

export interface ReserveStockRequest {
  quantityToReserve: number;
}
