import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PaymentService } from '../../core/services/payment.service';
import { Payment, PaymentFilters, PaymentStatistics, PendingPaymentsBySection } from '../../core/models/payments.model';

@Component({
  selector: 'app-admin-payments-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payments-management.component.html',
  styleUrl: './admin-payments-management.component.css'
})
export class AdminPaymentsManagementComponent implements OnInit, OnDestroy {

  // Data properties
  payments: Payment[] = [];
  pendingFees: any[] = [];
  availableSections: any[] = [];
  statistics: PaymentStatistics | null = null;
  pendingBySection: PendingPaymentsBySection[] = [];

  // Filter properties
  filters: PaymentFilters = {
    memberId: null,
    familyGroupId: null,
    sectionId: null,
    dateFrom: null,
    dateTo: null,
    minAmount: null,
    maxAmount: null,
    status: '',
    paymentMethod: null,
    memberName: null
  };

  // Pending fees filter properties
  pendingFeesFilters: any = {
    memberName: null,
    sectionId: '',
    familyGroupId: null,
    minAmount: null,
    maxAmount: null,
    period: null
  };

  // UI state properties
  currentTab: 'payments' | 'pending-fees' | 'statistics' = 'payments';
  showFilters = true;
  showPendingFeesFilters = true;
  loadingPayments = false;
  loadingPendingFees = false;
  loadingStatistics = false;
  selectedPayment: Payment | null = null;
  showPaymentModal = false;
  showEditStatusModal = false;

  // Edit payment status properties
  editingPayment: Payment | null = null;
  newPaymentStatus: string = '';
  statusChangeReason: string = '';

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;
  totalPages = 1;

  // Pending fees pagination properties
  currentPendingFeesPage = 1;
  pendingFeesItemsPerPage = 20;
  totalPendingFeesItems = 0;
  totalPendingFeesPages = 1;

  // Status options for dropdown
  statusOptions = [
    { value: 'COMPLETED', label: 'Completado' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'PROCESSING', label: 'Procesando' },
    { value: 'FAILED', label: 'Fallido' }
  ];

  // Alert properties
  showAlert = false;
  alertType: 'success' | 'error' = 'success';
  alertMessage = '';

  private subscriptions: Subscription[] = [];
  private readonly paymentService = inject(PaymentService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadPayments();
    this.loadStatistics();
    this.loadPendingBySection();
    this.loadSections();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadPayments(page: number = 1): void {
    this.loadingPayments = true;
    this.currentPage = page;

    const sub = this.paymentService.getAllPaymentsForAdmin(this.filters, page - 1, this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.payments = response.payments;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.loadingPayments = false;
        },
        error: (error) => {
          console.error('Error loading payments:', error);
          this.showAlertMessage('error', 'Error al cargar los pagos');
          this.loadingPayments = false;
        }
      });

