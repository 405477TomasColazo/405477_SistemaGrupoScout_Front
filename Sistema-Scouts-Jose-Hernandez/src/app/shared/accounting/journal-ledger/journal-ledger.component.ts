import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { AccountingService } from '../../../core/services/accounting.service';
import {
  AccountingEntry,
  AccountingEntriesResponse,
  AccountingFilters,
  AccountingFiltersForm,
  OriginType,
  EntryStatus,
  MovementType,
  ORIGIN_TYPE_LABELS,
  ENTRY_STATUS_LABELS,
  MOVEMENT_TYPE_LABELS,
  Account
} from '../../../core/models/accounting.model';

@Component({
  selector: 'app-journal-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './journal-ledger.component.html',
  styleUrls: ['./journal-ledger.component.css']
})
export class JournalLedgerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  entries: AccountingEntry[] = [];
  accounts: Account[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  pageSizeOptions = [10, 20, 50, 100];

  // Filter form
  filterForm: FormGroup;
  showFilters = false;

  // Enums for template
  OriginType = OriginType;
  EntryStatus = EntryStatus;
  MovementType = MovementType;
  ORIGIN_TYPE_LABELS = ORIGIN_TYPE_LABELS;
  ENTRY_STATUS_LABELS = ENTRY_STATUS_LABELS;
  MOVEMENT_TYPE_LABELS = MOVEMENT_TYPE_LABELS;

  // Selected entry for details modal
  selectedEntry: AccountingEntry | null = null;
  showEntryModal = false;

  // Math for template
  Math = Math;

  constructor(
    private accountingService: AccountingService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadEntries();
    this.setupFilterSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      dateFrom: [null],
      dateTo: [null],
      status: [null],
      originType: [null],
      description: [''],
      accountId: [null]
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadEntries();
      });
  }

  private loadAccounts(): void {
    this.accountingService.getAllAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
        },
        error: (error) => {
          console.error('Error loading accounts:', error);
          this.error = 'Error loading accounts';
        }
      });
  }

  loadEntries(): void {
    this.loading = true;
    this.error = null;

    const filters = this.buildFilters();

    this.accountingService.getAccountingEntries(filters, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AccountingEntriesResponse) => {
          this.entries = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading accounting entries:', error);
          this.error = 'Error loading accounting entries';
          this.loading = false;
        }
      });
  }

  private buildFilters(): AccountingFilters {
    const formValue = this.filterForm.value;
    const filters: AccountingFilters = {};

    if (formValue.dateFrom) {
      filters.dateFrom = this.formatDateForAPI(formValue.dateFrom);
    }
    if (formValue.dateTo) {
      filters.dateTo = this.formatDateForAPI(formValue.dateTo);
    }
    if (formValue.status) {
      filters.status = formValue.status;
    }
    if (formValue.originType) {
      filters.originType = formValue.originType;
    }
    if (formValue.description && formValue.description.trim()) {
      filters.description = formValue.description.trim();
    }
    if (formValue.accountId) {
      filters.accountId = formValue.accountId;
    }

    return filters;
  }

  private formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEntries();
  }

  handlePageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newSize = +target.value;
    this.onPageSizeChange(newSize);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.loadEntries();
  }

  // Filter methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  applyQuickFilter(filter: 'today' | 'week' | 'month' | 'automatic' | 'manual'): void {
    const today = new Date();
    const formValue: any = {};

    switch (filter) {
      case 'today':
        formValue.dateFrom = today;
        formValue.dateTo = today;
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        formValue.dateFrom = weekStart;
        formValue.dateTo = today;
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        formValue.dateFrom = monthStart;
        formValue.dateTo = today;
        break;
      case 'automatic':
        formValue.originType = OriginType.AUTOMATIC;
        break;
      case 'manual':
        formValue.originType = OriginType.MANUAL;
        break;
    }

    this.filterForm.patchValue(formValue);
  }

  // Entry detail methods
  viewEntryDetails(entry: AccountingEntry): void {
    this.selectedEntry = entry;
    this.showEntryModal = true;
  }

  closeEntryModal(): void {
    this.showEntryModal = false;
    this.selectedEntry = null;
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return this.accountingService.formatCurrency(amount);
  }

  formatDate(dateString: string): string {
    return this.accountingService.formatDate(dateString);
  }

  formatDateTime(dateTimeString: string): string {
    return this.accountingService.formatDateTime(dateTimeString);
  }

  getAccountName(accountId: number): string {
    const account = this.accounts.find(a => a.id === accountId);
    return account ? `${account.code} - ${account.name}` : 'Unknown Account';
  }

  getTotalDebitsForEntry(entry: AccountingEntry): number {
    return entry.movements
      .filter(m => m.movementType === MovementType.DEBIT)
      .reduce((sum, m) => sum + m.amount, 0);
  }

  getTotalCreditsForEntry(entry: AccountingEntry): number {
    return entry.movements
      .filter(m => m.movementType === MovementType.CREDIT)
      .reduce((sum, m) => sum + m.amount, 0);
  }

  getStatusBadgeClass(status: EntryStatus): string {
    return status === EntryStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getOriginBadgeClass(origin: OriginType): string {
    return origin === OriginType.AUTOMATIC ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  }

  // Generate page numbers for pagination
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Export methods
  exportToPDF(): void {
    const filters = this.buildFilters();
    const startDate = filters.dateFrom || this.formatDateForAPI(new Date(new Date().getFullYear(), 0, 1));
    const endDate = filters.dateTo || this.formatDateForAPI(new Date());

    this.accountingService.exportJournalReportPDF(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const filename = `journal-report-${startDate}-${endDate}.pdf`;
          this.accountingService.downloadBlob(blob, filename);
        },
        error: (error) => {
          console.error('Error exporting PDF:', error);
          this.error = 'Error exporting PDF report';
        }
      });
  }

  exportToExcel(): void {
    const filters = this.buildFilters();
    const startDate = filters.dateFrom || this.formatDateForAPI(new Date(new Date().getFullYear(), 0, 1));
    const endDate = filters.dateTo || this.formatDateForAPI(new Date());

    this.accountingService.exportJournalReportExcel(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const filename = `journal-report-${startDate}-${endDate}.xlsx`;
          this.accountingService.downloadBlob(blob, filename);
        },
        error: (error) => {
          console.error('Error exporting Excel:', error);
          this.error = 'Error exporting Excel report';
        }
      });
  }

  // TrackBy function for performance
  trackByEntryId(index: number, entry: AccountingEntry): number {
    return entry.id;
  }
}