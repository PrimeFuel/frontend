import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OrderResource, OrdersResponse } from './orders-response';
import { OrderAssembler } from './order-assembler';
import { Order } from '../domain/model/order.entity';
import { Observable, catchError, map, of } from 'rxjs';

export class OrdersApiEndpoint extends BaseApiEndpoint<Order, OrderResource, OrdersResponse, OrderAssembler> {
  constructor(http: HttpClient) {
    super(http, environment.serverBasePath + environment.orderingOrdersEndpointPath, new OrderAssembler());
  }

  override getAll(): Observable<Order[]> {
    return this.http.get<OrderResource[]>(this.endpointUrl).pipe(
      map((rows) => (rows ?? []).map((row) => this.assembler.toEntityFromResource(row))),
      catchError(this.handleError('Failed to fetch fuel orders')),
    );
  }

  override create(order: Order): Observable<Order> {
    const { id: _id, ...payload } = this.assembler.toResourceFromEntity(order);
    return this.http.post<OrderResource>(this.endpointUrl, payload).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to create fuel order')),
    );
  }

  override update(order: Order, id: string): Observable<Order> {
    const status = (order.status ?? '').toUpperCase();
    if (status === 'CONFIRMED' || status === 'APPROVED' || status === 'ACCEPTED') {
      return this.http.post<OrderResource>(`${this.endpointUrl}/${id}/confirm`, {}).pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError(`Failed to confirm order ${id}`)),
      );
    }
    if (status === 'CANCELLED' || status === 'REJECTED') {
      return this.http.post<OrderResource>(`${this.endpointUrl}/${id}/cancel`, {}).pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError(`Failed to cancel order ${id}`)),
      );
    }
    return of(order);
  }

  override delete(id: string): Observable<void> {
    return this.http.post<OrderResource>(`${this.endpointUrl}/${id}/cancel`, {}).pipe(
      map(() => undefined),
      catchError(this.handleError(`Failed to cancel order ${id}`)),
    );
  }
}
