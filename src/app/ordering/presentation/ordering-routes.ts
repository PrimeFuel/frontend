import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';
import { buyerGuard, providerGuard } from '../../iam/infrastructure/auth.guard';

const requestList = () => import('./views/request-list/request-list').then(m => m.RequestList);
const requestForm = () => import('./views/request-form/request-form').then(m => m.RequestForm);
const orderList = () => import('./views/order-list/order-list').then(m => m.OrderList);
const orderDetail = () => import('./views/order-detail/order-detail').then(m => m.OrderDetail);
const myRequests = () => import('./views/my-requests/my-requests').then(m => m.MyRequests);
const myOrders = () => import('./views/my-orders/my-orders').then(m => m.MyOrders);
const buyerOrderDetail = () => import('./views/buyer-order-detail/buyer-order-detail').then(m => m.BuyerOrderDetail);
const collections = () => import('./views/collections/collections').then(m => m.Collections);

const orderingRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'pending', canActivate: [providerGuard], loadComponent: requestList },
      { path: 'orders', canActivate: [providerGuard], loadComponent: orderList },
      { path: 'orders/:id', canActivate: [providerGuard], loadComponent: orderDetail },
      { path: 'collections', canActivate: [providerGuard], loadComponent: collections },
      { path: 'my-requests', canActivate: [buyerGuard], loadComponent: myRequests },
      { path: 'my-orders', canActivate: [buyerGuard], loadComponent: myOrders },
      { path: 'my-orders/:id', canActivate: [buyerGuard], loadComponent: buyerOrderDetail },
      { path: 'request-form', canActivate: [buyerGuard], loadComponent: requestForm },
      { path: 'request-form/:id', canActivate: [buyerGuard], loadComponent: requestForm },
      { path: 'request-list', redirectTo: 'pending', pathMatch: 'full' },
      { path: 'order-list', redirectTo: 'orders', pathMatch: 'full' },
      { path: 'order-detail/:id', redirectTo: 'orders/:id', pathMatch: 'full' },
      { path: 'buyer-order/:id', redirectTo: 'my-orders/:id', pathMatch: 'full' },
      { path: '', redirectTo: 'pending', pathMatch: 'full' },
    ],
  },
];

export { orderingRoutes };
