import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonthlyFeeService } from '../../../core/services/monthly-fee.service';
import { ExportService } from '../../../core/services/export.service';
import { ExportButtonsComponent } from '../../components/export-buttons/export-buttons.component';
import {
  FeeGenerationLog,
  FeeGenerationRequest,
  Section,
  GlobalPriceUpdateRequest,
  GlobalPriceUpdateResult,
  GlobalFeeConfiguration
} from '../../../core/models/payments.model';

@Component({
  selector: 'app-monthly-fee-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ExportButtonsComponent],
  templateUrl: './monthly-fee-management.component.html',
  styleUrls: ['./monthly-fee-management.component.css']
})
export class MonthlyFeeManagementComponent implements OnInit {
  activeTab: 'generation' | 'configuration' | 'logs' = 'generation';

  // Fee Generation properties
  generationRequest: FeeGenerationRequest = {
    targetMonth: this.getCurrentMonth(),
    section: ''
  };
  generationInProgress = false;
  generationResult: { message: string; totalGenerated: number } | null = null;

  // Global Price Configuration properties
  currentGlobalPrice = 0;
  newGlobalPrice = 0;
  globalPriceLoading = false;
  globalPriceUpdateInProgress = false;
  globalPriceUpdateResult: GlobalPriceUpdateResult | null = null;

  // Logs properties
  generationLogs: FeeGenerationLog[] = [];
  logsTotal = 0;
  logsPage = 0;
  logsLimit = 10;
  logsFilters = {
    generationType: ''
  };
  logsLoading = false;

  // Utility properties
  availableSections: Section[] = [];

  // Export state properties
  isExportingLogs = false;

  constructor(
    private monthlyFeeService: MonthlyFeeService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadUtilityData();
    this.loadGlobalPrice();
    this.loadGenerationLogs();
  }

  // Tab management
  setActiveTab(tab: 'generation' | 'configuration' | 'logs'): void {
    this.activeTab = tab;
  }

  // Utility methods
  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private loadUtilityData(): void {
    this.monthlyFeeService.getAvailableSections().subscribe({
      next: (sections) => this.availableSections = sections,
      error: (error) => console.error('Error loading sections:', error)
    });
  }

  // Fee Generation methods
  generateMonthlyFees(): void {
    this.generationInProgress = true;
    this.generationResult = null;

    this.monthlyFeeService.generateMonthlyFees(this.generationRequest).subscribe({
      next: (result) => {
        this.generationResult = result;
        this.generationInProgress = false;
        this.loadGenerationLogs(); // Refresh logs
      },
      error: (error) => {
        console.error('Error generating fees:', error);
        this.generationInProgress = false;
      }
    });
  }

  // Global Price Configuration methods
  loadGlobalPrice(): void {
    this.globalPriceLoading = true;
    this.monthlyFeeService.getGlobalFeePrice().subscribe({
      next: (config) => {
        this.currentGlobalPrice = config.monthlyFeeAmount;
        this.newGlobalPrice = config.monthlyFeeAmount;
        this.globalPriceLoading = false;
      },
      error: (error) => {
        console.error('Error loading global price:', error);
        this.globalPriceLoading = false;
      }
    });
  }

  updateGlobalPrice(): void {
    if (!this.isValidGlobalPrice()) {
      return;
    }

    this.globalPriceUpdateInProgress = true;
    this.globalPriceUpdateResult = null;

    const request: GlobalPriceUpdateRequest = {
      newAmount: this.newGlobalPrice
    };

    this.monthlyFeeService.updateGlobalFeePrice(request).subscribe({
      next: (result) => {
        this.globalPriceUpdateResult = result;
        this.currentGlobalPrice = result.newPrice;
        this.globalPriceUpdateInProgress = false;
        this.loadGenerationLogs(); // Refresh logs to show price update entry
      },
      error: (error) => {
        console.error('Error updating global price:', error);
        this.globalPriceUpdateInProgress = false;
      }
    });
  }

  isValidGlobalPrice(): boolean {
    return this.newGlobalPrice > 0;
  }

