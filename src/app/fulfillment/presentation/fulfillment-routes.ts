import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

// Lazy loading de las vistas del BC Fulfillment
const dispatchDashboard = () =>
  import('./views/dispatch-dashboard/dispatch-dashboard').then((m) => m.DispatchDashboard);

const vehicleList = () =>
  import('./views/vehicle-list/vehicle-list').then((m) => m.VehicleList);

const vehicleForm = () =>
  import('./views/vehicle-form/vehicle-form').then((m) => m.VehicleForm);

const driverList = () =>
  import('./views/driver-list/driver-list').then((m) => m.DriverList);

const driverForm = () =>
  import('./views/driver-form/driver-form').then((m) => m.DriverForm);

const fulfillmentRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'dispatch-dashboard', loadComponent: dispatchDashboard },
      { path: 'vehicle-list', loadComponent: vehicleList },
      { path: 'vehicle-form', loadComponent: vehicleForm },
      { path: 'vehicle-form/:id', loadComponent: vehicleForm },
      { path: 'driver-list', loadComponent: driverList },
      { path: 'driver-form', loadComponent: driverForm },
      { path: 'driver-form/:id', loadComponent: driverForm },
      { path: '', redirectTo: 'dispatch-dashboard', pathMatch: 'full' },
    ],
  },
];

export { fulfillmentRoutes };
