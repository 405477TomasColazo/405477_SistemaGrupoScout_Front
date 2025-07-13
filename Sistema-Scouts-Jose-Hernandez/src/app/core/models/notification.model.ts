export interface Notification {
  id: number;
  title: string;
  message: string;
  notificationType: string;
  createdAt: string;
  readAt?: string;
  relatedEntity?: string;
  relatedEntityId?: number;
  read: boolean;
}

export interface NotificationListResponse {
  notifications: Notification[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UnreadNotificationCountResponse {
  count: number;
}

export interface MarkReadRequest {
  notificationId: number;
}

export enum NotificationType {
  EVENT_INVITATION = 'EVENT_INVITATION',
  EVENT_UPDATE = 'EVENT_UPDATE',
  EVENT_REMINDER = 'EVENT_REMINDER',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  MONTHLY_FEE_GENERATED = 'MONTHLY_FEE_GENERATED',
  BALANCE_APPLIED = 'BALANCE_APPLIED',
  PROGRESSION_APPROVAL = 'PROGRESSION_APPROVAL',
  NEWS_ANNOUNCEMENT = 'NEWS_ANNOUNCEMENT'
}