/**
 * @summary Request DTO para operaciones de productos de combustible.
 * @remarks Define los payloads para crear y actualizar productos en el backend.
 * @author FullTank Platform
 */
export interface CreateProductRequest {
  name: string;
  type: string;
  description: string;
  pricePerLiter: number;
  unit: string;
}

export interface UpdateProductRequest {
  name?: string;
  type?: string;
  description?: string;
  pricePerLiter?: number;
  unit?: string;
  isActive?: boolean;
}
