import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-family-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">
          ¡Bienvenida, Familia {{ familyName }}!
        </h1>
        <p class="text-blue-100">
          Gestiona a tus scouts y mantente al día con todas las actividades del grupo.
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8h-2.08A1.5 1.5 0 0 0 15.04 8.37L12.5 16H15v6h5z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ scoutCount }}</h3>
              <p class="text-gray-600">Scouts en tu familia</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ upcomingEvents }}</h3>
              <p class="text-gray-600">Próximos eventos</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ pendingPayments }}</h3>
              <p class="text-gray-600">Pagos pendientes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-sm border">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a routerLink="/family/gestion" 
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-blue-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1.5V6H9V1.5L3 7V9H21ZM12 11.5C11.2 11.5 10.5 11.7 9.9 12.1L7.2 10.6C7.1 10.4 7 10.2 7 10V9C7 8.4 7.4 8 8 8C8.6 8 9 8.4 9 9V10L11.1 11.1C11.4 11.0 11.7 11 12 11C12.3 11 12.6 11.0 12.9 11.1L15 10V9C15 8.4 15.4 8 16 8C16.6 8 17 8.4 17 9V10C17 10.2 16.9 10.4 16.8 10.6L14.1 12.1C13.5 11.7 12.8 11.5 12 11.5Z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Gestión Familiar</h3>
              <p class="text-sm text-gray-600">Administra tu familia</p>
            </div>
          </a>

          <a routerLink="/events" 
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-green-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Eventos</h3>
              <p class="text-sm text-gray-600">Ver y registrarse</p>
            </div>
          </a>

          <a routerLink="/payments" 
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-yellow-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Pagos</h3>
              <p class="text-sm text-gray-600">Cuotas y eventos</p>
            </div>
          </a>

          <a routerLink="/progression" 
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-purple-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Progresión</h3>
              <p class="text-sm text-gray-600">Seguimiento scout</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg p-6 shadow-sm border">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div class="space-y-3">
          <div class="flex items-center p-3 border rounded-lg">
            <div class="p-2 bg-green-100 rounded-lg mr-3">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Inscripción confirmada</p>
              <p class="text-xs text-gray-600">Campamento de Verano 2025</p>
            </div>
            <span class="ml-auto text-xs text-gray-500">Hace 2 días</span>
          </div>

          <div class="flex items-center p-3 border rounded-lg">
            <div class="p-2 bg-blue-100 rounded-lg mr-3">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Nueva competencia asignada</p>
              <p class="text-xs text-gray-600">Habilidades de Liderazgo</p>
            </div>
            <span class="ml-auto text-xs text-gray-500">Hace 1 semana</span>
          </div>

          <div class="flex items-center p-3 border rounded-lg">
            <div class="p-2 bg-yellow-100 rounded-lg mr-3">
              <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Pago procesado</p>
              <p class="text-xs text-gray-600">Cuota mensual de enero</p>
            </div>
            <span class="ml-auto text-xs text-gray-500">Hace 2 semanas</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './family-dashboard.component.css'
})
export class FamilyDashboardComponent implements OnInit {
  familyName = '';
  scoutCount = 0;
  upcomingEvents = 0;
  pendingPayments = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Get family name from auth service
    const user = this.authService.getCurrentUser();
    this.familyName = user?.lastName || 'Scout';

    // Load statistics (these would come from real API calls)
    this.scoutCount = 3;
    this.upcomingEvents = 2;
    this.pendingPayments = 1;
  }
}