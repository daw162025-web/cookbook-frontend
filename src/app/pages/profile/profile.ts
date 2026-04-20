import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  profileForm: FormGroup;
  user: any;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      password_confirmation: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = { ...this.profileForm.value };
    if (!formData.password) {
      delete formData.password;
      delete formData.password_confirmation;
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = '¡Perfil actualizado con éxito!';
        this.profileForm.get('password')?.reset();
        this.profileForm.get('password_confirmation')?.reset();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error.message || 'Error al actualizar el perfil';
      }
    });
  }
}
