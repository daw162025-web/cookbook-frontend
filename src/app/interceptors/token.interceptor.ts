import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let request = req;

  //Añadimos el token si existe
  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  //Gestionamos la respuesta del servidor
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor nos dice que el token no vale (401)
      if (error.status === 401) {
        console.warn('Sesión expirada o token inválido. Redirigiendo...');
        
        // Limpiamos los datos del usuario en el frontend
        authService.logout(); 
        
        // Lo mandamos al login para que vuelva a entrar
        router.navigate(['/login']);
      }
      
      // Seguimos lanzando el error para que el componente también sepa que algo falló
      return throwError(() => error);
    })
  );
};