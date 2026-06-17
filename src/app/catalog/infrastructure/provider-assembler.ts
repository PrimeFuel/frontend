import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Provider } from '../domain/model/provider.entity';
import { ProviderResource, ProvidersResponse } from './provider-response';

export class ProviderAssembler implements BaseAssembler<Provider, ProviderResource, ProvidersResponse> {
  toEntityFromResource(resource: ProviderResource): Provider {
    return new Provider({
      id: resource.providerId ?? resource.id,
      name: resource.name,
      ruc: resource.ruc,
      rating: resource.rating,
      address: resource.address,
      phone: resource.phone,
      fuelTypesOffered: resource.fuelTypesOffered ?? [],
      description: resource.description,
    });
  }

  toResourceFromEntity(entity: Provider): ProviderResource {
    return {
      id: entity.id,
      name: entity.name,
      ruc: entity.ruc,
      rating: entity.rating,
      address: entity.address,
      phone: entity.phone,
      fuelTypesOffered: entity.fuelTypesOffered,
      description: entity.description,
    };
  }

  toEntitiesFromResponse(response: ProvidersResponse): Provider[] {
    return response.providers.map((r) => this.toEntityFromResource(r));
  }
}
