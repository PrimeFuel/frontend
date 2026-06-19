import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Notification } from '../domain/model/notification.entity';
import { NotificationResource, NotificationsResponse } from './notification-response';
import { NotificationAssembler } from './notification-assembler';

const notificationsEndpointUrl = `${environment.serverBasePath}${environment.notificationEndpointPath}`;

export class NotificationApiEndpoint extends BaseApiEndpoint<
  Notification,
  NotificationResource,
  NotificationsResponse,
  NotificationAssembler
> {
  constructor(http: HttpClient) {
    super(http, notificationsEndpointUrl, new NotificationAssembler());
  }

  getNotificationsByUser(_userId: string): Observable<Notification[]> {
    return this.http
      .get<NotificationResource[]>(`${this.endpointUrl}/user/${_userId}`)
      .pipe(
        map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError(`Failed to fetch notifications`)),
      );
  }

  getByBuyer(buyerCompanyId: number | string): Observable<Notification[]> {
    return this.http
      .get<NotificationResource[]>(`${this.endpointUrl}/buyer/${buyerCompanyId}`)
      .pipe(
        map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError(`Failed to fetch buyer notifications`)),
      );
  }

  getByProvider(providerId: number | string): Observable<Notification[]> {
    return this.http
      .get<NotificationResource[]>(`${this.endpointUrl}/provider/${providerId}`)
      .pipe(
        map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError(`Failed to fetch provider notifications`)),
      );
  }

  /** No backend bulk-read endpoint; callers update local state after this no-op. */
  markAllReadBuyer(buyerCompanyId: number | string): Observable<unknown> {
    return of({ buyerCompanyId });
  }

  /** No backend bulk-read endpoint; callers update local state after this no-op. */
  markAllReadProvider(providerId: number | string): Observable<unknown> {
    return of({ providerId });
  }

  getUnreadNotificationsByUser(_userId: string): Observable<Notification[]> {
    return this.http
      .get<NotificationResource[]>(`${this.endpointUrl}/user/${_userId}/unread`)
      .pipe(
        map((response) => response
          .map((r) => this.assembler.toEntityFromResource(r))
          .filter((n) => !n.isRead)
        ),
        catchError(this.handleError(`Failed to fetch unread notifications`)),
      );
  }

  getNotificationsByOrder(orderId: string): Observable<Notification[]> {
    // The current backend cannot query by order/reference id directly.
    return of([] as Notification[]);
  }

  createNotification(
    request: Pick<Notification, 'userId' | 'orderId' | 'type' | 'message'>,
  ): Observable<Notification> {
    const payload = {
      userId: Number(request.userId),
      type: request.type,
      title: request.type,
      message: request.message,
      referenceId: request.orderId != null ? Number(request.orderId) : null,
    };
    return this.http.post<NotificationResource>(this.endpointUrl, payload).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to create notification')),
    );
  }

  updateReadState(
    notificationId: string,
    request: Pick<Notification, 'isRead'>,
  ): Observable<Notification> {
    // The backend only supports marking a notification as read.
    // there is no "mark unread" endpoint.
    if (!request.isRead) {
      return this.getById(notificationId).pipe(catchError(() => of(null as unknown as Notification)));
    }
    return this.http
      .post<NotificationResource>(`${this.endpointUrl}/${notificationId}/mark-as-read`, {})
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError(`Failed to mark notification ${notificationId} as read`)),
      );
  }

  override delete(notificationId: string): Observable<void> {
    return of(undefined);
  }
}
