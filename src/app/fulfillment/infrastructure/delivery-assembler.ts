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
    const dispatchedAt = resource.dispatchedAt ?? null;
    const deliveredAt = resource.deliveredAt ?? resource.actualDeliveryDate ?? null;
    return new Delivery({
      id: String(resource.id),
      orderId: String(resource.orderId),
      providerId: String(resource.providerId),
      vehicleId: resource.vehicleId ?? resource.vehiclePlate ?? '',
      driverId: resource.driverId ?? resource.driverName ?? '',
      status: resource.status,
      scheduledDate: resource.scheduledDate ?? '',
      actualDeliveryDate: deliveredAt,
      notes: resource.notes,
      createdAt: resource.createdAt ?? dispatchedAt ?? deliveredAt ?? '',
    });
  }

  toResourceFromEntity(entity: Delivery): DeliveryResource {
    return {
      id: entity.id,
      orderId: entity.orderId,
      providerId: entity.providerId,
      vehicleId: entity.vehicleId,
      driverId: entity.driverId,
      status: entity.status,
      scheduledDate: entity.scheduledDate,
      deliveredAt: entity.actualDeliveryDate,
      actualDeliveryDate: entity.actualDeliveryDate,
      notes: entity.notes,
      createdAt: entity.createdAt,
    } as DeliveryResource;
  }
}
