import { Routes } from '@angular/router';

// Layout Components
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';

// Auth Components (keep these eagerly loaded as they're needed immediately)
import { LoginComponent } from './features/auth/login/login.component';
import { LogoutComponent } from './features/auth/logout/logout.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

// Light Components (keep eagerly loaded)
import { HomeComponent } from './shared/home/home.component';
import { ProfileComponent } from './shared/profile/profile.component';
import { RegistryComponent } from './shared/registry/registry.component';
import { PaymentsComponent } from './shared/payments/payments.component';
import { NewsListComponent } from './shared/news/news-list/news-list.component';
import { NewsDetailComponent } from './shared/news/news-detail/news-detail.component';

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
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
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

      // Admin Routes (Lazy Loaded with Standalone Components)
      {
        path: 'admin',
        canActivate: [AdminGuard],
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
      },

      // Educator Routes (Lazy Loaded with Standalone Components)
      {
        path: 'educator',
        canActivate: [EducatorGuard],
        loadChildren: () => import('./features/educator/educator.routes').then(m => m.educatorRoutes)
      },

      // Family Routes (Lazy Loaded with Standalone Components)
      {
        path: 'family',
        canActivate: [FamilyGuard],
        loadChildren: () => import('./features/family/family.routes').then(m => m.familyRoutes)
      },

      // Events Routes (Lazy Loaded with Standalone Components)
      {
        path: 'events',
        canActivate: [AuthGuard],
        loadChildren: () => import('./features/events/events.routes').then(m => m.eventsRoutes)
      },

      // Progression Routes (Lazy Loaded with Standalone Components)
      {
        path: 'progression',
        canActivate: [AuthGuard],
        loadChildren: () => import('./features/progression/progression.routes').then(m => m.progressionRoutes)
      },

      {
        path: 'payments',
        component: PaymentsComponent,
        canActivate: [AuthGuard]
      },

      {
        path: 'profile',
        component: ProfileComponent,
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
