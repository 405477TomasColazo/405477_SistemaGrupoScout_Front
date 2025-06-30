import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { ForgotPasswordRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  isSubmitted = false;

  // Alert system
  showAlert = false;
  alertType: 'success' | 'error' = 'success';
  alertText = '';

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const forgotPasswordData: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.value.email
    };

    this.userService.forgotPassword(forgotPasswordData).subscribe({
      next: (response) => {
        this.isSubmitted = true;
        this.isSubmitting = false;
        this.showAlertMessage('success', 'Se ha enviado un email con las instrucciones para recuperar tu contraseña');
      },
      error: (error) => {
        this.isSubmitting = false;
        // For security reasons, always show success message
        this.isSubmitted = true;
        this.showAlertMessage('success', 'Se ha enviado un email con las instrucciones para recuperar tu contraseña');
      }
    });
  }

  showAlertMessage(type: 'success' | 'error', text: string): void {
    this.alertType = type;
    this.alertText = text;
    this.showAlert = true;

    setTimeout(() => {
      this.closeAlert();
    }, 8000); // 8 seconds for important security messages
  }

  closeAlert(): void {
    this.showAlert = false;
    this.alertText = '';
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return `${fieldName} es obligatorio`;
      if (field.errors?.['email']) return 'Por favor ingresa un email válido';
    }
    return '';
  }

  goBackToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
