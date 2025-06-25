import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Iniciar Sesión
        </h2>
        <p class="text-gray-600">
          Accede a tu cuenta scout
        </p>
      </div>

      <!-- Login Form -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            placeholder="tu@email.com"
            [class.border-red-500]="isFieldInvalid('email')"
          />
          <div *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-red-600">
            <span *ngIf="loginForm.get('email')?.errors?.['required']">
              El correo electrónico es requerido
            </span>
            <span *ngIf="loginForm.get('email')?.errors?.['email']">
              Introduce un correo electrónico válido
            </span>
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <div class="relative">
            <input
              [type]="showPassword ? 'text' : 'password'"
              id="password"
              formControlName="password"
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Tu contraseña"
              [class.border-red-500]="isFieldInvalid('password')"
            />
            <button
              type="button"
              (click)="togglePasswordVisibility()"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg *ngIf="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg *ngIf="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            </button>
          </div>
          <div *ngIf="isFieldInvalid('password')" class="mt-1 text-sm text-red-600">
            <span *ngIf="loginForm.get('password')?.errors?.['required']">
              La contraseña es requerida
            </span>
          </div>
        </div>

        <!-- Remember Me -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember"
              type="checkbox"
              formControlName="remember"
              class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label for="remember" class="ml-2 block text-sm text-gray-700">
              Recordarme
            </label>
          </div>

          <button
            type="button"
            (click)="goToForgotPassword()"
            class="text-sm text-green-600 hover:text-green-500"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="ml-3 text-sm text-red-700">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          [disabled]="loginForm.invalid || isLoading"
          class="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium
                 hover:from-green-700 hover:to-blue-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span *ngIf="!isLoading">Iniciar Sesión</span>
          <span *ngIf="isLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Iniciando...
          </span>
        </button>
      </form>

      <!-- Demo Credentials -->
      <div class="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Credenciales de Prueba:</h3>
        <div class="space-y-2 text-xs text-gray-600">
          <div class="flex justify-between">
            <span class="font-medium">Admin:</span>
            <span>admin&#64;scout.com / 123</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Educador:</span>
            <span>educador.manada&#64;scout.com / 123</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium">Familia:</span>
            <span>familia.gonzalez&#64;email.com / 123</span>
          </div>
        </div>
      </div>

      <!-- Footer Links -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          ¿No tienes una cuenta?
          <a href="#" class="text-green-600 hover:text-green-500 font-medium">
            Contacta al administrador
          </a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to role-specific dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectToRoleDashboard();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log("punto 0")
          // Redirect based on role or return URL
          if (this.returnUrl && this.returnUrl !== '/') {
            console.log("punto 1")
            this.router.navigate([this.returnUrl]);
          } else {
            console.log("punto 2")
            this.redirectToRoleDashboard();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        }
      });
    }
  }

  private redirectToRoleDashboard(): void {
    const userRole = this.authService.getUserRole();
    console.log(userRole);
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
        this.router.navigate(['/home']);
        break;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}
