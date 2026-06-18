import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface OrderResource extends BaseResource {
  id: string;
  requestId?: string | number | null;
  clientId?: string | number;
  clientid?: string | number;
  companyId?: number;
  buyerCompanyId?: number;
  providerId?: string | number;
  providerid?: string | number;
  productId?: string | number;
  productid?: string | number;
  fuelProductId?: string | number;
  fuelProductid?: string | number;
  equipmentId?: number | string | null;
  quantity?: number;
  requestedQuantity?: number;
  unit?: string;
  unitPrice?: number;
  totalAmount?: number;
  totalPrice?: number;
  deliveryAddress?: string;
  scheduledDate?: string | null;
  estimatedDeliveryDate?: string | null;
  status?: string;
  paymentStatus?: string;
  driverId?: string | number | null;
  vehicleId?: string | number | null;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;
  closedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrdersResponse extends BaseResponse {
  orders: OrderResource[];
}
