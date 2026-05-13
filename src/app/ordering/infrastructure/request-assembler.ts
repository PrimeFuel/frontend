import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Request } from '../domain/model/request.entity';
import { RequestResource, RequestsResponse } from './requests-response';

export class RequestAssembler implements BaseAssembler<Request, RequestResource, RequestsResponse> {

  toEntityFromResource(resource: RequestResource): Request {
    return new Request({
      id: resource.id,
      clientId: resource.clientId,
      providerId: resource.providerId,
      productId: resource.productId,
      quantity: resource.quantity,
      unit: resource.unit,
      desiredDeliveryDate: resource.desiredDeliveryDate,
      deliveryAddress: resource.deliveryAddress,
      status: resource.status,
      rejectionReason: resource.rejectionReason,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    });
  }

  toResourceFromEntity(entity: Request): RequestResource {
    const resource: any = {
      clientId: entity.clientId,
      providerId: entity.providerId,
      productId: entity.productId,
      quantity: entity.quantity,
      unit: entity.unit,
      desiredDeliveryDate: entity.desiredDeliveryDate,
      deliveryAddress: entity.deliveryAddress,
      status: entity.status,
      rejectionReason: entity.rejectionReason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    if (entity.id) {
      resource.id = entity.id;
    }
    return resource as RequestResource;
  }

  toEntitiesFromResponse(response: RequestsResponse): Request[] {
    return response.requests.map(resource => this.toEntityFromResource(resource as RequestResource));
  }

}
