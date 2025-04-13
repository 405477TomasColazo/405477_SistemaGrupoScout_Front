import { Routes } from '@angular/router';
import {HomeComponent} from './shared/home/home.component';
import {FamilyGestionComponent} from './shared/family-gestion/family-gestion.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {path:'home', component: HomeComponent},
  {path:'family-gestion', component:FamilyGestionComponent}
];
