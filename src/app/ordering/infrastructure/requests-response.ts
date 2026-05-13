import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * @summary Resource DTO para solicitudes de combustible.
 * @remarks Define la estructura de respuesta del backend para Requests.
 * @author FullTank Platform
 */
export interface RequestResource extends BaseResource {
  id: string;
  clientId: string;
  providerId: string;
  productId: string;
  quantity: number;
  unit: string;
  desiredDeliveryDate: string;
  deliveryAddress: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestsResponse extends BaseResponse {
  requests: RequestResource[];
}
