import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

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
}