import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';

import { Vehicle } from '../domain/model/vehicle.entity';
import { Driver } from '../domain/model/driver.entity';
import { Delivery } from '../domain/model/delivery.entity';

import { VehicleApiEndpoint } from './vehicle-api-endpoint';
import { DriverApiEndpoint } from './driver-api-endpoint';
import { DeliveryApiEndpoint } from './delivery-api-endpoint';

import { RegisterVehicleRequest, UpdateVehicleStatusRequest, UpdateVehicleRequest } from './vehicle.request';
import { RegisterDriverRequest, UpdateDriverStatusRequest, UpdateDriverRequest } from './driver.request';

/**
 * @summary API gateway para el bounded context Fulfillment.
 * @remarks Agrega VehicleApiEndpoint, DriverApiEndpoint y DeliveryApiEndpoint,
 * exponiendo operaciones de logística y despacho al application layer.
 * @author FullTank Platform
 */
@Injectable({ providedIn: 'root' })
export class FulfillmentApi extends BaseApi {
  private readonly _vehicleEndpoint: VehicleApiEndpoint;
  private readonly _driverEndpoint: DriverApiEndpoint;
  private readonly _deliveryEndpoint: DeliveryApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this._vehicleEndpoint = new VehicleApiEndpoint(http);
    this._driverEndpoint = new DriverApiEndpoint(http);
    this._deliveryEndpoint = new DeliveryApiEndpoint(http);
  }

  // ── Vehicles ─────────────────────────────────────────────────────────────
  getVehiclesByProvider(providerId: string): Observable<Vehicle[]> {
    return this._vehicleEndpoint.getVehiclesByProvider(providerId);
  }

  getAvailableVehicles(providerId: string): Observable<Vehicle[]> {
    return this._vehicleEndpoint.getAvailableVehicles(providerId);
  }

  registerVehicle(request: RegisterVehicleRequest): Observable<Vehicle> {
    return this._vehicleEndpoint.registerVehicle(request);
  }

  updateVehicleStatus(vehicleId: string, request: UpdateVehicleStatusRequest): Observable<Vehicle> {
    return this._vehicleEndpoint.updateVehicleStatus(vehicleId, request);
  }

  getVehicleById(vehicleId: string): Observable<Vehicle> {
    return this._vehicleEndpoint.getById(vehicleId);
  }

  updateVehicle(vehicleId: string, request: UpdateVehicleRequest): Observable<Vehicle> {
    return this._vehicleEndpoint.updateVehicle(vehicleId, request);
  }

  deleteVehicle(vehicleId: string): Observable<void> {
    return this._vehicleEndpoint.delete(vehicleId);
  }

  // ── Drivers ──────────────────────────────────────────────────────────────
  getDriversByProvider(providerId: string): Observable<Driver[]> {
    return this._driverEndpoint.getDriversByProvider(providerId);
  }

  getAvailableDrivers(providerId: string): Observable<Driver[]> {
    return this._driverEndpoint.getAvailableDrivers(providerId);
  }

  registerDriver(request: RegisterDriverRequest): Observable<Driver> {
    return this._driverEndpoint.registerDriver(request);
  }

  updateDriverStatus(driverId: string, request: UpdateDriverStatusRequest): Observable<Driver> {
    return this._driverEndpoint.updateDriverStatus(driverId, request);
  }

  getDriverById(driverId: string): Observable<Driver> {
    return this._driverEndpoint.getById(driverId);
  }

  updateDriver(driverId: string, request: UpdateDriverRequest): Observable<Driver> {
    return this._driverEndpoint.updateDriver(driverId, request);
  }

  deleteDriver(driverId: string): Observable<void> {
    return this._driverEndpoint.delete(driverId);
  }

  // ── Deliveries ───────────────────────────────────────────────────────────
  getDeliveriesByProvider(providerId: string): Observable<Delivery[]> {
    return this._deliveryEndpoint.getDeliveriesByProvider(providerId);
  }

  getDeliveryByOrder(orderId: string): Observable<Delivery> {
    return this._deliveryEndpoint.getDeliveryByOrder(orderId);
  }

  assignResources(request: any): Observable<Delivery> {
    return this._deliveryEndpoint.assignResources(request);
  }

  executeDispatch(deliveryId: string, request: any): Observable<Delivery> {
    return this._deliveryEndpoint.executeDispatch(deliveryId, request);
  }
}
