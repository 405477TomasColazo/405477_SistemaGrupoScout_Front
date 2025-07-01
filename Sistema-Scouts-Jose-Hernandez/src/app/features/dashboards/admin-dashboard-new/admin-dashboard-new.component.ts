import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import {NgIf, NgFor, NgClass} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import { DashboardService, DashboardStatsDto } from '../../../core/services/dashboard.service';
import { PaymentService } from '../../../core/services/payment.service';
import {
  Chart,
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register only the components we need
Chart.register(
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface PaymentChartData {
  name: string;
  value: number;
  color: string;
}

interface SectionChartData {
  nombre: string;
  miembros: number;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard-new',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, FormsModule],
  templateUrl: './admin-dashboard-new.component.html',
  styleUrl: './admin-dashboard-new.component.css'
})
export class AdminDashboardNewComponent implements OnInit, AfterViewInit {
  @ViewChild('pagosCuotasChart') pagosCuotasChartRef: ElementRef | undefined;
  @ViewChild('miembrosSeccionChart') miembrosSeccionChartRef: ElementRef | undefined;
  
  user: User | null = null;
  isLoading = false;
  dashboardData: DashboardStatsDto | null = null;
  quickActions = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar invitaciones y usuarios',
      icon: 'users',
      route: '/invitations',
      color: 'green'
    },
    {
      title: 'Gestión de Eventos',
      description: 'Crear y administrar eventos del grupo',
      icon: 'calendar',
      route: '/event-crud',
      color: 'purple'
    },
    {
      title: 'Gestión de Noticias',
      description: 'Crear y publicar noticias',
      icon: 'newspaper',
      route: '/admin/noticias',
      color: 'yellow'
    },
    {
      title: 'Configuración de Cuotas',
      description: 'Administrar cuotas mensuales y precios',
      icon: 'cog',
      route: '/admin/monthly-fees',
      color: 'indigo'
    },
    {
      title: 'Gestión de Pagos',
      description: 'Administrar todos los pagos del sistema',
      icon: 'credit-card',
      route: '/admin/payments',
      color: 'red'
    }
  ];

  systemStats = [
    { label: 'Total Usuarios', value: '156', color: 'blue' },
    { label: 'Scouts Activos', value: '89', color: 'green' },
    { label: 'Educadores', value: '12', color: 'purple' },
    { label: 'Eventos Este Mes', value: '8', color: 'yellow' }
  ];

  // Chart references
  pagosCuotasChart: Chart | undefined;
  miembrosSeccionChart: Chart | undefined;
  
  // Chart data
  pagosCuotasData: PaymentChartData[] = [];
  miembrosSeccionData: SectionChartData[] = [];
  
  // Chart control states
  showEducators = false; // Toggle for showing educators vs protagonists
  isLoadingPayments = false;
  isLoadingSections = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private dashboardService: DashboardService,
    private paymentService: PaymentService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadDashboardData();
    this.loadPaymentStatistics();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.ngZone.runOutsideAngular(() => {
        this.createPagosCuotasChart();
        this.createMiembrosSeccionChart();
      });
    }, 100);
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data: DashboardStatsDto) => {
        this.dashboardData = data;
        this.updateSystemStats(data);
        this.updateChartData(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loadFallbackData();
        this.isLoading = false;
      }
    });
  }

  private updateSystemStats(data: DashboardStatsDto): void {
    this.systemStats = [
      { label: 'Total Familias', value: data.totalFamilies.toString(), color: 'blue' },
      { label: 'Scouts Activos', value: data.totalScouts.toString(), color: 'green' },
      { label: 'Educadores', value: data.memberStats?.totalEducators?.toString() || '0', color: 'purple' },
      { label: 'Eventos Activos', value: data.activeEvents.toString(), color: 'yellow' }
    ];
  }

  private updateChartData(data: DashboardStatsDto): void {
    if (data.memberStats) {
      this.updateSectionData(data.memberStats);
    }
  }

  private loadPaymentStatistics(): void {
    this.isLoadingPayments = true;
    
    // Load pending fees by section to get fee status counts
    this.paymentService.getPendingPaymentsBySection().subscribe({
      next: (sectionData) => {
        // Calculate total pending fees across all sections
        const totalPendingFees = sectionData.reduce((sum, section) => sum + section.totalPendingFees, 0);
        
        // Load dashboard data to get completed payment count
        this.dashboardService.getAdminDashboard().subscribe({
          next: (dashboardData) => {
            const completedPayments = dashboardData.financialStats?.completedPaymentCount || 0;
            
            this.pagosCuotasData = [
              { name: 'Pagadas', value: completedPayments, color: '#10b981' },
              { name: 'Pendientes', value: totalPendingFees, color: '#f59e0b' }
            ];
            this.isLoadingPayments = false;
            this.updatePaymentsChart();
          },
          error: (error) => {
            console.error('Error loading dashboard data for payments:', error);
            this.loadFallbackPaymentData();
            this.isLoadingPayments = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading pending fees by section:', error);
        this.loadFallbackPaymentData();
        this.isLoadingPayments = false;
      }
    });
  }

  private loadFallbackPaymentData(): void {
    this.pagosCuotasData = [
      { name: 'Pagadas', value: 45, color: '#10b981' },
      { name: 'Pendientes', value: 78, color: '#f59e0b' }
    ];
    this.updatePaymentsChart();
  }

  private updateSectionData(memberStats: any): void {
    const sectionData = [
      { nombre: 'Manada', miembros: 0, color: '#f1d717' },
      { nombre: 'Scout', miembros: 0, color: '#21ff10' },
      { nombre: 'Caminante', miembros: 0, color: '#01bce4' },
      { nombre: 'Rover', miembros: 0, color: '#ff0000' }
    ];

    if (this.showEducators) {
      // For educators, we need to distribute the total educators across sections
      // This is simplified - in a real scenario you'd have educator counts per section
      const totalEducators = memberStats.totalEducators || 0;
      const educatorsPerSection = Math.floor(totalEducators / 4);
      sectionData.forEach(section => {
        section.miembros = educatorsPerSection;
      });
    } else {
      // For protagonists (scouts)
      sectionData[0].miembros = memberStats.manadaCount || 0;
      sectionData[1].miembros = memberStats.unidadCount || 0;
      sectionData[2].miembros = memberStats.caminantesCount || 0;
      sectionData[3].miembros = memberStats.roversCount || 0;
    }

    this.miembrosSeccionData = sectionData;
    this.updateSectionsChart();
  }

  private loadFallbackData(): void {
    this.systemStats = [
      { label: 'Total Usuarios', value: '156', color: 'blue' },
      { label: 'Scouts Activos', value: '89', color: 'green' },
      { label: 'Educadores', value: '12', color: 'purple' },
      { label: 'Eventos Este Mes', value: '8', color: 'yellow' }
    ];
  }

  private createPagosCuotasChart(): void {
    try {
      const ctx = this.pagosCuotasChartRef?.nativeElement as HTMLCanvasElement;

      if (ctx) {
        this.pagosCuotasChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: this.pagosCuotasData.map(item => item.name),
            datasets: [{
              data: this.pagosCuotasData.map(item => item.value),
              backgroundColor: this.pagosCuotasData.map(item => item.color),
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw as number;
                    return `${label}: ${value}%`;
                  }
                }
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error en createPagosCuotasChart:', error);
    }
  }

  private createMiembrosSeccionChart(): void {
    try {
      const ctx = this.miembrosSeccionChartRef?.nativeElement as HTMLCanvasElement;

      if (ctx) {
        this.miembrosSeccionChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: this.miembrosSeccionData.map(item => item.nombre),
            datasets: [{
              label: 'Miembros Activos',
              data: this.miembrosSeccionData.map(item => item.miembros),
              backgroundColor: this.miembrosSeccionData.map(item => item.color),
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error en createMiembrosSeccionChart:', error);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  toggleMemberType(): void {
    this.showEducators = !this.showEducators;
    if (this.dashboardData?.memberStats) {
      this.updateSectionData(this.dashboardData.memberStats);
    }
  }

  private updatePaymentsChart(): void {
    if (this.pagosCuotasChart && this.pagosCuotasData.length > 0) {
      this.pagosCuotasChart.data.labels = this.pagosCuotasData.map(item => item.name);
      this.pagosCuotasChart.data.datasets[0].data = this.pagosCuotasData.map(item => item.value);
      this.pagosCuotasChart.data.datasets[0].backgroundColor = this.pagosCuotasData.map(item => item.color);
      this.pagosCuotasChart.update();
    }
  }

  private updateSectionsChart(): void {
    if (this.miembrosSeccionChart && this.miembrosSeccionData.length > 0) {
      this.miembrosSeccionChart.data.labels = this.miembrosSeccionData.map(item => item.nombre);
      this.miembrosSeccionChart.data.datasets[0].data = this.miembrosSeccionData.map(item => item.miembros);
      this.miembrosSeccionChart.data.datasets[0].backgroundColor = this.miembrosSeccionData.map(item => item.color);
      this.miembrosSeccionChart.update();
    }
  }

  getIconSvg(iconName: string): SafeHtml {
    const icons: {[key: string]: string} = {
      'chart-bar': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>',
      'users': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>',
      'calendar': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
      'newspaper': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path>',
      'chart-line': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>',
      'credit-card': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>',
      'cog': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>'
    };
    return this.sanitizer.bypassSecurityTrustHtml( icons[iconName] || '' );
  }
}
