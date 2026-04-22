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

      let url: any = '';

      // 1. Extraer la primera URL si es un array
      if (Array.isArray(recipe.image_url)) {
          url = recipe.image_url[0];
      } else {
          url = recipe.image_url;
      }

      // 2. Limpieza recursiva de strings que parecen JSON o arrays anidados
      const maxAttempts = 3;
      let attempts = 0;

      while (attempts < maxAttempts) {
          // Si es un array, seguir bajando
          if (Array.isArray(url)) {
              url = url[0];
          } 
          // Si es un string que parece JSON, intentar parsear
          else if (typeof url === 'string' && (url.startsWith('[') || url.startsWith('"'))) {
              try {
                  url = JSON.parse(url);
                  continue; // Volver a evaluar el resultado
              } catch (e) {
                  // Si falla el parseo pero tiene corchetes, limpiar a mano
                  url = url.replace(/[\[\]"\\ ]/g, '');
                  break;
              }
          } else {
              break;
          }
          attempts++;
      }

      // 3. Limpieza final de caracteres residuales (como escapes de slashes \/)
      if (typeof url === 'string') {
          url = url.replace(/[\[\]"\\ ]/g, '');
          // Asegurar que empiece por http (a veces el replace puede quitar demasiado si no se tiene cuidado, 
          // pero Cloudinary siempre usa http)
          if (!url.startsWith('http') && url.includes('http')) {
              url = url.substring(url.indexOf('http'));
          }
      }

      return (typeof url === 'string' && url.startsWith('http')) ? url : fallback;
  }
}