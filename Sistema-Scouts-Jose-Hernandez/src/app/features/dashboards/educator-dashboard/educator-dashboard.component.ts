import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardService, EducatorDashboardDto } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-educator-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">
          ¡Bienvenido, {{ educatorName }}!
        </h1>
        <p class="text-green-100">
          Panel de gestión para educadores scout - Sección {{ sectionName }}
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8h-2.08A1.5 1.5 0 0 0 15.04 8.37L12.5 16H15v6h5z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ scoutsCount }}</h3>
              <p class="text-gray-600">Scouts activos</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H7v9h2v-9zm4-4H11v13h2V7zm4-4H15v17h2V3z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ pendingApprovals }}</h3>
              <p class="text-gray-600">Competencias pendientes</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ upcomingEvents }}</h3>
              <p class="text-gray-600">Eventos próximos</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ progressionRate }}%</h3>
              <p class="text-gray-600">Progreso general</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-sm border">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a routerLink="/educator/scouts" 
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-green-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8h-2.08A1.5 1.5 0 0 0 15.04 8.37L12.5 16H15v6h5z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Gestión de Scouts</h3>
              <p class="text-sm text-gray-600">Administrar scouts</p>
            </div>
          </a>

          <a routerLink="/progression" 
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-yellow-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H7v9h2v-9zm4-4H11v13h2V7zm4-4H15v17h2V3z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Aprobar Competencias</h3>
              <p class="text-sm text-gray-600">Revisar progresión</p>
            </div>
          </a>

          <a routerLink="/events/manage" 
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-blue-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Gestión de Eventos</h3>
              <p class="text-sm text-gray-600">Crear y organizar</p>
            </div>
          </a>

          <a routerLink="/events" 
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-purple-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Inscripciones</h3>
              <p class="text-sm text-gray-600">Ver registros</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Pending Approvals -->
      <div class="bg-white rounded-lg p-6 shadow-sm border">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Competencias Pendientes de Aprobación</h2>
          <a routerLink="/progression" class="text-green-600 hover:text-green-700 text-sm font-medium">
            Ver todas →
          </a>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                AH
              </div>
              <div>
                <p class="font-medium text-gray-900">Ana Hernández</p>
                <p class="text-sm text-gray-600">Liderazgo Juvenil</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Pendiente
              </span>
              <button class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                Revisar
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                CM
              </div>
              <div>
                <p class="font-medium text-gray-900">Carlos Martínez</p>
                <p class="text-sm text-gray-600">Vida Saludable</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Pendiente
              </span>
              <button class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                Revisar
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                LR
              </div>
              <div>
                <p class="font-medium text-gray-900">Lucía Rodríguez</p>
                <p class="text-sm text-gray-600">Cuidado del Medio Ambiente</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Pendiente
              </span>
              <button class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                Revisar
              </button>
            </div>
          </div>
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
              <p class="text-sm font-medium text-gray-900">Competencia aprobada</p>
              <p class="text-xs text-gray-600">María González - Trabajo en Equipo</p>
            </div>
            <span class="ml-auto text-xs text-gray-500">Hace 1 hora</span>
          </div>

          <div class="flex items-center p-3 border rounded-lg">
            <div class="p-2 bg-blue-100 rounded-lg mr-3">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Evento creado</p>
              <p class="text-xs text-gray-600">Reunión Semanal Scouts</p>
            </div>
            <span class="ml-auto text-xs text-gray-500">Hace 2 días</span>
          </div>

          <div class="flex items-center p-3 border rounded-lg">
            <div class="p-2 bg-purple-100 rounded-lg mr-3">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Nueva inscripción</p>
              <p class="text-xs text-gray-600">Diego Fernández - Campamento de Verano</p>
            </div>
            <span class="ml-auto text-xs text-gray-500">Hace 1 semana</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './educator-dashboard.component.css'
})
export class EducatorDashboardComponent implements OnInit {
  educatorName = '';
  sectionName = '';
  scoutsCount = 0;
  pendingApprovals = 0;
  upcomingEvents = 0;
  progressionRate = 0;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.dashboardService.getEducatorDashboard().subscribe({
      next: (data: EducatorDashboardDto) => {
        this.educatorName = data.educatorName;
        this.sectionName = data.sectionName;
        this.scoutsCount = data.scoutsCount;
        this.pendingApprovals = data.pendingApprovals;
        this.upcomingEvents = data.upcomingEvents;
        this.progressionRate = data.progressionRate;
      },
      error: (error) => {
        console.error('Error loading educator dashboard data:', error);
        // Fallback to user name from auth service and mock data
        const user = this.authService.getCurrentUser();
        this.educatorName = user?.lastName || 'Educador';
        this.sectionName = 'Scouts';
        this.scoutsCount = 15;
        this.pendingApprovals = 3;
        this.upcomingEvents = 2;
        this.progressionRate = 78;
      }
    });
  }
}