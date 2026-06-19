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
      id: resource.id,
      userId: resource.userId,
      orderId: resource.orderId,
      type: resource.type,
      message: resource.message,
      isRead: resource.isRead,
      createdAt: resource.createdAt,
    });
  }

  toResourceFromEntity(entity: Notification): NotificationResource {
    return {
      id: entity.id,
      userId: entity.userId,
      orderId: entity.orderId,
      type: entity.type,
      message: entity.message,
      isRead: entity.isRead,
      createdAt: entity.createdAt,
    } as NotificationResource;
  }
}
