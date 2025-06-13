import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    BreadcrumbComponent,
    FooterComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <!-- Navigation Header -->
      <app-navbar></app-navbar>
      
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Breadcrumb Navigation -->
        <app-breadcrumb class="bg-white border-b"></app-breadcrumb>
        
        <!-- Page Content -->
        <main class="flex-1 container mx-auto px-4 py-6">
          <router-outlet></router-outlet>
        </main>
      </div>
      
      <!-- Footer -->
      <app-footer></app-footer>
    </div>
  `,
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {}