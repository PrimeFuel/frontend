import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Driver } from '../domain/model/driver.entity';
import { DriverResource, DriversResponse } from './driver-response';
import { DriverAssembler } from './driver-assembler';
import { RegisterDriverRequest, UpdateDriverStatusRequest, UpdateDriverRequest } from './driver.request';

const driversEndpointUrl = `${environment.serverBasePath}${environment.fulfillmentDriversEndpointPath}`;

export class DriverApiEndpoint extends BaseApiEndpoint<
  Driver,
  DriverResource,
  DriversResponse,
  DriverAssembler
> {
  constructor(http: HttpClient) {
    super(http, driversEndpointUrl, new DriverAssembler());
  }

  getDriversByProvider(providerId: string): Observable<Driver[]> {
    return this.http.get<DriverResource[]>(`${this.endpointUrl}?providerId=${providerId}`).pipe(
      map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch drivers for provider ${providerId}`)),
    );
  }

  getAvailableDrivers(providerId: string): Observable<Driver[]> {
    return this.http
      .get<DriverResource[]>(`${this.endpointUrl}?providerId=${providerId}&status=AVAILABLE`)
      .pipe(
        map((response) => response.map((r) => this.assembler.toEntityFromResource(r))),
        catchError(this.handleError('Failed to fetch available drivers')),
      );
  }

  registerDriver(request: RegisterDriverRequest): Observable<Driver> {
    return this.http.post<DriverResource>(this.endpointUrl, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to register driver')),
    );
  }

  updateDriverStatus(driverId: string, request: UpdateDriverStatusRequest): Observable<Driver> {
    return this.http.patch<DriverResource>(`${this.endpointUrl}/${driverId}`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to update driver status ${driverId}`)),
    );
  }

  updateDriver(driverId: string, request: UpdateDriverRequest): Observable<Driver> {
    return this.http.patch<DriverResource>(`${this.endpointUrl}/${driverId}`, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to update driver ${driverId}`)),
    );
  }
}
