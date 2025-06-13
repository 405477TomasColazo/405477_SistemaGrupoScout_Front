import { Component } from '@angular/core';
import {LatestNewsComponent} from '../news/latest-news/latest-news.component';

@Component({
  selector: 'app-home',
  imports: [
    LatestNewsComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
