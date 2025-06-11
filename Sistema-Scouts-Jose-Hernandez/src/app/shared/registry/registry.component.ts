import {Component, inject, OnInit} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {RegisterRequest} from '../../core/models/user.model';
import {UserService} from '../../core/services/user.service';

@Component({
  selector: 'app-registry',
  imports: [
    NgClass,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './registry.component.html',
  styleUrl: './registry.component.css'
})
export class RegistryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
 private userService = inject(UserService);

  showAlert: boolean = false;
  alertType: string = '';
  alertText: string = '';
  invitationToken: string | null = null;

  registrationForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    contactPhone: ['', [Validators.required]],
    dni: ['', [Validators.required]],
    birthdate: ['', [Validators.required]],
    address: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    // Get token from URL
    this.invitationToken = this.activatedRoute.snapshot.queryParamMap.get('token');

    if (!this.invitationToken) {
      this.showErrorAlert('No se encontró token de invitación válido');
      setTimeout(() => this.router.navigate(['/home']), 3000);
      return;
    }

    // Decode token and pre-fill form
    this.decodeTokenAndPopulateForm();
  }

  decodeTokenAndPopulateForm(): void {
    try {
      // Only decode the payload part (second part of the JWT)
      const parts = this.invitationToken!.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(atob(parts[1]));

      // Check if token is expired
      const expTime = payload.exp * 1000; // Convert to milliseconds
      if (expTime < Date.now()) {
        this.showErrorAlert('El enlace de invitación ha expirado');
        return;
      }

      // Get email from token
      const email = payload.sub;
      if (!email) {
        throw new Error('Email not found in token');
      }

      // Pre-fill the form with data from token
      const lastName = payload.lastName || ''; // Check if lastName is in the token or use empty string

      this.registrationForm.patchValue({
        email: email,
        lastName: lastName
      });

      // Make email and lastName read-only
      this.registrationForm.get('email')?.disable();
      this.registrationForm.get('lastName')?.disable();

    } catch (error) {
      console.error('Error decoding token:', error);
      this.showErrorAlert('Token de invitación inválido');
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  closeAlert(): void {
    this.showAlert = false;
  }

  showSuccessAlert(message: string): void {
    this.alertType = 'success';
    this.alertText = message;
    this.showAlert = true;
  }

  showErrorAlert(message: string): void {
    this.alertType = 'error';
    this.alertText = message;
    this.showAlert = true;
  }

  registerUser(): void {
    if (this.registrationForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registrationForm.controls).forEach(key => {
        this.registrationForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Get values including disabled fields
    const email = this.registrationForm.get('email')?.value;
    const lastName = this.registrationForm.get('lastName')?.value;
    const formValues = this.registrationForm.getRawValue();

    const registerPayload:RegisterRequest = {
      email: email,
      password: formValues.password,
      lastName: lastName,
      tutor: {
        name: formValues.name,
        lastName: lastName,
        email: email,
        contactPhone: formValues.contactPhone,
        dni: formValues.dni,
        birthdate: formValues.birthdate,
        address: formValues.address,
        relationships: []
      }
    };

    this.userService.registerUser(registerPayload).subscribe({
      next: response => {
        this.showSuccessAlert('Registro completado con exito');

        setTimeout(() => {
          this.router.navigate(['/home']);
        },2000);
      },
      error: error => {
        this.showErrorAlert(error.message || 'Error al completar el registro');
      }
    })
  }
}
