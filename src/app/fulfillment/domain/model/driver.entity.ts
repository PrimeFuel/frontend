import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * @summary Entidad de dominio que representa un conductor.
 * @remarks Almacena información de conductores autorizados para realizar
 * entregas. Incluye licencia, contacto y estado de disponibilidad.
 * @author FullTank Platform
 */
export class Driver implements BaseEntity {
  id: string;
  providerId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  status: string; // AVAILABLE, ASSIGNED, ON_LEAVE, INACTIVE
  createdAt: string;

  constructor(params: {
    id: string;
    providerId: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    phoneNumber: string;
    email: string;
    status: string;
    createdAt: string;
  }) {
    this.id = params.id;
    this.providerId = params.providerId;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.licenseNumber = params.licenseNumber;
    this.phoneNumber = params.phoneNumber;
    this.email = params.email;
    this.status = params.status;
    this.createdAt = params.createdAt;
  }
}

