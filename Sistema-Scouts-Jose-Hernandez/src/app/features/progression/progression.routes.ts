import { Routes } from '@angular/router';

export const progressionRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/progression/progression-dashboard/progression-dashboard.component').then(m => m.ProgressionDashboardComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('../../shared/progression/progression-dashboard/progression-dashboard.component').then(m => m.ProgressionDashboardComponent)
  },
  {
    path: 'march-sheet',
    loadComponent: () => import('../../shared/progression/march-sheet/march-sheet.component').then(m => m.MarchSheetComponent)
  },
  {
    path: 'select-competences',
    loadComponent: () => import('../../shared/progression/select-competences/select-competences.component').then(m => m.SelectCompetencesComponent)
  }
];