export class CatalogProduct {
  id: string;
  providerId: number;
  fuelType: string;
  name: string;
  description: string;
  pricePerLiter: number;
  unit: string;
  available: boolean;
  stock?: number;

  constructor(params: {
    id: number | string;
    providerId: number;
    fuelType: string;
    name: string;
    description: string;
    pricePerLiter: number;
    unit: string;
    available: boolean;
    stock?: number;
  }) {
    this.id = String(params.id);
    this.providerId = params.providerId;
    this.fuelType = params.fuelType;
    this.name = params.name;
    this.description = params.description;
    this.pricePerLiter = params.pricePerLiter;
    this.unit = params.unit;
    this.available = params.available;
    this.stock = params.stock;
  }
}
