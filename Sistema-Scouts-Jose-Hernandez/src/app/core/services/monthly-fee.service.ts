import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {
  FeeGenerationLog,
  FeeGenerationRequest,
  Section,
  MemberType,
  GlobalPriceUpdateRequest,
  GlobalPriceUpdateResult,
  GlobalFeeConfiguration
} from '../models/payments.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonthlyFeeService {
  private readonly url = "http://localhost:8080/api/admin/monthly-fees";
  private readonly client = inject(HttpClient);

  // Fee generation methods
  generateMonthlyFees(request: FeeGenerationRequest): Observable<{message: string, totalGenerated: number}> {
    return this.client.post<{message: string, totalGenerated: number}>(`${this.url}/generate`, request);
  }

  generateFeesForNewMember(memberId: number): Observable<{message: string, totalGenerated: number}> {
    return this.client.post<{message: string, totalGenerated: number}>(`${this.url}/generate/member/${memberId}`, {});
  }

  // Global price configuration methods
  getGlobalFeePrice(): Observable<GlobalFeeConfiguration> {
    return this.client.get<GlobalFeeConfiguration>(`${this.url}/global-price`);
  }

  updateGlobalFeePrice(request: GlobalPriceUpdateRequest): Observable<GlobalPriceUpdateResult> {
    return this.client.put<GlobalPriceUpdateResult>(`${this.url}/global-price`, request);
  }

  // Fee generation logs methods
  getGenerationLogs(page?: number, limit?: number, section?: string, generationType?: string): Observable<{logs: FeeGenerationLog[], total: number}> {
    let params = new HttpParams();
    
    if (page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (section) {
      params = params.set('section', section);
    }
    if (generationType) {
      params = params.set('generationType', generationType);
    }

    return this.client.get<{logs: FeeGenerationLog[], total: number}>(`${this.url}/logs`, { params });
  }

  // Utility methods
  getAvailableSections(): Observable<Section[]> {
    return this.client.get<Section[]>(`${this.url}/sections`);
  }
}