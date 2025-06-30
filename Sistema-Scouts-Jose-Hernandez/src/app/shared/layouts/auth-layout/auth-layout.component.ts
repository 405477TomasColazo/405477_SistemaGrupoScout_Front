import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex">
        <!-- Left Panel - Scout Branding -->
        <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-600 p-12 items-center justify-center relative">
          <div class="text-center text-white">
            <!-- Scout Logo/Symbol -->
            <div class="mb-8">
              <div class="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2ZM12 4.44L18.18 9.44L17.45 19H6.55L5.82 9.44L12 4.44Z"/>
                  <circle cx="12" cy="13" r="2"/>
                </svg>
              </div>
            </div>
            
            <!-- Title and Description -->
            <h1 class="text-3xl font-bold mb-4">
              Grupo Scout José Hernández
            </h1>
            <p class="text-lg text-white/90 leading-relaxed">
              Sistema de gestión integral para el desarrollo y seguimiento 
              de actividades scout
            </p>
            
            <!-- Features -->
            <div class="mt-8 space-y-3 text-left">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-white rounded-full"></div>
                <span class="text-white/90">Gestión de eventos y campamentos</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-white rounded-full"></div>
                <span class="text-white/90">Seguimiento de progresión personal</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-white rounded-full"></div>
                <span class="text-white/90">Administración familiar</span>
              </div>
            </div>
          </div>
          
          <!-- Decorative Elements -->
          <div class="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
          <div class="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full"></div>
        </div>
        
        <!-- Right Panel - Auth Content -->
        <div class="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <div class="w-full max-w-md">
            <!-- Mobile Logo -->
            <div class="lg:hidden text-center mb-8">
              <div class="w-16 h-16 mx-auto bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2ZM12 4.44L18.18 9.44L17.45 19H6.55L5.82 9.44L12 4.44Z"/>
                  <circle cx="12" cy="13" r="2"/>
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-800 mt-4">
                Grupo Scout José Hernández
              </h2>
            </div>
            
            <!-- Auth Form Content -->
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent {}