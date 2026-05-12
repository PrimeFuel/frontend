import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { InventoryItem } from '../domain/model/inventory-item.entity';
import { InventoryResource, InventoriesResponse } from './inventory-response';

/**
 * @summary Assembler para transformar inventario entre capas.
 * @remarks Convierte InventoryResource ↔ InventoryItem entity.
 * @author FullTank Platform
 */
export class InventoryAssembler
  implements BaseAssembler<InventoryItem, InventoryResource, InventoriesResponse>
{
  toEntitiesFromResponse(response: InventoriesResponse): InventoryItem[] {
    return response.inventories.map((resource) => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: InventoryResource): InventoryItem {
    return new InventoryItem({
      id: resource.id,
      productId: resource.productId,
      providerId: resource.providerId,
      availableQuantity: resource.availableQuantity,
      reservedQuantity: resource.reservedQuantity,
      unit: resource.unit,
      lastUpdated: resource.lastUpdated,
    });
  }

  toResourceFromEntity(entity: InventoryItem): InventoryResource {
    return {
      id: entity.id,
      productId: entity.productId,
      providerId: entity.providerId,
      availableQuantity: entity.availableQuantity,
      reservedQuantity: entity.reservedQuantity,
      unit: entity.unit,
      lastUpdated: entity.lastUpdated,
    } as InventoryResource;
  }
}
