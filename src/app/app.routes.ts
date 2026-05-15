import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';

const about = () => import('./shared/presentation/views/about/about').then((m) => m.About);

const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);

const inventoryRoutes = () =>
  import('./inventory/presentation/inventory-routes').then((m) => m.inventoryRoutes);

const fulfillmentRoutes = () =>
  import('./fulfillment/presentation/fulfillment-routes').then((m) => m.fulfillmentRoutes);

const reportingRoutes = () =>
  import('./reporting/presentation/reporting-routes').then((m) => m.reportingRoutes);
const orderingRoutes = () =>
  import('./ordering/presentation/ordering-routes').then((m) => m.orderingRoutes);

const dashboardRoutes = () =>
  import('./dashboard/presentation/dashboard.routes').then((m) => m.dashboardRoutes);

const notificationRoutes = () =>
  import('./notification/presentation/notification-routes').then((m) => m.notificationRoutes);

const baseTitle = 'FullTank';

export const routes: Routes = [
  { path: 'home', component: Home, title: `Home - ${baseTitle}` },
  { path: 'about', loadComponent: about, title: `About - ${baseTitle}` },
  { path: 'inventory', loadChildren: inventoryRoutes },
  { path: 'fulfillment', loadChildren: fulfillmentRoutes },
  {path:'dashboard', loadChildren: dashboardRoutes },

  { path: 'notification', loadChildren: notificationRoutes },

  { path: 'ordering', loadChildren: orderingRoutes },


  { path: 'reporting', loadChildren: reportingRoutes },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `Page Not Found - ${baseTitle}` },
];
