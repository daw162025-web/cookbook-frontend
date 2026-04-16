import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router'; // Añade RouterModule
import { CommonModule } from '@angular/common'; // Añade CommonModule para directivas básicas
import { AuthService } from '../../services/auth.service'; // Lo necesitarás para el logout

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule], // Añade estos dos
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authService.logout(); // Tu método de cerrar sesión
    this.router.navigate(['/login']);
  }
}