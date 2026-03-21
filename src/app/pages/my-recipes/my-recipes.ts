import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-recipes.html',
  styleUrl: './my-recipes.css'
})
export class MyRecipesComponent implements OnInit {
  private recipeService = inject(RecipeService);
  private cdr = inject(ChangeDetectorRef);

  recipes: Recipe[] = [];
  loading = true;
  error = false;

  ngOnInit() {
    this.loadMyRecipes();
  }

  loadMyRecipes() {
    this.loading = true;
    this.recipeService.getMyRecipes().subscribe({
      next: (data) => {
        this.recipes = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando tus recetas', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteRecipe(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta receta? Esta acción no se puede deshacer.')) {
      this.recipeService.deleteRecipe(id).subscribe({
        next: () => {
          // Filtrar la receta eliminada de la lista local
          this.recipes = this.recipes.filter(r => r.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error eliminando la receta', err);
          alert('No se pudo eliminar la receta. Inténtalo de nuevo.');
        }
      });
    }
  }
}