  resetGlobalPriceForm(): void {
    this.newGlobalPrice = this.currentGlobalPrice;
    this.globalPriceUpdateResult = null;
  }

  // Logs methods
  loadGenerationLogs(): void {
    this.logsLoading = true;
    const { generationType } = this.logsFilters;

    this.monthlyFeeService.getGenerationLogs(
      this.logsPage,
      this.logsLimit,
      undefined, // section no se usa
      generationType || undefined
    ).subscribe({
      next: (response) => {
        console.log('Generation logs response:', response); // Debug logging
        this.generationLogs = response.logs;
        this.logsTotal = response.total;
        this.logsLoading = false;
      },
      error: (error) => {
        console.error('Error loading logs:', error);
        this.logsLoading = false;
      }
    });
  }

  applyLogsFilters(): void {
    this.logsPage = 0;
    this.loadGenerationLogs();
  }

  nextLogsPage(): void {
    if ((this.logsPage + 1) * this.logsLimit < this.logsTotal) {
      this.logsPage++;
      this.loadGenerationLogs();
    }
  }

  previousLogsPage(): void {
    if (this.logsPage > 0) {
      this.logsPage--;
      this.loadGenerationLogs();
    }
  }

  get canGoNextPage(): boolean {
    return (this.logsPage + 1) * this.logsLimit < this.logsTotal;
  }

  get canGoPreviousPage(): boolean {
    return this.logsPage > 0;
  }

  // Export Methods
  exportLogsToPDF(): void {
    if (this.generationLogs.length === 0) {
      console.error('No hay logs para exportar');
      return;
    }

    this.isExportingLogs = true;

    const exportData = this.generationLogs.map(log => ({
      date: log.executedAt,
      type: this.getGenerationTypeLabel(log.generationType),
      targetMonth: log.targetMonth,
      feesGenerated: log.totalFeesGenerated,
      details: log.details || 'N/A'
    }));

    try {
      const columns = [
        { key: 'date', header: 'Fecha', type: 'date' as const },
        { key: 'type', header: 'Tipo', type: 'text' as const },
        { key: 'targetMonth', header: 'Mes Objetivo', type: 'text' as const },
        { key: 'feesGenerated', header: 'Cuotas Generadas', type: 'number' as const },
        { key: 'details', header: 'Detalles', type: 'text' as const }
      ];
      
      this.exportService.exportToPDF(exportData, columns, 'historial-generacion-cuotas', 'Historial de Generación de Cuotas');
    } catch (error) {
      console.error('Error al exportar logs a PDF:', error);
    }

    this.isExportingLogs = false;
  }

  exportLogsToCSV(): void {
    if (this.generationLogs.length === 0) {
      console.error('No hay logs para exportar');
      return;
    }

    this.isExportingLogs = true;

    const exportData = this.generationLogs.map(log => ({
      date: log.executedAt,
      type: this.getGenerationTypeLabel(log.generationType),
      targetMonth: log.targetMonth,
      feesGenerated: log.totalFeesGenerated,
      details: log.details || 'N/A'
    }));

    try {
      const columns = [
        { key: 'date', header: 'Fecha', type: 'date' as const },
        { key: 'type', header: 'Tipo', type: 'text' as const },
        { key: 'targetMonth', header: 'Mes Objetivo', type: 'text' as const },
        { key: 'feesGenerated', header: 'Cuotas Generadas', type: 'number' as const },
        { key: 'details', header: 'Detalles', type: 'text' as const }
      ];
      
      this.exportService.exportToCSV(exportData, columns, 'historial-generacion-cuotas');
    } catch (error) {
      console.error('Error al exportar logs a CSV:', error);
    }

    this.isExportingLogs = false;
  }

  private getGenerationTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'AUTOMATIC': 'Automática',
      'MANUAL': 'Manual',
      'GLOBAL_PRICE_UPDATE': 'Actualización de Precio',
      'NEW_MEMBER': 'Nuevo Miembro'
    };
    return typeLabels[type] || type;
  }

  protected readonly Math = Math;
}
