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
      next: (res: any) => {
        // Forzamos la conversión a booleano real (true/false)
        // así evitamos que "0", "1" o null rompan el HTML
        this.recipe.is_favorite = !!res.is_favorite; 
        
        this.favoriteToggled.emit(this.recipe);
        console.log('Mensaje API:', res.message, 'Estado final:', this.recipe.is_favorite);
      },
      error: (err) => console.error('Error al gestionar favorito', err)
    });
  }
}