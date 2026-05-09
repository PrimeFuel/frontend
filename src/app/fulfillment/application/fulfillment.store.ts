import { Injectable, signal, computed } from '@angular/core';
import { retry } from 'rxjs';
import { FulfillmentApi } from '../infrastructure/fulfillment-api';
import { Vehicle } from '../domain/model/vehicle.entity';
import { Driver } from '../domain/model/driver.entity';
import { Delivery } from '../domain/model/delivery.entity';
import { RegisterVehicleRequest, UpdateVehicleStatusRequest } from '../infrastructure/vehicle.request';
import { RegisterDriverRequest, UpdateDriverStatusRequest } from '../infrastructure/driver.request';

/**
 * @summary Store de estado para el BC Fulfillment.
 * @remarks Gestiona estado de vehículos, conductores y entregas usando signals.
 * @author FullTank Platform
 */
@Injectable({ providedIn: 'root' })
export class FulfillmentStore {
  // ── State ────────────────────────────────────────────────────────────────
  private readonly _vehicleList = signal<Vehicle[]>([]);
  private readonly _selectedVehicle = signal<Vehicle | null>(null);
  private readonly _driverList = signal<Driver[]>([]);
  private readonly _selectedDriver = signal<Driver | null>(null);
  private readonly _deliveryList = signal<Delivery[]>([]);
  private readonly _selectedDelivery = signal<Delivery | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string>('');
  private readonly _successMsg = signal<string>('');

  // ── Public Readonly Signals ──────────────────────────────────────────────
  public readonly vehicleList = this._vehicleList.asReadonly();
  public readonly selectedVehicle = this._selectedVehicle.asReadonly();
  public readonly driverList = this._driverList.asReadonly();
  public readonly selectedDriver = this._selectedDriver.asReadonly();
  public readonly deliveryList = this._deliveryList.asReadonly();
  public readonly selectedDelivery = this._selectedDelivery.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly successMsg = this._successMsg.asReadonly();

  // ── Computed ─────────────────────────────────────────────────────────────
  public readonly availableVehicles = computed(() =>
    this._vehicleList().filter((vehicle) => vehicle.status === 'AVAILABLE'),
  );

  public readonly inRouteVehicles = computed(() =>
    this._vehicleList().filter((vehicle) => vehicle.status === 'IN_ROUTE'),
  );

  public readonly vehiclesInMaintenance = computed(() =>
    this._vehicleList().filter((vehicle) => vehicle.status === 'MAINTENANCE'),
  );

  public readonly availableDrivers = computed(() =>
    this._driverList().filter((driver) => driver.status === 'AVAILABLE'),
  );

  public readonly assignedDrivers = computed(() =>
    this._driverList().filter((driver) => driver.status === 'ASSIGNED'),
  );

  public readonly activeDeliveries = computed(() =>
    this._deliveryList().filter(
      (delivery) => delivery.status === 'ASSIGNED' || delivery.status === 'IN_TRANSIT',
    ),
  );

  public readonly completedDeliveries = computed(() =>
    this._deliveryList().filter((delivery) => delivery.status === 'DELIVERED'),
  );

  constructor(private api: FulfillmentApi) {}

