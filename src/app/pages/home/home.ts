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
  // Aquí guardaremos las recetas 
  recipes: Recipe[] = []; 

  // Inyectamos el servicio
  private recipeService = inject(RecipeService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes() {
    this.recipeService.getRecipes().subscribe({
      next: (data: any) => {
        // Tu lógica de limpieza está bien, pero aseguremos el tiro:
        this.recipes = Array.isArray(data) ? data : (data.recipes || data.data || []);
        
        console.log('Recetas listas para el HTML:', this.recipes);
        
        // Esto forzará el renderizado
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error:', err)
    });
  }
}