import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsService } from '../../../core/services/news.service';
import { NewsArticleSummary } from '../../../core/models/news.model';
import {environment} from '../../../../environments/environment';


@Component({
  selector: 'app-latest-news',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './latest-news.component.html',
  styleUrl: './latest-news.component.css'
})
export class LatestNewsComponent implements OnInit {
  latestNews: NewsArticleSummary[] = [];
  loading = false;
  error = '';

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadLatestNews();
  }

  loadLatestNews(): void {
    this.loading = true;
    this.error = '';

    this.newsService.getLatestArticles(5).subscribe({
      next: (articles) => {
        this.latestNews = articles;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las últimas noticias';
        this.loading = false;
        console.error('Error loading latest news:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return this.newsService.formatDate(dateString);
  }

  getImageUrl(imagePath?: string): string {
    console.log(imagePath);
    if (!imagePath) {
      return '/media/lis.jpg'; // Imagen por defecto del scout
    }
    return imagePath.startsWith('http') ? imagePath : `${environment.apiUrl}${imagePath}`;
  }
}
