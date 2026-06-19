import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface OrderResource extends BaseResource {
  id: string;
  requestId: string;
  clientId: string;
  providerId: string;
  productId: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  deliveryAddress: string;
  status: string;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse extends BaseResponse {
  orders: OrderResource[];
}
