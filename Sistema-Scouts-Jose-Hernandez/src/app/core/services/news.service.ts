import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  NewsArticle,
  NewsArticleSummary,
  NewsCategory,
  CreateNewsArticle,
  UpdateNewsArticle,
  CreateNewsCategory,
  NewsImage,
  NewsDistribution,
  CreateDistribution,
  PaginatedNewsResponse
} from '../models/news.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private readonly apiUrl = `${environment.apiUrl}/api/news`;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============ LOADING STATE ============
  
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  // ============ ARTÍCULOS PÚBLICOS ============

  getPublishedArticles(page: number = 0, size: number = 10): Observable<PaginatedNewsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PaginatedNewsResponse>(this.apiUrl, { params });
  }

  getLatestArticles(limit: number = 5): Observable<NewsArticleSummary[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<NewsArticleSummary[]>(`${this.apiUrl}/latest`, { params });
  }

  getArticleBySlug(slug: string): Observable<NewsArticle> {
    return this.http.get<NewsArticle>(`${this.apiUrl}/${slug}`);
  }

  searchArticles(searchTerm: string, page: number = 0, size: number = 10): Observable<PaginatedNewsResponse> {
    const params = new HttpParams()
      .set('q', searchTerm)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PaginatedNewsResponse>(`${this.apiUrl}/search`, { params });
  }

  getArticlesByCategory(categoryId: number, page: number = 0, size: number = 10): Observable<PaginatedNewsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PaginatedNewsResponse>(`${this.apiUrl}/category/${categoryId}`, { params });
  }

  // ============ ADMINISTRACIÓN ============

  getAllArticlesAdmin(page: number = 0, size: number = 10): Observable<PaginatedNewsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PaginatedNewsResponse>(`${this.apiUrl}/admin`, { params });
  }

  getArticleByIdAdmin(id: number): Observable<NewsArticle> {
    return this.http.get<NewsArticle>(`${this.apiUrl}/admin/${id}`);
  }

  createArticle(article: CreateNewsArticle): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(this.apiUrl, article);
  }

  updateArticle(id: number, article: UpdateNewsArticle): Observable<NewsArticle> {
    return this.http.put<NewsArticle>(`${this.apiUrl}/${id}`, article);
  }

  publishArticle(id: number): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(`${this.apiUrl}/${id}/publish`, {});
  }

  unpublishArticle(id: number): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(`${this.apiUrl}/${id}/unpublish`, {});
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ============ CATEGORÍAS ============

  getAllCategories(): Observable<NewsCategory[]> {
    return this.http.get<NewsCategory[]>(`${this.apiUrl}/categories`);
  }

  getCategoryById(id: number): Observable<NewsCategory> {
    return this.http.get<NewsCategory>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(category: CreateNewsCategory): Observable<NewsCategory> {
    return this.http.post<NewsCategory>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: number, category: CreateNewsCategory): Observable<NewsCategory> {
    return this.http.put<NewsCategory>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  // ============ IMÁGENES ============

  uploadImage(articleId: number, file: File, altText?: string, caption?: string): Observable<NewsImage> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    if (caption) formData.append('caption', caption);

    return this.http.post<NewsImage>(`${this.apiUrl}/${articleId}/images`, formData);
  }

  getArticleImages(articleId: number): Observable<NewsImage[]> {
    return this.http.get<NewsImage[]>(`${this.apiUrl}/${articleId}/images`);
  }

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/images/${imageId}`);
  }

  // ============ DISTRIBUCIÓN ============

  createDistribution(articleId: number, distribution: CreateDistribution): Observable<NewsDistribution> {
    return this.http.post<NewsDistribution>(`${this.apiUrl}/${articleId}/distribute`, distribution);
  }

  sendDistribution(distributionId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/distributions/${distributionId}/send`, {});
  }

  getDistributionHistory(articleId: number): Observable<NewsDistribution[]> {
    return this.http.get<NewsDistribution[]>(`${this.apiUrl}/${articleId}/distributions`);
  }

  // ============ UTILIDADES ============

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'text-green-600 bg-green-100';
      case 'DRAFT': return 'text-yellow-600 bg-yellow-100';
      case 'ARCHIVED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'Publicado';
      case 'DRAFT': return 'Borrador';
      case 'ARCHIVED': return 'Archivado';
      default: return status;
    }
  }
}