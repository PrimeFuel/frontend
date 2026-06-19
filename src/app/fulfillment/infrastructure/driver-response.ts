import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * @summary Resource DTO para conductores.
 * @remarks Define la estructura de respuesta del backend para conductores.
 * @author FullTank Platform
 */
export interface DriverResource extends BaseResource {
  id: string;
  providerId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface DriversResponse extends BaseResponse {
  drivers: DriverResource[];
}
