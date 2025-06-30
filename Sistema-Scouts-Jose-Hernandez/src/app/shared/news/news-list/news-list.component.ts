import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { NavbarComponent } from '../../navbar/navbar.component';
import { NewsService } from '../../../core/services/news.service';
import { NewsArticleSummary, NewsCategory, PaginatedNewsResponse } from '../../../core/models/news.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css'
})
export class NewsListComponent implements OnInit {
  articles: NewsArticleSummary[] = [];
  categories: NewsCategory[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedCategoryId: string = '';

  // Pagination
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 9;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadArticles();
  }

  loadCategories(): void {
    this.newsService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadArticles(): void {
    this.loading = true;
    this.error = '';

    let request: Observable<PaginatedNewsResponse>;

    if (this.searchTerm.trim()) {
      request = this.newsService.searchArticles(this.searchTerm, this.currentPage, this.pageSize);
    } else if (this.selectedCategoryId && this.selectedCategoryId !== '') {
      request = this.newsService.getArticlesByCategory(+this.selectedCategoryId, this.currentPage, this.pageSize);
    } else {
      request = this.newsService.getPublishedArticles(this.currentPage, this.pageSize);
    }

    request.subscribe({
      next: (response: PaginatedNewsResponse) => {
        this.articles = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las noticias';
        this.loading = false;
        console.error('Error loading articles:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.selectedCategoryId = '';
    this.loadArticles();
  }

  onCategoryChange(): void {
    this.currentPage = 0;
    this.searchTerm = '';
    this.loadArticles();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = '';
    this.currentPage = 0;
    this.loadArticles();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  formatDate(dateString: string): string {
    return this.newsService.formatDate(dateString);
  }

  getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return '/media/lis.jpg';
    }
    return imagePath.startsWith('http') ? imagePath : `${environment.apiUrl}${imagePath}`;
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || (this.selectedCategoryId !== '' && this.selectedCategoryId !== null);
  }

  get selectedCategoryName(): string {
    if (!this.selectedCategoryId || this.selectedCategoryId === '' || this.categories.length === 0) {
      return '';
    }
    const category = this.categories.find(c => c.id === +this.selectedCategoryId);
    return category ? category.name : '';
  }

  get showSearchResults(): boolean {
    return this.searchTerm.trim() !== '';
  }

  get showCategoryFilter(): boolean {
    return this.selectedCategoryId !== '' && this.selectedCategoryId !== null && this.categories.length > 0;
  }

  get showEmptyStateForFilters(): boolean {
    return this.hasActiveFilters;
  }

  get showEmptyStateDefault(): boolean {
    return !this.hasActiveFilters;
  }
}
