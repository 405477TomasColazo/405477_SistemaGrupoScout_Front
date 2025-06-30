import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ExportService } from '../../../core/services/export.service';
import { ExportButtonsComponent } from '../../../shared/components/export-buttons/export-buttons.component';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import { DashboardService, FamilyDashboardDto } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-family-dashboard',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgForOf,
    ExportButtonsComponent
  ],
  templateUrl: './family-dashboard.component.html',
  styleUrl: './family-dashboard.component.css'
})
export class FamilyDashboardComponent implements OnInit {

  // Variables para alertas
  showAlert: boolean = false;
  alertType: 'success' | 'error' = 'success';
  alertText: string = '';

  // Fecha actual para mostrar en el calendario
  mesActual: string = 'Mayo 2025';

  // Variables básicas de la familia
  familyName = '';
  
  // Export state
  isExportingEvents = false;
  
  // Datos para las tarjetas de resumen
  resumenEstadisticas = [
    {
      titulo: 'Scouts en Familia',
      valor: '3',
      icon: 'scouts',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      titulo: 'Próximos Eventos',
      valor: '5',
      icon: 'events',
      textColor: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      titulo: 'Pagos Pendientes',
      valor: '1',
      icon: 'payments',
      textColor: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    }
  ];


  // Acciones rápidas
  quickActions = [
    {
      title: 'Gestión Familiar',
      description: 'Administra tu familia',
      icon: 'users',
      route: '/family-gestion',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Eventos',
      description: 'Ver y registrarse',
      icon: 'calendar',
      route: '/events',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pagos',
      description: 'Cuotas y eventos',
      icon: 'credit-card',
      route: '/payments',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Progresión',
      description: 'Seguimiento scout',
      icon: 'chart-line',
      route: '/progression',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  // Datos de eventos próximos
  eventosProximos = [
    { id: 1, titulo: 'Campamento de Verano', fecha: '15/05/2025', estado: 'Inscripto' },
    { id: 2, titulo: 'Reunión de Padres', fecha: '18/05/2025', estado: 'Disponible' },
    { id: 3, titulo: 'Actividad de Manada', fecha: '22/05/2025', estado: 'Disponible' },
    { id: 4, titulo: 'Fogón Familiar', fecha: '30/05/2025', estado: 'Inscripto' }
  ];


  constructor(
    private authService: AuthService, 
    private router: Router,
    private sanitizer: DomSanitizer,
    private exportService: ExportService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.dashboardService.getFamilyDashboard().subscribe({
      next: (data: FamilyDashboardDto) => {
        this.familyName = data.familyName;
        
        // Update the summary statistics cards
        this.resumenEstadisticas[0].valor = data.scoutsInFamily.toString();
        this.resumenEstadisticas[1].valor = data.upcomingEvents.toString();
        this.resumenEstadisticas[2].valor = data.pendingPayments.toString();
        
        // Update upcoming events from API if available
        if (data.upcomingEventsList && data.upcomingEventsList.length > 0) {
          this.eventosProximos = data.upcomingEventsList.map((event, index) => ({
            id: index + 1,
            titulo: event.title,
            fecha: new Date(event.startDate).toLocaleDateString('es-ES'),
            estado: 'Disponible' // Default status, could be enhanced based on API data
          }));
        }
      },
      error: (error) => {
        console.error('Error loading family dashboard data:', error);
        // Fallback to auth service and existing mock data
        const user = this.authService.getCurrentUser();
        this.familyName = user?.lastName || 'Scout';
      }
    });
  }


  // Navegación
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Métodos para eventos
  getEventStatusClass(estado: string): string {
    switch(estado) {
      case 'Inscripto':
        return 'bg-green-100 text-green-800';
      case 'Disponible':
        return 'bg-blue-100 text-blue-800';
      case 'Cerrado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  inscribirEvento(evento: any): void {
    // Lógica para inscribir al evento
    this.showAlertMessage('success', `Inscripción exitosa para ${evento.titulo}`);
  }


  getIconSvg(iconName: string): SafeHtml {
    const icons: {[key: string]: string} = {
      'users': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>',
      'calendar': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
      'credit-card': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>',
      'chart-line': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>'
    };
    return this.sanitizer.bypassSecurityTrustHtml( icons[iconName] || '' );
  }

  // Método para mostrar una alerta
  showAlertMessage(type: 'success' | 'error', message: string): void {
    this.alertType = type;
    this.alertText = message;
    this.showAlert = true;

    // Ocultar la alerta después de 5 segundos
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  // Export Methods for Events Table
  exportEventsToPDF(): void {
    if (this.eventosProximos.length === 0) return;
    this.isExportingEvents = true;
    
    try {
      const exportData = this.eventosProximos.map(evento => ({
        titulo: evento.titulo,
        fecha: evento.fecha,
        estado: evento.estado
      }));
      
      const columns = [
        { key: 'titulo', header: 'Evento', type: 'text' as const },
        { key: 'fecha', header: 'Fecha', type: 'text' as const },
        { key: 'estado', header: 'Estado', type: 'text' as const }
      ];
      
      this.exportService.exportToPDF(exportData, columns, 'proximos-eventos-familia', 'Próximos Eventos - Familia');
    } catch (error) {
      console.error('Error al exportar eventos a PDF:', error);
    }
    
    this.isExportingEvents = false;
  }

  exportEventsToCSV(): void {
    if (this.eventosProximos.length === 0) return;
    this.isExportingEvents = true;
    
    try {
      const exportData = this.eventosProximos.map(evento => ({
        titulo: evento.titulo,
        fecha: evento.fecha,
        estado: evento.estado
      }));
      
      const columns = [
        { key: 'titulo', header: 'Evento', type: 'text' as const },
        { key: 'fecha', header: 'Fecha', type: 'text' as const },
        { key: 'estado', header: 'Estado', type: 'text' as const }
      ];
      
      this.exportService.exportToCSV(exportData, columns, 'proximos-eventos-familia');
    } catch (error) {
      console.error('Error al exportar eventos a CSV:', error);
    }
    
    this.isExportingEvents = false;
  }
}