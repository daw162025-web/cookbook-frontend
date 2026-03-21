import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, RecipeCardComponent],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchComponent implements OnInit {
  recipes: Recipe[] = [];
  searchQuery: string = '';
  isLoading: boolean = true;
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.loadRecipes();
    });
  }

  loadRecipes(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.recipeService.getRecipes(this.searchQuery).subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching recipes', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
