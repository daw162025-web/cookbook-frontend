import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  // Variable que controla si el menú móvil está abierto
  isMenuOpen = false;

  // Función para abrir/cerrar el menú al tocar el botón
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
