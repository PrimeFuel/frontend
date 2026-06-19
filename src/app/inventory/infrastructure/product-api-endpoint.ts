import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
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
    // Backend returns the full fuel-products list (no isActive query filter);
    // active filtering, if needed, is handled in the store/presentation layer.
    return this.http.get<ProductsResponse | ProductResource[]>(this.endpointUrl).pipe(
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
    const payload = {
      name: request.name,
      fuelType: request.type,
      pricePerUnit: request.pricePerLiter,
      unit: request.unit,
      availableStock: 0,
      providerId: 1,
    };
    return this.http.post<ProductResource>(this.endpointUrl, payload).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to create product')),
    );
  }

  /**
   * Actualiza un producto existente.
   */
  updateProduct(productId: string, request: UpdateProductPayload): Observable<FuelProduct> {
    // The current backend exposes stock updates, but not a full product update.
    // Re-read the product so editing descriptive fields does not zero the stock.
    return this.getById(productId);
  }

  override delete(_productId: string): Observable<void> {
    return of(undefined);
  }
}
