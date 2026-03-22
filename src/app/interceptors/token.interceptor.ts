import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Este interceptor se encarga de mirar cada petición HTTP que sale de Angular hacia al backend de Laravel.
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectamos el servicio de autenticación para acceder al token.
  const authService = inject(AuthService);
  
  // Obtenemos el token
  const token = authService.getToken();

  if (token) {
   //Las peticiones originales no se pueden editar por eso las clonamos y les añadimos las cabeceras
    const clonedReq = req.clone({
      setHeaders: {
        // Añadimos el encabezado que Laravel Sanctum 
        Authorization: `Bearer ${token}`
      }
    });

    //Enviamos la petición clonada 
    return next(clonedReq);
  }
  return next(req);
};