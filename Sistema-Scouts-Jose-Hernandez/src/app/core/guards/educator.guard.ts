import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EducatorGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      const userRole = this.authService.getUserRole();

      // Allow both EDUCATOR and ADMIN roles
      if (userRole === 'EDUCATOR' || userRole === 'ADMIN') {
        return true;
      } else {
        // Redirect based on user role
        this.redirectBasedOnRole(userRole);
        return false;
      }
    } else {
      // Redirect to login with return URL
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return false;
    }
  }

  private redirectBasedOnRole(role: string | null): void {
    switch (role) {
      case 'FAMILY':
        this.router.navigate(['/family/dashboard']);
        break;
      default:
        this.router.navigate(['/auth/login']);
        break;
    }
  }
}
