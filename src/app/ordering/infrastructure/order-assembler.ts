import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Order } from '../domain/model/order.entity';
import { OrderResource, OrdersResponse } from './orders-response';

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export class OrderAssembler implements BaseAssembler<Order, OrderResource, OrdersResponse> {
  toEntityFromResource(resource: OrderResource): Order {
    const companyId = toNumber(resource.companyId ?? resource.buyerCompanyId ?? resource.clientId ?? resource.clientid);
    const providerId = resource.providerId ?? resource.providerid ?? '';
    const productId = resource.fuelProductId ?? resource.fuelProductid ?? resource.productId ?? resource.productid ?? '';
    const quantity = Number(resource.quantity ?? resource.requestedQuantity ?? 0);
    const totalAmount = Number(resource.totalAmount ?? resource.totalPrice ?? 0);

    return new Order({
      id: resource.id ?? '',
      requestId: resource.requestId ?? resource.id ?? '',
      clientId: resource.clientId ?? resource.clientid ?? companyId ?? '',
      companyId,
      providerId,
      productId,
      quantity,
      unit: resource.unit ?? 'LITERS',
      unitPrice: resource.unitPrice ?? (quantity ? totalAmount / quantity : 0),
      totalAmount,
      equipmentId: resource.equipmentId ?? null,
      driverId: resource.driverId ?? null,
      vehicleId: resource.vehicleId ?? null,
      deliveryAddress: resource.deliveryAddress ?? '',
      estimatedDeliveryDate: resource.estimatedDeliveryDate ?? resource.scheduledDate ?? null,
      status: resource.status ?? 'CREATED',
      paymentStatus: resource.paymentStatus ?? null,
      dispatchedAt: resource.dispatchedAt ?? null,
      deliveredAt: resource.deliveredAt ?? null,
      closedAt: resource.closedAt ?? null,
      createdAt: resource.createdAt ?? resource.scheduledDate ?? new Date().toISOString(),
      updatedAt: resource.updatedAt ?? new Date().toISOString(),
    });
  }

  toResourceFromEntity(entity: Order): OrderResource {
    const companyId = toNumber(entity.companyId ?? entity.clientId);
    const providerId = toNumber(entity.providerId);
    const fuelProductId = toNumber(entity.productId);
    const equipmentId = toNumber(entity.equipmentId);

    return {
      id: entity.id || '',
      companyId: companyId ?? undefined,
      providerId: providerId ?? undefined,
      fuelProductId: fuelProductId ?? undefined,
      equipmentId,
      requestedQuantity: entity.quantity,
      totalPrice: entity.totalAmount,
      deliveryAddress: entity.deliveryAddress,
      scheduledDate: entity.estimatedDeliveryDate?.slice(0, 10) ?? null,
      status: entity.status,
    };
  }

  toEntitiesFromResponse(response: OrdersResponse): Order[] {
    return (response.orders ?? []).map((resource) => this.toEntityFromResource(resource));
  }
}
