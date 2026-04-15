import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 
import { map, take } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Comprobamos el usuario actual
  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && user.role === 'admin') {
        return true; // Es admin, puede pasar
      }

      // Si no es admin, lo redirigimos a la home
      console.warn('Acceso denegado: Se requiere rol de administrador');
      router.navigate(['/']);
      return false;
    })
  );
};