/**
 * @summary Comando para actualizar el stock de inventario.
 * @remarks Permite a proveedores actualizar la cantidad disponible
 * de combustible en su inventario.
 * @author FullTank Platform
 */
export interface UpdateStockCommand {
  inventoryItemId: string;
  availableQuantity: number;
}
