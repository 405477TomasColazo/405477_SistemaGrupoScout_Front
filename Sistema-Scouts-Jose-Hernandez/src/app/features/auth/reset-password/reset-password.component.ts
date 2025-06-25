import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { ResetPasswordRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {

  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetPasswordForm: FormGroup;
  token: string = '';
  isValidatingToken = true;
  isValidToken = false;
  isSubmitting = false;
  isSuccess = false;

  // Alert system
  showAlert = false;
  alertType: 'success' | 'error' = 'success';
  alertText = '';

  constructor() {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get token from query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.validateToken();
      } else {
        this.isValidatingToken = false;
        this.showAlertMessage('error', 'Token de recuperación no válido');
      }
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  validateToken(): void {
    this.userService.validateResetToken(this.token).subscribe({
      next: (isValid) => {
        this.isValidToken = isValid;
        this.isValidatingToken = false;
        if (!isValid) {
          this.showAlertMessage('error', 'El enlace de recuperación ha expirado o no es válido');
        }
      },
      error: (error) => {
        this.isValidToken = false;
        this.isValidatingToken = false;
        this.showAlertMessage('error', 'Error al validar el enlace de recuperación');
        console.error('Error validating token:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const resetData: ResetPasswordRequest = {
      token: this.token,
      newPassword: this.resetPasswordForm.value.newPassword,
      confirmPassword: this.resetPasswordForm.value.confirmPassword
    };

    this.userService.resetPassword(resetData).subscribe({
      next: (response) => {
        this.isSuccess = true;
        this.isSubmitting = false;
        this.showAlertMessage('success', 'Contraseña restablecida exitosamente');
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error.error?.message || 'Error al restablecer la contraseña';
        this.showAlertMessage('error', errorMessage);
        console.error('Error resetting password:', error);
      }
    });
  }

  showAlertMessage(type: 'success' | 'error', text: string): void {
    this.alertType = type;
    this.alertText = text;
    this.showAlert = true;

    setTimeout(() => {
      this.closeAlert();
    }, 8000);
  }

  closeAlert(): void {
    this.showAlert = false;
    this.alertText = '';
  }

  getFieldError(fieldName: string): string {
    const field = this.resetPasswordForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return `${fieldName} es obligatorio`;
      if (field.errors?.['minlength']) return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }

  get passwordsMatch(): boolean {
    return !this.resetPasswordForm.errors?.['passwordMismatch'];
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  requestNewLink(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}
