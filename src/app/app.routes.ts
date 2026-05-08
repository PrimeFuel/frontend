import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';

const about = () => import('./shared/presentation/views/about/about').then((m) => m.About);
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);

/***const iamRoutes = () => import('./iam/presentation/iam-routes').then((m) => m.iamRoutes);
const catalogRoutes = () => import('./catalog/presentation/catalog-routes').then((m) => m.catalogRoutes);
const orderingRoutes = () => import('./ordering/presentation/ordering-routes').then((m) => m.orderingRoutes);
const fulfillmentRoutes = () => import('./fulfillment/presentation/fulfillment-routes').then((m) => m.fulfillmentRoutes);
const paymentRoutes = () => import('./payment/presentation/payment-routes').then((m) => m.paymentRoutes);
const notificationRoutes = () => import('./notification/presentation/notification-routes').then((m) => m.notificationRoutes);
const reportingRoutes = () => import('./reporting/presentation/reporting-routes').then((m) => m.reportingRoutes);
**/
const baseTitle = 'FullTank';

export const routes: Routes = [
  { path: 'home', component: Home, title: `Home - ${baseTitle}` },
  { path: 'about', loadComponent: about, title: `About - ${baseTitle}` },

 /** // Bounded Contexts
  { path: 'iam', loadChildren: iamRoutes },
  { path: 'catalog', loadChildren: catalogRoutes },
  { path: 'ordering', loadChildren: orderingRoutes },
  { path: 'fulfillment', loadChildren: fulfillmentRoutes },
  { path: 'payment', loadChildren: paymentRoutes },
  { path: 'notification', loadChildren: notificationRoutes },
  { path: 'reporting', loadChildren: reportingRoutes },
**/

  // Redirects
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `Page Not Found - ${baseTitle}` },
];
