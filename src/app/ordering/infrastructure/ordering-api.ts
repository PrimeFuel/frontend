import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { RequestsApiEndpoint } from './requests-api-endpoint';
import { OrdersApiEndpoint } from './orders-api-endpoint';
import { Request } from '../domain/model/request.entity';
import { Order } from '../domain/model/order.entity';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderingApi extends BaseApi {
  private readonly requestsEndpoint: RequestsApiEndpoint;
  private readonly ordersEndpoint: OrdersApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.requestsEndpoint = new RequestsApiEndpoint(http);
    this.ordersEndpoint = new OrdersApiEndpoint(http);
  }

  getRequests(): Observable<Request[]> { return this.requestsEndpoint.getAll(); }
  getOrders(): Observable<Order[]> { return this.ordersEndpoint.getAll(); }
  getRequestById(id: string): Observable<Request> { return this.requestsEndpoint.getById(id); }
  getOrderById(id: string): Observable<Order> { return this.ordersEndpoint.getById(id); }
  createRequest(request: Request): Observable<Request> { return this.requestsEndpoint.create(request); }
  createOrder(order: Order): Observable<Order> { return this.ordersEndpoint.create(order); }
  updateRequest(request: Request): Observable<Request> { return this.requestsEndpoint.update(request, request.id); }
  updateOrder(order: Order): Observable<Order> { return this.ordersEndpoint.update(order, order.id); }
  deleteRequest(id: string): Observable<void> { return this.requestsEndpoint.delete(id); }
  deleteOrder(id: string): Observable<void> { return this.ordersEndpoint.delete(id); }
  acceptRequest(id: string): Observable<Order> { return this.requestsEndpoint.acceptRequest(id); }
  rejectRequest(id: string, reason: string): Observable<Request> { return this.requestsEndpoint.rejectRequest(id, reason); }
}
