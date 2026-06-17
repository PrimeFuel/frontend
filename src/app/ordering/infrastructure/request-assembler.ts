import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Request } from '../domain/model/request.entity';
import { RequestResource, RequestsResponse } from './requests-response';

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export class RequestAssembler implements BaseAssembler<Request, RequestResource, RequestsResponse> {
  toEntityFromResource(resource: RequestResource): Request {
    const companyId = toNumber(resource.buyerCompanyId ?? resource.companyId ?? resource.clientId ?? resource.clientid);
    const providerId = resource.providerId ?? resource.providerid ?? '';
    const productId = resource.fuelProductId ?? resource.fuelProductid ?? resource.productId ?? resource.productid ?? '';
    const rejectionReason = resource.rejectionReason ?? resource.rejectionReasonNote ?? null;

    return new Request({
      id: resource.id ?? '',
      clientId: resource.clientId ?? resource.clientid ?? companyId ?? '',
      companyId,
      providerId,
      productId,
      equipmentId: resource.equipmentId ?? null,
      fuelType: resource.fuelType ?? '',
      productName: resource.productName ?? '',
      quantity: resource.quantity ?? 0,
      unit: resource.unit ?? 'LITERS',
      unitPrice: resource.unitPrice ?? 0,
      desiredDeliveryDate: resource.desiredDeliveryDate ?? resource.deliveryDate ?? '',
      deliveryAddress: resource.deliveryAddress ?? '',
      status: resource.status ?? 'PENDING',
      source: resource.source ?? 'MANUAL',
      rejectionReason,
      createdAt: resource.createdAt ?? new Date().toISOString(),
      updatedAt: resource.updatedAt ?? resource.createdAt ?? new Date().toISOString(),
    });
  }

  toResourceFromEntity(entity: Request): RequestResource {
    const buyerCompanyId = toNumber(entity.companyId ?? entity.clientId);
    const providerId = toNumber(entity.providerId);
    const fuelProductId = toNumber(entity.productId);
    const equipmentId = toNumber(entity.equipmentId);
    const deliveryDate = entity.desiredDeliveryDate ? entity.desiredDeliveryDate.slice(0, 10) : '';

    return {
      id: entity.id || '',
      buyerCompanyId: buyerCompanyId ?? undefined,
      providerId: providerId ?? undefined,
      equipmentId,
      fuelProductId: fuelProductId ?? undefined,
      fuelType: entity.fuelType,
      productName: entity.productName,
      quantity: entity.quantity,
      unit: entity.unit,
      unitPrice: entity.unitPrice,
      deliveryAddress: entity.deliveryAddress,
      deliveryDate,
      source: entity.source || 'MANUAL',
    };
  }

  toEntitiesFromResponse(response: RequestsResponse): Request[] {
    return (response.requests ?? []).map((resource) => this.toEntityFromResource(resource));
  }
}
