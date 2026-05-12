import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * @summary Resource DTO para productos de combustible.
 * @remarks Define la estructura de respuesta del backend para productos.
 * @author FullTank Platform
 */
export interface ProductResource extends BaseResource {
  id: string;
  name: string;
  type: string;
  description: string;
  pricePerLiter: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductsResponse extends BaseResponse {
  products: ProductResource[];
}
