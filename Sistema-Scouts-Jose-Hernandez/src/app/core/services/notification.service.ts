import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Notification, 
  NotificationListResponse, 
  UnreadNotificationCountResponse 
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly url: string = environment.apiUrl;
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    // Poll for unread notifications every 30 seconds
    interval(30000)
      .pipe(
        switchMap(() => this.getUnreadCount()),
        catchError(() => of({ count: 0 }))
      )
      .subscribe();
  }

  getNotifications(page: number = 0, size: number = 20): Observable<NotificationListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<NotificationListResponse>(`${this.url}/api/notifications`, { params })
      .pipe(
        tap(response => {
          if (page === 0) {
            this.notificationsSubject.next(response.notifications);
          }
        })
      );
  }

  getUnreadCount(): Observable<UnreadNotificationCountResponse> {
    return this.http.get<UnreadNotificationCountResponse>(`${this.url}/api/notifications/unread`)
      .pipe(
        tap(response => this.unreadCountSubject.next(response.count))
      );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.url}/api/notifications/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          // Update local state
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true, readAt: new Date().toISOString() }
              : notification
          );
          this.notificationsSubject.next(updatedNotifications);
          
          // Update unread count
          const currentCount = this.unreadCountSubject.value;
          this.unreadCountSubject.next(Math.max(0, currentCount - 1));
        })
      );
  }

  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/api/notifications/${notificationId}`)
      .pipe(
        tap(() => {
          // Update local state
          const currentNotifications = this.notificationsSubject.value;
          const notificationToDelete = currentNotifications.find(n => n.id === notificationId);
          const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
          this.notificationsSubject.next(updatedNotifications);
          
          // Update unread count if deleted notification was unread
          if (notificationToDelete && !notificationToDelete.read) {
            const currentCount = this.unreadCountSubject.value;
            this.unreadCountSubject.next(Math.max(0, currentCount - 1));
          }
        })
      );
  }

  refreshNotifications(): void {
    this.getNotifications(0, 10).subscribe();
    this.getUnreadCount().subscribe();
  }

  // Helper method to format relative time
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
  }
}