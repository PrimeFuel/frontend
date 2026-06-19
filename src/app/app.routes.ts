import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';
import { authGuard, buyerGuard, dashboardRedirectGuard, providerGuard } from './iam/infrastructure/auth.guard';

const about = () => import('./shared/presentation/views/about/about').then((m) => m.About);
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);
const iamRoutes = () => import('./iam/presentation/iam-routes').then((m) => m.iamRoutes);
const catalogRoutes = () => import('./catalog/presentation/catalog-routes').then((m) => m.catalogRoutes);
const inventoryRoutes = () => import('./inventory/presentation/inventory-routes').then((m) => m.inventoryRoutes);
const fulfillmentRoutes = () => import('./fulfillment/presentation/fulfillment-routes').then((m) => m.fulfillmentRoutes);
const reportingRoutes = () => import('./reporting/presentation/reporting-routes').then((m) => m.reportingRoutes);
const orderingRoutes = () => import('./ordering/presentation/ordering-routes').then((m) => m.orderingRoutes);
const notificationRoutes = () => import('./notification/presentation/notification-routes').then((m) => m.notificationRoutes);
const equipmentRoutes = () => import('./equipment/presentation/equipment-routes').then((m) => m.equipmentRoutes);
const paymentRoutes = () => import('./payment/presentation/payment-routes').then((m) => m.paymentRoutes);

const baseTitle = 'FullTank';

export const routes: Routes = [
  { path: 'home', component: Home, title: `Home - ${baseTitle}` },
  { path: 'about', loadComponent: about, title: `About - ${baseTitle}` },
  { path: 'iam', loadChildren: iamRoutes },
  { path: 'dashboard', canActivate: [authGuard, dashboardRedirectGuard], children: [] },
  { path: 'catalog', canActivate: [authGuard, buyerGuard], loadChildren: catalogRoutes },
  { path: 'equipment', canActivate: [authGuard, buyerGuard], loadChildren: equipmentRoutes },
  { path: 'payment', canActivate: [authGuard, buyerGuard], loadChildren: paymentRoutes },
  { path: 'inventory', canActivate: [authGuard, providerGuard], loadChildren: inventoryRoutes },
  { path: 'fulfillment', canActivate: [authGuard, providerGuard], loadChildren: fulfillmentRoutes },
  { path: 'ordering', canActivate: [authGuard], loadChildren: orderingRoutes },
  { path: 'reporting', canActivate: [authGuard], loadChildren: reportingRoutes },
  { path: 'notification', canActivate: [authGuard], loadChildren: notificationRoutes },
  { path: '', redirectTo: '/iam', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `Page Not Found - ${baseTitle}` },
];
