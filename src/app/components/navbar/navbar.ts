import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { RecipeService } from '../../services/recipe.service';
import { take } from 'rxjs/operators';

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

  searchHistory: any[] = []; 
  showHistory = false;

  searchControl = new FormControl('');
  private router = inject(Router);
  public authService = inject(AuthService);
  private recipeService = inject(RecipeService);

  ngOnInit() {
    // Escuchamos cambios en el login para cargar el historial específico del usuario
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadSearchHistory(); 
      } else {
        this.searchHistory = []; // Limpiamos si no hay nadie logueado
      }
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(search_term => {
      if (search_term && search_term.trim() !== '') {
        this.router.navigate(['/search'], { queryParams: { q: search_term.trim() } });
        this.showHistory = false;
      }
    });
  }

  loadSearchHistory() {
    this.recipeService.getSearchHistory().subscribe({
      next: (history) => {
        this.searchHistory = history;
      },
      error: (err) => {
        // Si da error 401 (no logueado), limpiamos el historial localmente
        if (err.status === 401) this.searchHistory = [];
      }
    });
  }

  onFocusSearch() {
    if (this.searchHistory.length > 0) {
      this.showHistory = true;
    }
  }

  selectHistory(search_term: string) {
    this.searchControl.setValue(search_term);
    this.onSearch();
    this.showHistory = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Función para cerrar el menú al hacer clic en un enlace en móvil
  closeMenu() {
    this.isMenuOpen = false;
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation(); 
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  onSearch() {
    const search_term = this.searchControl.value?.trim();
    if (!search_term) return;

    this.router.navigate(['/search'], { queryParams: { q: search_term } });
    this.closeMenu();
    this.showHistory = false;

    // Verificamos el estado antes de llamar al servicio
    this.authService.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.recipeService.saveHistory(search_term).subscribe({
          next: () => this.loadSearchHistory(), // Recarga el historial del usuario actual
          error: (err) => console.error('Error al guardar', err)
        });
      }
    });
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

  deleteHistoryItem(event: Event, id: number) {
    event.stopPropagation();
    
    if (!id) {
      console.error('No se puede borrar: ID no definido');
      return;
    }

    this.recipeService.deleteSearchHistory(id).subscribe({
      next: () => {
        console.log('Borrado con éxito');
        this.loadSearchHistory();
      },
      error: (err) => console.error('Error al borrar', err)
    });
  }

  // Limpiar el input con la X
  clearSearch() {
    this.searchControl.setValue('');
    this.showHistory = true; 
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showHistory = false;
      this.isUserDropdownOpen = false;
    }
  }
}
