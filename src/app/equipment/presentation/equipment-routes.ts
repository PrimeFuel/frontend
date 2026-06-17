import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

const equipmentList = () =>
  import('./views/equipment-list/equipment-list').then((m) => m.EquipmentList);
const equipmentForm = () =>
  import('./views/equipment-form/equipment-form').then((m) => m.EquipmentForm);

export const equipmentRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', loadComponent: equipmentList },
      { path: 'new', loadComponent: equipmentForm },
      { path: ':id/edit', loadComponent: equipmentForm },
      { path: 'equipment-form', redirectTo: 'new', pathMatch: 'full' },
      { path: 'equipment-form/:id', redirectTo: ':id/edit', pathMatch: 'full' },
    ],
  },
];
