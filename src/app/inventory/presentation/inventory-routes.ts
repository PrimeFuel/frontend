import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

const productInventory = () =>
  import('./views/product-inventory/product-inventory').then((m) => m.ProductInventory);
const productForm = () =>
  import('./views/product-form/product-form').then((m) => m.ProductForm);

const inventoryRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'products', loadComponent: productInventory },
      { path: 'products/new', loadComponent: productForm },
      { path: 'products/:id/edit', loadComponent: productForm },
      { path: 'product-inventory', redirectTo: 'products', pathMatch: 'full' },
      { path: 'product-form', redirectTo: 'products/new', pathMatch: 'full' },
      { path: 'product-form/:id', redirectTo: 'products/:id/edit', pathMatch: 'full' },
      { path: 'catalog', redirectTo: '/catalog', pathMatch: 'full' },
      { path: 'catalog/provider/:id', redirectTo: '/catalog/providers/:id', pathMatch: 'full' },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },
];

export { inventoryRoutes };
