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
  selectedFiles: File[] = []; // Guardamos los archivos nuevos para subir
  
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
    console.log("Dificultad que llega de la BD:", `'${recipe.difficulty}'`);
    const diff = recipe.difficulty ? recipe.difficulty.trim() : 'Media';
    this.selectedRecipe.difficulty = diff;    // Mapeamos los IDs de las categorías actuales para el multiselector
    this.selectedRecipe.category_ids = recipe.categories.map((c: any) => c.id);
    this.selectedRecipe.all_images = Array.isArray(recipe.image_url) 
      ? recipe.image_url 
      : (recipe.image_url ? [recipe.image_url] : []);
      
    this.selectedFiles = [];
    if (recipe.ingredients) {
      this.selectedRecipe.ingredients = recipe.ingredients.map((ing: any) => ({
        id: ing.id,
        name: ing.name,
        pivot: {
          quantity: ing.pivot?.quantity || '',
          unit: ing.pivot?.unit || ''
        }
      }));
    } else {
      this.selectedRecipe.ingredients = [];
    }
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
    
    formData.append('existing_images', JSON.stringify(this.selectedRecipe.all_images.filter((img: string) => img.startsWith('http'))));

    // Añadimos los archivos NUEVOS
    this.selectedFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    this.adminService.updateRecipe(this.selectedRecipe.id, formData).subscribe({
      next: () => {
        this.loadRecipes();
        this.selectedRecipe = null;
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

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
        
        // Previsualización de las nuevas fotos
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedRecipe.all_images.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removeImage(index: number) {
    this.selectedRecipe.all_images.splice(index, 1);
    // Aquí deberías sincronizar también con selectedFiles si es una foto recién añadida
  }

  
}