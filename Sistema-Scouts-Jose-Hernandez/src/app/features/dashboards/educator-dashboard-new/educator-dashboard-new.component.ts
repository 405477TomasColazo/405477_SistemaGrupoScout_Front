import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgIf, NgFor, NgClass} from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-educator-dashboard-new',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './educator-dashboard-new.component.html',
  styleUrl: './educator-dashboard-new.component.css'
})
export class EducatorDashboardNewComponent implements OnInit {
  user: User | null = null;
  quickActions = [
    {
      title: 'Gestión de Scouts',
      description: 'Administra los scouts de tu sección',
      icon: 'users',
      route: '/educators',
      color: 'blue'
    },
    {
      title: 'Progresión Personal',
      description: 'Revisa y aprueba competencias',
      icon: 'chart-line',
      route: '/progression',
      color: 'green'
    },
    {
      title: 'Gestión de Eventos',
      description: 'Crear y administrar eventos',
      icon: 'calendar',
      route: '/event-crud',
      color: 'purple'
    },
    {
      title: 'Registro de Asistencia',
      description: 'Controla la asistencia a actividades',
      icon: 'check-circle',
      route: '/educators',
      color: 'yellow'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer:DomSanitizer
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getIconSvg(iconName: string): SafeHtml {
    const icons: {[key: string]: string} = {
      'users': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>',
      'chart-line': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>',
      'calendar': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
      'check-circle': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[iconName] || '');
  }
}
