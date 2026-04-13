import { Component, Input, inject } from '@angular/core';
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
  private recipeService = inject(RecipeService);

  toggleFavorite(event: Event, recipe: Recipe) {
    event.preventDefault();
    event.stopPropagation(); // Evita que el clic active el routerLink de la card

    this.recipeService.toggleFavorite(recipe.id).subscribe({
      next: (res) => {
        // Invertimos el estado localmente para que el corazón cambie al instante
        recipe.is_favorite = !recipe.is_favorite;
        console.log('Estado de favorito cambiado', res);
      },
      error: (err) => {
        console.error('Error al gestionar favorito', err);
        // Aquí podrías añadir un aviso si el usuario no está logueado
        if (err.status === 401) {
          alert('Debes iniciar sesión para añadir a favoritos');
        }
      }
    });
  }
}