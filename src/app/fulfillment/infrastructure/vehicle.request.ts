/**
 * @summary Request DTO para operaciones de vehículos.
 * @remarks Define los payloads para crear y actualizar vehículos en el backend.
 * @author FullTank Platform
 */
export interface RegisterVehicleRequest {
  providerId: string;
  licensePlate: string;
  model: string;
  brand: string;
  capacity: number;
  unit: string;
}

export interface UpdateVehicleStatusRequest {
  status: string;
}
