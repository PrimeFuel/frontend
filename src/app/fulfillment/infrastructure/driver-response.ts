import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * @summary Resource DTO para conductores.
 * @remarks Define la estructura de respuesta del backend para conductores.
 * @author FullTank Platform
 */
export interface DriverResource extends BaseResource {
  id: string;
  providerId: string;
  // Backend uses a single `name` + `phone`; firstName/lastName/phoneNumber are
  // the frontend split kept for backward compatibility.
  name?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  licenseNumber: string;
  phoneNumber?: string;
  email: string;
  status: string;
  createdAt?: string;
}

export interface DriversResponse extends BaseResponse {
  drivers: DriverResource[];
}
