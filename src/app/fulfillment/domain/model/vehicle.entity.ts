import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * @summary Entidad de dominio que representa un vehículo de transporte.
 * @remarks Almacena información de vehículos (camiones cisterna) disponibles
 * para entregas de combustible. Incluye capacidad, estado y datos de registro.
 * @author FullTank Platform
 */
export class Vehicle implements BaseEntity {
  id: string;
  providerId: string;
  licensePlate: string;
  model: string;
  brand: string;
  capacity: number; // Capacidad en litros
  unit: string; // LITERS, GALLONS
  status: string; // AVAILABLE, IN_ROUTE, MAINTENANCE, OUT_OF_SERVICE
  createdAt: string;

  constructor(params: {
    id: string;
    providerId: string;
    licensePlate: string;
    model: string;
    brand: string;
    capacity: number;
    unit: string;
    status: string;
    createdAt: string;
  }) {
    this.id = params.id;
    this.providerId = params.providerId;
    this.licensePlate = params.licensePlate;
    this.model = params.model;
    this.brand = params.brand;
    this.capacity = params.capacity;
    this.unit = params.unit;
    this.status = params.status;
    this.createdAt = params.createdAt;
  }
}

