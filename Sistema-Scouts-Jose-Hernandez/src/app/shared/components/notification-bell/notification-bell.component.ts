import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly destroy$ = new Subject<void>();

  unreadCount = 0;
  notifications: Notification[] = [];
  isDropdownOpen = false;

  ngOnInit() {
    // Subscribe to unread count changes
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Subscribe to notifications changes
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications.slice(0, 5); // Show only latest 5 in dropdown
      });

    // Initial load
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNotifications() {
    this.notificationService.refreshNotifications();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.loadNotifications();
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  onNotificationClick(notification: Notification) {
    if (!notification.read) {
      this.markAsRead(notification.id);
    }
    
    // Navigate based on notification type and related entity
    this.navigateToRelatedContent(notification);
    this.closeDropdown();
  }

  markAsRead(notificationId: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    this.notificationService.markAsRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Success handled by service
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
          this.toastr.error('Error al marcar la notificación como leída');
        }
      });
  }

  markAllAsRead() {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    
    unreadNotifications.forEach(notification => {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (error) => {
            console.error('Error marking notification as read:', error);
          }
        });
    });

    this.toastr.success('Todas las notificaciones marcadas como leídas');
  }

  deleteNotification(notificationId: number, event: Event) {
    event.stopPropagation();
    
    this.notificationService.deleteNotification(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Notificación eliminada');
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
          this.toastr.error('Error al eliminar la notificación');
        }
      });
  }

  viewAllNotifications() {
    this.router.navigate(['/notifications']);
    this.closeDropdown();
  }

  getRelativeTime(dateString: string): string {
    return this.notificationService.getRelativeTime(dateString);
  }

  trackByNotificationId(index: number, notification: Notification): number {
    return notification.id;
  }

  private navigateToRelatedContent(notification: Notification) {
    if (!notification.relatedEntity || !notification.relatedEntityId) {
      return;
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
      case 'FEE':
        this.router.navigate(['/payments'], { 
          queryParams: { feeId: notification.relatedEntityId } 
        });
        break;
      case 'BALANCE':
        this.router.navigate(['/payments']);
        break;
      case 'MARCH_SHEET':
        this.router.navigate(['/progression'], { 
          queryParams: { marchSheetId: notification.relatedEntityId } 
        });
        break;
      case 'NEWS':
        this.router.navigate(['/noticias'], { 
          queryParams: { articleId: notification.relatedEntityId } 
        });
        break;
      default:
        // Navigate to dashboard if no specific route
        this.router.navigate(['/dashboard']);
        break;
    }
  }
}