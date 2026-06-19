import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Provider } from '../domain/model/provider.entity';
import { CatalogProduct } from '../domain/model/catalog-product.entity';
import { ProviderApiEndpoint } from './provider-api-endpoint';
import { CatalogProductApiEndpoint } from './catalog-product-api-endpoint';
import { environment } from '../../../environments/environment';

export interface ProviderRatingResource {
  id: number;
  companyId: number;
  providerId: number;
  rating: number;
}

@Injectable({ providedIn: 'root' })
export class CatalogApi extends BaseApi {
  private readonly baseUrl = environment.serverBasePath;
  private readonly providersEndpoint: ProviderApiEndpoint;
  private readonly productsEndpoint: CatalogProductApiEndpoint;

  constructor(private readonly http: HttpClient) {
    super();
    this.providersEndpoint = new ProviderApiEndpoint(http);
    this.productsEndpoint = new CatalogProductApiEndpoint(http);
  }

  getProviders(): Observable<Provider[]> {
    return this.providersEndpoint.getAll();
  }

  getProviderById(id: string): Observable<Provider> {
    return this.providersEndpoint.getById(id);
  }

  getProductsByProvider(providerId: number): Observable<CatalogProduct[]> {
    return this.productsEndpoint.getByProviderId(providerId);
  }

  getRatings(providerId?: number): Observable<ProviderRatingResource[]> {
    const url = `${this.baseUrl}/provider-ratings`;
    return providerId != null
      ? this.http.get<ProviderRatingResource[]>(url, { params: { providerId } })
      : this.http.get<ProviderRatingResource[]>(url);
  }

  createRating(resource: Omit<ProviderRatingResource, 'id'>): Observable<ProviderRatingResource> {
    return this.http.post<ProviderRatingResource>(`${this.baseUrl}/provider-ratings`, resource);
  }

  updateRating(
    id: number,
    resource: Omit<ProviderRatingResource, 'id'>,
  ): Observable<ProviderRatingResource> {
    return this.http.put<ProviderRatingResource>(`${this.baseUrl}/provider-ratings/${id}`, resource);
  }
}
