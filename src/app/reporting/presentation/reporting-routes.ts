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
      { path: 'supplier-dashboard', loadComponent: supplierDashboard },
      { path: 'client-portfolio', loadComponent: clientPortfolio },
      { path: '', redirectTo: 'supplier-dashboard', pathMatch: 'full' },
    ],
  },
];

export { reportingRoutes };
