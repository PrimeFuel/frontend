import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface NotificationResource extends BaseResource {
  id: string;
  userId?: string;
  orderId?: string | null;
  type: string;
  title?: string;
  message: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
  referenceId?: string | number | null;
  // Vue-format fields
  recipientType?: string;
  companyId?: number | null;
  providerId?: number | null;
  relatedId?: string | number | null;
}

export interface NotificationsResponse extends BaseResponse {
  notifications: NotificationResource[];
}
