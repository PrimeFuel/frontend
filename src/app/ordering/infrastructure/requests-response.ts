import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface RequestResource extends BaseResource {
  id: string;
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
  fuelType?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  desiredDeliveryDate?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  status?: string;
  source?: string;
  rejectionReason?: string | null;
  rejectionReasonCode?: string | null;
  rejectionReasonNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequestsResponse extends BaseResponse {
  requests: RequestResource[];
}
