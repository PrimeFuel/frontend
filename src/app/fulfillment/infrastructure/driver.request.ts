/**
 * @summary Request DTO para operaciones de conductores.
 * @remarks Define los payloads para crear y actualizar conductores en el backend.
 * @author FullTank Platform
 */
export interface RegisterDriverRequest {
  providerId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  status: string;
}

export interface UpdateDriverStatusRequest {
  status: string;
}

export interface UpdateDriverRequest {
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  email?: string;
  status?: string; // ← esto falta

}
