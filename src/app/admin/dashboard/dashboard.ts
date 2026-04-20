import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef); 
  stats: any = null;
  isRefreshing = false; 

 ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isRefreshing = true;
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isRefreshing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar stats', err);
        this.isRefreshing = false;
        this.cdr.detectChanges();
      }
    });
  }
}