import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Guard para rutas que solo deben ser accesibles por usuarios NO autenticados
 * Redirige a usuarios logueados a su dashboard correspondiente
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario NO está autenticado, permitir acceso
  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si está autenticado, redirigir a su dashboard según rol
  const user = authService.getCurrentUser();
  
  if (user?.roles?.includes('ROLE_ADMIN')) {
    router.navigate(['/admin/dashboard']);
  } else if (user?.roles?.includes('ROLE_EDUCATOR')) {
    router.navigate(['/educator/dashboard']);
  } else if (user?.roles?.includes('ROLE_FAMILY')) {
    router.navigate(['/family/dashboard']);
  } else {
    // Fallback si no tiene rol definido
    router.navigate(['/home']);
  }

  // Denegar acceso a la ruta original
  return false;
};