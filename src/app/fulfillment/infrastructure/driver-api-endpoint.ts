import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Driver } from '../domain/model/driver.entity';
import { DriverResource, DriversResponse } from './driver-response';
import { DriverAssembler } from './driver-assembler';
import { RegisterDriverRequest, UpdateDriverStatusRequest } from './driver.request';

const fulfillmentEndpointUrl = `${environment.serverBasePath}${environment.fulfillmentDriversEndpointPath}`;

/**
 * @summary Endpoint API para gestión de conductores.
 * @remarks Expone operaciones CRUD y consultas específicas de conductores.
 * @author FullTank Platform
 */
export class DriverApiEndpoint extends BaseApiEndpoint<
  Driver,
  DriverResource,
  DriversResponse,
  DriverAssembler
> {
  constructor(http: HttpClient) {
    super(http, fulfillmentEndpointUrl, new DriverAssembler());
  }

  /**
   * Obtiene conductores de un proveedor específico.
   */
  getDriversByProvider(providerId: string): Observable<Driver[]> {
    return this.http.get<DriversResponse>(`${this.endpointUrl}/provider/${providerId}`).pipe(
      map((response) => this.assembler.toEntitiesFromResponse(response)),
      catchError(this.handleError(`Failed to fetch drivers for provider ${providerId}`)),
    );
  }

  /**
   * Obtiene conductores disponibles.
   */
  getAvailableDrivers(providerId: string): Observable<Driver[]> {
    return this.http.get<DriversResponse>(`${this.endpointUrl}/provider/${providerId}/available`).pipe(
      map((response) => this.assembler.toEntitiesFromResponse(response)),
      catchError(this.handleError('Failed to fetch available drivers')),
    );
  }

  /**
   * Registra un nuevo conductor.
   */
  registerDriver(request: RegisterDriverRequest): Observable<Driver> {
    return this.http.post<DriverResource>(this.endpointUrl, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to register driver')),
    );
  }

  /**
   * Actualiza el estado de un conductor.
   */
  updateDriverStatus(driverId: string, request: UpdateDriverStatusRequest): Observable<Driver> {
    return this.http.put<DriverResource>(`${this.endpointUrl}/${driverId}/status`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to update driver status ${driverId}`)),
    );
  }
}
