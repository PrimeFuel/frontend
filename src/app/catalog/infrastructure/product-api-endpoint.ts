import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { FuelProduct } from '../domain/model/fuel-product.entity';
import { ProductResource, ProductsResponse } from './product-response';
import { ProductAssembler } from './product-assembler';
import {CreateProductRequest, UpdateProductRequest} from '../domain/model/delete-product.command';

const catalogEndpointUrl = `${environment.serverBasePath}${environment.catalogEndpointPath}`;

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
    super(http, catalogEndpointUrl, new ProductAssembler());
  }

  /**
   * Obtiene todos los productos activos.
   */
  getActiveProducts(): Observable<FuelProduct[]> {
    return this.http.get<ProductsResponse>(`${this.endpointUrl}/active`).pipe(
      map((response) => this.assembler.toEntitiesFromResponse(response)),
      catchError(this.handleError('Failed to fetch active products')),
    );
  }

  /**
   * Crea un nuevo producto de combustible.
   */
  createProduct(request: CreateProductRequest): Observable<FuelProduct> {
    return this.http.post<ProductResource>(this.endpointUrl, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to create product')),
    );
  }

  /**
   * Actualiza un producto existente.
   */
  updateProduct(productId: string, request: UpdateProductRequest): Observable<FuelProduct> {
    return this.http.put<ProductResource>(`${this.endpointUrl}/${productId}`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to update product ${productId}`)),
    );
  }
}
