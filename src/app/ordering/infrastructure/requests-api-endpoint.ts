import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Request } from '../domain/model/request.entity';
import { RequestResource, RequestsResponse } from './requests-response';
import { RequestAssembler } from './request-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, catchError, map, of } from 'rxjs';
import { Order } from '../domain/model/order.entity';
import { OrderResource } from './orders-response';
import { OrderAssembler } from './order-assembler';

export class RequestsApiEndpoint extends BaseApiEndpoint<Request, RequestResource, RequestsResponse, RequestAssembler> {
  private readonly orderAssembler = new OrderAssembler();

  constructor(http: HttpClient) {
    super(http, environment.serverBasePath + environment.orderingRequestsEndpointPath, new RequestAssembler());
  }

  override getAll(): Observable<Request[]> {
    return this.http.get<RequestResource[]>(this.endpointUrl).pipe(
      map((rows) => (rows ?? []).map((row) => this.assembler.toEntityFromResource(row))),
      catchError(this.handleError('Failed to fetch fuel requests')),
    );
  }

  override getById(id: string): Observable<Request> {
    return this.getAll().pipe(
      map((requests) => {
        const found = requests.find((request) => String(request.id) === String(id));
        if (!found) throw new Error(`Fuel request ${id} not found`);
        return found;
      }),
      catchError(this.handleError(`Failed to fetch fuel request ${id}`)),
    );
  }

  override create(request: Request): Observable<Request> {
    const { id: _id, ...payload } = this.assembler.toResourceFromEntity(request);
    return this.http.post<RequestResource>(this.endpointUrl, payload).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to create fuel request')),
    );
  }

  override update(request: Request, _id: string): Observable<Request> {
    if (request.status === 'REJECTED') {
      return this.rejectRequest(request.id, request.rejectionReason ?? '').pipe(map(() => request));
    }
    return of(request);
  }

  override delete(_id: string): Observable<void> {
    return of(undefined);
  }

  acceptRequest(id: string): Observable<Order> {
    return this.http.post<OrderResource>(`${this.endpointUrl}/${id}/accept`, {}).pipe(
      map((resource) => this.orderAssembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to accept fuel request ${id}`)),
    );
  }

  rejectRequest(id: string, reason: string): Observable<Request> {
    return this.http.post<RequestResource>(`${this.endpointUrl}/${id}/reject`, { reason }).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to reject fuel request ${id}`)),
    );
  }
}
