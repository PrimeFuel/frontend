import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface NotificationResource extends BaseResource {
  id: string;
  userId: string;
  orderId: string | null;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse extends BaseResponse {
  notifications: NotificationResource[];
}
