import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

const paymentList = () =>
  import('./views/payment-list/payment-list').then((m) => m.PaymentList);

export const paymentRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', loadComponent: paymentList },
    ],
  },
];
