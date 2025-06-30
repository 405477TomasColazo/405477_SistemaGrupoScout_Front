import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';

export interface DashboardStatsDto {
  totalScouts: number;
  totalFamilies: number;
  activeEvents: number;
  monthlyRevenue: number;
  memberStats: MemberStatsDto;
  eventStats: EventStatsDto;
  financialStats: FinancialStatsDto;
}

export interface MemberStatsDto {
  manadaCount: number;
  unidadCount: number;
  caminantesCount: number;
  roversCount: number;
  totalEducators: number;
  totalTutors: number;
}

export interface EventStatsDto {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  recentEvents: any[];
  upcomingEventsList: any[];
}

export interface FinancialStatsDto {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  totalPaymentCount: number;
  pendingPaymentCount: number;
  completedPaymentCount: number;
}

export interface EducatorDashboardDto {
  educatorName: string;
  sectionName: string;
  scoutsCount: number;
  pendingApprovals: number;
  upcomingEvents: number;
  progressionRate: number;
  upcomingEventsList: any[];
}

export interface FamilyDashboardDto {
  familyName: string;
  scoutsInFamily: number;
  upcomingEvents: number;
  pendingPayments: number;
  totalPendingAmount: number;
  upcomingEventsList: any[];
  pendingFeesList: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/api/dashboard`;

  constructor(private http: HttpClient) {}

  getAdminDashboard(): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>(`${this.apiUrl}/admin`);
  }

  getEducatorDashboard(): Observable<EducatorDashboardDto> {
    return this.http.get<EducatorDashboardDto>(`${this.apiUrl}/educator`);
  }

  getEducatorDashboardById(educatorId: number): Observable<EducatorDashboardDto> {
    return this.http.get<EducatorDashboardDto>(`${this.apiUrl}/educator/${educatorId}`);
  }

  getFamilyDashboard(): Observable<FamilyDashboardDto> {
    return this.http.get<FamilyDashboardDto>(`${this.apiUrl}/family`);
  }

  getFamilyDashboardById(familyUserId: number): Observable<FamilyDashboardDto> {
    return this.http.get<FamilyDashboardDto>(`${this.apiUrl}/family/${familyUserId}`);
  }
}
