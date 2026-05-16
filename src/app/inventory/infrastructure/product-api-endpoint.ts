import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import {
  FuelProduct,
  CreateProductPayload,
  UpdateProductPayload
} from '../domain/model/fuel-product.entity';import { ProductResource, ProductsResponse } from './product-response';
import { ProductAssembler } from './product-assembler';

const inventoryEndpointUrl = `${environment.serverBasePath}${environment.inventoryEndpointPath}`;
/**
 * @summary Endpoint API para gestión de productos de combustible.
 * @remarks Expone operaciones CRUD y consultas específicas de productos.
 * @author FullTank Platform
 */
export class ProductApiEndpoint extends BaseApiEndpoint<
  FuelProduct,
  ProductResource,
  ProductsResponse,
  ProductAssembler
> {
  constructor(http: HttpClient) {
    super(http, inventoryEndpointUrl, new ProductAssembler());
  }

  /**
   * Obtiene todos los productos activos.
   */
  getActiveProducts(): Observable<FuelProduct[]> {
    return this.http.get<ProductsResponse | ProductResource[]>(`${this.endpointUrl}?isActive=true`).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response.map((r) => this.assembler.toEntityFromResource(r));
        }
        return this.assembler.toEntitiesFromResponse(response as ProductsResponse);
      }),
      catchError(this.handleError('Failed to fetch active products')),
    );
  }

  /**
   * Crea un nuevo producto de combustible.
   */
  createProduct(request: CreateProductPayload): Observable<FuelProduct> {
    return this.http.post<ProductResource>(this.endpointUrl, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to create product')),
    );
  }

  /**
   * Actualiza un producto existente.
   */
  updateProduct(productId: string, request: UpdateProductPayload): Observable<FuelProduct> {
    return this.http.patch<ProductResource>(`${this.endpointUrl}/${productId}`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to update product ${productId}`)),
    );
  }
}
