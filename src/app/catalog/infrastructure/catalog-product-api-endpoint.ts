import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { CatalogProduct } from '../domain/model/catalog-product.entity';
import { CatalogProductResource, CatalogProductsResponse } from './catalog-product-response';
import { CatalogProductAssembler } from './catalog-product-assembler';

const productsEndpointUrl = `${environment.serverBasePath}${environment.catalogProductsEndpointPath}`;

export class CatalogProductApiEndpoint extends BaseApiEndpoint<
  CatalogProduct,
  CatalogProductResource,
  CatalogProductsResponse,
  CatalogProductAssembler
> {
  constructor(http: HttpClient) {
    super(http, productsEndpointUrl, new CatalogProductAssembler());
  }

  getByProviderId(providerId: number): Observable<CatalogProduct[]> {
    const url = `${environment.serverBasePath}${environment.catalogProductsEndpointPath}/provider/${providerId}`;
    return this.http
      .get<CatalogProductResource[]>(url)
      .pipe(
        map((resources) => resources.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError(`Failed to fetch products for provider ${providerId}`)),
      );
  }
}
