import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Delivery } from '../domain/model/delivery.entity';
import { DeliveryResource, DeliveriesResponse } from './delivery-response';

/**
 * @summary Assembler para transformar entregas entre capas.
 * @remarks Convierte DeliveryResource ↔ Delivery entity.
 * @author FullTank Platform
 */
export class DeliveryAssembler
  implements BaseAssembler<Delivery, DeliveryResource, DeliveriesResponse>
{
  toEntitiesFromResponse(response: DeliveriesResponse): Delivery[] {
    return response.deliveries.map((resource) => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: DeliveryResource): Delivery {
    return new Delivery({
      id: resource.id,
      orderId: resource.orderId,
      vehicleId: resource.vehicleId,
      driverId: resource.driverId,
      status: resource.status,
      scheduledDate: resource.scheduledDate,
      actualDeliveryDate: resource.actualDeliveryDate,
      notes: resource.notes,
      createdAt: resource.createdAt,
    });
  }

  toResourceFromEntity(entity: Delivery): DeliveryResource {
    return {
      id: entity.id,
      orderId: entity.orderId,
      vehicleId: entity.vehicleId,
      driverId: entity.driverId,
      status: entity.status,
      scheduledDate: entity.scheduledDate,
      actualDeliveryDate: entity.actualDeliveryDate,
      notes: entity.notes,
      createdAt: entity.createdAt,
    } as DeliveryResource;
  }
}
