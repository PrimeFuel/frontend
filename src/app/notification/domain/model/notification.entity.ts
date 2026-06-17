import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Notification implements BaseEntity {
  id: string;
  userId: string;
  orderId: string | null;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;

  constructor(params: {
    id: string;
    userId: string;
    orderId: string | null;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.orderId = params.orderId;
    this.type = params.type;
    this.message = params.message;
    this.isRead = params.isRead;
    this.createdAt = params.createdAt;
  }

  markAsRead(): void { this.isRead = true; }
  markAsUnread(): void { this.isRead = false; }
  isOrderEvent(): boolean { return this.type.startsWith('ORDER_'); }
  isPaymentEvent(): boolean { return this.type.startsWith('PAYMENT_'); }
  isDeliveryEvent(): boolean { return this.type.startsWith('DELIVERY_'); }
}
