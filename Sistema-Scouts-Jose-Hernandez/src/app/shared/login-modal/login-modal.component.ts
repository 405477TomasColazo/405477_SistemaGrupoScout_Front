import {Component, EventEmitter, inject, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../core/auth/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-login-modal',
  imports: [
    FormsModule
  ],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.css'
})
export class LoginModalComponent {
  @Output() closeModal = new EventEmitter<void>;
  authService: AuthService = inject(AuthService);

  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  subscription: Subscription = new Subscription();

  onSubmit(){
    this.subscription.add(
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          // Login exitoso, cierra el modal
          this.closeModal.emit();
        },
        error: () => {
          // Aquí puedes mostrar algún mensaje de error
          console.error('Error al iniciar sesión');
        }
      })
    );
  }

  onClose(){
    this.subscription.unsubscribe();
    this.closeModal.emit();
  }
}
