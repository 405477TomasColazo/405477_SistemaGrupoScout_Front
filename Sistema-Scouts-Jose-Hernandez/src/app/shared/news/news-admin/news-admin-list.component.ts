import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NavbarComponent } from '../../navbar/navbar.component';
import { NewsService } from '../../../core/services/news.service';
import { ExportService } from '../../../core/services/export.service';
import { ExportButtonsComponent } from '../../components/export-buttons/export-buttons.component';
import { NewsArticleSummary, PaginatedNewsResponse, NewsStatus } from '../../../core/models/news.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-news-admin-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ExportButtonsComponent],
  templateUrl: './news-admin-list.component.html',
  styleUrl: './news-admin-list.component.css'
})
export class NewsAdminListComponent implements OnInit, OnDestroy {
  articles: NewsArticleSummary[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedStatus = '';

  // Pagination
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;

  // Status enum for template
  NewsStatus = NewsStatus;

  private destroy$ = new Subject<void>();

  // Export state
  isExportingArticles = false;

  constructor(
    private newsService: NewsService,
    private router: Router,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadArticles(): void {
    this.loading = true;
    this.error = '';

    this.newsService.getAllArticlesAdmin(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedNewsResponse) => {
          this.articles = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar las noticias';
          this.loading = false;
          console.error('Error loading admin articles:', error);
        }
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.selectedStatus = '';
    // TODO: Implement search when backend supports it
    this.loadArticles();
  }

  onStatusFilter(): void {
    this.currentPage = 0;
    this.searchTerm = '';
    // TODO: Implement status filter when backend supports it
    this.loadArticles();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.currentPage = 0;
    this.loadArticles();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  createArticle(): void {
    this.router.navigate(['/admin/noticias/crear']);
  }

  editArticle(article: NewsArticleSummary): void {
    this.router.navigate(['/admin/noticias', article.id, 'editar']);
  }

  viewArticle(article: NewsArticleSummary): void {
    this.router.navigate(['/noticias', article.slug]);
  }

  togglePublishStatus(article: NewsArticleSummary): void {
    const action = article.status === NewsStatus.PUBLISHED ? 'unpublish' : 'publish';
    const method = action === 'publish'
      ? this.newsService.publishArticle(article.id)
      : this.newsService.unpublishArticle(article.id);

    method.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        article.status = action === 'publish' ? NewsStatus.PUBLISHED : NewsStatus.DRAFT;
      },
      error: (error) => {
        console.error(`Error ${action}ing article:`, error);
        this.error = `Error al ${action === 'publish' ? 'publicar' : 'despublicar'} el artículo`;
      }
    });
  }

  deleteArticle(article: NewsArticleSummary): void {
    if (confirm(`¿Estás seguro de que deseas eliminar "${article.title}"? Esta acción no se puede deshacer.`)) {
      this.newsService.deleteArticle(article.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.articles = this.articles.filter(a => a.id !== article.id);
            this.totalElements--;
          },
          error: (error) => {
            console.error('Error deleting article:', error);
            this.error = 'Error al eliminar el artículo';
          }
        });
    }
  }

  get pageNumbers(): number[] {
    const pages = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.selectedStatus !== '';
  }

  formatDate(dateString: string): string {
    return this.newsService.formatDate(dateString);
  }

  getStatusColor(status: string): string {
    return this.newsService.getStatusColor(status);
  }

  getStatusText(status: string): string {
    return this.newsService.getStatusText(status);
  }

  getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return '/media/lis.jpg';
    }
    return imagePath.startsWith('http') ? imagePath : `${environment.apiUrl}${imagePath}`;
  }

  // Export Methods
  exportArticlesToPDF(): void {
    if (this.articles.length === 0) return;
    this.isExportingArticles = true;
    try {
      this.exportService.exportNewsToPDF(this.articles.map(article => ({
        title: article.title,
        status: this.getStatusText(article.status),
        createdAt: article.createdAt,
        views: article.viewsCount || 0,
        categories: article.categories?.map(c => c.name).join(', ') || 'Sin categorías'
      })));
    } catch (error) {
      console.error('Error al exportar artículos a PDF:', error);
    }
    this.isExportingArticles = false;
  }

  exportArticlesToCSV(): void {
    if (this.articles.length === 0) return;
    this.isExportingArticles = true;
    try {
      this.exportService.exportNewsToCSV(this.articles.map(article => ({
        title: article.title,
        status: this.getStatusText(article.status),
        createdAt: article.createdAt,
        views: article.viewsCount || 0,
        categories: article.categories?.map(c => c.name).join(', ') || 'Sin categorías'
      })));
    } catch (error) {
      console.error('Error al exportar artículos a CSV:', error);
    }
    this.isExportingArticles = false;
  }
}
