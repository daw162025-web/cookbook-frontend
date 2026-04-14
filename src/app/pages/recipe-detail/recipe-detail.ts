import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { TimeFormatPipe } from '../../pipes/time-format-pipe';
import { Recipe } from '../../models/recipe';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeFormatPipe],
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

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.recipeService.getRecipe(id).subscribe({
        next: (data) => {
          this.recipe = data;

          if (Array.isArray(data.image_url)) {
            this.images = data.image_url;
          } else if (typeof data.image_url === 'string') {
            try {
              const parsed = JSON.parse(data.image_url);
              this.images = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              this.images = data.image_url ? [data.image_url] : [];
            }
          } else {
            this.images = [];
          }

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
}
