import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  // private apiLocal = 'http://localhost:8000/api';
  private apiUrl = environment.apiUrl;

  getRecipes(search?: string): Observable<Recipe[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Recipe[]>(`${this.apiUrl}/recipes`, { params });
  }

  getMyRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/my-recipes`);
  }

  getRecipe(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/recipes/${id}`);
  }

  createRecipe(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recipes`, formData);
  }

  updateRecipe(id: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recipes/${id}`, formData);
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/recipes/${id}`);
  }

  toggleFavorite(recipeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/recipes/${recipeId}/favorite`, {});
  }
  getFavorites(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/favorites`);
  }
  rateRecipe(recipeId: number, score: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/recipes/${recipeId}/rate`, { score });
  }
  addComment(recipeId: number, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recipes/${recipeId}/comments`, { content });
  }
  saveHistory(query: string) {
    return this.http.post(`${this.apiUrl}/recipes/search-history`, { query });
  }
  getSearchHistory() {
    return this.http.get<any[]>(`${this.apiUrl}/recipes/search-history`);
  }
}