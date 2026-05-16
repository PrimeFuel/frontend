import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

// Lazy loading de las vistas del BC Reporting
const supplierDashboard = () =>
  import('./views/supplier-dashboard/supplier-dashboard').then((m) => m.SupplierDashboard);

const clientPortfolio = () =>
  import('./views/client-portfolio/client-portfolio').then((m) => m.ClientPortfolio);

const reportingRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'report-main', loadComponent: supplierDashboard },
      { path: 'client-reports', loadComponent: clientPortfolio },
      { path: '', redirectTo: 'report-main', pathMatch: 'full' },
    ],
  },
];

export { reportingRoutes };
