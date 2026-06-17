import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Provider } from '../domain/model/provider.entity';
import { ProviderResource, ProvidersResponse } from './provider-response';
import { ProviderAssembler } from './provider-assembler';

const providersEndpointUrl = `${environment.serverBasePath}${environment.catalogProvidersEndpointPath}`;

export class ProviderApiEndpoint extends BaseApiEndpoint<
  Provider,
  ProviderResource,
  ProvidersResponse,
  ProviderAssembler
> {
  constructor(http: HttpClient) {
    super(http, providersEndpointUrl, new ProviderAssembler());
  }
}
