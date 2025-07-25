import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

import { AccountingService } from '../../../core/services/accounting.service';
import { AccountingDashboardStats } from '../../../core/models/accounting.model';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-accounting-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accounting-dashboard.component.html',
  styleUrls: ['./accounting-dashboard.component.css']
})
export class AccountingDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  @ViewChild('debitCreditChart', { static: false }) debitCreditChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('balanceChart', { static: false }) balanceChartRef!: ElementRef<HTMLCanvasElement>;

  stats: AccountingDashboardStats | null = null;
  loading = false;
  error: string | null = null;

  private debitCreditChart: Chart | null = null;
  private balanceChart: Chart | null = null;

  constructor(private accountingService: AccountingService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Destroy charts to prevent memory leaks
    if (this.debitCreditChart) {
      this.debitCreditChart.destroy();
    }
    if (this.balanceChart) {
      this.balanceChart.destroy();
    }
  }

  ngAfterViewInit(): void {
    // Charts will be created after stats are loaded
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
          // Create charts after stats are loaded
          setTimeout(() => {
            this.createCharts();
          }, 100);
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

  private createCharts(): void {
    if (!this.stats) return;
    
    this.createDebitCreditChart();
    this.createBalanceChart();
  }

  private createDebitCreditChart(): void {
    if (!this.stats || !this.debitCreditChartRef) return;

    const ctx = this.debitCreditChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.debitCreditChart) {
      this.debitCreditChart.destroy();
    }

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Débitos', 'Créditos'],
        datasets: [{
          data: [this.stats.totalDebits, this.stats.totalCredits],
          backgroundColor: [
            '#10B981', // Green for debits
            '#8B5CF6'  // Purple for credits
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = this.formatCurrency(context.parsed);
                return `${label}: ${value}`;
              }
            }
          }
        },
        cutout: '60%'
      }
    };

    this.debitCreditChart = new Chart(ctx, config);
  }

  private createBalanceChart(): void {
    if (!this.stats || !this.balanceChartRef) return;

    const ctx = this.balanceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.balanceChart) {
      this.balanceChart.destroy();
    }

    // For now, show a simple bar chart comparing totals
    // In the future, this could show balance over time with real data
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['Débitos', 'Créditos', 'Balance'],
        datasets: [{
          label: 'Montos',
          data: [
            this.stats.totalDebits,
            this.stats.totalCredits,
            Math.abs(this.stats.balanceDifference)
          ],
          backgroundColor: [
            '#10B981', // Green for debits
            '#8B5CF6', // Purple for credits
            this.stats.balanceDifference >= 0 ? '#10B981' : '#EF4444' // Green for positive, red for negative balance
          ],
          borderColor: [
            '#059669',
            '#7C3AED',
            this.stats.balanceDifference >= 0 ? '#059669' : '#DC2626'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = this.formatCurrency(context.parsed.y);
                return `${context.label}: ${value}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return this.formatCurrency(Number(value));
              }
            }
          }
        }
      }
    };

    this.balanceChart = new Chart(ctx, config);
  }
}