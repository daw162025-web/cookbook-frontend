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
  expandedCategories: Set<number> = new Set();

  private categoryService = inject(CategoryService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        console.log('Categories recibidas:', data);
        this.categories = Array.isArray(data) ? data : (data.categories || data.data || []);
        
        // Que cargue por defecto cuando entre
        if (this.categories.length > 0) {
          const firstCat = this.categories[0];
          // Expandimos la primera categoría si tiene hijos
          if (firstCat.children && firstCat.children.length > 0) {
            this.expandedCategories.add(firstCat.id);
            this.selectCategory(firstCat.children[0].id);
          } else {
            this.selectCategory(firstCat.id);
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  toggleCategory(categoryId: number): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
    this.cdr.detectChanges();
  }

  isExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  // al seleccionar categoria que cargue las recetas
  selectCategory(id: number, isParent: boolean = false): void {
    this.selectedCategoryId = id;
    
    if (isParent) {
      this.toggleCategory(id);
    }

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