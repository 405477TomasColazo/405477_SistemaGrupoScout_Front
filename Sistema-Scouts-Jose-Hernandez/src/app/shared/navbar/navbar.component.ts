import {Component} from '@angular/core';
import {NgIf} from '@angular/common';
import {User} from '../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  imports: [
    NgIf
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent  {
  isLoggedIn: boolean = true;
  isAdmin: boolean = false;
  user:User = {email: 'pepito@email.com', id: '1', name: 'Pepe', roles: []}

  logout() {
    this.isLoggedIn = false;
  }
}
