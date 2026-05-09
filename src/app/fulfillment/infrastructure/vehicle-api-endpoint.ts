import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './vehicle-response';
import { VehicleAssembler } from './vehicle-assembler';
import { RegisterVehicleRequest, UpdateVehicleStatusRequest } from './vehicle.request';

const fulfillmentEndpointUrl = `${environment.serverBasePath}${environment.fulfillmentVehiclesEndpointPath}`;

/**
 * @summary Endpoint API para gestión de vehículos.
 * @remarks Expone operaciones CRUD y consultas específicas de vehículos.
 * @author FullTank Platform
 */
export class VehicleApiEndpoint extends BaseApiEndpoint<
  Vehicle,
  VehicleResource,
  VehiclesResponse,
  VehicleAssembler
> {
  constructor(http: HttpClient) {
    super(http, fulfillmentEndpointUrl, new VehicleAssembler());
  }

  /**
   * Obtiene vehículos de un proveedor específico.
   */
  getVehiclesByProvider(providerId: string): Observable<Vehicle[]> {
    return this.http.get<VehiclesResponse>(`${this.endpointUrl}/provider/${providerId}`).pipe(
      map((response) => this.assembler.toEntitiesFromResponse(response)),
      catchError(this.handleError(`Failed to fetch vehicles for provider ${providerId}`)),
    );
  }

  /**
   * Obtiene vehículos disponibles.
   */
  getAvailableVehicles(providerId: string): Observable<Vehicle[]> {
    return this.http.get<VehiclesResponse>(`${this.endpointUrl}/provider/${providerId}/available`).pipe(
      map((response) => this.assembler.toEntitiesFromResponse(response)),
      catchError(this.handleError('Failed to fetch available vehicles')),
    );
  }

  /**
   * Registra un nuevo vehículo.
   */
  registerVehicle(request: RegisterVehicleRequest): Observable<Vehicle> {
    return this.http.post<VehicleResource>(this.endpointUrl, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to register vehicle')),
    );
  }

  /**
   * Actualiza el estado de un vehículo.
   */
  updateVehicleStatus(vehicleId: string, request: UpdateVehicleStatusRequest): Observable<Vehicle> {
    return this.http.put<VehicleResource>(`${this.endpointUrl}/${vehicleId}/status`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to update vehicle status ${vehicleId}`)),
    );
  }
}
