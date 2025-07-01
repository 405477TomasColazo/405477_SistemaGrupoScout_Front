import { Routes } from '@angular/router';

export const familyRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboards/family-dashboard/family-dashboard.component').then(m => m.FamilyDashboardComponent)
  },
  {
    path: 'gestion',
    loadComponent: () => import('../../shared/family-gestion/family-gestion.component').then(m => m.FamilyGestionComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];