import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class FuelProduct implements BaseEntity {
  id: string;
  name: string;
  type: string;
  description: string;
  pricePerLiter: number;
  unit: string;
  isActive: boolean;
  createdAt: string;

  constructor(params: {
    id: string;
    name: string;
    type: string;
    description: string;
    pricePerLiter: number;
    unit: string;
    isActive: boolean;
    createdAt: string;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
    this.description = params.description;
    this.pricePerLiter = params.pricePerLiter;
    this.unit = params.unit;
    this.isActive = params.isActive;
    this.createdAt = params.createdAt;
  }
}

export interface CreateProductPayload {
  name: string;
  type: string;
  description: string;
  pricePerLiter: number;
  unit: string;
}

export interface UpdateProductPayload {
  name?: string;
  type?: string;
  description?: string;
  pricePerLiter?: number;
  unit?: string;
  isActive?: boolean;
}
