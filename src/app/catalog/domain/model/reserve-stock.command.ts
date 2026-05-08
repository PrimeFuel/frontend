/**
 * @summary Comando para reservar stock durante el proceso de pedido.
 * @remarks Reserva temporalmente combustible cuando se acepta una solicitud,
 * evitando sobreventa mientras se confirma el pago.
 * @author FullTank Platform
 */
export interface ReserveStockCommand {
  inventoryItemId: string;
  quantityToReserve: number;
}
