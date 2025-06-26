import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardService, DashboardStatsDto } from '../../../core/services/dashboard.service';



@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">
          Panel de Administración
        </h1>
        <p class="text-purple-100">
          Sistema de gestión integral - Grupo Scout José Hernández
        </p>
      </div>

      <!-- System Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8h-2.08A1.5 1.5 0 0 0 15.04 8.37L12.5 16H15v6h5z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ totalScouts }}</h3>
              <p class="text-gray-600">Total de Scouts</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1.5V6H9V1.5L3 7V9H21Z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ totalFamilies }}</h3>
              <p class="text-gray-600">Familias Registradas</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ activeEvents }}</h3>
              <p class="text-gray-600">Eventos Activos</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ monthlyRevenue | currency}}</h3>
              <p class="text-gray-600">Ingresos del Mes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-sm border">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Gestión Administrativa</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a routerLink="/admin/users"
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-blue-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8h-2.08A1.5 1.5 0 0 0 15.04 8.37L12.5 16H15v6h5z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Gestión de Usuarios</h3>
              <p class="text-sm text-gray-600">Administrar familias</p>
            </div>
          </a>

          <a routerLink="/admin/stats"
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-green-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Estadísticas</h3>
              <p class="text-sm text-gray-600">Reportes y gráficos</p>
            </div>
          </a>

          <a routerLink="/events/manage"
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-yellow-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Eventos</h3>
              <p class="text-sm text-gray-600">Crear y gestionar</p>
            </div>
          </a>

          <a routerLink="/admin/news"
             class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div class="p-2 bg-purple-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Noticias</h3>
              <p class="text-sm text-gray-600">Gestionar contenido</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Section Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sections Stats -->
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Distribución por Secciones</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span class="text-gray-700">Manada (7-10 años)</span>
              </div>
              <span class="font-semibold text-gray-900">{{ manadaCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span class="text-gray-700">Unidad (11-14 años)</span>
              </div>
              <span class="font-semibold text-gray-900">{{ unidadCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span class="text-gray-700">Caminantes (15-17 años)</span>
              </div>
              <span class="font-semibold text-gray-900">{{ caminantesCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span class="text-gray-700">Rovers (18-21 años)</span>
              </div>
              <span class="font-semibold text-gray-900">{{ roversCount }}</span>
            </div>
          </div>
        </div>

        <!-- Recent System Activity -->
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Actividad del Sistema</h2>
          <div class="space-y-3">
            <div class="flex items-center p-3 border rounded-lg">
              <div class="p-2 bg-green-100 rounded-lg mr-3">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Nueva familia registrada</p>
                <p class="text-xs text-gray-600">Familia Pérez - 3 scouts</p>
              </div>
              <span class="ml-auto text-xs text-gray-500">Hace 2 horas</span>
            </div>

            <div class="flex items-center p-3 border rounded-lg">
              <div class="p-2 bg-blue-100 rounded-lg mr-3">
                <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Evento publicado</p>
                <p class="text-xs text-gray-600">Campamento de Verano 2025</p>
              </div>
              <span class="ml-auto text-xs text-gray-500">Hace 1 día</span>
            </div>

            <div class="flex items-center p-3 border rounded-lg">
              <div class="p-2 bg-yellow-100 rounded-lg mr-3">
                <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Pagos procesados</p>
                <p class="text-xs text-gray-600">15 cuotas mensuales</p>
              </div>
              <span class="ml-auto text-xs text-gray-500">Hace 2 días</span>
            </div>

            <div class="flex items-center p-3 border rounded-lg">
              <div class="p-2 bg-purple-100 rounded-lg mr-3">
                <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Artículo publicado</p>
                <p class="text-xs text-gray-600">Proyecto Comunitario Finalizado</p>
              </div>
              <span class="ml-auto text-xs text-gray-500">Hace 1 semana</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  totalScouts = 0;
  totalFamilies = 0;
  activeEvents = 0;
  monthlyRevenue = 0;

  // Section counts
  manadaCount = 0;
  unidadCount = 0;
  caminantesCount = 0;
  roversCount = 0;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data: DashboardStatsDto) => {

        this.totalScouts = data.totalScouts;
        this.totalFamilies = data.totalFamilies;
        this.activeEvents = data.activeEvents;
        this.monthlyRevenue = data.monthlyRevenue;

        // Section distribution from memberStats
        if (data.memberStats) {
          this.manadaCount = data.memberStats.manadaCount;
          this.unidadCount = data.memberStats.unidadCount;
          this.caminantesCount = data.memberStats.caminantesCount;
          this.roversCount = data.memberStats.roversCount;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        // Fallback to mock data if API fails
        this.totalScouts = 86;
        this.totalFamilies = 42;
        this.activeEvents = 5;
        this.monthlyRevenue = 680000;
        this.manadaCount = 18;
        this.unidadCount = 25;
        this.caminantesCount = 22;
        this.roversCount = 20;
      }
    });
  }
}
