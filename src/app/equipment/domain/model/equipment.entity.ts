import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Equipment implements BaseEntity {
  id: string;
  companyId: number;
  name: string;
  licensePlate: string;
  type: string;
  requiredFuelType: string;
  capacity: number;
  currentLevel: number;
  unit: string;
  status: string;
  favoriteProviderId: number | null;
  autoRefill: boolean;
  refillThreshold: number;
  location: string;
  lastRefillDate: string | null;

  constructor(params: {
    id: string | number;
    companyId: number;
    name: string;
    licensePlate?: string;
    type: string;
    requiredFuelType: string;
    capacity: number;
    currentLevel: number;
    unit: string;
    status: string;
    favoriteProviderId: number | null;
    autoRefill: boolean;
    refillThreshold: number;
    location: string;
    lastRefillDate: string | null;
  }) {
    this.id = String(params.id);
    this.companyId = params.companyId;
    this.name = params.name;
    this.licensePlate = params.licensePlate ?? '';
    this.type = params.type;
    this.requiredFuelType = params.requiredFuelType;
    this.capacity = params.capacity;
    this.currentLevel = params.currentLevel;
    this.unit = params.unit;
    this.status = params.status;
    this.favoriteProviderId = params.favoriteProviderId;
    this.autoRefill = params.autoRefill;
    this.refillThreshold = params.refillThreshold;
    this.location = params.location;
    this.lastRefillDate = params.lastRefillDate;
  }

  get fillPercentage(): number {
    if (this.capacity === 0) return 0;
    return Math.round((this.currentLevel / this.capacity) * 100);
  }

  get remainingCapacity(): number {
    return this.capacity - this.currentLevel;
  }

  get isLowFuel(): boolean {
    return this.fillPercentage <= this.refillThreshold;
  }
}

export const FUEL_TYPES = [
  'DIESEL', 'GASOLINE_84', 'GASOLINE_90', 'GASOLINE_95', 'GASOLINE_97',
];
export const EQUIPMENT_TYPES = [
  'TRUCK', 'BUS', 'EXCAVATOR', 'GENERATOR', 'FORKLIFT', 'OTHER',
];
export const EQUIPMENT_STATUSES = ['operational', 'maintenance', 'inactive'];
