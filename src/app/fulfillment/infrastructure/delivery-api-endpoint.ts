import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Delivery } from '../domain/model/delivery.entity';
import { DeliveryResource, DeliveriesResponse } from './delivery-response';
import { DeliveryAssembler } from './delivery-assembler';

const deliveriesEndpointUrl = `${environment.serverBasePath}${environment.fulfillmentDeliveriesEndpointPath}`;

export class DeliveryApiEndpoint extends BaseApiEndpoint<
  Delivery,
  DeliveryResource,
  DeliveriesResponse,
  DeliveryAssembler
> {
  constructor(http: HttpClient) {
    super(http, deliveriesEndpointUrl, new DeliveryAssembler());
  }

  getDeliveriesByProvider(providerId: string): Observable<Delivery[]> {
    return this.http.get<DeliveryResource[]>(`${this.endpointUrl}?providerId=${providerId}`).pipe(
      map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch deliveries for provider ${providerId}`)),
    );
  }

  getDeliveryByOrder(orderId: string): Observable<Delivery> {
    return this.http.get<DeliveryResource[]>(`${this.endpointUrl}?orderId=${orderId}`).pipe(
      map((response) => this.assembler.toEntityFromResource(response[0])),
      catchError(this.handleError(`Failed to fetch delivery for order ${orderId}`)),
    );
  }

  assignResources(request: any): Observable<Delivery> {
    return this.http.post<DeliveryResource>(this.endpointUrl, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to assign resources')),
    );
  }

  executeDispatch(deliveryId: string, request: any): Observable<Delivery> {
    return this.http.patch<DeliveryResource>(`${this.endpointUrl}/${deliveryId}`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to execute dispatch for delivery ${deliveryId}`)),
    );
  }
}
