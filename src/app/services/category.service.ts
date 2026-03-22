import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category';
import { Recipe } from '../models/recipe'; 

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/categories';

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getRecipesByCategory(categoryId: number): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/${categoryId}/recipes`);
  }
}