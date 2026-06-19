import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Driver } from '../domain/model/driver.entity';
import { DriverResource, DriversResponse } from './driver-response';

/**
 * @summary Assembler para transformar conductores entre capas.
 * @remarks Convierte DriverResource ↔ Driver entity.
 * @author FullTank Platform
 */
export class DriverAssembler
  implements BaseAssembler<Driver, DriverResource, DriversResponse>
{
  toEntitiesFromResponse(response: DriversResponse): Driver[] {
    return response.drivers.map((resource) => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: DriverResource): Driver {
    // Backend returns a single `name`; split it into first/last for the UI.
    const fullName = resource.name ?? `${resource.firstName ?? ''} ${resource.lastName ?? ''}`.trim();
    const [firstName, ...rest] = fullName.split(' ');
    return new Driver({
      id: String(resource.id),
      providerId: String(resource.providerId),
      firstName: resource.firstName ?? firstName ?? fullName,
      lastName: resource.lastName ?? rest.join(' '),
      licenseNumber: resource.licenseNumber,
      phoneNumber: resource.phoneNumber ?? resource.phone ?? '',
      email: resource.email,
      status: resource.status,
      createdAt: resource.createdAt ?? '',
    });
  }

  toResourceFromEntity(entity: Driver): DriverResource {
    // Emit the backend shape (`name`, `phone`) for POST/PUT.
    return {
      id: entity.id,
      providerId: entity.providerId,
      name: `${entity.firstName} ${entity.lastName}`.trim(),
      phone: entity.phoneNumber,
      firstName: entity.firstName,
      lastName: entity.lastName,
      licenseNumber: entity.licenseNumber,
      phoneNumber: entity.phoneNumber,
      email: entity.email,
      status: entity.status,
      createdAt: entity.createdAt,
    } as DriverResource;
  }
}
