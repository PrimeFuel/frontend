import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * @summary Entidad de dominio que representa un producto de combustible.
 * @remarks Almacena información del catálogo de productos disponibles
 * en la plataforma FullTank (Diesel, Gasolina 90, 95, 97, etc.).
 * @author FullTank Platform
 */
export class FuelProduct implements BaseEntity {
  id: string;
  name: string;
  type: string; // DIESEL, GASOLINE_90, GASOLINE_95, GASOLINE_97
  description: string;
  pricePerLiter: number;
  unit: string; // LITERS, GALLONS
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
