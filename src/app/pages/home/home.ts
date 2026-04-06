import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  // Separamos las 3 grandes cateogrias
  mainCourses: Recipe[] = [];
  secondCourses: Recipe[] = [];
  desserts: Recipe[] = [];

  // Guardamos todas por si las necesitamos
  recipes: Recipe[] = [];

  private recipeService = inject(RecipeService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes() {
    this.recipeService.getRecipes().subscribe({
      next: (data: any) => {
        this.recipes = Array.isArray(data) ? data : (data.recipes || data.data || []);

        // Agrupar recetas por tipo
        this.groupRecipes();

        console.log('Recetas agrupadas listas para el HTML', {
          principales: this.mainCourses,
          segundos: this.secondCourses,
          postres: this.desserts
        });

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  // Agrupa por categoria segun categorias 
  private groupRecipes() {
    // Limpiamos los arrays
    this.mainCourses = [];
    this.secondCourses = [];
    this.desserts = [];

    this.recipes.forEach(recipe => {
      let isMain = false;
      let isSecond = false;
      let isDessert = false;

      // agrupamos por tipos de categorias
      if (recipe.categories && Array.isArray(recipe.categories)) {
        const catNames = recipe.categories.map(c => c.name.toLowerCase());

        isMain = catNames.some(name =>
          name.includes('principal') || name.includes('arroz') || name.includes('pasta') || name.includes('legumbre') ||
          name.includes('sopa') || name.includes('ensalada') || name.includes('verdura') || name.includes('tapa')
        );

        isSecond = catNames.some(name =>
          name.includes('segundo') || name.includes('carne') || name.includes('pescado') || name.includes('huevo') || name.includes('marisco')
        );

        isDessert = catNames.some(name =>
          name.includes('postre') || name.includes('dulce') || name.includes('tarta') || name.includes('bebida') || name.includes('cóctel') || name.includes('café')
        );
      }

      // La metemos en su correspondiente grupo 
      if (isMain) this.mainCourses.push(recipe);
      if (isSecond) this.secondCourses.push(recipe);
      if (isDessert) this.desserts.push(recipe);

    });
  }
}