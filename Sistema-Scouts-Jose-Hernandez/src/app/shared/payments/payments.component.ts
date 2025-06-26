import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FamilyGroup, MemberProtagonist} from '../../core/models/family-group.model';
import {Fee, Payment, PaymentFilters} from '../../core/models/payments.model';
import {Subscription} from 'rxjs';
import {PaymentService} from '../../core/services/payment.service';
import {FamilyGroupService} from '../../core/services/family-group.service';
import {ExportService} from '../../core/services/export.service';
import {ExportButtonsComponent} from '../components/export-buttons/export-buttons.component';

import {FormsModule} from '@angular/forms';

declare var MercadoPago: any;
@Component({
  selector: 'app-payments',
  imports: [
    NgForOf,
    DatePipe,
    NgIf,
    NgClass,
    FormsModule,
    ExportButtonsComponent
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit, OnDestroy {


  seccionActiva: 'cuotas' | 'historial' = 'cuotas';
  selectedMember: MemberProtagonist | undefined;
  pendingFees: Fee[] = [];
  filteredFees: Fee[] = [];
  selectedFees: number[] = [];
  paymentsHistory: Payment[] = [];
  familyGroup: FamilyGroup | undefined;
  subscriptions: Subscription[] = [];

  // Filtro de tipo de cuota
  feeTypeFilter: 'all' | 'monthly' | 'event' = 'all';

  filters: PaymentFilters = {
    familyGroupId: null,
    maxAmount: null,
    memberName: null,
    paymentMethod: null,
    sectionId: null,
    status: null,
    memberId: null,
    dateFrom: null,
    dateTo: null,
    minAmount: null
  };

  // Variables para modales
  showPaymentModal = false;
  showPaymentDetailsModal = false;
  showSuccessModal = false;
  showFailModal = false;
  selectedPayment: Payment | undefined;

  // Variables para estado de pagos
  processingPayment = false;
  loadingPaymentBrick = false;
  mpCardPaymentBrickController: any;
  mpInstance: any;

  // Variables para paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 1;

  // Variables para alertas
  showAlert = false;
  alertType: 'success' | 'error' = 'success';
  alertText = '';

  // Variables para exportación
  isExportingPendingFees = false;
  isExportingPaymentHistory = false;

  // Variables para balance de cuenta
  memberBalance: number = 0;
  showBalanceSection: boolean = false;

  // Referencia para Math en el template
  Math = Math;

  private readonly paymentService: PaymentService = inject(PaymentService);
  private readonly familyGroupService: FamilyGroupService = inject(FamilyGroupService);
  private readonly exportService: ExportService = inject(ExportService);
  private cdr = inject(ChangeDetectorRef);

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe();
    })
  }
  ngOnInit(): void {
    this.loadFamilyData();
    this.loadPendingFees();
    this.loadPaymentsHistory();
  }

  private loadFamilyData() {
    const sub = this.familyGroupService.getFamilyGroup().subscribe({
      next: data => {
        this.familyGroup = data;
      },
      error: err => {
        console.error('Error al cargar datos de familia:', err);
        this.showAlertMessage('error', 'No se pudo cargar la información de la familia');
      }
    })
    this.subscriptions.push(sub);

  }

  private loadPendingFees() {
    const memberId = this.selectedMember?.id;
    if (memberId) {
      const sub = this.paymentService.getPendingFeed(memberId).subscribe({
        next: data => {
          this.pendingFees = data;
          this.applyFeeTypeFilter();
        },
        error: err => {
          console.error('Error al cargar datos de familia:', err);
          this.showAlertMessage('error', 'No se pudieron cargar las cuotas pendientes');
        }
      })
    }
  }

  private applyFeeTypeFilter() {
    if (this.feeTypeFilter === 'all') {
      this.filteredFees = [...this.pendingFees];
    } else {
      this.filteredFees = this.pendingFees.filter(fee => {
        const feeType = this.determineFeeType(fee);
        return feeType === this.feeTypeFilter;
      });
    }
  }

  determineFeeType(fee: Fee): 'monthly' | 'event' {
    // Estrategia para identificar fees de eventos:
    // 1. Si la descripción contiene palabras relacionadas con eventos
    // 2. Si el formato del período no es mensual típico
    // 3. Otros patrones que puedas identificar

    const description = fee.description.toLowerCase();
    const eventKeywords = ['evento', 'campamento', 'salida', 'actividad', 'excursión', 'fogón', 'raid'];

    // Verificar si contiene palabras clave de eventos
    if (eventKeywords.some(keyword => description.includes(keyword))) {
      return 'event';
    }

    // Si la descripción no parece una cuota mensual estándar
    if (!description.includes('cuota') && !description.includes('mensual') && !description.includes('mes')) {
      return 'event';
    }

    // Por defecto, asumir que es mensual
    return 'monthly';
  }

  changeFeeTypeFilter(type: 'all' | 'monthly' | 'event') {
    this.feeTypeFilter = type;
    this.selectedFees = []; // Limpiar selección al cambiar filtro
    this.applyFeeTypeFilter();
  }

  loadPaymentsHistory(page = 1): void {
    const sub = this.paymentService.getPaymentsHistory(this.filters, page, this.itemsPerPage).subscribe({
      next: (response) => {
        this.paymentsHistory = response.payments;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = page;
      },
      error: (error) => {
        console.error('Error al cargar historial de pagos:', error);
        this.showAlertMessage('error', 'No se pudo cargar el historial de pagos');
      }
    });
    this.subscriptions.push(sub);
  }

  toggleAllFees(): void {
    if (this.filteredFees.length === this.selectedFees.length) {
      // Si ya están todos seleccionados, los deselecciona
      this.selectedFees = [];
    } else {
      // Selecciona todos los filtrados
      this.selectedFees = this.filteredFees.map(fee => fee.id);
    }
  }

  toggleFeeSelection(feeId: number): void {
    const index = this.selectedFees.indexOf(feeId);
    if (index === -1) {
      this.selectedFees.push(feeId);
    } else {
      this.selectedFees.splice(index, 1);
    }
  }

  selectMember(member: MemberProtagonist): void {
    this.selectedMember = member;
    this.loadPendingFees();
    this.loadMemberBalance();
  }

  clearFilters(): void {
    this.filters = {
      familyGroupId: null,
      maxAmount: null,
      memberName: null,
      paymentMethod: null,
      sectionId: null,
      status: null,
      memberId: null,
      dateFrom: null,
      dateTo: null,
      minAmount: null
    };
    this.loadPaymentsHistory();
  }

  applyFilters(): void {
    this.loadPaymentsHistory(1);
  }

  openPaymentModal(): void {
    if (this.selectedFees.length === 0) {
      this.showAlertMessage('error', 'Debes seleccionar al menos una cuota para pagar');
      return;
    }

    this.showPaymentModal = true;
    this.initMercadoPago();
  }

  closePaymentModal(): void {
    if (this.mpCardPaymentBrickController) {
      this.mpCardPaymentBrickController.then((controller: any) => {
        if (controller && typeof controller.unmount === 'function') {
          try {
            controller.unmount();
          } catch (e) {
            console.error('Error al desmontar el brick de MercadoPago', e);
          }
        }
      }).catch((error: any) => {
        console.error('Error al acceder al controlador de MercadoPago', error);
      });
    }

    // Siempre ejecutamos estas instrucciones, independientemente de la promesa
    setTimeout(() => {
      this.mpCardPaymentBrickController = null;
      this.showPaymentModal = false;
      this.selectedFees = [];
      this.loadingPaymentBrick = false;
    }, 0);
  }

  openPaymentDetails(payment: Payment): void {
    this.selectedPayment = payment;
    this.showPaymentDetailsModal = true;
    this.cdr.detectChanges();
  }

  closeDetailsModal(): void {
    this.showPaymentDetailsModal = false;
    this.selectedPayment = undefined;
    this.cdr.detectChanges();
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.loadPendingFees();
    this.loadPaymentsHistory();
    this.cdr.detectChanges();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadPaymentsHistory(page);
    }
  }

  showRecipe(): void {
    if (this.selectedPayment) {
      this.openPaymentDetails(this.selectedPayment);
    }
    this.showSuccessModal = false;
    this.cdr.detectChanges();
  }

  downloadRecipe(payment: Payment): void {
    this.paymentService.downloadPaymentReceipt(payment.id).subscribe({
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
        console.error('Error al descargar comprobante:', error);
        this.showAlertMessage('error', 'No se pudo descargar el comprobante');
      }
    });
  }
  retryPayment(payment: Payment): void {
    // Se pueden recuperar los conceptos del pago fallido
    this.selectedFees = payment.items.map(item => item.feeId).filter((id): id is number => id !== undefined);
    this.closeDetailsModal();
    this.openPaymentModal();
  }

  getSelectedFeesDetails(): Fee[] {
    return this.pendingFees.filter(fee => this.selectedFees.includes(fee.id));
  }

  calculateTotalAmount(): number {
    return this.getSelectedFeesDetails().reduce((sum, fee) => sum + fee.amount, 0);
  }

  getMemberName(memberId: number): string {
    const member = this.familyGroup?.members.find(m => m.id === memberId);
    return member ? `${member.name} ${member.lastName}` : 'Miembro no encontrado';
  }

  getStatusText(status: "completed" | "processing" | "failed" | "pending"): string {
    const statusMap = {
      completed: "Completado",
      processing: "Procesando",
      pending: "Pendiente",
      failed: "Fallido"
    };
    return statusMap[status];
  }

  showAlertMessage(type: 'success' | 'error', text: string): void {
    this.alertType = type;
    this.alertText = text;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  initMercadoPago(): void {
    this.loadingPaymentBrick = true;

    // Asegúrate de tener un ID público de MercadoPago
    const PUBLIC_KEY = 'TEST-caae36ed-b31d-4d34-ab69-e7d22df107ae';

    // Carga el script de MercadoPago de forma dinámica
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      // Una vez cargado el script, inicializa MercadoPago
      // @ts-ignore - Ignora error de tipo para MercadoPago
      this.mpInstance = new window.MercadoPago(PUBLIC_KEY, {
        locale: 'es-AR'
      });

      this.initCardPaymentBrick();
    };
    document.body.appendChild(script);
  }

  initCardPaymentBrick(): void {
    // Recupera la información para crear la preferencia
    const selectedFees = this.getSelectedFeesDetails();
    const totalAmount = this.calculateTotalAmount();
    const member = this.selectedMember || this.familyGroup?.members[0];

    if (!member || !member.id) {
      this.showAlertMessage('error', 'No se pudo identificar al miembro para el pago');
      this.loadingPaymentBrick = false;
      return;
    }

    // Primero crea la preferencia en el backend
    this.paymentService.createPaymentPreference({
      memberId: member.id,
      items: selectedFees.map(fee => ({
        feeId: fee.id,
        description: fee.description,
        period: fee.period,
        amount: fee.amount
      })),
      totalAmount: totalAmount,
      paymentType: 'fee' as const,
      externalReferenceId: ''
    }).subscribe({
      next: (preferenceResponse) => {

        // Inicializa el Payment Brick completo (incluye todos los métodos de pago)
        const paymentBrickSettings = {
          initialization: {
            amount: totalAmount,
            preferenceId: preferenceResponse.preferenceId
          },
          customization: {
            paymentMethods: {
              ticket: "all",           // Rapipago, PagoFácil, etc.
              creditCard: "all",       // Tarjetas de crédito
              prepaidCard: "all",      // Tarjetas prepagas
              debitCard: "all",        // Tarjetas de débito
              mercadoPago: "all",      // Cuenta de MercadoPago
              bankTransfer: "all",     // Transferencias bancarias
              atm: "all"              // Cajeros automáticos
            },
            visual: {
              hidePaymentButton: false,
              hideFormTitle: false,
              style: {
                theme: 'default'
              }
            }
          },
          callbacks: {
            onReady: () => {
              this.loadingPaymentBrick = false;
            },
            onError: (error: any) => {
              console.error('Error en MercadoPago Brick:', error);
              this.loadingPaymentBrick = false;
              this.showAlertMessage('error', 'Hubo un problema con el servicio de pago');
            },
            onSubmit: (paymentFormData: any) => {
              this.processPayment(paymentFormData, preferenceResponse.preferenceId);
            }
          }
        };

        const brickContainer = document.getElementById('mercadopago-bricks-container');
        const brickContainerId = 'mercadopago-bricks-container';

        if (brickContainer) {
          // Renderiza el Payment Brick completo
          this.mpCardPaymentBrickController = this.mpInstance.bricks().create('payment', brickContainerId, paymentBrickSettings );
          this.loadingPaymentBrick = false;
        } else {
          console.error('No se encontró el contenedor para el Brick de MercadoPago');
          this.loadingPaymentBrick = false;
        }
      },
      error: (error) => {
        console.error('Error al crear preferencia de pago:', error);
        this.loadingPaymentBrick = false;
        this.showAlertMessage('error', 'No se pudo inicializar el servicio de pago');
      }
    });
  }

  processPayment(paymentFormData: any, preferenceId: string): void {
    this.processingPayment = true;

    this.paymentService.processPayment({
      paymentFormData: paymentFormData,
      preferenceId: preferenceId,
      feeIds: this.selectedFees
    }).subscribe({
      next: (response) => {
        this.processingPayment = false;

        // Primero intentamos desmontar el componente de MercadoPago
        if (this.mpCardPaymentBrickController) {
          this.mpCardPaymentBrickController.then((controller: any) => {
            if (controller && typeof controller.unmount === 'function') {
              try {
                controller.unmount();
              } catch (e) {
                console.error('Error al desmontar el brick de MercadoPago', e);
              }
            }
            this.mpCardPaymentBrickController = null;
            this.finalizarTransaccion(response);
          }).catch(() => {
            this.mpCardPaymentBrickController = null;
            this.finalizarTransaccion(response);
          });
        } else {
          // Si no hay controlador, finalizamos directamente
          this.finalizarTransaccion(response);
        }
      },
      error: (error) => {
        console.error('Error al procesar pago:', error);
        this.processingPayment = false;
        this.showAlertMessage('error', 'Hubo un problema al procesar el pago');
      }
    });
  }

  finalizarTransaccion(response: any): void {
    // Primero verificamos si la transacción fue exitosa

    const transaccionExitosa = response.status === 'success';


    // if (transaccionExitosa) {
      // Guardamos la información del pago seleccionado antes de limpiar
      this.selectedPayment = response.payment;


    // Cerramos el modal de pago
    this.showPaymentModal = false;
    this.loadPendingFees();
    this.selectedFees = [];
    this.loadingPaymentBrick = false;

    // Forzamos la detección de cambios para asegurar que el modal se cierre
    this.cdr.detectChanges();

    // Pequeño retraso para asegurar que el modal anterior se haya cerrado completamente
    // antes de mostrar el modal de éxito
    setTimeout(() => {
      if (transaccionExitosa) {
        this.showSuccessModal = true;
        // Aseguramos que la UI se actualice con el nuevo modal
        this.cdr.detectChanges();
      } else {
        // this.showAlertMessage('error', response.message || 'El pago no pudo ser procesado');
        this.showPaymentDetailsModal = true;
        this.cdr.detectChanges();
      }
    }, 300); // Un retraso un poco mayor para asegurar que la UI esté lista
  }

  // processPayment(): void {
  //   // Este método se llama desde el botón "Confirmar pago"
  //   // El procesamiento real lo gestiona MercadoPago al hacer submit del formulario
  //   // Por lo que este método queda para compatibilidad con la plantilla
  //   if (this.mpCardPaymentBrickController) {
  //     this.processingPayment = true;
  //   } else {
  //     this.showAlertMessage('error', 'No se pudo inicializar el servicio de pago');
  //   }
  // }

  // Métodos para cambio de secciones
  changeTab(tab: 'cuotas' | 'historial'): void {
    this.seccionActiva = tab;
    if (tab === 'historial') {
      this.loadPaymentsHistory();
    } else {
      this.loadPendingFees();
    }
  }

  // Método para formatear fechas en formato local
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-AR');
  }

  // Métodos de exportación
  exportPendingFeesToPDF(): void {
    if (this.filteredFees.length === 0) {
      this.showAlertMessage('error', 'No hay cuotas pendientes para exportar');
      return;
    }

    this.isExportingPendingFees = true;
    
    // Preparar datos para exportación
    const exportData = this.filteredFees.map(fee => ({
      description: fee.description,
      period: fee.period,
      dueDate: 'Por definir', // TODO: Implementar fechas de vencimiento
      amount: fee.amount
    }));

    try {
      this.exportService.exportPaymentsToPDF(exportData, true);
      this.showAlertMessage('success', 'Cuotas pendientes exportadas a PDF exitosamente');
    } catch (error) {
      console.error('Error al exportar cuotas pendientes a PDF:', error);
      this.showAlertMessage('error', 'Error al exportar cuotas pendientes a PDF');
    }

    this.isExportingPendingFees = false;
  }

  exportPendingFeesToCSV(): void {
    if (this.filteredFees.length === 0) {
      this.showAlertMessage('error', 'No hay cuotas pendientes para exportar');
      return;
    }

    this.isExportingPendingFees = true;
    
    // Preparar datos para exportación
    const exportData = this.filteredFees.map(fee => ({
      description: fee.description,
      period: fee.period,
      dueDate: 'Por definir', // TODO: Implementar fechas de vencimiento
      amount: fee.amount
    }));

    try {
      this.exportService.exportPaymentsToCSV(exportData, true);
      this.showAlertMessage('success', 'Cuotas pendientes exportadas a CSV exitosamente');
    } catch (error) {
      console.error('Error al exportar cuotas pendientes a CSV:', error);
      this.showAlertMessage('error', 'Error al exportar cuotas pendientes a CSV');
    }

    this.isExportingPendingFees = false;
  }

  exportPaymentHistoryToPDF(): void {
    if (this.paymentsHistory.length === 0) {
      this.showAlertMessage('error', 'No hay historial de pagos para exportar');
      return;
    }

    this.isExportingPaymentHistory = true;
    
    // Preparar datos para exportación
    const exportData = this.paymentsHistory.map(payment => ({
      paymentDate: payment.paymentDate,
      memberName: this.getMemberName(payment.memberId),
      referenceId: payment.referenceId || 'N/A',
      amount: payment.amount,
      status: this.getStatusText(payment.status)
    }));

    try {
      this.exportService.exportPaymentsToPDF(exportData, false);
      this.showAlertMessage('success', 'Historial de pagos exportado a PDF exitosamente');
    } catch (error) {
      console.error('Error al exportar historial de pagos a PDF:', error);
      this.showAlertMessage('error', 'Error al exportar historial de pagos a PDF');
    }

    this.isExportingPaymentHistory = false;
  }

  exportPaymentHistoryToCSV(): void {
    if (this.paymentsHistory.length === 0) {
      this.showAlertMessage('error', 'No hay historial de pagos para exportar');
      return;
    }

    this.isExportingPaymentHistory = true;
    
    // Preparar datos para exportación
    const exportData = this.paymentsHistory.map(payment => ({
      paymentDate: payment.paymentDate,
      memberName: this.getMemberName(payment.memberId),
      referenceId: payment.referenceId || 'N/A',
      amount: payment.amount,
      status: this.getStatusText(payment.status)
    }));

    try {
      this.exportService.exportPaymentsToCSV(exportData, false);
      this.showAlertMessage('success', 'Historial de pagos exportado a CSV exitosamente');
    } catch (error) {
      console.error('Error al exportar historial de pagos a CSV:', error);
      this.showAlertMessage('error', 'Error al exportar historial de pagos a CSV');
    }

    this.isExportingPaymentHistory = false;
  }

  // initMercadoPago(): void {
  //   this.loadingPaymentBrick = true;
  //
  //   // Asegúrate de tener un ID público de MercadoPago
  //   const PUBLIC_KEY = 'TEST-1234567890abcdef1234567890abcdef';
  //
  //   // Inicializa el SDK
  //   this.mpInstance = new MercadoPago(PUBLIC_KEY, {
  //     locale: 'es-AR'
  //   });
  //
  //   // Recupera la información para crear la preferencia
  //   const selectedFees = this.getSelectedFeesDetails();
  //   const totalAmount = this.calculateTotalAmount();
  //   const member = this.selectedMember || this.familyGroup?.members[0];
  //
  //   if (!member || !member.id) {
  //     this.showAlertMessage('error', 'No se pudo identificar al miembro para el pago');
  //     this.loadingPaymentBrick = false;
  //     return;
  //   }
  //
  //   // Primero crea la preferencia en el backend
  //   this.paymentService.createPaymentPreference({
  //     externalReferenceId: '', paymentType: '',
  //     memberId: member.id,
  //     items: selectedFees.map(fee => ({
  //       feeId: fee.id,
  //       description: fee.description,
  //       period: fee.period,
  //       amount: fee.amount
  //     })),
  //     totalAmount: totalAmount
  //   }).subscribe({
  //     next: (preferenceResponse) => {
  //       // Inicializa el Brick de Card Payment
  //       const cardPaymentBrickSettings = {
  //         initialization: {
  //           amount: totalAmount,
  //           preferenceId: preferenceResponse.preferenceId
  //         },
  //         customization: {
  //           visual: {
  //             style: {
  //               theme: 'default'
  //             }
  //           }
  //         },
  //         callbacks: {
  //           onReady: () => {
  //             this.loadingPaymentBrick = false;
  //           },
  //           onError: (error: any) => {
  //             console.error('Error en MercadoPago Brick:', error);
  //             this.loadingPaymentBrick = false;
  //             this.showAlertMessage('error', 'Hubo un problema con el servicio de pago');
  //           },
  //           onSubmit: (cardFormData: any) => {
  //             this.processCardPayment(cardFormData, preferenceResponse.preferenceId);
  //           }
  //         }
  //       };
  //
  //       const brickContainer = document.getElementById('mercadopago-bricks-container');
  //       if (brickContainer) {
  //         // Renderiza el Brick
  //         this.mpCardPaymentBrickController = this.mpInstance.bricks().create('cardPayment', cardPaymentBrickSettings, brickContainer);
  //       } else {
  //         console.error('No se encontró el contenedor para el Brick de MercadoPago');
  //         this.loadingPaymentBrick = false;
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error al crear preferencia de pago:', error);
  //       this.loadingPaymentBrick = false;
  //       this.showAlertMessage('error', 'No se pudo inicializar el servicio de pago');
  //     }
  //   });
  // }
  //
  // processCardPayment(cardFormData: any, preferenceId: string): void {
  //   this.processingPayment = true;
  //
  //   // Envía los datos del formulario al backend para procesar el pago
  //   this.paymentService.processPayment({
  //     cardFormData: cardFormData,
  //     preferenceId: preferenceId,
  //     feeIds: this.selectedFees
  //   }).subscribe({
  //     next: (response) => {
  //       this.processingPayment = false;
  //       this.closePaymentModal();
  //
  //       if (response.status === 'success') {
  //         this.selectedPayment = response.payment;
  //         this.showSuccessModal = true;
  //       } else {
  //         this.showAlertMessage('error', response.message || 'El pago no pudo ser procesado');
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error al procesar pago:', error);
  //       this.processingPayment = false;
  //       this.showAlertMessage('error', 'Hubo un problema al procesar el pago');
  //     }
  //   });
  // }
  //
  // processPayment(): void {
  //   // Este método se llama desde el botón "Confirmar pago"
  //   // El procesamiento real lo gestiona MercadoPago al hacer submit del formulario
  //   // Por lo que este método queda para compatibilidad con la plantilla
  //   if (this.mpCardPaymentBrickController) {
  //     this.processingPayment = true;
  //   } else {
  //     this.showAlertMessage('error', 'No se pudo inicializar el servicio de pago');
  //   }
  // }

  // Métodos para balance de cuenta
  loadMemberBalance(): void {
    if (!this.selectedMember?.id) {
      this.memberBalance = 0;
      this.showBalanceSection = false;
      return;
    }

    this.paymentService.getMemberBalance(this.selectedMember.id).subscribe({
      next: (response) => {
        this.memberBalance = response.balance || 0;
        this.showBalanceSection = true;
      },
      error: (error) => {
        console.error('Error loading member balance:', error);
        this.memberBalance = 0;
        this.showBalanceSection = false;
        this.showAlertMessage('error', 'No se pudo cargar el balance del miembro');
      }
    });
  }

  getMaxBalanceToUse(): number {
    if (!this.selectedFees.length) return 0;
    const totalAmount = this.calculateTotalAmount();
    return Math.min(this.memberBalance, totalAmount);
  }

  canApplyBalance(): boolean {
    return this.memberBalance > 0 && this.selectedFees.length > 0;
  }

  applyBalanceToSelectedFees(): void {
    if (!this.selectedMember?.id || !this.canApplyBalance()) {
      this.showAlertMessage('error', 'No se puede aplicar balance en este momento');
      return;
    }

    const totalAmount = this.calculateTotalAmount();
    const balanceToUse = Math.min(this.memberBalance, totalAmount);
    
    // Mostrar confirmación
    const message = `¿Aplicar $${balanceToUse} de tu balance a las cuotas seleccionadas?\n\n` +
                   `Balance actual: $${this.memberBalance}\n` +
                   `Total cuotas: $${totalAmount}\n` +
                   `${balanceToUse < totalAmount ? `Restante a pagar: $${totalAmount - balanceToUse}` : 'Las cuotas quedarán completamente pagadas'}`;
    
    if (!confirm(message)) {
      return;
    }

    this.paymentService.applyBalanceToFees(this.selectedMember.id, this.selectedFees).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.showAlertMessage('success', response.message);
          
          // Actualizar datos
          this.memberBalance = response.remainingBalance;
          this.loadPendingFees(); // Recargar cuotas para ver los cambios
          this.selectedFees = []; // Limpiar selección
          
          if (response.feesPaidCompletely > 0) {
            this.showAlertMessage('success', 
              `¡${response.feesPaidCompletely} cuota(s) pagada(s) completamente con balance!`);
          }
        } else {
          this.showAlertMessage('error', response.message);
        }
      },
      error: (error) => {
        console.error('Error applying balance:', error);
        this.showAlertMessage('error', 'Error al aplicar balance a las cuotas');
      }
    });
  }

}
