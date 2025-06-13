import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NavbarComponent } from '../../navbar/navbar.component';
import { NewsService } from '../../../core/services/news.service';
import { NewsArticle } from '../../../core/models/news.model';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css'
})
export class NewsDetailComponent implements OnInit, OnDestroy {
  article: NewsArticle | null = null;
  loading = true;
  error = '';
  notFound = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadArticle(slug);
      } else {
        this.router.navigate(['/noticias']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadArticle(slug: string): void {
    this.loading = true;
    this.error = '';
    this.notFound = false;

    this.newsService.getArticleBySlug(slug).subscribe({
      next: (article: NewsArticle) => {
        this.article = article;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 404) {
          this.notFound = true;
        } else {
          this.error = 'Error al cargar el artículo';
        }
        console.error('Error loading article:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/noticias']);
  }

  formatDate(dateString: string): string {
    return this.newsService.formatDate(dateString);
  }

  getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return '/media/lis.jpg';
    }
    return imagePath.startsWith('http') ? imagePath : `http://localhost:8080${imagePath}`;
  }

  getStatusColor(status: string): string {
    return this.newsService.getStatusColor(status);
  }

  getStatusText(status: string): string {
    return this.newsService.getStatusText(status);
  }

  shareOnWhatsApp(): void {
    if (this.article) {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${this.article.title} - ${this.article.summary}`);
      window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    }
  }

  shareOnFacebook(): void {
    if (this.article) {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      // Could show a toast notification here
      console.log('Link copied to clipboard');
    });
  }
}
