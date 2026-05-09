import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * @summary Resource DTO para vehículos.
 * @remarks Define la estructura de respuesta del backend para vehículos.
 * @author FullTank Platform
 */
export interface VehicleResource extends BaseResource {
  id: string;
  providerId: string;
  licensePlate: string;
  model: string;
  brand: string;
  capacity: number;
  unit: string;
  status: string;
  createdAt: string;
}

export interface VehiclesResponse extends BaseResponse {
  vehicles: VehicleResource[];
}
