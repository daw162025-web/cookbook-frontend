import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe';
import { ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef); // Inyectamos el detector

  toggleFavorite(event: Event, recipe: Recipe) {
    event.preventDefault();
    event.stopPropagation();

    this.recipeService.toggleFavorite(recipe.id).subscribe({
      next: (res) => {
        // 1. Actualizamos el dato
        this.recipe.is_favorite = res.is_favorite; 
        
        // 2. Emitimos el evento
        this.favoriteToggled.emit(this.recipe);

        // 3. ¡ESTO ES LO IMPORTANTE! Forzamos a Angular a repintar la pantalla YA
        this.cdr.detectChanges(); 
        
        console.log('API dice:', res.message, 'Estado:', this.recipe.is_favorite);
      },
      error: (err) => {
        console.error('Error al gestionar favorito', err);
      }
    });
  }
}