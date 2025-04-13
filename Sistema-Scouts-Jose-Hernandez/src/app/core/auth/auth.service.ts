import { Injectable } from '@angular/core';
import {TokenService} from './token.service';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, map, Observable, tap} from 'rxjs';
import {User} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = 'api/auth';

  constructor(private http: HttpClient,
              private tokenService: TokenService) {
    const token = this.tokenService.getToken();
    if (token) {
      this.loadUserFromToken();
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<{token: string, user: User}>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.tokenService.saveToken(response.token);
          this.currentUserSubject.next(response.user);
        }),
        map(response => response.user)
      );
  }

  logout(): void {
    this.tokenService.removeToken();
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.tokenService.getToken() !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private loadUserFromToken(): void {
    const token = this.tokenService.getToken();
    if (token) {
      // Aquí decodificarías el JWT para obtener la info del usuario
      // O harías una petición al backend para obtener el usuario actual
      this.http.get<User>(`${this.apiUrl}/me`).subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => {
          this.tokenService.removeToken();
          this.currentUserSubject.next(null);
        }
      });
    }
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes(role) : false;
  }
}