  // ── Vehicle Operations ───────────────────────────────────────────────────
  loadVehiclesByProvider(providerId: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getVehiclesByProvider(providerId)
      .pipe(retry(2))
      .subscribe({
        next: (vehicles) => {
          setTimeout(() => {
            this._vehicleList.set(vehicles);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load vehicles');
          this._isLoading.set(false);
        },
      });
  }

  loadAvailableVehicles(providerId: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getAvailableVehicles(providerId)
      .pipe(retry(2))
      .subscribe({
        next: (vehicles) => {
          setTimeout(() => {
            this._vehicleList.set(vehicles);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load available vehicles');
          this._isLoading.set(false);
        },
      });
  }

  registerVehicle(request: RegisterVehicleRequest): void {
    this._isLoading.set(true);
    this._error.set('');
    this._successMsg.set('');

    this.api
      .registerVehicle(request)
      .pipe(retry(2))
      .subscribe({
        next: (vehicle) => {
          setTimeout(() => {
            this._vehicleList.update((list) => [...list, vehicle]);
            this._successMsg.set('Vehicle registered successfully');
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to register vehicle');
          this._isLoading.set(false);
        },
      });
  }

  updateVehicleStatus(vehicleId: string, request: UpdateVehicleStatusRequest): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .updateVehicleStatus(vehicleId, request)
      .pipe(retry(2))
      .subscribe({
        next: (updatedVehicle) => {
          setTimeout(() => {
            this._vehicleList.update((list) =>
              list.map((v) => (v.id === vehicleId ? updatedVehicle : v)),
            );
            this._successMsg.set('Vehicle status updated successfully');
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to update vehicle status');
          this._isLoading.set(false);
        },
      });
  }

  // ── Driver Operations ────────────────────────────────────────────────────
  loadDriversByProvider(providerId: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getDriversByProvider(providerId)
      .pipe(retry(2))
      .subscribe({
        next: (drivers) => {
          setTimeout(() => {
            this._driverList.set(drivers);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load drivers');
          this._isLoading.set(false);
        },
      });
  }

  loadAvailableDrivers(providerId: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getAvailableDrivers(providerId)
      .pipe(retry(2))
      .subscribe({
        next: (drivers) => {
          setTimeout(() => {
            this._driverList.set(drivers);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load available drivers');
          this._isLoading.set(false);
        },
      });
  }

  registerDriver(request: RegisterDriverRequest): void {
    this._isLoading.set(true);
    this._error.set('');
    this._successMsg.set('');

    this.api
      .registerDriver(request)
      .pipe(retry(2))
      .subscribe({
        next: (driver) => {
          setTimeout(() => {
            this._driverList.update((list) => [...list, driver]);
            this._successMsg.set('Driver registered successfully');
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to register driver');
          this._isLoading.set(false);
        },
      });
  }

  updateDriverStatus(driverId: string, request: UpdateDriverStatusRequest): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .updateDriverStatus(driverId, request)
      .pipe(retry(2))
      .subscribe({
        next: (updatedDriver) => {
          setTimeout(() => {
            this._driverList.update((list) =>
              list.map((d) => (d.id === driverId ? updatedDriver : d)),
            );
            this._successMsg.set('Driver status updated successfully');
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to update driver status');
          this._isLoading.set(false);
        },
      });
  }

  // ── Delivery Operations ──────────────────────────────────────────────────
  loadDeliveriesByProvider(providerId: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getDeliveriesByProvider(providerId)
      .pipe(retry(2))
      .subscribe({
        next: (deliveries) => {
          setTimeout(() => {
            this._deliveryList.set(deliveries);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load deliveries');
          this._isLoading.set(false);
        },
      });
  }

  loadDeliveryByOrder(orderId: string): void {
    this._isLoading.set(true);
    this._error.set('');

    this.api
      .getDeliveryByOrder(orderId)
      .pipe(retry(2))
      .subscribe({
        next: (delivery) => {
          setTimeout(() => {
            this._selectedDelivery.set(delivery);
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to load delivery');
          this._isLoading.set(false);
        },
      });
  }

  assignResources(request: any): void {
    this._isLoading.set(true);
    this._error.set('');
    this._successMsg.set('');

    this.api
      .assignResources(request)
      .pipe(retry(2))
      .subscribe({
        next: (delivery) => {
          setTimeout(() => {
            this._deliveryList.update((list) => [...list, delivery]);
            this._successMsg.set('Resources assigned successfully');
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to assign resources');
          this._isLoading.set(false);
        },
      });
  }

  executeDispatch(deliveryId: string, request: any): void {
    this._isLoading.set(true);
    this._error.set('');
    this._successMsg.set('');

    this.api
      .executeDispatch(deliveryId, request)
      .pipe(retry(2))
      .subscribe({
        next: (delivery) => {
          setTimeout(() => {
            this._deliveryList.update((list) =>
              list.map((d) => (d.id === deliveryId ? delivery : d)),
            );
            this._successMsg.set('Dispatch executed successfully');
            this._isLoading.set(false);
          }, 100);
        },
        error: (err) => {
          this._error.set(err.message || 'Failed to execute dispatch');
          this._isLoading.set(false);
        },
      });
  }

  // ── Utility ──────────────────────────────────────────────────────────────
  clearMessages(): void {
    this._error.set('');
    this._successMsg.set('');
  }
}
