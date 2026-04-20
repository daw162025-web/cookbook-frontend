import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-comments-dashboard',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './comments-dashboard.html',
  styleUrl: './comments-dashboard.css',
})

export class CommentsDashboard implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  comments: any[] = [];
  loading = true;
  filterStatus = 'all'; // Para filtrar por pendientes o aprobados

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.loading = true;
    this.adminService.getPendingComments().subscribe({
      next: (data) => {
        this.comments = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  approveComment(id: number) {
    this.adminService.approveComment(id).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== id);
        this.cdr.detectChanges();
      }
    });
  }

  deleteComment(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      this.adminService.deleteComment(id).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== id);
          this.cdr.detectChanges();
        }
      });
    }
  }
}
