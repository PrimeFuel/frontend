import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Domain entity representing a fuel order generated from an approved request.
 * Lifecycle: CREATED → DISPATCHED → DELIVERED → CLOSED (or CANCELLED).
 */
export class Order implements BaseEntity {
  private _id: string;
  private _requestId: string;
  private _clientId: string;
  private _providerId: string;
  private _productId: string;
  private _quantity: number;
  private _unit: string;
  private _totalAmount: number;
  private _deliveryAddress: string;
  private _status: string;
  private _dispatchedAt: string | null;
  private _deliveredAt: string | null;
  private _closedAt: string | null;
  private _createdAt: string;
  private _updatedAt: string;

  constructor(props: {
    id: string;
    requestId: string;
    clientId: string;
    providerId: string;
    productId: string;
    quantity: number;
    unit: string;
    totalAmount: number;
    deliveryAddress: string;
    status: string;
    dispatchedAt: string | null;
    deliveredAt: string | null;
    closedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }) {
    this._id = props.id;
    this._requestId = props.requestId;
    this._clientId = props.clientId;
    this._providerId = props.providerId;
    this._productId = props.productId;
    this._quantity = props.quantity;
    this._unit = props.unit;
    this._totalAmount = props.totalAmount;
    this._deliveryAddress = props.deliveryAddress;
    this._status = props.status;
    this._dispatchedAt = props.dispatchedAt;
    this._deliveredAt = props.deliveredAt;
    this._closedAt = props.closedAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string { return this._id; }
  set id(value: string) { this._id = value; }

  get requestId(): string { return this._requestId; }
  set requestId(value: string) { this._requestId = value; }

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

  get totalAmount(): number { return this._totalAmount; }
  set totalAmount(value: number) { this._totalAmount = value; }

  get deliveryAddress(): string { return this._deliveryAddress; }
  set deliveryAddress(value: string) { this._deliveryAddress = value; }

  get status(): string { return this._status; }
  set status(value: string) { this._status = value; }

  get dispatchedAt(): string | null { return this._dispatchedAt; }
  set dispatchedAt(value: string | null) { this._dispatchedAt = value; }

  get deliveredAt(): string | null { return this._deliveredAt; }
  set deliveredAt(value: string | null) { this._deliveredAt = value; }

  get closedAt(): string | null { return this._closedAt; }
  set closedAt(value: string | null) { this._closedAt = value; }

  get createdAt(): string { return this._createdAt; }
  set createdAt(value: string) { this._createdAt = value; }

  get updatedAt(): string { return this._updatedAt; }
  set updatedAt(value: string) { this._updatedAt = value; }
}
