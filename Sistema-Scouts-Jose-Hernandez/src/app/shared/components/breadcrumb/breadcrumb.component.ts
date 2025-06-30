import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  private routeLabels: { [key: string]: string } = {
    'home': 'Inicio',
    'admin': 'Administración',
    'educator': 'Educador',
    'family': 'Familia',
    'dashboard': 'Panel',
    'stats': 'Estadísticas',
    'users': 'Usuarios',
    'noticias': 'Noticias',
    'crear': 'Crear',
    'editar': 'Editar',
    'scouts': 'Scouts',
    'gestion': 'Gestión',
    'events': 'Eventos',
    'manage': 'Gestionar',
    'progression': 'Progresión',
    'march-sheet': 'Hoja de Marcha',
    'select-competences': 'Seleccionar Competencias',
    'payments': 'Pagos',
    'registro': 'Registro',
    'auth': 'Autenticación',
    'login': 'Iniciar Sesión',
    'logout': 'Cerrar Sesión'
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs();
      });

    // Initial breadcrumb creation
    this.breadcrumbs = this.createBreadcrumbs();
  }

  private createBreadcrumbs(): BreadcrumbItem[] {
    const url = this.router.url;
    const urlSegments = url.split('/').filter(segment => segment !== '');
    
    // Don't show breadcrumbs for home page
    if (urlSegments.length === 0 || (urlSegments.length === 1 && urlSegments[0] === 'home')) {
      return [];
    }

    // Don't show breadcrumbs for auth pages
    if (urlSegments[0] === 'auth') {
      return [];
    }

    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Inicio',
        url: '/home',
        active: false
      }
    ];

    let currentUrl = '';
    urlSegments.forEach((segment, index) => {
      currentUrl += `/${segment}`;
      const isLast = index === urlSegments.length - 1;
      
      // Skip numeric IDs in breadcrumb labels
      if (isNaN(Number(segment))) {
        breadcrumbs.push({
          label: this.getSegmentLabel(segment, urlSegments, index),
          url: currentUrl,
          active: isLast
        });
      }
    });

    return breadcrumbs;
  }

  private getSegmentLabel(segment: string, urlSegments: string[], index: number): string {
    // Special cases for contextual labels
    if (segment === 'dashboard') {
      const parentSegment = urlSegments[index - 1];
      if (parentSegment === 'admin') return 'Panel de Administración';
      if (parentSegment === 'educator') return 'Panel de Educador';
      if (parentSegment === 'family') return 'Panel Familiar';
    }

    return this.routeLabels[segment] || this.capitalizeFirst(segment);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  navigateTo(url: string): void {
    this.router.navigate([url]);
  }
}