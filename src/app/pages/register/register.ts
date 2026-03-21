import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  errorMessage: string | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para comprobar que las contraseñas coinciden
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      // Marcamos el error en el control de confirmación
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.errorMessage = null;
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Register error', err);
          if (err.error && err.error.errors) {
            // Laravel envía los errores de validación en "errors"
            const firstErrorKey = Object.keys(err.error.errors)[0];
            this.errorMessage = err.error.errors[firstErrorKey][0]; 
            // Esto mostrará por ejemplo "The email has already been taken."
            // O si configuras Laravel en español, saldrá en español.
          } else if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Hubo un error al registrar el usuario';
          }
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
