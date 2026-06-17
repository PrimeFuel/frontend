import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { CatalogProduct } from '../domain/model/catalog-product.entity';
import { CatalogProductResource, CatalogProductsResponse } from './catalog-product-response';

export class CatalogProductAssembler implements BaseAssembler<CatalogProduct, CatalogProductResource, CatalogProductsResponse> {
  toEntityFromResource(resource: CatalogProductResource): CatalogProduct {
    return new CatalogProduct({
      id: String(resource.id),
      providerId: resource.providerId,
      fuelType: resource.fuelType,
      name: resource.name,
      description: resource.description ?? '',
      pricePerLiter: resource.pricePerLiter ?? resource.pricePerUnit ?? 0,
      unit: resource.unit,
      available: resource.active ?? resource.available ?? true,
      stock: resource.stock ?? resource.availableStock,
    });
  }

  toResourceFromEntity(entity: CatalogProduct): CatalogProductResource {
    return {
      id: entity.id,
      providerId: entity.providerId,
      fuelType: entity.fuelType,
      name: entity.name,
      description: entity.description,
      pricePerLiter: entity.pricePerLiter,
      pricePerUnit: entity.pricePerLiter,
      unit: entity.unit,
      available: entity.available,
      stock: entity.stock,
      availableStock: entity.stock,
    };
  }

  toEntitiesFromResponse(response: CatalogProductsResponse): CatalogProduct[] {
    return response.products.map((r) => this.toEntityFromResource(r));
  }
}
