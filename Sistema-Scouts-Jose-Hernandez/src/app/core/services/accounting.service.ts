import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Account,
  AccountType,
  AccountingEntry,
  AccountingEntriesResponse,
  CreateAccountingEntry,
  CreateAccountingEntryRequest,
  UpdateAccountingEntryRequest,
  AccountingFilters,
  AccountingReport,
  AccountingDashboardStats
} from '../models/accounting.model';

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private readonly apiUrl = `${environment.apiUrl}/api/accounting`;
  
  // Cache for accounts to avoid repeated API calls
  private accountsCache$ = new BehaviorSubject<Account[]>([]);
  private accountsCacheLoaded = false;

  constructor(private http: HttpClient) {}

  // Account management methods
  getAllAccounts(): Observable<Account[]> {
    if (this.accountsCacheLoaded) {
      return this.accountsCache$.asObservable();
    }

    return this.http.get<Account[]>(`${this.apiUrl}/accounts`).pipe(
      tap(accounts => {
        this.accountsCache$.next(accounts);
        this.accountsCacheLoaded = true;
      })
    );
  }

  getAccountsByType(type: AccountType): Observable<Account[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<Account[]>(`${this.apiUrl}/accounts/by-type`, { params });
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/accounts/${id}`);
  }

  // Clear accounts cache (useful when accounts are modified)
  clearAccountsCache(): void {
    this.accountsCacheLoaded = false;
    this.accountsCache$.next([]);
  }

  // Accounting entry methods
  getAccountingEntries(
    filters: AccountingFilters = {},
    page: number = 0,
    size: number = 20
  ): Observable<AccountingEntriesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Add filters if provided
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.originType) {
      params = params.set('originType', filters.originType);
    }
    if (filters.description) {
      params = params.set('description', filters.description);
    }
    if (filters.accountId) {
      params = params.set('accountId', filters.accountId.toString());
    }

    return this.http.get<AccountingEntriesResponse>(`${this.apiUrl}/entries`, { params });
  }

  getAccountingEntry(id: number): Observable<AccountingEntry> {
    return this.http.get<AccountingEntry>(`${this.apiUrl}/entries/${id}`);
  }

  getAccountingEntryById(id: number): Observable<AccountingEntry> {
    return this.http.get<AccountingEntry>(`${this.apiUrl}/entries/${id}`);
  }

  createAccountingEntry(entry: CreateAccountingEntryRequest): Observable<AccountingEntry> {
    return this.http.post<AccountingEntry>(`${this.apiUrl}/entries`, entry);
  }

  updateAccountingEntry(id: number, entry: UpdateAccountingEntryRequest): Observable<AccountingEntry> {
    return this.http.put<AccountingEntry>(`${this.apiUrl}/entries/${id}`, entry);
  }

  cancelAccountingEntry(id: number, reason: string): Observable<AccountingEntry> {
    const params = new HttpParams().set('reason', reason);
    return this.http.put<AccountingEntry>(`${this.apiUrl}/entries/${id}/cancel`, null, { params });
  }

  // Report methods
  generateJournalReport(startDate: string, endDate: string): Observable<AccountingReport> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<AccountingReport>(`${this.apiUrl}/reports/journal`, { params });
  }

  generateBalanceReport(startDate: string, endDate: string): Observable<AccountingReport> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<AccountingReport>(`${this.apiUrl}/reports/balance`, { params });
  }

  // Dashboard methods
  getDashboardStats(dateFrom?: string, dateTo?: string): Observable<AccountingDashboardStats> {
    let params = new HttpParams();
    
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }

    return this.http.get<AccountingDashboardStats>(`${this.apiUrl}/dashboard/stats`, { params });
  }

  // Utility methods for data transformation
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }

  // Validation methods
  validateDoubleEntry(movements: { movementType: string; amount: number }[]): boolean {
    const totalDebits = movements
      .filter(m => m.movementType === 'DEBIT')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const totalCredits = movements
      .filter(m => m.movementType === 'CREDIT')
      .reduce((sum, m) => sum + m.amount, 0);

    return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for small floating point differences
  }

  // Export methods (returns blob for download)
  exportJournalReportPDF(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('format', 'pdf');
    
    return this.http.get(`${this.apiUrl}/reports/journal/export`, {
      params,
      responseType: 'blob'
    });
  }

  exportJournalReportExcel(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('format', 'excel');
    
    return this.http.get(`${this.apiUrl}/reports/journal/export`, {
      params,
      responseType: 'blob'
    });
  }

  exportBalanceReportPDF(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('format', 'pdf');
    
    return this.http.get(`${this.apiUrl}/reports/balance/export`, {
      params,
      responseType: 'blob'
    });
  }

  exportBalanceReportExcel(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('format', 'excel');
    
    return this.http.get(`${this.apiUrl}/reports/balance/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Helper method to download blobs
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Account lookup helper (useful for form validation)
  getAccountsForSelect(): Observable<{ value: number; label: string; type: AccountType }[]> {
    return this.getAllAccounts().pipe(
      map(accounts => accounts.map(account => ({
        value: account.id,
        label: `${account.code} - ${account.name}`,
        type: account.type
      })))
    );
  }

  // Get accounts filtered by types (useful for specific forms)
  getIncomeAccounts(): Observable<Account[]> {
    return this.getAllAccounts().pipe(
      map(accounts => accounts.filter(account => account.type === AccountType.INCOME))
    );
  }

  getExpenseAccounts(): Observable<Account[]> {
    return this.getAllAccounts().pipe(
      map(accounts => accounts.filter(account => account.type === AccountType.EXPENSE))
    );
  }

  getAssetAccounts(): Observable<Account[]> {
    return this.getAllAccounts().pipe(
      map(accounts => accounts.filter(account => account.type === AccountType.ASSET))
    );
  }
}