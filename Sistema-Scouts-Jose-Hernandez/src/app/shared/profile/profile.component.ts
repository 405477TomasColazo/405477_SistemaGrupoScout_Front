import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import {
  User,
  UpdateUserRequest,
  ChangePasswordRequest,
  AvatarOption
} from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // User data
  user: User | null = null;
  avatarOptions: AvatarOption[] = [];
  
  // Forms
  profileForm: FormGroup;
  passwordForm: FormGroup;

  // UI State
  activeTab: 'profile' | 'password' | 'avatar' = 'profile';
  isLoadingProfile = false;
  isUpdatingProfile = false;
  isChangingPassword = false;
  isLoadingAvatars = false;

  // Alerts
  showAlert = false;
  alertType: 'success' | 'error' = 'success';
  alertText = '';

  constructor() {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      lastName: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Subscribe to current user from AuthService
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          email: user.email,
          lastName: user.lastName
        });
      }
    });
    this.loadAvatars();
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }


  loadAvatars(): void {
    this.isLoadingAvatars = true;
    this.userService.getAvailableAvatars().subscribe({
      next: (avatars) => {
        this.avatarOptions = avatars;
        this.isLoadingAvatars = false;
      },
      error: (error) => {
        this.showAlertMessage('error', 'Error al cargar avatares');
        this.isLoadingAvatars = false;
        console.error('Error loading avatars:', error);
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile = true;
    const updateRequest: UpdateUserRequest = {
      email: this.profileForm.value.email,
      lastName: this.profileForm.value.lastName
    };

    this.userService.updateUser(updateRequest).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        // Update the current user in AuthService to sync with navbar
        this.authService.updateCurrentUser(updatedUser);
        this.showAlertMessage('success', 'Perfil actualizado exitosamente');
        this.isUpdatingProfile = false;
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al actualizar perfil';
        this.showAlertMessage('error', errorMessage);
        this.isUpdatingProfile = false;
        console.error('Error updating profile:', error);
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword = true;
    const changeRequest: ChangePasswordRequest = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.userService.changePassword(changeRequest).subscribe({
      next: () => {
        this.showAlertMessage('success', 'Contraseña cambiada exitosamente');
        this.passwordForm.reset();
        this.isChangingPassword = false;
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al cambiar contraseña';
        this.showAlertMessage('error', errorMessage);
        this.isChangingPassword = false;
        console.error('Error changing password:', error);
      }
    });
  }

  selectAvatar(avatarId: string): void {
    if (!this.user) return;

    const updateRequest: UpdateUserRequest = {
      email: this.user.email,
      lastName: this.user.lastName,
      avatar: avatarId
    };

    this.userService.updateUser(updateRequest).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        // Update the current user in AuthService to sync with navbar
        this.authService.updateCurrentUser(updatedUser);
        this.showAlertMessage('success', 'Avatar actualizado exitosamente');
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al actualizar avatar';
        this.showAlertMessage('error', errorMessage);
        console.error('Error updating avatar:', error);
      }
    });
  }

  changeTab(tab: 'profile' | 'password' | 'avatar'): void {
    this.activeTab = tab;
    this.closeAlert();
  }

  showAlertMessage(type: 'success' | 'error', text: string): void {
    this.alertType = type;
    this.alertText = text;
    this.showAlert = true;

    setTimeout(() => {
      this.closeAlert();
    }, 5000);
  }

  closeAlert(): void {
    this.showAlert = false;
    this.alertText = '';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Helper method to get field errors
  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return `${fieldName} es obligatorio`;
      if (field.errors?.['email']) return 'Email inválido';
      if (field.errors?.['minlength']) return `${fieldName} muy corto`;
    }
    return '';
  }

  // Helper method to check if passwords match
  get passwordsMatch(): boolean {
    return !this.passwordForm.errors?.['passwordMismatch'];
  }

  getAvatarUrl(avatar: string | undefined): string {
    if (avatar && avatar !== 'default') {
      return `https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=${avatar}`;
    }
    return '';
  }
}