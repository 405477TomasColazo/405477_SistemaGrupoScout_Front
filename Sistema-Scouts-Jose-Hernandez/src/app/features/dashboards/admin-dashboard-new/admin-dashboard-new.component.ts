import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgIf, NgFor, NgClass} from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-admin-dashboard-new',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './admin-dashboard-new.component.html',
  styleUrl: './admin-dashboard-new.component.css'
})
export class AdminDashboardNewComponent implements OnInit {
  user: User | null = null;
  quickActions = [
    {
      title: 'Dashboard Completo',
      description: 'Ver dashboard con gráficos y estadísticas',
      icon: 'chart-bar',
      route: '/dashboard',
      color: 'blue'
    },
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
      title: 'Progresión Personal',
      description: 'Supervisar progreso de todos los scouts',
      icon: 'chart-line',
      route: '/progression',
      color: 'indigo'
    },
    {
      title: 'Gestión de Pagos',
      description: 'Monitorear pagos y finanzas',
      icon: 'credit-card',
      route: '/payments',
      color: 'red'
    }
  ];

  systemStats = [
    { label: 'Total Usuarios', value: '156', color: 'blue' },
    { label: 'Scouts Activos', value: '89', color: 'green' },
    { label: 'Educadores', value: '12', color: 'purple' },
    { label: 'Eventos Este Mes', value: '8', color: 'yellow' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getIconSvg(iconName: string): SafeHtml {
    const icons: {[key: string]: string} = {
      'chart-bar': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>',
      'users': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>',
      'calendar': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
      'newspaper': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path>',
      'chart-line': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>',
      'credit-card': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>'
    };
    return this.sanitizer.bypassSecurityTrustHtml( icons[iconName] || '' );
  }
}
