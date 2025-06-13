import {Component, inject, OnInit} from '@angular/core';
import { CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {User} from '../../core/models/user.model';
import {AuthService} from '../../core/auth/auth.service';

interface NavigationItem {
  label: string;
  route?: string;
  children?: NavigationItem[];
  roles?: string[];
  external?: boolean;
  action?: () => void;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  user: User | null = null;
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);

  // Define navigation structure based on roles
  navigationItems: NavigationItem[] = [
    {
      label: 'Inicio',
      route: '/home'
    },
    {
      label: 'Noticias',
      route: '/noticias'
    },
    {
      label: 'Mi Panel',
      children: [
        {
          label: 'Dashboard Familiar',
          route: '/family/dashboard',
          roles: ['ROLE_FAMILY', 'ROLE_EDUCATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Dashboard Educador',
          route: '/educator/dashboard',
          roles: ['ROLE_EDUCATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Panel Administrador',
          route: '/admin/dashboard',
          roles: ['ROLE_ADMIN']
        }
      ]
    },
    {
      label: 'Gestión',
      children: [
        {
          label: 'Grupo Familiar',
          route: '/family/gestion',
          roles: ['ROLE_FAMILY', 'ROLE_EDUCATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Scouts',
          route: '/educator/scouts',
          roles: ['ROLE_EDUCATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Usuarios',
          route: '/admin/users',
          roles: ['ROLE_ADMIN']
        },
        {
          label: 'Noticias',
          route: '/admin/noticias',
          roles: ['ROLE_ADMIN']
        }
      ]
    },
    {
      label: 'Actividades',
      children: [
        {
          label: 'Ver Eventos',
          route: '/events',
          roles: ['ROLE_FAMILY', 'ROLE_EDUCATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Gestionar Eventos',
          route: '/events/manage',
          roles: ['ROLE_EDUCATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Progresión Personal',
          route: '/progression',
          roles: ['ROLE_FAMILY', 'ROLE_EDUCATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Pagos',
          route: '/payments',
          roles: ['ROLE_FAMILY', 'ROLE_EDUCATOR', 'ROLE_ADMIN']
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
    });
  }

  hasRole(roles?: string[]): boolean {
    if (!roles || !this.user || !this.user.roles) return true;
    return roles.some(role => this.user!.roles.includes(role));
  }

  shouldShowItem(item: NavigationItem): boolean {
    // If the item has children, show it if at least one child is visible
    if (item.children) {
      return item.children.some(child => this.shouldShowItem(child));
    }

    // If not logged in, only show items without role requirements
    if (!this.isLoggedIn) {
      return !item.roles;
    }

    // If logged in, check role requirements
    return this.hasRole(item.roles);
  }

  navigateTo(route?: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  logout(): void {
    this.router.navigate(['/auth/logout']);
  }

  getInitials(name: string): string {
    if (!name || name.length === 0) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return words[0].charAt(0).toUpperCase() + (words[1] ? words[1].charAt(0).toUpperCase() : '');
  }

  getDashboardRoute(): string {
    if (!this.user || !this.user.roles) return '/';

    if (this.user.roles.includes('ROLE_ADMIN')) {
      return '/admin/dashboard';
    } else if (this.user.roles.includes('ROLE_EDUCATOR')) {
      return '/educator/dashboard';
    } else if (this.user.roles.includes('ROLE_FAMILY')) {
      return '/family/dashboard';
    }

    return '/';
  }

  // Helper methods for template
  userHasRole(role: string): boolean {
    return this.user?.roles?.includes(role) ?? false;
  }

  userHasFamilyRole(): boolean {
    return this.userHasRole('ROLE_FAMILY');
  }

  userHasEducatorRole(): boolean {
    return this.userHasRole('ROLE_EDUCATOR');
  }

  userHasAdminRole(): boolean {
    return this.userHasRole('ROLE_ADMIN');
  }
}
