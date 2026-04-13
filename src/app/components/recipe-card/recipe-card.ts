import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-card.html', 
  styleUrls: ['./recipe-card.css']
})
export class RecipeCardComponent {
  @Input() recipe: any; 
  @Output() favoriteToggled = new EventEmitter<Recipe>();
  private recipeService = inject(RecipeService);

  toggleFavorite(event: Event, recipe: Recipe) {
    event.preventDefault();
    event.stopPropagation();

    this.recipeService.toggleFavorite(recipe.id).subscribe({
      next: (res) => {
        // ACTUALIZACIÓN CRUCIAL:
        // Usamos la respuesta de la API para asegurar que el estado es real
        recipe.is_favorite = res.is_favorite; 
        this.favoriteToggled.emit(recipe);
        console.log('Estado de favorito cambiado', res);
      },
      error: (err) => {
        console.error('Error al gestionar favorito', err);
      }
    });
}
}