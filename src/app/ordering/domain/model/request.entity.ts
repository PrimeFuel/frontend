import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Request implements BaseEntity {
  id: string;
  clientId: string;
  companyId: number | null;
  providerId: string;
  productId: string;
  fuelType: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  equipmentId: number | string | null;
  desiredDeliveryDate: string;
  deliveryAddress: string;
  status: string;
  source: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(props: {
    id?: string | number | null;
    clientId?: string | number | null;
    companyId?: number | null;
    providerId?: string | number | null;
    productId?: string | number | null;
    fuelType?: string | null;
    productName?: string | null;
    quantity?: number | null;
    unit?: string | null;
    unitPrice?: number | null;
    equipmentId?: number | string | null;
    desiredDeliveryDate?: string | null;
    deliveryAddress?: string | null;
    status?: string | null;
    source?: string | null;
    rejectionReason?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  } = {}) {
    const now = new Date().toISOString();
    this.id = props.id == null ? '' : String(props.id);
    this.companyId = props.companyId ?? (props.clientId == null ? null : Number(props.clientId));
    this.clientId = props.clientId == null ? (this.companyId == null ? '' : String(this.companyId)) : String(props.clientId);
    this.providerId = props.providerId == null ? '' : String(props.providerId);
    this.productId = props.productId == null ? '' : String(props.productId);
    this.fuelType = props.fuelType ?? '';
    this.productName = props.productName ?? '';
    this.quantity = Number(props.quantity ?? 0);
    this.unit = props.unit ?? 'LITERS';
    this.unitPrice = Number(props.unitPrice ?? 0);
    this.equipmentId = props.equipmentId ?? null;
    this.desiredDeliveryDate = props.desiredDeliveryDate ?? '';
    this.deliveryAddress = props.deliveryAddress ?? '';
    this.status = props.status ?? 'PENDING';
    this.source = props.source ?? 'MANUAL';
    this.rejectionReason = props.rejectionReason ?? null;
    this.createdAt = props.createdAt ?? now;
    this.updatedAt = props.updatedAt ?? this.createdAt;
  }
}
