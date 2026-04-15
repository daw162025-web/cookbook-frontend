import { Component, OnInit, inject } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats: any = null;

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        console.log('Estadísticas cargadas:', data);
      },
      error: (err) => console.error('Error al cargar stats', err)
    });
  }
}