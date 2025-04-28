import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {
  Fee,
  PaymentFilters,
  PaymentPreferenceRequest,
  PaymentPreferenceResponse,
  PaymentsHistoryResponse, ProcessPaymentRequest, ProcessPaymentResponse
} from '../models/payments.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly url = "http://localhost:8080/payments";
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

  createPaymentPreference(request: PaymentPreferenceRequest): Observable<PaymentPreferenceResponse> {
    return this.client.post<PaymentPreferenceResponse>(`${this.url}/create-preference`, request);
  }

  processPayment(request: ProcessPaymentRequest): Observable<ProcessPaymentResponse> {
    return this.client.post<ProcessPaymentResponse>(`${this.url}/process`, request);
  }
}
