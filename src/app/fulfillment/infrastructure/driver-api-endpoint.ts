import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, switchMap } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Driver } from '../domain/model/driver.entity';
import { DriverResource, DriversResponse } from './driver-response';
import { DriverAssembler } from './driver-assembler';

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

  override getAll(): Observable<Driver[]> {
    return super.getAll();
  }

  override getById(id: string): Observable<Driver> {
    return super.getById(id);
  }

  getDriversByProvider(providerId: string): Observable<Driver[]> {
    return this.http.get<DriverResource[]>(this.endpointUrl, { params: { providerId } }).pipe(
      map((rows) => rows.map((row) => this.assembler.toEntityFromResource(row))),
      catchError(this.handleError(`Failed to fetch drivers for provider ${providerId}`)),
    );
  }

  getAvailableDrivers(providerId: string): Observable<Driver[]> {
    return this.getDriversByProvider(providerId).pipe(
      map((drivers) => drivers.filter((driver) => driver.status === 'AVAILABLE')),
    );
  }

  registerDriver(request: Omit<Driver, 'id' | 'createdAt'>): Observable<Driver> {
    return this.http.post<DriverResource>(this.endpointUrl, request).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to register driver')),
    );
  }

  updateDriverStatus(driverId: string, request: Pick<Driver, 'status'>): Observable<Driver> {
    return this.getById(driverId).pipe(
      map((driver) => new Driver({ ...driver, status: request.status })),
      switchMap((driver) => this.update(driver, driverId)),
    );
  }

  updateDriver(
    driverId: string,
    request: Partial<Omit<Driver, 'id' | 'providerId' | 'createdAt'>>,
  ): Observable<Driver> {
    return this.getById(driverId).pipe(
      map((driver) => new Driver({ ...driver, ...request })),
      switchMap((driver) => this.update(driver, driverId)),
    );
  }
}
