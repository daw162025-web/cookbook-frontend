import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule], 
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  isMenuOpen = false;
  isUserDropdownOpen = false;
  searchControl = new FormControl('');
  private router = inject(Router);
  public authService = inject(AuthService);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Si se hace click en otro sitio del documento, cerramos el dropdown
    this.isUserDropdownOpen = false;
  }

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query !== null) {
        if (query.trim() !== '') {
          this.router.navigate(['/search'], { queryParams: { q: query.trim() } });
        } else if (this.router.url.startsWith('/search')) {
          this.router.navigate(['/search'], { queryParams: { q: '' } });
        }
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Función para cerrar el menú al hacer clic en un enlace en móvil
  closeMenu() {
    this.isMenuOpen = false;
    this.isUserDropdownOpen = false;
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation(); 
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  onSearch() {
    const query = this.searchControl.value;
    if (query && query.trim() !== '') {
      this.router.navigate(['/search'], { queryParams: { q: query.trim() } });
      this.closeMenu();
    }
  }

  logout() {
    if (window.confirm('¿Seguro que quieres cerrar sesión?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
          this.closeMenu();
        },
        error: () => {
          // Fallback en caso de error, limpiar local
          this.authService.clearAuth();
          this.router.navigate(['/login']);
          this.closeMenu();
        }
      });
    }
  }
}
