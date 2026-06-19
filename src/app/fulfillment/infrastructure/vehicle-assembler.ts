import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './vehicle-response';

/**
 * @summary Assembler para transformar vehículos entre capas.
 * @remarks Convierte VehicleResource ↔ Vehicle entity.
 * @author FullTank Platform
 */
export class VehicleAssembler
  implements BaseAssembler<Vehicle, VehicleResource, VehiclesResponse>
{
  toEntitiesFromResponse(response: VehiclesResponse): Vehicle[] {
    return response.vehicles.map((resource) => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: VehicleResource): Vehicle {
    return new Vehicle({
      id: String(resource.id),
      providerId: String(resource.providerId),
      licensePlate: resource.plate ?? resource.licensePlate ?? '',
      model: resource.model,
      brand: resource.brand,
      capacity: resource.capacity,
      unit: resource.unit,
      status: resource.status,
      createdAt: resource.createdAt ?? '',
    });
  }

  toResourceFromEntity(entity: Vehicle): VehicleResource {
    // Emit the backend shape (`plate`) for POST/PUT.
    return {
      id: entity.id,
      providerId: entity.providerId,
      plate: entity.licensePlate,
      licensePlate: entity.licensePlate,
      model: entity.model,
      brand: entity.brand,
      capacity: entity.capacity,
      unit: entity.unit,
      status: entity.status,
      createdAt: entity.createdAt,
    } as VehicleResource;
  }
}
