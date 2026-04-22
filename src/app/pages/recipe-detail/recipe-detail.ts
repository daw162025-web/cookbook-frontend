import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { TimeFormatPipe } from '../../pipes/time-format-pipe';
import { Recipe } from '../../models/recipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeFormatPipe, FormsModule],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.css'
})
export class RecipeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router); // Inyectamos el Router aquí

  recipe: any = null;
  images: string[] = [];
  currentImageIndex = 0;
  loading = true;
  error = false;
  userRating = 0;
  newCommentContent: string = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.recipeService.getRecipe(id).subscribe({
        next: (data) => {
          this.recipe = data;
          this.userRating = data.user_rating || 0;
          // Función para limpiar URLs de forma robusta
          const cleanUrl = (val: any): string[] => {
            if (!val) return [];
            let current = val;
            const maxAttempts = 3;
            let attempts = 0;

            while (attempts < maxAttempts) {
              if (Array.isArray(current)) {
                // Si es un array de un solo elemento que parece JSON, bajamos
                if (current.length === 1 && typeof current[0] === 'string' && current[0].startsWith('[')) {
                  try {
                    current = JSON.parse(current[0]);
                    continue;
                  } catch { break; }
                }
                return current.map(item => typeof item === 'string' ? item.replace(/[\[\]"\\ ]/g, '') : item);
              }
              if (typeof current === 'string' && current.startsWith('[')) {
                try {
                  current = JSON.parse(current);
                  continue;
                } catch {
                  return [current.replace(/[\[\]"\\ ]/g, '')];
                }
              }
              break;
              attempts++;
            }
            return Array.isArray(current) ? current : [String(current).replace(/[\[\]"\\ ]/g, '')];
          };

          this.images = cleanUrl(data.image_url);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  nextImage() {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }
  }

  prevImage() {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    }
  }

  getInstructions(): string[] {
    if (!this.recipe?.instructions) return [];
    if (Array.isArray(this.recipe.instructions)) return this.recipe.instructions;
    try { return JSON.parse(this.recipe.instructions); } catch { return [this.recipe.instructions]; }
  }

  toggleFavorite(recipe: Recipe) {
    this.recipeService.toggleFavorite(recipe.id).subscribe({
      next: (res) => {
        this.recipe.is_favorite = !!res.is_favorite;
        this.cdr.detectChanges();
        console.log('Favorito actualizado', res);
      },
      error: (err) => {
        // También redirigimos al login si intenta guardar favoritos sin estar logueado
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  shareRecipe() {
    const shareData = {
      title: this.recipe.title,
      text: `¡Mira esta receta de ${this.recipe.title} en Cookbook!`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles.');
    }
  }

  rate(stars: number) {
    this.recipeService.rateRecipe(this.recipe.id, stars).subscribe({
      next: (res) => {
        this.recipe.avg_rating = res.avg_rating;
        this.userRating = stars; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) {
          // Redirección directa al login si no hay token
          this.router.navigate(['/login']);
        } else {
          console.error('Error al valorar:', err);
        }
      }
    });
  }

  addComment() {
    // Si el texto está vacío o solo tiene espacios, no hacemos nada
    if (!this.newCommentContent.trim()) return;

    this.recipeService.addComment(this.recipe.id, this.newCommentContent).subscribe({
      next: (comment) => {
        // El backend devuelve el comentario con el usuario cargado
        // Lo añadimos al principio del array para que aparezca arriba de todo
        if (!this.recipe.comments) {
          this.recipe.comments = [];
        }
        this.recipe.comments.unshift(comment);

        // Limpiamos el textarea y forzamos el repintado
        this.newCommentContent = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) {
          // Si no está logueado, lo mandamos al login (como con las estrellas)
          this.router.navigate(['/login']);
        } else {
          console.error('Error al publicar comentario', err);
        }
      }
    });
  }
}
