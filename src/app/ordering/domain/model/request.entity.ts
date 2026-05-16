import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Domain entity representing a fuel request submitted by a client.
 * Lifecycle: PENDING_APPROVAL → APPROVED | REJECTED | CANCELLED.
 */
export class Request implements BaseEntity {
  private _id: string;
  private _clientId: string;
  private _providerId: string;
  private _productId: string;
  private _quantity: number;
  private _unit: string;
  private _desiredDeliveryDate: string;
  private _deliveryAddress: string;
  private _status: string;
  private _rejectionReason: string | null;
  private _createdAt: string;
  private _updatedAt: string;

  constructor(props: {
    id: string;
    clientId: string;
    providerId: string;
    productId: string;
    quantity: number;
    unit: string;
    desiredDeliveryDate: string;
    deliveryAddress: string;
    status: string;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
  }) {
    this._id = props.id;
    this._clientId = props.clientId;
    this._providerId = props.providerId;
    this._productId = props.productId;
    this._quantity = props.quantity;
    this._unit = props.unit;
    this._desiredDeliveryDate = props.desiredDeliveryDate;
    this._deliveryAddress = props.deliveryAddress;
    this._status = props.status;
    this._rejectionReason = props.rejectionReason;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string { return this._id; }
  set id(value: string) { this._id = value; }

  get clientId(): string { return this._clientId; }
  set clientId(value: string) { this._clientId = value; }

  get providerId(): string { return this._providerId; }
  set providerId(value: string) { this._providerId = value; }

  get productId(): string { return this._productId; }
  set productId(value: string) { this._productId = value; }

  get quantity(): number { return this._quantity; }
  set quantity(value: number) { this._quantity = value; }

  get unit(): string { return this._unit; }
  set unit(value: string) { this._unit = value; }

  get desiredDeliveryDate(): string { return this._desiredDeliveryDate; }
  set desiredDeliveryDate(value: string) { this._desiredDeliveryDate = value; }

  get deliveryAddress(): string { return this._deliveryAddress; }
  set deliveryAddress(value: string) { this._deliveryAddress = value; }

  get status(): string { return this._status; }
  set status(value: string) { this._status = value; }

  get rejectionReason(): string | null { return this._rejectionReason; }
  set rejectionReason(value: string | null) { this._rejectionReason = value; }

  get createdAt(): string { return this._createdAt; }
  set createdAt(value: string) { this._createdAt = value; }

  get updatedAt(): string { return this._updatedAt; }
  set updatedAt(value: string) { this._updatedAt = value; }
}
