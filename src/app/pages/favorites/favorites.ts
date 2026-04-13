import { Component, OnInit, inject } from '@angular/core';
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
      },
      error: (err) => {
        console.error('Error al cargar favoritos', err);
        this.loading = false;
      }
    });
  }

  onFavoriteToggled(recipe: Recipe) {
    if (!recipe.is_favorite) {
      // Si ya no es favorito, lo quitamos de la lista actual
      this.recipes = this.recipes.filter(r => r.id !== recipe.id);
    }
  }
}