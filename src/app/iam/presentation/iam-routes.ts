import { Routes } from '@angular/router';
import { Layout } from '../../shared/presentation/component/layout/layout';

const roleSelection = () =>
  import('./views/role-selection/role-selection').then((m) => m.RoleSelection);
const profileEdit = () =>
  import('./views/profile-edit/profile-edit').then((m) => m.ProfileEdit);

export const iamRoutes: Routes = [
  { path: '', loadComponent: roleSelection },
  {
    path: '',
    component: Layout,
    children: [{ path: 'profile', loadComponent: profileEdit }],
  },
];
