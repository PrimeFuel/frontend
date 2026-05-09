import { Routes } from '@angular/router';
import {Layout} from '../../shared/presentation/component/layout/layout';

// Lazy loading de las vistas del BC Catalog
const productInventory = () =>
  import('./views/product-catalog/product-catalog').then((m) => m.ProductCatalog);

const productForm = () =>
  import('./views/product-form/product-form').then((m) => m.ProductForm);

const catalogRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'product-inventory', loadComponent: productInventory },
      { path: 'product-form', loadComponent: productForm },
      { path: 'product-form/:id', loadComponent: productForm },
      { path: '', redirectTo: 'product-inventory', pathMatch: 'full' },
    ],
  },
];

export { catalogRoutes };
