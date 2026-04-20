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

  ngOnInit() {
    this.loadRecipes();
    this.loadCategories();
  }

  loadCategories() {
    this.adminService.getCategories().subscribe(data => this.categories = data);
  }

  openEditModal(recipe: any) {
    this.selectedRecipe = { ...recipe }; // Copia para no editar en vivo la tabla
  }

  saveRecipe() {
    this.adminService.updateRecipe(this.selectedRecipe.id, this.selectedRecipe).subscribe({
      next: (res) => {
        const index = this.recipes.findIndex(r => r.id === this.selectedRecipe.id);
        this.recipes[index] = res.recipe;
        this.selectedRecipe = null;
        this.cdr.detectChanges();
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
}