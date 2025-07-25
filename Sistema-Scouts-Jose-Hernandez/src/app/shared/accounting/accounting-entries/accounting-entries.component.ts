import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { AccountingService } from '../../../core/services/accounting.service';
import { ExportService, ExportColumn } from '../../../core/services/export.service';
import { ExportButtonsComponent } from '../../components/export-buttons/export-buttons.component';
import {
  AccountingEntry,
  AccountingEntriesResponse,
  AccountingFilters,
  OriginType,
  EntryStatus,
  MovementType,
  ORIGIN_TYPE_LABELS,
  ENTRY_STATUS_LABELS,
  MOVEMENT_TYPE_LABELS,
  Account
} from '../../../core/models/accounting.model';

@Component({
  selector: 'app-accounting-entries',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, ExportButtonsComponent],
  templateUrl: './accounting-entries.component.html',
  styleUrls: ['./accounting-entries.component.css']
})
export class AccountingEntriesComponent implements OnInit, OnDestroy {
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

  // Cancel entry modal
  showCancelModal = false;
  entryToCancel: AccountingEntry | null = null;
  cancelReason = '';

  // Math for template
  Math = Math;

  constructor(
    private accountingService: AccountingService,
    private exportService: ExportService,
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
    if (formValue.accountId && formValue.accountId !== '' && formValue.accountId !== null) {
      filters.accountId = parseInt(formValue.accountId, 10);
    }

    return filters;
  }

  private formatDateForAPI(date: Date | string | null): string {
    if (!date) {
      return '';
    }

    // Si ya es un string en formato YYYY-MM-DD, devolverlo tal como está
    if (typeof date === 'string') {
      return date;
    }

    // Si es un objeto Date, convertirlo
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    // Intentar crear un Date desde el valor
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date value:', date);
        return '';
      }
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error parsing date:', date, error);
      return '';
    }
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

  // Cancel entry methods
  openCancelModal(entry: AccountingEntry): void {
    this.entryToCancel = entry;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.entryToCancel = null;
    this.cancelReason = '';
  }

  confirmCancelEntry(): void {
    if (!this.entryToCancel || !this.cancelReason.trim()) {
      return;
    }

    this.loading = true;
    this.accountingService.cancelAccountingEntry(this.entryToCancel.id, this.cancelReason.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadEntries(); // Reload to show the cancelled entry and the new reversal entry
          this.closeCancelModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cancelling entry:', error);
          this.error = 'Error cancelling accounting entry';
          this.loading = false;
        }
      });
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

  canEditEntry(entry: AccountingEntry): boolean {
    return entry.originType === OriginType.MANUAL && entry.status === EntryStatus.ACTIVE;
  }

  canCancelEntry(entry: AccountingEntry): boolean {
    return entry.originType === OriginType.MANUAL && entry.status === EntryStatus.ACTIVE;
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

  // TrackBy function for performance
  trackByEntryId(index: number, entry: AccountingEntry): number {
    return entry.id;
  }

  // Export methods
  exportToPDF(): void {
    const data = this.prepareExportData();
    const columns = this.getExportColumns();
    const filters = this.buildFilters();
    const startDate = filters.dateFrom || this.formatDateForAPI(new Date(new Date().getFullYear(), 0, 1));
    const endDate = filters.dateTo || this.formatDateForAPI(new Date());
    const filename = `entradas-contables-${startDate}-${endDate}`;
    const title = 'Gestión de Entradas Contables - Sistema Scout José Hernández';

    this.exportService.exportToPDF(data, columns, filename, title);
  }

  exportToCSV(): void {
    const data = this.prepareExportData();
    const columns = this.getExportColumns();
    const filters = this.buildFilters();
    const startDate = filters.dateFrom || this.formatDateForAPI(new Date(new Date().getFullYear(), 0, 1));
    const endDate = filters.dateTo || this.formatDateForAPI(new Date());
    const filename = `entradas-contables-${startDate}-${endDate}`;

    this.exportService.exportToCSV(data, columns, filename);
  }

  private prepareExportData(): any[] {
    return this.entries.map(entry => ({
      entryNumber: entry.entryNumber,
      entryDate: this.formatDate(entry.entryDate),
      description: entry.description,
      originType: ORIGIN_TYPE_LABELS[entry.originType],
      status: ENTRY_STATUS_LABELS[entry.status],
      totalDebits: entry.totalDebits,
      totalCredits: entry.totalCredits,
      createdBy: entry.createdByUserName || 'Sistema',
      createdAt: this.formatDateTime(entry.createdAt)
    }));
  }

  private getExportColumns(): ExportColumn[] {
    return [
      { key: 'entryNumber', header: 'Entrada #', type: 'text' },
      { key: 'entryDate', header: 'Fecha', type: 'date' },
      { key: 'description', header: 'Descripción', type: 'text' },
      { key: 'originType', header: 'Origen', type: 'text' },
      { key: 'status', header: 'Estado', type: 'text' },
      { key: 'totalDebits', header: 'Débitos', type: 'currency' },
      { key: 'totalCredits', header: 'Créditos', type: 'currency' },
      { key: 'createdBy', header: 'Creado por', type: 'text' },
      { key: 'createdAt', header: 'Fecha de creación', type: 'date' }
    ];
  }

  // private formatDateForAPI(date: Date): string {
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }
}
