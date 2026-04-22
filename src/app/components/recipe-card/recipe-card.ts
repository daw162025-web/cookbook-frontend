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
  
  cleanImageUrl(recipe: any): string {
      const fallback = 'assets/placeholder.jpg';
      if (!recipe || !recipe.image_url) return fallback;

      let url = '';

      // Caso 1: Es un Array (como debería ser)
      if (Array.isArray(recipe.image_url)) {
          let first = recipe.image_url[0];
          
          // Si el primer elemento es un string que parece JSON, lo decodificamos (doble encoding legacy)
          if (typeof first === 'string' && first.startsWith('[')) {
              try {
                  const decoded = JSON.parse(first);
                  url = Array.isArray(decoded) ? decoded[0] : first;
              } catch (e) {
                  url = first;
              }
          } else {
              url = first;
          }
      } 
      // Caso 2: Es un string (porque se guardó mal o viene de un seeder antiguo)
      else if (typeof recipe.image_url === 'string') {
          if (recipe.image_url.startsWith('[')) {
              try {
                  const decoded = JSON.parse(recipe.image_url);
                  url = Array.isArray(decoded) ? decoded[0] : recipe.image_url;
              } catch (e) {
                  url = recipe.image_url.replace(/[\[\]"\\ ]/g, '').split(',')[0];
              }
          } else {
              url = recipe.image_url;
          }
      }

      // Si después de limpiar no hay nada, ponemos el placeholder
      return url && typeof url === 'string' && url.startsWith('http') ? url : fallback;
  }
}