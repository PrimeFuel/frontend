import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Order } from '../domain/model/order.entity';
import { OrderResource, OrdersResponse } from './orders-response';

export class OrderAssembler implements BaseAssembler<Order, OrderResource, OrdersResponse> {

  toEntityFromResource(resource: OrderResource): Order {
    return new Order({
      id: resource.id,
      requestId: resource.requestId,
      clientId: resource.clientId,
      providerId: resource.providerId,
      productId: resource.productId,
      quantity: resource.quantity,
      unit: resource.unit,
      totalAmount: resource.totalAmount,
      deliveryAddress: resource.deliveryAddress,
      status: resource.status,
      dispatchedAt: resource.dispatchedAt,
      deliveredAt: resource.deliveredAt,
      closedAt: resource.closedAt,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    });
  }

  toResourceFromEntity(entity: Order): OrderResource {
    const resource: any = {
      requestId: entity.requestId,
      clientId: entity.clientId,
      providerId: entity.providerId,
      productId: entity.productId,
      quantity: entity.quantity,
      unit: entity.unit,
      totalAmount: entity.totalAmount,
      deliveryAddress: entity.deliveryAddress,
      status: entity.status,
      dispatchedAt: entity.dispatchedAt,
      deliveredAt: entity.deliveredAt,
      closedAt: entity.closedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    // Solo incluir id cuando existe (PUT de actualización).
    if (entity.id) {
      resource.id = entity.id;
    }
    return resource as OrderResource;
  }

  toEntitiesFromResponse(response: OrdersResponse): Order[] {
    return response.orders.map(resource => this.toEntityFromResource(resource as OrderResource));
  }

}
