import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

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
      { path: 'vehicles', loadComponent: vehicleList },
      { path: 'vehicles/new', loadComponent: vehicleForm },
      { path: 'vehicles/:id/edit', loadComponent: vehicleForm },
      { path: 'drivers', loadComponent: driverList },
      { path: 'drivers/new', loadComponent: driverForm },
      { path: 'drivers/:id/edit', loadComponent: driverForm },
      { path: 'vehicle-list', redirectTo: 'vehicles', pathMatch: 'full' },
      { path: 'vehicle-form', redirectTo: 'vehicles/new', pathMatch: 'full' },
      { path: 'vehicle-form/:id', redirectTo: 'vehicles/:id/edit', pathMatch: 'full' },
      { path: 'driver-list', redirectTo: 'drivers', pathMatch: 'full' },
      { path: 'driver-form', redirectTo: 'drivers/new', pathMatch: 'full' },
      { path: 'driver-form/:id', redirectTo: 'drivers/:id/edit', pathMatch: 'full' },
      { path: '', redirectTo: 'vehicles', pathMatch: 'full' },
    ],
  },
];

export { fulfillmentRoutes };
