/**
 * @summary Comando para crear un nuevo producto de combustible.
 * @remarks Define los datos necesarios para registrar un producto
 * en el catálogo de FullTank. Utilizado por proveedores.
 * @author FullTank Platform
 */
export interface CreateProductCommand {
  name: string;
  type: string; // DIESEL, GASOLINE_90, GASOLINE_95, GASOLINE_97
  description: string;
  pricePerLiter: number;
  unit: string; // LITERS, GALLONS
}
