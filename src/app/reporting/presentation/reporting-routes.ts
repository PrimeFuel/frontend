import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';
import { buyerGuard, providerGuard } from '../../iam/infrastructure/auth.guard';

const supplierDashboard = () =>
  import('./views/supplier-dashboard/supplier-dashboard').then((m) => m.SupplierDashboard);
const buyerDashboard = () =>
  import('./views/buyer-dashboard/buyer-dashboard').then((m) => m.BuyerDashboard);
const providerDashboard = () =>
  import('./views/provider-dashboard/provider-dashboard').then((m) => m.ProviderDashboard);
const legacyDashboard = () =>
  import('./views/dashboard/dashboard').then((m) => m.Dashboard);
const clientPortfolio = () =>
  import('./views/client-portfolio/client-portfolio').then((m) => m.ClientPortfolio);
const buyerReport = () =>
  import('./views/buyer-report/buyer-report').then((m) => m.BuyerReport);

const reportingRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'buyer-dashboard', canActivate: [buyerGuard], loadComponent: buyerDashboard },
      { path: 'provider-dashboard', canActivate: [providerGuard], loadComponent: providerDashboard },
      { path: 'buyer', canActivate: [buyerGuard], loadComponent: buyerReport },
      { path: 'provider', canActivate: [providerGuard], loadComponent: supplierDashboard },
      { path: 'legacy-dashboard', loadComponent: legacyDashboard },
      { path: 'report-main', redirectTo: 'provider', pathMatch: 'full' },
      { path: 'client-reports', canActivate: [providerGuard], loadComponent: clientPortfolio },
      { path: 'buyer-report', redirectTo: 'buyer', pathMatch: 'full' },
      { path: '', redirectTo: 'provider', pathMatch: 'full' },
    ],
  },
];

export { reportingRoutes };
