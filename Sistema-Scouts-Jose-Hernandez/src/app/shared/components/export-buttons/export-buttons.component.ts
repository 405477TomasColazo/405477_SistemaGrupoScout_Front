import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-export-buttons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <button
        type="button"
        (click)="toggleDropdown()"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        [disabled]="isExporting"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span *ngIf="!isExporting">{{ buttonText }}</span>
        <span *ngIf="isExporting" class="flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exportando...
        </span>
        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div 
        *ngIf="showDropdown"
        class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
      >
        <div class="py-1" role="menu">
          <button
            (click)="onExportPDF()"
            class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full"
            role="menuitem"
            [disabled]="isExporting"
          >
            <svg class="w-4 h-4 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
            </svg>
            Exportar PDF
          </button>
          <button
            (click)="onExportCSV()"
            class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full"
            role="menuitem"
            [disabled]="isExporting"
          >
            <svg class="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop to close dropdown -->
    <div 
      *ngIf="showDropdown" 
      class="fixed inset-0 z-40" 
      (click)="closeDropdown()"
    ></div>
  `,
  styles: [`
    .z-50 {
      z-index: 50;
    }
    .z-40 {
      z-index: 40;
    }
  `]
})
export class ExportButtonsComponent {
  @Input() buttonText: string = 'Exportar';
  @Input() isExporting: boolean = false;
  @Output() exportPDF = new EventEmitter<void>();
  @Output() exportCSV = new EventEmitter<void>();

  showDropdown = false;

  toggleDropdown(): void {
    if (!this.isExporting) {
      this.showDropdown = !this.showDropdown;
    }
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  onExportPDF(): void {
    this.closeDropdown();
    this.exportPDF.emit();
  }

  onExportCSV(): void {
    this.closeDropdown();
    this.exportCSV.emit();
  }
}