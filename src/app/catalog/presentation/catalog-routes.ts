import { Routes } from '@angular/router';
import {Layout} from '../../shared/presentation/component/layout/layout';

// Lazy loading de las vistas del BC Catalog
const productCatalog = () =>
  import('./views/product-catalog/product-catalog').then((m) => m.ProductCatalog);

const productForm = () =>
  import('./views/product-form/product-form').then((m) => m.ProductForm);

const inventoryList = () =>
  import('./views/inventory-list/inventory-list').then((m) => m.InventoryList);

const catalogRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'product-catalog', loadComponent: productCatalog },
      { path: 'product-form', loadComponent: productForm },
      { path: 'product-form/:id', loadComponent: productForm },
      { path: 'inventory-list', loadComponent: inventoryList },
      { path: '', redirectTo: 'product-catalog', pathMatch: 'full' },
    ],
  },
];

export { catalogRoutes };
