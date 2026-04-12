import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private http = inject(HttpClient);
  // private apiUrl = 'http://localhost:8000/api/ingredients';
  private apiUrl = environment.apiUrl;

  getIngredients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ingredients`);
  }
}
