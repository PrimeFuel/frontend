import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
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


  getNotificationsByUser(userId: string): Observable<Notification[]> {
    return this.http
      .get<NotificationResource[]>(`${this.endpointUrl}?userId=${userId}&_sort=createdAt&_order=desc`)
      .pipe(
        map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError(`Failed to fetch notifications for user ${userId}`)),
      );
  }


  getUnreadNotificationsByUser(userId: string): Observable<Notification[]> {
    return this.http
      .get<NotificationResource[]>(
        `${this.endpointUrl}?userId=${userId}&isRead=false&_sort=createdAt&_order=desc`,
      )
      .pipe(
        map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError(`Failed to fetch unread notifications for user ${userId}`)),
      );
  }


  getNotificationsByOrder(orderId: string): Observable<Notification[]> {
    return this.http
      .get<NotificationResource[]>(`${this.endpointUrl}?orderId=${orderId}&_sort=createdAt&_order=desc`)
      .pipe(
        map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError(`Failed to fetch notifications for order ${orderId}`)),
      );
  }


  createNotification(
    request: Pick<Notification, 'userId' | 'orderId' | 'type' | 'message'>,
  ): Observable<Notification> {
    const payload = {
      ...request,
      isRead: false,
      createdAt: new Date().toISOString(),
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
    return this.http
      .patch<NotificationResource>(`${this.endpointUrl}/${notificationId}`, request)
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError(`Failed to update read state for notification ${notificationId}`)),
      );
  }
}