    this.subscriptions.push(sub);
  }

  loadStatistics(): void {
    this.loadingStatistics = true;

    const sub = this.paymentService.getPaymentStatistics(
      this.filters.dateFrom || undefined,
      this.filters.dateTo || undefined
    ).subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.loadingStatistics = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.showAlertMessage('error', 'Error al cargar las estadísticas');
        this.loadingStatistics = false;
      }
    });

    this.subscriptions.push(sub);
  }

  loadPendingBySection(): void {
    const sub = this.paymentService.getPendingPaymentsBySection()
      .subscribe({
        next: (data) => {
          this.pendingBySection = data;
        },
        error: (error) => {
          console.error('Error loading pending payments by section:', error);
        }
      });

    this.subscriptions.push(sub);
  }

  applyFilters(): void {
    this.loadPayments(1);
    if (this.currentTab === 'statistics') {
      this.loadStatistics();
    }
  }

  clearFilters(): void {
    this.filters = {
      memberId: null,
      familyGroupId: null,
      sectionId: null,
      dateFrom: null,
      dateTo: null,
      minAmount: null,
      maxAmount: null,
      status: '',
      paymentMethod: null,
      memberName: null
    };
    this.loadPayments(1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadPayments(page);
    }
  }

  changeTab(tab: 'payments' | 'pending-fees' | 'statistics'): void {
    this.currentTab = tab;
    if (tab === 'statistics' && !this.statistics) {
      this.loadStatistics();
    } else if (tab === 'pending-fees' && this.pendingFees.length === 0) {
      this.loadPendingFees();
    }
  }

  openPaymentDetails(payment: Payment): void {
    this.selectedPayment = payment;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedPayment = null;
  }

  openEditStatusModal(payment: Payment): void {
    this.editingPayment = payment;
    this.newPaymentStatus = payment.status;
    this.statusChangeReason = '';
    this.showEditStatusModal = true;
  }

  closeEditStatusModal(): void {
    this.showEditStatusModal = false;
    this.editingPayment = null;
    this.newPaymentStatus = '';
    this.statusChangeReason = '';
  }

  updatePaymentStatus(): void {
    if (!this.editingPayment || !this.newPaymentStatus) {
      this.showAlertMessage('error', 'Por favor complete todos los campos');
      return;
    }

    const sub = this.paymentService.updatePaymentStatus(
      this.editingPayment.id,
      this.newPaymentStatus as any,
      this.statusChangeReason
    ).subscribe({
      next: (updatedPayment) => {
        // Update the payment in the list
        const index = this.payments.findIndex(p => p.id === updatedPayment.id);
        if (index !== -1) {
          this.payments[index] = updatedPayment;
        }

        this.showAlertMessage('success', 'Estado del pago actualizado correctamente');
        this.closeEditStatusModal();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating payment status:', error);
        this.showAlertMessage('error', 'Error al actualizar el estado del pago');
      }
    });

    this.subscriptions.push(sub);
  }

  downloadReceipt(payment: Payment | null): void {
    if (payment == null) {
      return;
    }
    const sub = this.paymentService.downloadPaymentReceipt(payment.id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `comprobante-pago-${payment.referenceId || payment.id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading receipt:', error);
          this.showAlertMessage('error', 'Error al descargar el comprobante');
        }
      });

    this.subscriptions.push(sub);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'Completado',
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'failed': 'Fallido'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  getStatusClass(status: string): string {
    const statusClassMap: { [key: string]: string } = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return statusClassMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  togglePendingFeesFilters(): void {
    this.showPendingFeesFilters = !this.showPendingFeesFilters;
  }

  loadPendingFees(page: number = 1): void {
    this.loadingPendingFees = true;
    this.currentPendingFeesPage = page;

    const sub = this.paymentService.getPendingFeesForAdmin(this.pendingFeesFilters, page - 1, this.pendingFeesItemsPerPage)
      .subscribe({
        next: (response) => {
          this.pendingFees = response.fees;
          this.totalPendingFeesItems = response.total;
          this.totalPendingFeesPages = Math.ceil(this.totalPendingFeesItems / this.pendingFeesItemsPerPage);
          this.loadingPendingFees = false;
        },
        error: (error) => {
          console.error('Error loading pending fees:', error);
          this.showAlertMessage('error', 'Error al cargar las cuotas pendientes');
          this.loadingPendingFees = false;
        }
      });

    this.subscriptions.push(sub);
  }

  applyPendingFeesFilters(): void {
    this.loadPendingFees(1);
  }

  clearPendingFeesFilters(): void {
    this.pendingFeesFilters = {
      memberName: null,
      sectionId: '',
      familyGroupId: null,
      minAmount: null,
      maxAmount: null,
      period: null
    };
    this.loadPendingFees(1);
  }

  changePendingFeesPage(page: number): void {
    if (page >= 1 && page <= this.totalPendingFeesPages) {
      this.loadPendingFees(page);
    }
  }

  loadSections(): void {
    const sub = this.paymentService.getAllSections()
      .subscribe({
        next: (sections) => {
          this.availableSections = sections;
        },
        error: (error) => {
          console.error('Error loading sections:', error);
          this.showAlertMessage('error', 'Error al cargar las secciones');
        }
      });

    this.subscriptions.push(sub);
  }

  private showAlertMessage(type: 'success' | 'error', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  protected readonly Math = Math;
}
