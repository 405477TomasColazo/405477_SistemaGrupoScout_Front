import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-full text-center">
      <!-- Logout Icon -->
      <div class="mb-8">
        <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoggingOut && !loggedOut">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          ¿Cerrar Sesión?
        </h2>
        <p class="text-gray-600 mb-8">
          ¿Estás seguro de que quieres cerrar tu sesión actual?
        </p>

        <!-- Action Buttons -->
        <div class="space-y-4">
          <button
            (click)="confirmLogout()"
            class="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium
                   hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                   transition-colors duration-200"
          >
            Sí, Cerrar Sesión
          </button>

          <button
            (click)="cancel()"
            class="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium
                   hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                   transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>

      <div *ngIf="isLoggingOut" class="space-y-4">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Cerrando Sesión...
        </h2>

        <!-- Loading Spinner -->
        <div class="flex items-center justify-center">
          <svg class="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <p class="text-gray-600">
          Desconectando de forma segura...
        </p>
      </div>

      <div *ngIf="loggedOut" class="space-y-6">
        <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          ¡Sesión Cerrada!
        </h2>
        <p class="text-gray-600 mb-8">
          Has cerrado sesión exitosamente. Gracias por usar nuestro sistema.
        </p>

        <!-- Navigation Options -->
        <div class="space-y-4">
          <a routerLink="/auth/login"
             class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium
                    hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                    transition-colors duration-200 inline-block text-center">
            Iniciar Sesión Nuevamente
          </a>

          <a href="/"
             class="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium
                    hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                    transition-colors duration-200 inline-block text-center">
            Ir al Inicio
          </a>
        </div>
      </div>

      <!-- Scout Group Info -->
      <div class="mt-12 p-6 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center mb-4">
          <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2ZM12 4.44L18.18 9.44L17.45 19H6.55L5.82 9.44L12 4.44Z"/>
              <circle cx="12" cy="13" r="2"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800">
            Grupo Scout José Hernández
          </h3>
        </div>
        <p class="text-sm text-gray-600">
          Siempre preparados para servir a nuestra comunidad
        </p>
      </div>
    </div>
  `,
  styleUrl: './logout.component.css'
})
export class LogoutComponent implements OnInit {
  isLoggingOut = false;
  loggedOut = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If user is not authenticated, redirect to login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
    }
  }

  confirmLogout(): void {
    this.isLoggingOut = true;

    // Simulate logout process with a brief delay for UX
    setTimeout(() => {
      this.authService.logout();
      this.isLoggingOut = false;
      this.loggedOut = true;
    }, 1500);
  }

  cancel(): void {
    // Navigate back to appropriate dashboard based on role
    const userRole = this.authService.getUserRole();

    switch (userRole) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'EDUCATOR':
        this.router.navigate(['/educator/dashboard']);
        break;
      case 'FAMILY':
        this.router.navigate(['/family/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }
}
