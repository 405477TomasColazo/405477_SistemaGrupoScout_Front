import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboards/admin-dashboard-new/admin-dashboard-new.component').then(m => m.AdminDashboardNewComponent)
  },
  {
    path: 'stats',
    loadComponent: () => import('../../shared/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('../../shared/registry-management/registry-management.component').then(m => m.RegistryManagementComponent)
  },
  {
    path: 'payments',
    loadComponent: () => import('../../shared/admin-payments-management/admin-payments-management.component').then(m => m.AdminPaymentsManagementComponent)
  },
  {
    path: 'monthly-fees',
    loadComponent: () => import('../../shared/admin-dashboard/monthly-fee-management/monthly-fee-management.component').then(m => m.MonthlyFeeManagementComponent)
  },
  {
    path: 'noticias',
    loadComponent: () => import('../../shared/news/news-admin/news-admin-list.component').then(m => m.NewsAdminListComponent)
  },
  {
    path: 'noticias/crear',
    loadComponent: () => import('../../shared/news/news-admin/news-form.component').then(m => m.NewsFormComponent)
  },
  {
    path: 'noticias/:id/editar',
    loadComponent: () => import('../../shared/news/news-admin/news-form.component').then(m => m.NewsFormComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];