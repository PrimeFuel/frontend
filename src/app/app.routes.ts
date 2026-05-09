import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';

const about = () => import('./shared/presentation/views/about/about').then((m) => m.About);

const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);

const catalogRoutes = () =>
  import('./catalog/presentation/catalog-routes').then((m) => m.catalogRoutes);

const fulfillmentRoutes = () =>
  import('./fulfillment/presentation/fulfillment-routes').then((m) => m.fulfillmentRoutes);


/*
// Bounded Contexts pendientes de implementación
const iamRoutes = () => import('./iam/presentation/iam-routes').then((m) => m.iamRoutes);

const orderingRoutes = () =>
  import('./ordering/presentation/ordering-routes').then((m) => m.orderingRoutes);

const paymentRoutes = () =>
  import('./payment/presentation/payment-routes').then((m) => m.paymentRoutes);

const notificationRoutes = () =>
  import('./notification/presentation/notification-routes').then((m) => m.notificationRoutes);
*/

const baseTitle = 'FullTank';

export const routes: Routes = [
  { path: 'home', component: Home, title: `Home - ${baseTitle}` },
  { path: 'about', loadComponent: about, title: `About - ${baseTitle}` },
  { path: 'catalog', loadChildren: catalogRoutes },
  { path: 'fulfillment', loadChildren: fulfillmentRoutes },

  /*
  { path: 'iam', loadChildren: iamRoutes },
  { path: 'ordering', loadChildren: orderingRoutes },
  { path: 'payment', loadChildren: paymentRoutes },
  { path: 'notification', loadChildren: notificationRoutes },
  */

  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `Page Not Found - ${baseTitle}` },
];
