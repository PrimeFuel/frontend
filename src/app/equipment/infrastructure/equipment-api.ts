import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Equipment } from '../domain/model/equipment.entity';
import { EquipmentApiEndpoint } from './equipment-api-endpoint';
import { EquipmentResource } from './equipment-response';

@Injectable({ providedIn: 'root' })
export class EquipmentApi extends BaseApi {
  private readonly endpoint: EquipmentApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.endpoint = new EquipmentApiEndpoint(http);
  }

  getAll(): Observable<Equipment[]> {
    return this.endpoint.getAll();
  }

  getByCompanyId(companyId: number): Observable<Equipment[]> {
    return this.endpoint.getByCompanyId(companyId);
  }

  getById(id: string): Observable<Equipment> {
    return this.endpoint.getById(id);
  }

  create(equipment: Equipment): Observable<Equipment> {
    return this.endpoint.create(equipment);
  }

  update(equipment: Equipment): Observable<Equipment> {
    return this.endpoint.update(equipment, equipment.id);
  }

  patch(id: string, patch: Partial<EquipmentResource>): Observable<Equipment> {
    return this.endpoint.patchEquipment(id, patch);
  }

  delete(id: string): Observable<void> {
    return this.endpoint.delete(id);
  }
}
