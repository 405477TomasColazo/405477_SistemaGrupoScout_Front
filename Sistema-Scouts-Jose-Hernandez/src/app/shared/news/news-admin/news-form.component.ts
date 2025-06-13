import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { NavbarComponent } from '../../navbar/navbar.component';
import { NewsService } from '../../../core/services/news.service';
import { NewsArticle, NewsCategory, CreateNewsArticle, UpdateNewsArticle } from '../../../core/models/news.model';

@Component({
  selector: 'app-news-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.css'
})
export class NewsFormComponent implements OnInit, OnDestroy {
  newsForm: FormGroup;
  categories: NewsCategory[] = [];
  loading = false;
  error = '';
  isEditMode = false;
  articleId: number | null = null;
  previewMode = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService
  ) {
    this.newsForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.setupFormSubscriptions();

    // Check if we're in edit mode
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.articleId = +params['id'];
        this.loadArticle(this.articleId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      summary: ['', [Validators.required, Validators.maxLength(500)]],
      content: ['', [Validators.required]],
      featuredImage: [''],
      categoryIds: [[]]
    });
  }

  setupFormSubscriptions(): void {
    // Auto-generate slug from title
    this.newsForm.get('title')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(title => {
        if (title && !this.isEditMode) {
          const slug = this.newsService.generateSlug(title);
          this.newsForm.patchValue({ slug }, { emitEvent: false });
        }
      });
  }

  loadCategories(): void {
    this.newsService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  loadArticle(id: number): void {
    this.loading = true;
    this.newsService.getArticleByIdAdmin(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (article: NewsArticle) => {
          this.newsForm.patchValue({
            title: article.title,
            slug: article.slug,
            summary: article.summary,
            content: article.content,
            featuredImage: article.featuredImage,
            categoryIds: article.categories.map(c => c.id)
          });
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar el artículo';
          this.loading = false;
          console.error('Error loading article:', error);
        }
      });
  }

  onSubmit(): void {
    if (this.newsForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.newsForm.value;

      if (this.isEditMode && this.articleId) {
        const updateData: UpdateNewsArticle = {
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          featuredImage: formData.featuredImage,
          categoryIds: formData.categoryIds
        };

        this.newsService.updateArticle(this.articleId, updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.router.navigate(['/admin/noticias']);
            },
            error: (error) => {
              this.error = 'Error al actualizar el artículo';
              this.loading = false;
              console.error('Error updating article:', error);
            }
          });
      } else {
        const createData: CreateNewsArticle = {
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          featuredImage: formData.featuredImage,
          categoryIds: formData.categoryIds
        };

        this.newsService.createArticle(createData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.router.navigate(['/admin/noticias']);
            },
            error: (error) => {
              this.error = 'Error al crear el artículo';
              this.loading = false;
              console.error('Error creating article:', error);
            }
          });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onSaveDraft(): void {
    if (this.newsForm.get('title')?.valid && this.newsForm.get('summary')?.valid) {
      this.onSubmit(); // For now, save as draft is the same as save
    }
  }

  togglePreview(): void {
    this.previewMode = !this.previewMode;
  }

  cancel(): void {
    this.router.navigate(['/admin/noticias']);
  }

  markFormGroupTouched(): void {
    Object.keys(this.newsForm.controls).forEach(key => {
      const control = this.newsForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.newsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.newsForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength']) return `${fieldName} es demasiado largo`;
      if (field.errors['pattern']) return `${fieldName} contiene caracteres inválidos`;
    }
    return '';
  }

  onCategoryChange(categoryId: number, event: any): void {
    const currentCategories = this.newsForm.get('categoryIds')?.value || [];

    if (event.target.checked) {
      if (!currentCategories.includes(categoryId)) {
        this.newsForm.patchValue({
          categoryIds: [...currentCategories, categoryId]
        });
      }
    } else {
      this.newsForm.patchValue({
        categoryIds: currentCategories.filter((id: number) => id !== categoryId)
      });
    }
  }

  isCategorySelected(categoryId: number): boolean {
    const selectedCategories = this.newsForm.get('categoryIds')?.value || [];
    return selectedCategories.includes(categoryId);
  }

  get previewData() {
    const formValue = this.newsForm.value;
    return {
      title: formValue.title || 'Título del artículo',
      summary: formValue.summary || 'Resumen del artículo...',
      content: formValue.content || 'Contenido del artículo...',
      featuredImage: formValue.featuredImage,
      categories: this.categories.filter(c =>
        (formValue.categoryIds || []).includes(c.id)
      )
    };
  }
}
