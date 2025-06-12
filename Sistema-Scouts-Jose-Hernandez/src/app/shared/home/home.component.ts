import { Component } from '@angular/core';
import {NavbarComponent} from '../navbar/navbar.component';
import {LatestNewsComponent} from '../news/latest-news/latest-news.component';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    LatestNewsComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
