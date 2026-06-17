import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface CatalogProductResource extends BaseResource {
  id: string;
  providerId: number;
  fuelType: string;
  name: string;
  description?: string;
  pricePerLiter?: number;
  pricePerUnit?: number;
  unit: string;
  available?: boolean;
  active?: boolean;
  stock?: number;
  availableStock?: number;
}

export interface CatalogProductsResponse extends BaseResponse {
  products: CatalogProductResource[];
}
