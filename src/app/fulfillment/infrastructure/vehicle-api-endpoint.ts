import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './vehicle-response';
import { VehicleAssembler } from './vehicle-assembler';
import { RegisterVehicleRequest, UpdateVehicleStatusRequest, UpdateVehicleRequest } from './vehicle.request';

const vehiclesEndpointUrl = `${environment.serverBasePath}${environment.fulfillmentVehiclesEndpointPath}`;

export class VehicleApiEndpoint extends BaseApiEndpoint<
  Vehicle,
  VehicleResource,
  VehiclesResponse,
  VehicleAssembler
> {
  constructor(http: HttpClient) {
    super(http, vehiclesEndpointUrl, new VehicleAssembler());
  }

  getVehiclesByProvider(providerId: string): Observable<Vehicle[]> {
    return this.http.get<VehicleResource[]>(`${this.endpointUrl}?providerId=${providerId}`).pipe(
      map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch vehicles for provider ${providerId}`)),
    );
  }

  getAvailableVehicles(providerId: string): Observable<Vehicle[]> {
    return this.http
      .get<VehicleResource[]>(`${this.endpointUrl}?providerId=${providerId}&status=AVAILABLE`)
      .pipe(
        map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError('Failed to fetch available vehicles')),
      );
  }

  registerVehicle(request: RegisterVehicleRequest): Observable<Vehicle> {
    return this.http.post<VehicleResource>(this.endpointUrl, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to register vehicle')),
    );
  }

  updateVehicleStatus(vehicleId: string, request: UpdateVehicleStatusRequest): Observable<Vehicle> {
    return this.http.patch<VehicleResource>(`${this.endpointUrl}/${vehicleId}`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to update vehicle status ${vehicleId}`)),
    );
  }

  updateVehicle(vehicleId: string, request: UpdateVehicleRequest): Observable<Vehicle> {
    return this.http.patch<VehicleResource>(`${this.endpointUrl}/${vehicleId}`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to update vehicle ${vehicleId}`)),
    );
  }
}
