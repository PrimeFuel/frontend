import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Delivery } from '../domain/model/delivery.entity';
import { DeliveryResource, DeliveriesResponse } from './delivery-response';
import { DeliveryAssembler } from './delivery-assembler';

const fulfillmentEndpointUrl = `${environment.serverBasePath}${environment.fulfillmentDeliveriesEndpointPath}`;

/**
 * @summary Endpoint API para gestión de entregas.
 * @remarks Expone operaciones CRUD y consultas específicas de entregas.
 * @author FullTank Platform
 */
export class DeliveryApiEndpoint extends BaseApiEndpoint<
  Delivery,
  DeliveryResource,
  DeliveriesResponse,
  DeliveryAssembler
> {
  constructor(http: HttpClient) {
    super(http, fulfillmentEndpointUrl, new DeliveryAssembler());
  }

  /**
   * Obtiene entregas de un proveedor específico.
   */
  getDeliveriesByProvider(providerId: string): Observable<Delivery[]> {
    return this.http.get<DeliveriesResponse>(`${this.endpointUrl}/provider/${providerId}`).pipe(
      map((response) => this.assembler.toEntitiesFromResponse(response)),
      catchError(this.handleError(`Failed to fetch deliveries for provider ${providerId}`)),
    );
  }

  /**
   * Obtiene una entrega por orderId.
   */
  getDeliveryByOrder(orderId: string): Observable<Delivery> {
    return this.http.get<DeliveryResource>(`${this.endpointUrl}/order/${orderId}`).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to fetch delivery for order ${orderId}`)),
    );
  }

  /**
   * Asigna recursos a una orden (crea delivery).
   */
  assignResources(request: any): Observable<Delivery> {
    return this.http.post<DeliveryResource>(`${this.endpointUrl}/assign`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to assign resources')),
    );
  }

  /**
   * Ejecuta el despacho de una entrega.
   */
  executeDispatch(deliveryId: string, request: any): Observable<Delivery> {
    return this.http.put<DeliveryResource>(`${this.endpointUrl}/${deliveryId}/dispatch`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to execute dispatch for delivery ${deliveryId}`)),
    );
  }
}
