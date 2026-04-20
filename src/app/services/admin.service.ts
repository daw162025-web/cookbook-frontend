import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`; 

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/role`, { role });
  }

  getPendingComments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comments/pending`);
  }

  approveComment(commentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/${commentId}/approve`, {});
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comments/${commentId}`);
  }
  getAllComments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comments/all`);
  }

  updateComment(id: number, commentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/${id}`, {
      ...commentData,
      _method: 'PUT' 
    });
  }

  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, userData);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  getRecipes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recipes`);
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/recipes/${id}`);
  }

  updateRecipe(id: number, data: any): Observable<any> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return this.http.post(`${this.apiUrl}/recipes/${id}`, data);
    }
    
    return this.http.put(`${this.apiUrl}/recipes/${id}`, data);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

}