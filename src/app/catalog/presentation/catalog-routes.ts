import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

const catalogView = () =>
  import('./views/catalog-view/catalog-view').then((m) => m.CatalogView);
const providerDetail = () =>
  import('./views/provider-detail/provider-detail').then((m) => m.ProviderDetail);

export const catalogRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', loadComponent: catalogView },
      { path: 'providers/:id', loadComponent: providerDetail },
      { path: 'provider/:id', redirectTo: 'providers/:id', pathMatch: 'full' },
    ],
  },
];
