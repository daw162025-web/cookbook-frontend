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
    this.loadSearchHistory();

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(search_term => {
      if (search_term && search_term.trim() !== '') {
        this.router.navigate(['/search'], { queryParams: { q: search_term.trim() } });
        this.showHistory = false; // Ocultamos historial mientras escribe
      }
    });
  }

  loadSearchHistory() {
    this.authService.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.recipeService.getSearchHistory().subscribe({
          next: (history) => this.searchHistory = history,
          error: (err) => console.error('Error cargando historial', err)
        });
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

    this.authService.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.recipeService.saveHistory(search_term).subscribe({
          next: () => {
            console.log('Historial guardado');
            this.loadSearchHistory(); // Recargamos para que aparezca la nueva búsqueda
          },
          error: (err) => console.error('Error al guardar historial', err)
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
    this.recipeService.deleteSearchHistory(id).subscribe(() => {
      this.loadSearchHistory(); 
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
