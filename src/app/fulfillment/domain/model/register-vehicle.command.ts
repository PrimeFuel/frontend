/**
 * @summary Comando para registrar un nuevo vehículo.
 * @remarks Define los datos necesarios para dar de alta un vehículo
 * en la flota del proveedor. Utilizado por proveedores.
 * @author FullTank Platform
 */
export interface RegisterVehicleCommand {
  providerId: string;
  licensePlate: string;
  model: string;
  brand: string;
  capacity: number;
  unit: string; // LITERS, GALLONS
}
