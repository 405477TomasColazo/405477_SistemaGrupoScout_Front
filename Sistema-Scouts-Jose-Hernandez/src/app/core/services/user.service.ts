import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  RegisterRequest,
  User,
  UpdateUserRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AvatarOption
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url: string = 'http://localhost:8080';

  registerUser(user: RegisterRequest) {
    return this.http.post<string>(`${this.url}/auth/register`, user)
  }

  // User Management Methods (unified)
  updateUser(userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.url}/user/profile`, userData);
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<string> {
    return this.http.post(`${this.url}/user/change-password`, passwordData, {
      responseType: 'text'
    });
  }

  getAvailableAvatars(): Observable<AvatarOption[]> {
    return this.http.get<AvatarOption[]>(`${this.url}/user/avatars`);
  }

  // Password Reset Methods
  forgotPassword(emailData: ForgotPasswordRequest): Observable<string> {
    return this.http.post(`${this.url}/auth/forgot-password`, emailData, {
      responseType: 'text'
    });
  }

  resetPassword(resetData: ResetPasswordRequest): Observable<string> {
    return this.http.post(`${this.url}/auth/reset-password`, resetData, {
      responseType: 'text'
    });
  }

  validateResetToken(token: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}/auth/reset-password/validate/${token}`);
  }
}
