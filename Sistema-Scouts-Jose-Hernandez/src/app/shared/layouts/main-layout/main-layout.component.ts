import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { FooterComponent } from '../footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    BreadcrumbComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isHomePage = false;

  constructor(private router: Router) {
    // Check current route
    this.checkIfHomePage(this.router.url);
    
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkIfHomePage(event.urlAfterRedirects);
    });
  }

  private checkIfHomePage(url: string): void {
    // Consider it home page if the URL is '/', '/home', or empty
    this.isHomePage = url === '/' || url === '/home' || url === '';
  }
}