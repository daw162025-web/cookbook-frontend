import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe, RecipeResponse } from '../models/recipe'; 

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = 'http://localhost:8000/api/recipes'; 
  
  private http = inject(HttpClient);

  constructor() { }

  //Obtener todas las recetas
  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl);
  }

  //Obtener una receta por ID
  getRecipe(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  //Crear una nueva receta 
  createRecipe(recipe: Recipe): Observable<RecipeResponse> {
    return this.http.post<RecipeResponse>(this.apiUrl, recipe);
  }

  //Actualizar una receta
  updateRecipe(id: number, recipe: any): Observable<RecipeResponse> {
    // Le añadimos el _method='PUT' al objeto antes de enviarlo
    recipe._method = 'PUT'; 
    return this.http.post<RecipeResponse>(`${this.apiUrl}/${id}`, recipe);
  }

  //Eliminar una receta
  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}