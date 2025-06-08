import { Routes } from '@angular/router';
import {HomeComponent} from './shared/home/home.component';
import {FamilyGestionComponent} from './shared/family-gestion/family-gestion.component';
import {RegistryManagementComponent} from './shared/registry-management/registry-management.component';
import {RegistryComponent} from './shared/registry/registry.component';
import {PaymentsComponent} from './shared/payments/payments.component';
import {EducatorDashboardComponent} from './shared/educator-dashboard/educator-dashboard.component';
import {AdminDashboardComponent} from './shared/admin-dashboard/admin-dashboard.component';
import {EventManagementComponent} from './shared/event-management/event-management.component';
import {FamilyEventsComponent} from './shared/family-events/family-events.component';
import {ProgressionDashboardComponent} from './shared/progression/progression-dashboard/progression-dashboard.component';
import {MarchSheetComponent} from './shared/progression/march-sheet/march-sheet.component';
import {SelectCompetencesComponent} from './shared/progression/select-competences/select-competences.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {path:'home', component: HomeComponent},
  {path:'family-gestion', component:FamilyGestionComponent},
  {path: 'invitations', component:RegistryManagementComponent},
  {path: 'registro', component:RegistryComponent},
  {path: 'payments', component:PaymentsComponent},
  {path: 'educators', component:EducatorDashboardComponent},
  {path: 'dashboard', component:AdminDashboardComponent},
  {path: 'event-crud', component:EventManagementComponent},
  {path: 'events', component:FamilyEventsComponent},
  {path: 'progression', component:ProgressionDashboardComponent},
  {path: 'progression/dashboard', component:ProgressionDashboardComponent},
  {path: 'progression/march-sheet', component:MarchSheetComponent},
  {path: 'progression/select-competences', component:SelectCompetencesComponent}
];
