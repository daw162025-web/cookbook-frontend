import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-users-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-dashboard.html',
  styleUrl: './users-dashboard.css'
})
export class UsersDashboard implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  
  users: any[] = [];
  loading: boolean = true;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
        this.loading = false;
      }
    });
  }

  changeRole(userId: number, newRole: string) {
    if (confirm(`¿Estás segura de cambiar el rol a ${newRole}?`)) {
      this.adminService.updateUserRole(userId, newRole).subscribe({
        next: () => {
          // Actualizamos la lista local para no tener que recargar todo
          const user = this.users.find(u => u.id === userId);
          if (user) user.role = newRole;
          this.cdr.detectChanges();
        },
        error: (err) => alert('Error al actualizar el rol')
      });
    }
  }
}