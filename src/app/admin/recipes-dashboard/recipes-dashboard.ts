import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recipes-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './recipes-dashboard.html',
  styleUrl: './recipes-dashboard.css'
})
export class RecipesDashboard implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  recipes: any[] = [];
  categories: any[] = []; 
  selectedRecipe: any = null;
  loading = true;
  selectedFile: File | null = null;

  ngOnInit() {
    this.loadRecipes();
    this.loadCategories();
  }

  loadCategories() {
    this.adminService.getCategories().subscribe(data => this.categories = data);
  }

  openEditModal(recipe: any) {
    // Creamos una copia profunda para no romper la tabla
    this.selectedRecipe = JSON.parse(JSON.stringify(recipe));
    
    // Mapeamos los IDs de las categorías actuales para el multiselector
    this.selectedRecipe.category_ids = recipe.categories.map((c: any) => c.id);
    
    // Aseguramos que los ingredientes tengan la estructura correcta
    if (!this.selectedRecipe.ingredients) this.selectedRecipe.ingredients = [];
  }

  addIngredient() {
    this.selectedRecipe.ingredients.push({ name: '', pivot: { quantity: '', unit: '' } });
  }

  removeIngredient(index: number) {
    this.selectedRecipe.ingredients.splice(index, 1);
  }

  addStep() {
    this.selectedRecipe.instructions.push('');
  }

  removeStep(index: number) {
    this.selectedRecipe.instructions.splice(index, 1);
  }

 saveRecipe() {
    const formData = new FormData();
    
    // Añadimos los datos básicos
    formData.append('title', this.selectedRecipe.title);
    formData.append('description', this.selectedRecipe.description);
    formData.append('difficulty', this.selectedRecipe.difficulty);
    formData.append('category_ids', JSON.stringify(this.selectedRecipe.category_ids));
    formData.append('instructions', JSON.stringify(this.selectedRecipe.instructions));
    
    // Si hay una foto nueva, la adjuntamos
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.adminService.updateRecipe(this.selectedRecipe.id, formData).subscribe({
      next: (res) => {
        // Actualizamos la tabla y cerramos
        this.loadRecipes(); 
        this.selectedRecipe = null;
        this.selectedFile = null;
      }
    });
  }

  loadRecipes() {
    this.loading = true;
    this.adminService.getRecipes().subscribe({
      next: (data) => {
        this.recipes = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  deleteRecipe(id: number) {
    if (confirm('¿Seguro que quieres eliminar esta receta? Esta acción no se puede deshacer.')) {
      this.adminService.deleteRecipe(id).subscribe({
        next: () => {
          this.recipes = this.recipes.filter(r => r.id !== id);
          this.cdr.detectChanges();
        }
      });
    }
  }

  trackByFn(index: number, item: any): any {
    // Si el item tiene ID (como un ingrediente de la BD), usamos el ID.
    // Si no (como un paso nuevo), usamos el índice.
    return item.id ? item.id : index;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Previsualización instantánea antes de subir
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedRecipe.image_url = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  
}