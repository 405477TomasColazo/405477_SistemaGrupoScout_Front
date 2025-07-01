import { Routes } from '@angular/router';

export const eventsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/family-events/family-events.component').then(m => m.FamilyEventsComponent)
  },
  {
    path: 'manage',
    loadComponent: () => import('../../shared/event-management/event-management.component').then(m => m.EventManagementComponent)
  }
];