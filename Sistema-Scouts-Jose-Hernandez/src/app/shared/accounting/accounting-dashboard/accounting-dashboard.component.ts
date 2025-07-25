import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AccountingService } from '../../../core/services/accounting.service';
import { AccountingDashboardStats } from '../../../core/models/accounting.model';

@Component({
  selector: 'app-accounting-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accounting-dashboard.component.html',
  styleUrls: ['./accounting-dashboard.component.css']
})
export class AccountingDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  stats: AccountingDashboardStats | null = null;
  loading = false;
  error: string | null = null;

  constructor(private accountingService: AccountingService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardStats(): void {
    this.loading = true;
    this.error = null;

    // Get current month stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const dateFrom = startOfMonth.toISOString().split('T')[0];
    const dateTo = endOfMonth.toISOString().split('T')[0];

    this.accountingService.getDashboardStats(dateFrom, dateTo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          this.error = 'Error loading dashboard statistics';
          this.loading = false;
        }
      });
  }

  formatCurrency(amount: number): string {
    return this.accountingService.formatCurrency(amount);
  }

  getCurrentMonthName(): string {
    const now = new Date();
    return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(now);
  }

  getBalanceClass(): string {
    if (!this.stats) return '';
    const balance = this.stats.balanceDifference;
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  getBalanceIcon(): string {
    if (!this.stats) return 'fas fa-equals';
    const balance = this.stats.balanceDifference;
    if (balance > 0) return 'fas fa-arrow-up';
    if (balance < 0) return 'fas fa-arrow-down';
    return 'fas fa-equals';
  }
}