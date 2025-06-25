import { Routes } from '@angular/router';

// Layout Components
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';

// Auth Components
import { LoginComponent } from './features/auth/login/login.component';
import { LogoutComponent } from './features/auth/logout/logout.component';

// Dashboard Components
import { FamilyDashboardComponent } from './features/dashboards/family-dashboard/family-dashboard.component';
import { EducatorDashboardNewComponent } from './features/dashboards/educator-dashboard-new/educator-dashboard-new.component';
import { AdminDashboardNewComponent } from './features/dashboards/admin-dashboard-new/admin-dashboard-new.component';

// Existing Components
import { HomeComponent } from './shared/home/home.component';
import { FamilyGestionComponent } from './shared/family-gestion/family-gestion.component';
import { RegistryManagementComponent } from './shared/registry-management/registry-management.component';
import { RegistryComponent } from './shared/registry/registry.component';
import { PaymentsComponent } from './shared/payments/payments.component';
import { EducatorDashboardComponent } from './shared/educator-dashboard/educator-dashboard.component';
import { AdminDashboardComponent } from './shared/admin-dashboard/admin-dashboard.component';
import { EventManagementComponent } from './shared/event-management/event-management.component';
import { FamilyEventsComponent } from './shared/family-events/family-events.component';
import { ProgressionDashboardComponent } from './shared/progression/progression-dashboard/progression-dashboard.component';
import { MarchSheetComponent } from './shared/progression/march-sheet/march-sheet.component';
import { SelectCompetencesComponent } from './shared/progression/select-competences/select-competences.component';
import { NewsListComponent } from './shared/news/news-list/news-list.component';
import { NewsDetailComponent } from './shared/news/news-detail/news-detail.component';
import { NewsAdminListComponent } from './shared/news/news-admin/news-admin-list.component';
import { NewsFormComponent } from './shared/news/news-admin/news-form.component';
import { AdminPaymentsManagementComponent } from './shared/admin-payments-management/admin-payments-management.component';
import { MonthlyFeeManagementComponent } from './shared/admin-dashboard/monthly-fee-management/monthly-fee-management.component';

// Guards
import { AuthGuard } from './core/auth/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { EducatorGuard } from './core/guards/educator.guard';
import { FamilyGuard } from './core/guards/family.guard';

export const routes: Routes = [
  // Auth Routes (no layout, uses AuthLayoutComponent)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'logout', component: LogoutComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Main Application Routes (with MainLayoutComponent)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // Public Routes
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'noticias', component: NewsListComponent },
      { path: 'noticias/:slug', component: NewsDetailComponent },
      { path: 'registro', component: RegistryComponent },

      // Admin Routes
      {
        path: 'admin',
        canActivate: [AdminGuard],
        children: [
          { path: 'dashboard', component: AdminDashboardNewComponent },
          { path: 'stats', component: AdminDashboardComponent }, // Original dashboard with charts
          { path: 'users', component: RegistryManagementComponent },
          { path: 'payments', component: AdminPaymentsManagementComponent },
          { path: 'monthly-fees', component: MonthlyFeeManagementComponent },
          { path: 'noticias', component: NewsAdminListComponent },
          { path: 'noticias/crear', component: NewsFormComponent },
          { path: 'noticias/:id/editar', component: NewsFormComponent },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },

      // Educator Routes
      {
        path: 'educator',
        canActivate: [EducatorGuard],
        children: [
          { path: 'dashboard', component: EducatorDashboardNewComponent },
          { path: 'scouts', component: EducatorDashboardComponent }, // Original educator dashboard
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },

      // Family Routes
      {
        path: 'family',
        canActivate: [FamilyGuard],
        children: [
          { path: 'dashboard', component: FamilyDashboardComponent },
          { path: 'gestion', component: FamilyGestionComponent },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },

      // Shared Protected Routes (accessible by authenticated users with appropriate roles)
      {
        path: 'events',
        canActivate: [AuthGuard],
        children: [
          { path: '', component: FamilyEventsComponent },
          { path: 'manage', component: EventManagementComponent, canActivate: [EducatorGuard] }
        ]
      },

      {
        path: 'progression',
        canActivate: [AuthGuard],
        children: [
          { path: '', component: ProgressionDashboardComponent },
          { path: 'dashboard', component: ProgressionDashboardComponent },
          { path: 'march-sheet', component: MarchSheetComponent },
          { path: 'select-competences', component: SelectCompetencesComponent }
        ]
      },

      {
        path: 'payments',
        component: PaymentsComponent,
        canActivate: [AuthGuard]
      },

      // Backward compatibility routes (deprecated but maintained for existing links)
      { path: 'family-gestion', redirectTo: '/family/gestion', pathMatch: 'full' },
      { path: 'invitations', redirectTo: '/admin/users', pathMatch: 'full' },
      { path: 'educators', redirectTo: '/educator/scouts', pathMatch: 'full' },
      { path: 'dashboard', redirectTo: '/admin/stats', pathMatch: 'full' },
      { path: 'event-crud', redirectTo: '/events/manage', pathMatch: 'full' },

      // Catch-all redirect
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ]
  }
];
