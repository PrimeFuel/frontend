import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Notification } from '../domain/model/notification.entity';
import { NotificationResource, NotificationsResponse } from './notification-response';

export class NotificationAssembler
  implements BaseAssembler<Notification, NotificationResource, NotificationsResponse>
{
  toEntitiesFromResponse(response: NotificationsResponse): Notification[] {
    return response.notifications.map((r) => this.toEntityFromResource(r));
  }

  toEntityFromResource(resource: NotificationResource): Notification {
    return new Notification({
      id: String(resource.id),
      userId: resource.userId ?? String(resource.companyId ?? resource.providerId ?? 'u1'),
      orderId: resource.orderId ?? (resource.referenceId != null ? String(resource.referenceId) : resource.relatedId != null ? String(resource.relatedId) : null),
      type: resource.type,
      message: resource.message,
      isRead: resource.isRead ?? resource.read ?? false,
      createdAt: resource.createdAt ?? '',
    });
  }

  toResourceFromEntity(entity: Notification): NotificationResource {
    return {
      id: entity.id,
      userId: entity.userId,
      orderId: entity.orderId,
      type: entity.type,
      title: entity.type,
      message: entity.message,
      isRead: entity.isRead,
      read: entity.isRead,
      referenceId: entity.orderId,
      createdAt: entity.createdAt,
    } as NotificationResource;
  }
}
