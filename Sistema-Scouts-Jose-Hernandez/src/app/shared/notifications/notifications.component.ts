import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../core/services/notification.service';
import { Notification, NotificationListResponse } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly destroy$ = new Subject<void>();

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Data
  notifications: Notification[] = [];
  unreadCount = 0;
  loading = false;

  // Filters
  selectedFilter = 'all'; // all, read, unread
  selectedType = '';

  // Utility
  Math = Math;

  ngOnInit() {
    this.loadNotifications();
    
    // Subscribe to unread count changes
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications() {
    this.loading = true;
    
    this.notificationService.getNotifications(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: NotificationListResponse) => {
          // Apply client-side filtering since backend doesn't support it yet
          let filteredNotifications = response.notifications;
          
          if (this.selectedFilter === 'read') {
            filteredNotifications = filteredNotifications.filter(n => n.read);
          } else if (this.selectedFilter === 'unread') {
            filteredNotifications = filteredNotifications.filter(n => !n.read);
          }
          
          if (this.selectedType) {
            filteredNotifications = filteredNotifications.filter(n => n.notificationType === this.selectedType);
          }
          
          this.notifications = filteredNotifications;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.currentPage = response.currentPage;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.toastr.error('Error al cargar las notificaciones');
          this.loading = false;
        }
      });
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadNotifications();
  }

  refreshNotifications() {
    this.notificationService.refreshNotifications();
    this.loadNotifications();
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update local state
          const notification = this.notifications.find(n => n.id === notificationId);
          if (notification) {
            notification.read = true;
            notification.readAt = new Date().toISOString();
          }
          this.toastr.success('Notificación marcada como leída');
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
          this.toastr.error('Error al marcar la notificación como leída');
        }
      });
  }

  markAllAsRead() {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) {
      this.toastr.info('No hay notificaciones sin leer');
      return;
    }

    unreadNotifications.forEach(notification => {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Update local state
            notification.read = true;
            notification.readAt = new Date().toISOString();
          },
          error: (error) => {
            console.error('Error marking notification as read:', error);
          }
        });
    });

    this.toastr.success(`${unreadNotifications.length} notificaciones marcadas como leídas`);
  }

  deleteNotification(notificationId: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      return;
    }

    this.notificationService.deleteNotification(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove from local state
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.totalElements = Math.max(0, this.totalElements - 1);
          this.toastr.success('Notificación eliminada');
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
          this.toastr.error('Error al eliminar la notificación');
        }
      });
  }

  navigateToRelatedContent(notification: Notification) {
    if (!notification.relatedEntity || !notification.relatedEntityId) {
      return;
    }

    // Mark as read if not already read
    if (!notification.read) {
      this.markAsRead(notification.id);
    }

    switch (notification.relatedEntity) {
      case 'EVENT':
        this.router.navigate(['/events'], { 
          queryParams: { eventId: notification.relatedEntityId } 
        });
        break;
      case 'PAYMENT':
        this.router.navigate(['/payments'], { 
          queryParams: { paymentId: notification.relatedEntityId } 
        });
        break;
      case 'MARCH_SHEET':
        this.router.navigate(['/progression'], { 
          queryParams: { marchSheetId: notification.relatedEntityId } 
        });
        break;
      case 'NEWS':
        this.router.navigate(['/news'], { 
          queryParams: { articleId: notification.relatedEntityId } 
        });
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadNotifications();
    }
  }

  getRelativeTime(dateString: string): string {
    return this.notificationService.getRelativeTime(dateString);
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'EVENT_INVITATION': 'Invitación',
      'EVENT_UPDATE': 'Actualización',
      'EVENT_REMINDER': 'Recordatorio',
      'PAYMENT_CONFIRMATION': 'Pago confirmado',
      'PAYMENT_REMINDER': 'Recordatorio de pago',
      'PAYMENT_FAILED': 'Pago fallido',
      'MONTHLY_FEE_GENERATED': 'Cuota generada',
      'BALANCE_APPLIED': 'Balance aplicado',
      'PROGRESSION_APPROVAL': 'Progresión',
      'NEWS_ANNOUNCEMENT': 'Anuncio'
    };
    return labels[type] || type;
  }

  getTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'EVENT_INVITATION': 'bg-blue-100 text-blue-800',
      'EVENT_UPDATE': 'bg-yellow-100 text-yellow-800',
      'EVENT_REMINDER': 'bg-orange-100 text-orange-800',
      'PAYMENT_CONFIRMATION': 'bg-green-100 text-green-800',
      'PAYMENT_REMINDER': 'bg-amber-100 text-amber-800',
      'PAYMENT_FAILED': 'bg-red-100 text-red-800',
      'MONTHLY_FEE_GENERATED': 'bg-cyan-100 text-cyan-800',
      'BALANCE_APPLIED': 'bg-emerald-100 text-emerald-800',
      'PROGRESSION_APPROVAL': 'bg-purple-100 text-purple-800',
      'NEWS_ANNOUNCEMENT': 'bg-indigo-100 text-indigo-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  }

  getEmptyStateMessage(): string {
    if (this.selectedFilter === 'read') {
      return 'No tienes notificaciones leídas.';
    } else if (this.selectedFilter === 'unread') {
      return 'No tienes notificaciones sin leer.';
    } else if (this.selectedType) {
      return `No tienes notificaciones del tipo "${this.getTypeLabel(this.selectedType)}".`;
    }
    return 'Te avisaremos cuando tengas nuevas notificaciones.';
  }

  trackByNotificationId(index: number, notification: Notification): number {
    return notification.id;
  }
}