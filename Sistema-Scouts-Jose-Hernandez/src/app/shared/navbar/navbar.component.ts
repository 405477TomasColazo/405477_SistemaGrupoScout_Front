import {Component, inject, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {User} from '../../core/models/user.model';
import {LoginModalComponent} from '../login-modal/login-modal.component';
import {AuthService} from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    NgIf,
    LoginModalComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  showLoginModal: boolean = false;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  user: User | null = null;
  authService: AuthService = inject(AuthService);

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user =>{
      this.user = user;
      this.isLoggedIn = !!user;
      console.log(this.user);
      this.isAdmin = user ? user.roles.includes('ROLE_ADMIN') : false;
    })
  }

  openLoginModal() {
    this.showLoginModal = true;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }



  logout() {
    this.authService.logout();
  }


}
