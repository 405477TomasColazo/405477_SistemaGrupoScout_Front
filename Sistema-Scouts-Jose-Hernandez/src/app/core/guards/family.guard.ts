import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FamilyGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      const userRole = this.authService.getUserRole();

      // Allow FAMILY, EDUCATOR, and ADMIN roles
      if (userRole === 'FAMILY' || userRole === 'EDUCATOR' || userRole === 'ADMIN') {
        return true;
      } else {
        // Redirect to login for unknown roles
        this.router.navigate(['/auth/login']);
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
}
