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

  selectedFile: File | null = null;
  imagePreview: string | null = null;

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
        if (user.profile_image_url) {
          this.imagePreview = user.profile_image_url;
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Previsualización
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
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

    const formData = new FormData();
    formData.append('name', this.profileForm.get('name')?.value);
    formData.append('email', this.profileForm.get('email')?.value);
    
    const password = this.profileForm.get('password')?.value;
    if (password) {
      formData.append('password', password);
      formData.append('password_confirmation', this.profileForm.get('password_confirmation')?.value);
    }

    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = '¡Perfil actualizado con éxito!';
        this.profileForm.get('password')?.reset();
        this.profileForm.get('password_confirmation')?.reset();
        this.selectedFile = null;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error.message || 'Error al actualizar el perfil';
      }
    });
  }
}
