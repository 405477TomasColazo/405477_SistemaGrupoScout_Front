import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {EventFilter, EventRegistration,Event} from '../../core/models/events.model';
import {SectionMember} from '../../core/models/user.model';
import {AuthService} from '../../core/auth/auth.service';
import {EventService} from '../../core/services/event.service';
import {ExportService} from '../../core/services/export.service';
import {ExportButtonsComponent} from '../components/export-buttons/export-buttons.component';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {join} from '@angular/compiler-cli';

@Component({
  selector: 'app-event-management',
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    ExportButtonsComponent
  ],
  templateUrl: './event-management.component.html',
  styleUrl: './event-management.component.css'
})
export class EventManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado principal
  events: Event[] = [];
  filteredEvents: Event[] = [];
  currentUser: any = null;
  userSection: string = '';
  canCreateForAllSections = false;

  // Estados de UI
  showEventModal = false;
  showDetailsModal = false;
  showInviteMembersModal = false;
  showDeleteConfirmModal = false;
  showAlert = false;
  alertType: 'success' | 'error' = 'success';
  alertText = '';
  loading = false;

  // Formularios y filtros
  eventForm!: FormGroup;
  filters: EventFilter = {};
  searchTerm = '';

  // Datos para modales
  selectedEvent: Event | null = null;
  eventToDelete: Event | null = null;
  availableMembers: SectionMember[] = [];
  selectedMembers: number[] = [];
  eventRegistrations: EventRegistration[] = [];

  // Export state
  isExportingEvents = false;
  isExportingParticipants = false;

  // Opciones
  eventTypes = [
    { value: 'campamento', label: 'Campamento' },
    { value: 'salida', label: 'Salida' },
    { value: 'reunion', label: 'Reunión' },
    { value: 'actividad', label: 'Actividad Especial' },
    { value: 'otro', label: 'Otro' }
  ];

  sections = [
    { value: 'manada', label: 'Manada' },
    { value: 'unidad', label: 'Unidad Scout' },
    { value: 'caminantes', label: 'Caminantes' },
    { value: 'rovers', label: 'Rovers' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private eventService: EventService,
    private exportService: ExportService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Obtener usuario actual y su sección
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.checkUserPermissions();
          this.loadEvents();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      eventType: ['campamento', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      location: ['', Validators.required],
      sections: [[], Validators.required],
      cost: [0, [Validators.min(0)]],
      maxCapacity: [null, [Validators.min(1)]],
      registrationDeadline: [''],
      invitationType: ['all', Validators.required],
      requiresPayment: [false],
      paymentDeadline: [''],
      notes: ['']
    });

    // Listener para manejar el campo de pago
    this.eventForm.get('requiresPayment')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(requiresPayment => {
        const costControl = this.eventForm.get('cost');
        const paymentDeadlineControl = this.eventForm.get('paymentDeadline');

        if (requiresPayment) {
          costControl?.setValidators([Validators.required, Validators.min(1)]);
          paymentDeadlineControl?.setValidators([Validators.required]);
        } else {
          costControl?.setValidators([Validators.min(0)]);
          paymentDeadlineControl?.clearValidators();
        }

        costControl?.updateValueAndValidity();
        paymentDeadlineControl?.updateValueAndValidity();
      });
  }

  checkUserPermissions(): void {
    // Verificar si el usuario puede crear eventos para todas las secciones
    this.canCreateForAllSections = this.currentUser?.roles?.includes('COORDINATOR') ||
      this.currentUser?.roles?.includes('ROLE_ADMIN');

    // TODO: Obtener la sección asignada del educador desde el backend
    // Por ahora, simulamos que viene del usuario
    this.userSection = this.currentUser?.section || 'manada';
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.events = events;
          this.applyLocalFilters();
          this.loading = false;
        },
        error: (error) => {
          this.showAlertMessage('Error al cargar los eventos', 'error');
          this.loading = false;
        }
      });
  }

  applyLocalFilters(): void {
    this.filteredEvents = this.events.filter(event => {
      // Filtrar por término de búsqueda
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const matchesSearch = event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          event.location.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Si no es coordinador/admin, solo ver eventos de su sección
      if (!this.canCreateForAllSections) {
        const hasPermission = event.sections.includes('all') ||
          event.sections.includes(this.userSection);
        if (!hasPermission) return false;
      }

      return true;
    });
  }

  openEventModal(event?: Event): void {
    if (event) {
      // Modo edición
      this.selectedEvent = event;
      this.eventForm.patchValue({
        ...event,
        startDate: this.formatDateForInput(event.startDate),
        endDate: this.formatDateForInput(event.endDate),
        registrationDeadline: event.registrationDeadline ?
          this.formatDateForInput(event.registrationDeadline) : '',
        paymentDeadline: event.paymentDeadline ?
          this.formatDateForInput(event.paymentDeadline) : ''
      });
    } else {
      // Modo creación
      this.selectedEvent = null;
      this.eventForm.reset({
        eventType: 'campamento',
        invitationType: 'all',
        requiresPayment: false,
        cost: 0,
        sections: this.canCreateForAllSections ? [] : [this.userSection]
      });
    }

    this.showEventModal = true;
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.selectedEvent = null;
    this.eventForm.reset();
  }

  saveEvent(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      return;
    }

    const eventData: Event = {
      ...this.eventForm.value,
      createdBy: this.currentUser.id,
      status: 'published'
    };

    const operation = this.selectedEvent ?
      this.eventService.updateEvent(this.selectedEvent.id!, eventData) :
      this.eventService.createEvent(eventData);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (savedEvent) => {
        this.showAlertMessage(
          this.selectedEvent ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente',
          'success'
        );
        this.closeEventModal();
        this.loadEvents();

        // Si es nuevo y tiene invitationType 'selected', abrir modal de invitados
        if (!this.selectedEvent && eventData.invitationType === 'selected') {
          this.openInviteMembersModal(savedEvent);
        }
      },
      error: (error) => {
        this.showAlertMessage('Error al guardar el evento', 'error');
      }
    });
  }

  openDetailsModal(event: Event): void {
    this.selectedEvent = event;
    this.loadEventRegistrations(event.id!);
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedEvent = null;
    this.eventRegistrations = [];
  }

  loadEventRegistrations(eventId: number): void {
    this.eventService.getEventRegistrations(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (registrations) => {
          this.eventRegistrations = registrations;
        },
        error: (error) => {
          console.error('Error al cargar registros:', error);
        }
      });
  }

  openInviteMembersModal(event: Event): void {
    this.selectedEvent = event;
    this.selectedMembers = event.invitedMembers || [];

    // Cargar miembros disponibles según las secciones del evento
    this.eventService.getMembersBySection(event.sections)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.availableMembers = members.filter(m => !m.isEducator);
          this.showInviteMembersModal = true;
        },
        error: (error) => {
          this.showAlertMessage('Error al cargar miembros', 'error');
        }
      });
  }

  closeInviteMembersModal(): void {
    this.showInviteMembersModal = false;
    this.selectedMembers = [];
    this.availableMembers = [];
  }

  toggleMemberSelection(memberId: number): void {
    const index = this.selectedMembers.indexOf(memberId);
    if (index > -1) {
      this.selectedMembers.splice(index, 1);
    } else {
      this.selectedMembers.push(memberId);
    }
  }

  toggleAllMembers(): void {
    if (this.selectedMembers.length === this.availableMembers.length) {
      this.selectedMembers = [];
    } else {
      this.selectedMembers = this.availableMembers.map(m => m.id);
    }
  }

  saveInvitations(): void {
    if (!this.selectedEvent || this.selectedMembers.length === 0) return;

    const updatedEvent: Partial<Event> = {
      invitedMembers: this.selectedMembers
    };

    this.eventService.updateEvent(this.selectedEvent.id!, updatedEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showAlertMessage('Invitaciones guardadas exitosamente', 'success');
          this.closeInviteMembersModal();
          this.loadEvents();
        },
        error: (error) => {
          this.showAlertMessage('Error al guardar invitaciones', 'error');
        }
      });
  }

  confirmDelete(event: Event): void {
    this.eventToDelete = event;
    this.showDeleteConfirmModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteConfirmModal = false;
    this.eventToDelete = null;
  }

  deleteEvent(): void {
    if (!this.eventToDelete) return;

    this.eventService.deleteEvent(this.eventToDelete.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showAlertMessage('Evento eliminado exitosamente', 'success');
          this.closeDeleteModal();
          this.loadEvents();
        },
        error: (error) => {
          this.showAlertMessage('Error al eliminar el evento', 'error');
        }
      });
  }

  applyFilters(): void {
    this.loadEvents();
  }

  clearFilters(): void {
    this.filters = {};
    this.searchTerm = '';
    this.loadEvents();
  }

  // Métodos auxiliares
  showAlertMessage(message: string, type: 'success' | 'error'): void {
    this.alertText = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEventTypeLabel(type: string): string {
    return this.eventTypes.find(t => t.value === type)?.label || type;
  }

  getSectionLabel(section: string): string {
    if (section === 'all') return 'Todas las secciones';
    return this.sections.find(s => s.value === section)?.label || section;
  }

  getStatusBadgeClasses(status: string): string {
    const classes = {
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const labels = {
      'draft': 'Borrador',
      'published': 'Publicado',
      'cancelled': 'Cancelado',
      'completed': 'Finalizado'
    };
    return labels[status as keyof typeof labels] || status;
  }

  canEditEvent(event: Event): boolean {
    return event.createdBy === this.currentUser?.id ||
      this.currentUser?.roles?.includes('ADMIN');
  }

  getRegistrationStats(event: Event): string {
    if (!event.currentCapacity) return '0 inscriptos';
    if (event.maxCapacity) {
      return `${event.currentCapacity}/${event.maxCapacity} inscriptos`;
    }
    return `${event.currentCapacity} inscriptos`;
  }

  toggleSection(section: string): void {
    const sections = this.eventForm.get('sections')?.value || [];
    const index = sections.indexOf(section);

    if (index > -1) {
      sections.splice(index, 1);
    } else {
      sections.push(section);
    }

    this.eventForm.patchValue({ sections });
  }

  toggleAllSections(): void {
    const allSections = this.sections.map(s => s.value);
    const currentSections = this.eventForm.get('sections')?.value || [];

    if (currentSections.length === allSections.length) {
      this.eventForm.patchValue({ sections: [] });
    } else {
      this.eventForm.patchValue({ sections: allSections });
    }
  }

  getRegistrationStatusLabel(status: string): string {
    const labels = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'cancelled': 'Cancelado',
      'waitlist': 'Lista de espera'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getPaymentStatusLabel(status: string): string {
    const labels = {
      'pending': 'Pendiente',
      'paid': 'Pagado',
      'exempt': 'Exento'
    };
    return labels[status as keyof typeof labels] || status;
  }

  // Declaración de Math para uso en el template
  Math = Math;

  // Helper methods for template
  getSectionLabelsJoined(sections: string[]): string {
    return sections.map(s => this.getSectionLabel(s)).join(', ');
  }

  isSectionSelected(sectionValue: string): boolean {
    return this.eventForm.get('sections')?.value?.includes(sectionValue) || false;
  }

  areAllSectionsSelected(): boolean {
    return this.eventForm.get('sections')?.value?.length === this.sections.length;
  }

  // Export Methods for Events List
  exportEventsToPDF(): void {
    if (this.filteredEvents.length === 0) return;
    this.isExportingEvents = true;
    
    try {
      const exportData = this.filteredEvents.map(event => ({
        title: event.title,
        eventType: this.getEventTypeLabel(event.eventType),
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        sections: this.getSectionLabelsJoined(event.sections),
        status: this.getStatusLabel(event.status),
        capacity: this.getRegistrationStats(event),
        cost: event.requiresPayment ? `$${event.cost}` : 'Gratuito'
      }));
      
      const columns = [
        { key: 'title', header: 'Título', type: 'text' as const },
        { key: 'eventType', header: 'Tipo', type: 'text' as const },
        { key: 'startDate', header: 'Fecha Inicio', type: 'date' as const },
        { key: 'endDate', header: 'Fecha Fin', type: 'date' as const },
        { key: 'location', header: 'Ubicación', type: 'text' as const },
        { key: 'sections', header: 'Secciones', type: 'text' as const },
        { key: 'status', header: 'Estado', type: 'text' as const },
        { key: 'capacity', header: 'Capacidad', type: 'text' as const },
        { key: 'cost', header: 'Costo', type: 'text' as const }
      ];
      
      this.exportService.exportToPDF(exportData, columns, 'listado-eventos', 'Listado de Eventos');
    } catch (error) {
      console.error('Error al exportar eventos a PDF:', error);
    }
    
    this.isExportingEvents = false;
  }

  exportEventsToCSV(): void {
    if (this.filteredEvents.length === 0) return;
    this.isExportingEvents = true;
    
    try {
      const exportData = this.filteredEvents.map(event => ({
        title: event.title,
        eventType: this.getEventTypeLabel(event.eventType),
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        sections: this.getSectionLabelsJoined(event.sections),
        status: this.getStatusLabel(event.status),
        capacity: this.getRegistrationStats(event),
        cost: event.requiresPayment ? `$${event.cost}` : 'Gratuito'
      }));
      
      const columns = [
        { key: 'title', header: 'Título', type: 'text' as const },
        { key: 'eventType', header: 'Tipo', type: 'text' as const },
        { key: 'startDate', header: 'Fecha Inicio', type: 'date' as const },
        { key: 'endDate', header: 'Fecha Fin', type: 'date' as const },
        { key: 'location', header: 'Ubicación', type: 'text' as const },
        { key: 'sections', header: 'Secciones', type: 'text' as const },
        { key: 'status', header: 'Estado', type: 'text' as const },
        { key: 'capacity', header: 'Capacidad', type: 'text' as const },
        { key: 'cost', header: 'Costo', type: 'text' as const }
      ];
      
      this.exportService.exportToCSV(exportData, columns, 'listado-eventos');
    } catch (error) {
      console.error('Error al exportar eventos a CSV:', error);
    }
    
    this.isExportingEvents = false;
  }

  // Export Methods for Participants Table
  exportParticipantsToPDF(): void {
    if (!this.selectedEvent || this.eventRegistrations.length === 0) return;
    this.isExportingParticipants = true;
    
    try {
      const exportData = this.eventRegistrations.map(registration => ({
        participantName: `${registration.memberName} ${registration.memberLastName}`,
        registrationDate: registration.registrationDate,
        status: this.getRegistrationStatusLabel(registration.status),
        paymentStatus: this.selectedEvent!.requiresPayment ? 
          this.getPaymentStatusLabel(registration.paymentStatus || 'pending') : 'N/A'
      }));
      
      const columns = [
        { key: 'participantName', header: 'Participante', type: 'text' as const },
        { key: 'registrationDate', header: 'Fecha de Inscripción', type: 'date' as const },
        { key: 'status', header: 'Estado', type: 'text' as const },
        { key: 'paymentStatus', header: 'Estado de Pago', type: 'text' as const }
      ];
      
      this.exportService.exportToPDF(
        exportData, 
        columns, 
        `participantes-${this.selectedEvent.title.replace(/\s+/g, '-').toLowerCase()}`, 
        `Participantes - ${this.selectedEvent.title}`
      );
    } catch (error) {
      console.error('Error al exportar participantes a PDF:', error);
    }
    
    this.isExportingParticipants = false;
  }

  exportParticipantsToCSV(): void {
    if (!this.selectedEvent || this.eventRegistrations.length === 0) return;
    this.isExportingParticipants = true;
    
    try {
      const exportData = this.eventRegistrations.map(registration => ({
        participantName: `${registration.memberName} ${registration.memberLastName}`,
        registrationDate: registration.registrationDate,
        status: this.getRegistrationStatusLabel(registration.status),
        paymentStatus: this.selectedEvent!.requiresPayment ? 
          this.getPaymentStatusLabel(registration.paymentStatus || 'pending') : 'N/A'
      }));
      
      const columns = [
        { key: 'participantName', header: 'Participante', type: 'text' as const },
        { key: 'registrationDate', header: 'Fecha de Inscripción', type: 'date' as const },
        { key: 'status', header: 'Estado', type: 'text' as const },
        { key: 'paymentStatus', header: 'Estado de Pago', type: 'text' as const }
      ];
      
      this.exportService.exportToCSV(
        exportData, 
        columns, 
        `participantes-${this.selectedEvent.title.replace(/\s+/g, '-').toLowerCase()}`
      );
    } catch (error) {
      console.error('Error al exportar participantes a CSV:', error);
    }
    
    this.isExportingParticipants = false;
  }
}
