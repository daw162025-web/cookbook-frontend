import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { TimeFormatPipe } from '../../pipes/time-format-pipe';

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

  recipe: any = null;
  images: string[] = [];
  currentImageIndex = 0;
  loading = true;
  error = false;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.recipeService.getRecipe(id).subscribe({
        next: (data) => {
          this.recipe = data;
          this.images = Array.isArray(data.image_url)
            ? data.image_url
            : (data.image_url ? [data.image_url] : []);
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
}
