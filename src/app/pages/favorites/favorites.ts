import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card';


@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './favorites.html'
})
export class Favorites implements OnInit {
  private recipeService = inject(RecipeService);
  private cdr = inject(ChangeDetectorRef); // Inyectamos el detector
  recipes: Recipe[] = [];
  loading = true;

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.recipeService.getFavorites().subscribe({
      next: (data) => {
        this.recipes = data;
        this.loading = false;
        this.cdr.detectChanges(); // Aseguramos que se vea el listado al cargar
      },
      error: (err) => {
        console.error('Error al cargar favoritos', err);
        this.loading = false;
      }
    });
  }

  onFavoriteToggled(recipe: Recipe) {
    if (!recipe.is_favorite) {
      // 1. Filtramos el array
      this.recipes = this.recipes.filter(r => r.id !== recipe.id);
      
      // 2. ¡FORZAMOS EL REPINTADO! 
      // Así la card desaparece de la vista inmediatamente
      this.cdr.detectChanges(); 
    }
  }
}