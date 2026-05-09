/**
 * @summary Comando para actualizar un producto existente.
 * @remarks Permite modificar precio, descripción y estado de activación
 * de productos en el catálogo.
 * @author FullTank Platform
 */
export interface UpdateProductCommand {
  productId: string;
  name?: string;
  type?: string;
  description?: string;
  pricePerLiter?: number;
  unit?: string;
  isActive?: boolean;
}
