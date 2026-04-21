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
        
        if (this.categories.length > 0) {
          // Buscamos específicamente la categoría con ID 1
          const categoryId1 = this.categories.find(c => c.id === 1);

          if (categoryId1) {
            // Si la encontramos, la seleccionamos
            // Si quieres que se expanda si tiene hijos:
            if (categoryId1.children && categoryId1.children.length > 0) {
              this.expandedCategories.add(categoryId1.id);
            }
            this.selectCategory(1);
          } else {
            // Fallback: Si por algún motivo el ID 1 no existe, carga la primera disponible
            this.selectCategory(this.categories[0].id);
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