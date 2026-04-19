import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-dashboard.html',
  styleUrl: './users-dashboard.css'
})
export class UsersDashboard implements OnInit {
  private adminService = inject(AdminService);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  users: any[] = [];
  selectedUser: any = null; //para el modal
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

  openEditModal(user: any) {
    this.selectedUser = { ...user };
  }

  saveUser() {
    this.adminService.updateUser(this.selectedUser.id, this.selectedUser).subscribe({
      next: () => {
        const index = this.users.findIndex(u => u.id === this.selectedUser.id);
        this.users[index] = this.selectedUser; // Actualiza la tabla
        this.selectedUser = null; // Cierra modal
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(userId: number) {
    if (confirm('¿ESTÁS SEGURA? Esta acción no se puede deshacer y el usuario perderá todo.')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          this.cdr.detectChanges();
        }
      });
    }
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