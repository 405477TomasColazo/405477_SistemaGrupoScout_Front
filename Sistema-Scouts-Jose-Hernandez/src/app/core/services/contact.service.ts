import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  messageType: ContactMessageType;
  status?: ContactMessageStatus;
  createdAt?: string;
  updatedAt?: string;
  adminNotes?: string;
  repliedAt?: string;
}

export interface CreateContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  messageType: ContactMessageType;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  contactId?: number;
}

export interface ContactStatistics {
  totalMessages: number;
  unreadMessages: number;
  repliedMessages: number;
  recentMessages: number;
  archivedMessages: number;
  replyRate: number;
  unreadRate: number;
}

export interface UpdateContactMessageStatus {
  status: ContactMessageStatus;
  adminNotes?: string;
}

export interface ContactMessageFilter {
  status?: ContactMessageStatus;
  messageType?: ContactMessageType;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export enum ContactMessageType {
  GENERAL = 'GENERAL',
  MEMBERSHIP = 'MEMBERSHIP',
  EVENTS = 'EVENTS',
  COMPLAINT = 'COMPLAINT',
  SUGGESTION = 'SUGGESTION',
  TECHNICAL = 'TECHNICAL',
  OTHER = 'OTHER'
}

export enum ContactMessageStatus {
  NEW = 'NEW',
  READ = 'READ',
  REPLIED = 'REPLIED',
  ARCHIVED = 'ARCHIVED'
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly apiUrl = `${environment.apiUrl}/api/contact`;
  private readonly adminApiUrl = `${environment.apiUrl}/admin/contact`;

  constructor(private http: HttpClient) {}

  /**
   * Submit contact form (public endpoint)
   */
  submitContactForm(contactData: CreateContactMessage): Observable<ContactSubmissionResponse> {
    return this.http.post<ContactSubmissionResponse>(this.apiUrl, contactData);
  }

  // ============ ADMIN ENDPOINTS ============

  /**
   * Get all contact messages with filtering (admin only)
   */
  getContactMessages(filter: ContactMessageFilter = {}): Observable<any> {
    const params: any = {};
    
    if (filter.status) params.status = filter.status;
    if (filter.messageType) params.messageType = filter.messageType;
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;
    if (filter.searchTerm) params.searchTerm = filter.searchTerm;
    if (filter.page !== undefined) params.page = filter.page.toString();
    if (filter.size !== undefined) params.size = filter.size.toString();
    if (filter.sortBy) params.sortBy = filter.sortBy;
    if (filter.sortDirection) params.sortDirection = filter.sortDirection;

    return this.http.get<any>(`${this.adminApiUrl}/messages`, { params });
  }

  /**
   * Get specific contact message by ID (admin only)
   */
  getContactMessage(id: number): Observable<ContactMessage> {
    return this.http.get<ContactMessage>(`${this.adminApiUrl}/messages/${id}`);
  }

  /**
   * Update contact message status (admin only)
   */
  updateContactMessageStatus(id: number, update: UpdateContactMessageStatus): Observable<ContactMessage> {
    return this.http.put<ContactMessage>(`${this.adminApiUrl}/messages/${id}/status`, update);
  }

  /**
   * Mark message as read (admin only)
   */
  markAsRead(id: number): Observable<ContactMessage> {
    return this.http.patch<ContactMessage>(`${this.adminApiUrl}/messages/${id}/read`, {});
  }

  /**
   * Get contact statistics (admin only)
   */
  getContactStatistics(): Observable<ContactStatistics> {
    return this.http.get<ContactStatistics>(`${this.adminApiUrl}/statistics`);
  }

  /**
   * Get unread message count (admin only)
   */
  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.adminApiUrl}/unread-count`);
  }

  /**
   * Get messages by email (admin only)
   */
  getMessagesByEmail(email: string): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(`${this.adminApiUrl}/messages/by-email`, {
      params: { email }
    });
  }

  /**
   * Delete contact message (admin only)
   */
  deleteContactMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/messages/${id}`);
  }

  /**
   * Helper method to get display name for message type
   */
  getMessageTypeDisplayName(type: ContactMessageType): string {
    const typeNames: Record<ContactMessageType, string> = {
      [ContactMessageType.GENERAL]: 'General',
      [ContactMessageType.MEMBERSHIP]: 'Membresía',
      [ContactMessageType.EVENTS]: 'Eventos',
      [ContactMessageType.COMPLAINT]: 'Queja',
      [ContactMessageType.SUGGESTION]: 'Sugerencia',
      [ContactMessageType.TECHNICAL]: 'Técnico',
      [ContactMessageType.OTHER]: 'Otro'
    };
    return typeNames[type] || type;
  }

  /**
   * Helper method to get display name for message status
   */
  getStatusDisplayName(status: ContactMessageStatus): string {
    const statusNames: Record<ContactMessageStatus, string> = {
      [ContactMessageStatus.NEW]: 'Nuevo',
      [ContactMessageStatus.READ]: 'Leído',
      [ContactMessageStatus.REPLIED]: 'Respondido',
      [ContactMessageStatus.ARCHIVED]: 'Archivado'
    };
    return statusNames[status] || status;
  }

  /**
   * Get message type options for form selects
   */
  getMessageTypeOptions(): Array<{ value: ContactMessageType; label: string }> {
    return [
      { value: ContactMessageType.GENERAL, label: 'Consulta General' },
      { value: ContactMessageType.MEMBERSHIP, label: 'Información sobre Membresía' },
      { value: ContactMessageType.EVENTS, label: 'Consulta sobre Eventos' },
      { value: ContactMessageType.COMPLAINT, label: 'Queja o Reclamo' },
      { value: ContactMessageType.SUGGESTION, label: 'Sugerencia' },
      { value: ContactMessageType.TECHNICAL, label: 'Problema Técnico' },
      { value: ContactMessageType.OTHER, label: 'Otro' }
    ];
  }
}