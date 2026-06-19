import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Equipment } from '../domain/model/equipment.entity';
import { EquipmentResource, EquipmentListResponse } from './equipment-response';

export class EquipmentAssembler implements BaseAssembler<Equipment, EquipmentResource, EquipmentListResponse> {
  toEntityFromResource(resource: EquipmentResource): Equipment {
    const capacity = Number(resource.capacity ?? resource.tankCapacity ?? 0);
    const currentLevel = Number(resource.currentLevel ?? 0);

    return new Equipment({
      id: resource.id,
      companyId: resource.companyId,
      name: resource.name,
      licensePlate: resource.licensePlate,
      type: this.toUiEquipmentType(resource.type ?? resource.equipmentType),
      requiredFuelType: this.toUiFuelType(resource.requiredFuelType ?? resource.fuelType),
      capacity,
      currentLevel: Math.min(currentLevel, capacity),
      unit: resource.unit ?? 'LITERS',
      status: resource.status ?? 'operational',
      favoriteProviderId: resource.favoriteProviderId ?? null,
      autoRefill: resource.autoRefill ?? false,
      refillThreshold: resource.refillThreshold ?? 20,
      location: resource.location ?? 'Ubicacion de entrega',
      lastRefillDate: resource.lastRefillDate ?? null,
    });
  }

  toResourceFromEntity(entity: Equipment): EquipmentResource {
    return {
      id: entity.id,
      companyId: entity.companyId,
      name: entity.name,
      equipmentType: this.toBackendEquipmentType(entity.type),
      licensePlate: entity.licensePlate || `EQ-${entity.id}`,
      fuelType: this.toBackendFuelType(entity.requiredFuelType),
      tankCapacity: entity.capacity,
      type: entity.type,
      requiredFuelType: entity.requiredFuelType,
      capacity: entity.capacity,
      currentLevel: entity.currentLevel,
      unit: entity.unit,
      status: entity.status,
      favoriteProviderId: entity.favoriteProviderId,
      autoRefill: entity.autoRefill,
      refillThreshold: entity.refillThreshold,
      location: entity.location,
      lastRefillDate: entity.lastRefillDate,
    };
  }

  toEntitiesFromResponse(response: EquipmentListResponse): Equipment[] {
    return response.equipment.map((r) => this.toEntityFromResource(r));
  }

  private toUiEquipmentType(type: string | undefined): string {
    return this.toBackendEquipmentType(type);
  }

  private toBackendEquipmentType(type: string | undefined): string {
    switch (type) {
      case 'Vehicle Fleet':
        return 'TRUCK';
      case 'Generator':
        return 'GENERATOR';
      case 'Heavy Machinery':
        return 'EXCAVATOR';
      case 'Industrial Equipment':
      case 'Boiler':
      case 'Thermal System':
      case 'Boat':
      case 'Other':
        return 'OTHER';
      default:
        return type?.toUpperCase() ?? 'OTHER';
    }
  }

  private toUiFuelType(fuelType: string | undefined): string {
    switch (fuelType) {
      case 'GASOLINE_84':
        return 'GASOLINE_84';
      case 'GASOLINE_90':
        return 'GASOLINE_90';
      case 'GASOLINE_95':
        return 'GASOLINE_95';
      case 'GASOLINE_97':
        return 'GASOLINE_97';
      case 'GASOLINE':
        return 'GASOLINE_95';
      default:
        return fuelType ?? 'DIESEL';
    }
  }

  private toBackendFuelType(fuelType: string | undefined): string {
    if (!fuelType) return 'DIESEL';
    if (fuelType.startsWith('GASOLINE')) return fuelType;
    return fuelType;
  }

}
