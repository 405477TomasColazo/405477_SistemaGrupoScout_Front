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
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient,
              private tokenService: TokenService) {
    const token = this.tokenService.getToken();
    if (token) {
      this.loadUserFromToken();
    }
  }

  login(email: string, password: string): Observable<User | null> {
    return this.http.post<{token: string}>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.tokenService.saveToken(response.token);  // Guarda el token
          this.loadUserFromToken();  // Carga los datos del usuario desde el token
        }),
        map(() => this.getCurrentUser())  // Devuelve el usuario actual después de hacer login
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
      // Decodifica el token JWT (en base64) para obtener la información del usuario
      const decodedToken = this.decodeToken(token);
      const email: string = decodedToken.sub;  // O usa decodedToken.email dependiendo de cómo lo hayas configurado
      const roles = decodedToken.roles || [];

      // Llamas al backend para obtener el usuario por email
      this.getUserByEmail(email).subscribe({
        next: (user) => {
          user.roles = roles || [];
          // Después de recibir el usuario, actualizas el currentUserSubject
          this.currentUserSubject.next(user);
          console.log(this.currentUserSubject.value);
        },
        error: () => {
          // Si ocurre un error, puedes manejarlo (por ejemplo, eliminar el token y limpiar el usuario)
          this.tokenService.removeToken();
          this.currentUserSubject.next(null);
        }
      });
    }
  }
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`http://localhost:8080/user/${email}`);
  }

  private decodeToken(token: string): any {
    // Decodifica el JWT y extrae la información del payload
    const payload = token.split('.')[1];  // Obtiene el payload (parte del medio del token)
    const decoded = atob(payload);  // Decodifica en base64
    return JSON.parse(decoded);  // Parsea el JSON decodificado
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;
    
    // Check both with and without "ROLE_" prefix
    const roleWithPrefix = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    const roleWithoutPrefix = role.startsWith('ROLE_') ? role.substring(5) : role;
    
    return user.roles.includes(role) || 
           user.roles.includes(roleWithPrefix) || 
           user.roles.includes(roleWithoutPrefix);
  }

  // Method to update current user data (for profile updates)
  updateCurrentUser(updatedUser: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      this.currentUserSubject.next(newUser);
    }
  }

  // Method to refresh user data from backend
  refreshCurrentUser(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.email) {
      this.getUserByEmail(currentUser.email).subscribe({
        next: (user) => {
          user.roles = currentUser.roles; // Keep the roles from token
          this.currentUserSubject.next(user);
        },
        error: () => {
          // Handle error if needed
          console.error('Error refreshing user data');
        }
      });
    }
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    if (user && user.roles && user.roles.length > 0) {
      const role = user.roles[0]; 
      // Remove "ROLE_" prefix if present
      return role.startsWith('ROLE_') ? role.substring(5) : role;
    }
    return null;
  }
}
