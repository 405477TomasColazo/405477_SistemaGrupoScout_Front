import { Routes } from '@angular/router';

export const educatorRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboards/educator-dashboard-new/educator-dashboard-new.component').then(m => m.EducatorDashboardNewComponent)
  },
  {
    path: 'scouts',
    loadComponent: () => import('../../shared/educator-dashboard/educator-dashboard.component').then(m => m.EducatorDashboardComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];