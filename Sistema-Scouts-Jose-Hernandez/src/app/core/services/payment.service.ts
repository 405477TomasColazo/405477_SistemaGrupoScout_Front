import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {
  Fee,
  Payment,
  PaymentFilters,
  PaymentPreferenceRequest,
  PaymentPreferenceResponse,
  PaymentsHistoryResponse, 
  ProcessPaymentRequest, 
  ProcessPaymentResponse,
  PaymentStatistics,
  PendingPaymentsBySection,
  UpdatePaymentStatusRequest
} from '../models/payments.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly url = "http://localhost:8080/payments";
  private readonly adminUrl = "http://localhost:8080/admin/payments";
  private readonly client = inject(HttpClient);

  getPendingFeed(memberId: number) {
    return this.client.get<Fee[]>(`${this.url}/fees/${memberId}`);
  }

  getPaymentsHistory(filters: PaymentFilters, page: number, itemsPerPage: number): Observable<PaymentsHistoryResponse> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('limit', itemsPerPage.toString());

    if (filters.memberId) {
      params = params.set('memberId', filters.memberId);
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    if (filters.minAmount) {
      params = params.set('minAmount', filters.minAmount.toString());
    }

    return this.client.get<PaymentsHistoryResponse>(`${this.url}/history`, { params });
  }

  // Admin methods
  getAllPaymentsForAdmin(filters: PaymentFilters, page: number, itemsPerPage: number): Observable<PaymentsHistoryResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', itemsPerPage.toString());

    if (filters.memberId) {
      params = params.set('memberId', filters.memberId.toString());
    }
    if (filters.familyGroupId) {
      params = params.set('familyGroupId', filters.familyGroupId.toString());
    }
    if (filters.sectionId) {
      params = params.set('sectionId', filters.sectionId.toString());
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    if (filters.minAmount) {
      params = params.set('minAmount', filters.minAmount.toString());
    }
    if (filters.maxAmount) {
      params = params.set('maxAmount', filters.maxAmount.toString());
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.paymentMethod) {
      params = params.set('paymentMethod', filters.paymentMethod);
    }
    if (filters.memberName) {
      params = params.set('memberName', filters.memberName);
    }

    return this.client.get<PaymentsHistoryResponse>(`${this.adminUrl}`, { params });
  }

  updatePaymentStatus(paymentId: number, status: string, reason?: string): Observable<Payment> {
    const request: UpdatePaymentStatusRequest = { status, reason };
    return this.client.put<Payment>(`${this.adminUrl}/${paymentId}/status`, request);
  }

  downloadPaymentReceipt(paymentId: number): Observable<Blob> {
    return this.client.get(`${this.adminUrl}/${paymentId}/receipt`, { 
      responseType: 'blob' 
    });
  }

  getPaymentStatistics(dateFrom?: string, dateTo?: string, sectionId?: number): Observable<PaymentStatistics> {
    let params = new HttpParams();
    
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }
    if (sectionId) {
      params = params.set('sectionId', sectionId.toString());
    }

    return this.client.get<PaymentStatistics>(`${this.adminUrl}/statistics`, { params });
  }

  getPendingPaymentsBySection(): Observable<PendingPaymentsBySection[]> {
    return this.client.get<PendingPaymentsBySection[]>(`${this.adminUrl}/pending-by-section`);
  }

  createPaymentPreference(request: PaymentPreferenceRequest): Observable<PaymentPreferenceResponse> {
    return this.client.post<PaymentPreferenceResponse>(`${this.url}/create-preference`, request);
  }

  processPayment(request: ProcessPaymentRequest): Observable<ProcessPaymentResponse> {
    return this.client.post<ProcessPaymentResponse>(`${this.url}/process`, request);
  }
}
