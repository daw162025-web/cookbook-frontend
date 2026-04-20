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
  allComments: any[] = [];   
  loading = true;
  selectedComment: any = null;

  ngOnInit() {
    this.loadComments();    
    this.loadAllComments(); 
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

  loadAllComments() {
    this.adminService.getAllComments().subscribe(data => {
      this.allComments = data.map(comment => {
        // Comprobamos si el comentario está en la lista de pendientes de arriba
        const isPendingInCards = this.comments.some(pc => pc.id === comment.id);
        return {
          ...comment,
          statusLabel: comment.is_moderated 
            ? 'Aprobado' 
            : (isPendingInCards ? 'Pendiente de Revisión' : 'Rechazado / Oculto')
        };
      });
      this.cdr.detectChanges();
    });
  }

  approveComment(id: number) {
    this.adminService.approveComment(id).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== id);
        this.loadAllComments(); // Refrescamos la tabla para ver el badge verde
        this.cdr.detectChanges();
      }
    });
  }

  deleteComment(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      this.adminService.deleteComment(id).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== id);
          this.allComments = this.allComments.filter(c => c.id !== id);
          this.cdr.detectChanges();
        }
      });
    }
  }

  openEditModal(comment: any) {
    this.selectedComment = { ...comment };
  }

  updateComment() {
    this.adminService.updateComment(this.selectedComment.id, this.selectedComment).subscribe({
      next: () => {
        this.loadComments();
        this.loadAllComments();
        this.selectedComment = null;
        this.cdr.detectChanges();
      }
    });
  }

  rejectComment(id: number) {
    if (confirm('¿Quieres rechazar este comentario? No se mostrará en la receta.')) {
      // Enviamos el valor 2 para diferenciarlo del 0 (nuevo)
    this.adminService.updateComment(id, { is_moderated: 2 }).subscribe({
      next: () => {
        this.loadComments();
        this.loadAllComments();
        this.cdr.detectChanges();
      }
    });
  }
  }
}
