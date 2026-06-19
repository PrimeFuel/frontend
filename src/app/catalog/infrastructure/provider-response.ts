import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface ProviderResource extends BaseResource {
  // The catalog endpoint returns the provider key as `providerId`; `id` is kept
  // optional for compatibility with the /provider-companies shape.
  id: string;
  providerId?: number;
  name: string;
  ruc: string;
  rating: number;
  address: string;
  phone: string;
  fuelTypesOffered: string[];
  description: string;
}

export interface ProvidersResponse extends BaseResponse {
  providers: ProviderResource[];
}
