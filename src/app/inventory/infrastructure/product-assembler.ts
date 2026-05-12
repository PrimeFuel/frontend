import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { FuelProduct } from '../domain/model/fuel-product.entity';
import { ProductResource, ProductsResponse } from './product-response';

/**
 * @summary Assembler para transformar productos entre capas.
 * @remarks Convierte ProductResource ↔ FuelProduct entity.
 * @author FullTank Platform
 */
export class ProductAssembler
  implements BaseAssembler<FuelProduct, ProductResource, ProductsResponse>
{
  toEntitiesFromResponse(response: ProductsResponse): FuelProduct[] {
    return response.products.map((resource) => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: ProductResource): FuelProduct {
    return new FuelProduct({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      description: resource.description,
      pricePerLiter: resource.pricePerLiter,
      unit: resource.unit,
      isActive: resource.isActive,
      createdAt: resource.createdAt,
    });
  }

  toResourceFromEntity(entity: FuelProduct): ProductResource {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      description: entity.description,
      pricePerLiter: entity.pricePerLiter,
      unit: entity.unit,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    } as ProductResource;
  }
}
