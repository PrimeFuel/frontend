import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * @summary Resource DTO para entregas.
 * @remarks Define la estructura de respuesta del backend para entregas.
 * @author FullTank Platform
 */
export interface DeliveryResource extends BaseResource {
  id: string;
  orderId: string;
  vehicleId: string;
  driverId: string;
  status: string;
  scheduledDate: string;
  actualDeliveryDate: string | null;
  notes: string;
  createdAt: string;
}

export interface DeliveriesResponse extends BaseResponse {
  deliveries: DeliveryResource[];
}
