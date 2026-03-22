import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';
import { Recipe } from '../../models/recipe'; 
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredRecipes: Recipe[] = [];      
  selectedCategoryId: number | null = null; 

  private categoryService = inject(CategoryService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        console.log('Categories recibidas:', data);
        this.categories = Array.isArray(data) ? data : (data.categories || data.data || []);
        //Que cargue por defecto cuando entre
        if (this.categories.length > 0) {
          this.selectCategory(this.categories[0].id);
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  //al seleccionar categoria que cargue las recetas
  selectCategory(id: number): void {
    this.selectedCategoryId = id;
    this.categoryService.getRecipesByCategory(id).subscribe({
      next: (recipes: any) => {
        console.log('Recetas filtradas recibidas:', recipes);
        this.filteredRecipes = Array.isArray(recipes) ? recipes : (recipes.recipes || recipes.data || []);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al filtrar:', err)
    });
  }
}