import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, switchMap } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Vehicle } from '../domain/model/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './vehicle-response';
import { VehicleAssembler } from './vehicle-assembler';

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

  override getAll(): Observable<Vehicle[]> {
    return super.getAll();
  }

  override getById(id: string): Observable<Vehicle> {
    return super.getById(id);
  }

  getVehiclesByProvider(providerId: string): Observable<Vehicle[]> {
    return this.http.get<VehicleResource[]>(this.endpointUrl, { params: { providerId } }).pipe(
      map((rows) => rows.map((row) => this.assembler.toEntityFromResource(row))),
      catchError(this.handleError(`Failed to fetch vehicles for provider ${providerId}`)),
    );
  }

  getAvailableVehicles(providerId: string): Observable<Vehicle[]> {
    return this.getVehiclesByProvider(providerId).pipe(
      map((vehicles) => vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE')),
    );
  }

  registerVehicle(request: Omit<Vehicle, 'id' | 'createdAt'>): Observable<Vehicle> {
    return this.http.post<VehicleResource>(this.endpointUrl, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to register vehicle')),
    );
  }

  updateVehicleStatus(vehicleId: string, request: Pick<Vehicle, 'status'>): Observable<Vehicle> {
    return this.getById(vehicleId).pipe(
      map((vehicle) => new Vehicle({ ...vehicle, status: request.status })),
      switchMap((vehicle) => this.update(vehicle, vehicleId)),
    );
  }

  updateVehicle(
    vehicleId: string,
    request: Partial<Omit<Vehicle, 'id' | 'providerId' | 'createdAt'>>,
  ): Observable<Vehicle> {
    return this.getById(vehicleId).pipe(
      map((vehicle) => new Vehicle({ ...vehicle, ...request })),
      switchMap((vehicle) => this.update(vehicle, vehicleId)),
    );
  }
}
