import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface EquipmentResource extends BaseResource {
  id: string;
  companyId: number;
  name: string;
  type?: string;
  equipmentType?: string;
  licensePlate?: string;
  requiredFuelType?: string;
  fuelType?: string;
  capacity?: number;
  tankCapacity?: number;
  currentLevel?: number;
  unit?: string;
  status?: string;
  favoriteProviderId?: number | null;
  autoRefill?: boolean;
  refillThreshold?: number;
  location?: string;
  lastRefillDate?: string | null;
}

export interface EquipmentListResponse extends BaseResponse {
  equipment: EquipmentResource[];
}
