import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/ingredients';

  getIngredients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
