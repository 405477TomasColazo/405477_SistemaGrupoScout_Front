import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {AdminDashboardComponent} from './admin-dashboard.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AdminDashboardComponent,
      }
  ])]
})
export class DashboardModule { }
