export class Provider {
  id: string;
  name: string;
  ruc: string;
  rating: number;
  address: string;
  phone: string;
  fuelTypesOffered: string[];
  description: string;

  constructor(params: {
    id: number | string;
    name: string;
    ruc: string;
    rating: number;
    address: string;
    phone: string;
    fuelTypesOffered: string[];
    description: string;
  }) {
    Object.assign(this, params);
    this.id = String(params.id);
    this.name = params.name;
    this.ruc = params.ruc;
    this.rating = params.rating;
    this.address = params.address;
    this.phone = params.phone;
    this.fuelTypesOffered = params.fuelTypesOffered;
    this.description = params.description;
  }
}
