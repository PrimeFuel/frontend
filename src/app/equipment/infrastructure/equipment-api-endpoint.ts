import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Equipment } from '../domain/model/equipment.entity';
import { EquipmentResource, EquipmentListResponse } from './equipment-response';
import { EquipmentAssembler } from './equipment-assembler';

const equipmentEndpointUrl = `${environment.serverBasePath}${environment.equipmentEndpointPath}`;

export class EquipmentApiEndpoint extends BaseApiEndpoint<
  Equipment,
  EquipmentResource,
  EquipmentListResponse,
  EquipmentAssembler
> {
  constructor(http: HttpClient) {
    super(http, equipmentEndpointUrl, new EquipmentAssembler());
  }

  getByCompanyId(companyId: number): Observable<Equipment[]> {
    // Backend route: GET /equipment/company/{companyId}
    return this.http
      .get<EquipmentResource[]>(`${this.endpointUrl}/company/${companyId}`)
      .pipe(
        map((resources) => resources.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError(`Failed to fetch equipment for company ${companyId}`)),
      );
  }

  override update(equipment: Equipment, id: string): Observable<Equipment> {
    const resource = this.assembler.toResourceFromEntity(equipment);
    return this.http.post<EquipmentResource>(`${this.endpointUrl}/${id}/update`, resource).pipe(
      map((updatedResource) => this.assembler.toEntityFromResource(updatedResource)),
      catchError(this.handleError(`Failed to update equipment with id ${id}`)),
    );
  }

  patchEquipment(id: string, patch: Partial<EquipmentResource>): Observable<Equipment> {
    // The backend has no generic PATCH; favorite-provider is a dedicated action
    // and fuel level is adjusted server-side (apply-delivery). For other patches
    // we re-read the current server state.
    if (patch.favoriteProviderId != null) {
      return this.http
        .post<EquipmentResource>(`${this.endpointUrl}/${id}/favorite-provider`, {
          providerId: Number(patch.favoriteProviderId),
        })
        .pipe(
          map((r) => this.assembler.toEntityFromResource(r)),
          catchError(this.handleError(`Failed to assign favorite provider for equipment ${id}`)),
        );
    }
    return this.getById(id);
  }
}
