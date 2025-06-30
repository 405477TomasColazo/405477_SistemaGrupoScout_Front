import {Component, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, Subject, takeUntil} from 'rxjs';
import {FamilyGroup, MemberProtagonist} from '../../core/models/family-group.model';
import {CalendarDay, EventRegistration, Event, CalendarEvent} from '../../core/models/events.model';
import {AuthService} from '../../core/auth/auth.service';
import {EventService} from '../../core/services/event.service';
import {FamilyGroupService} from '../../core/services/family-group.service';
import {PaymentService} from '../../core/services/payment.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-family-events',
  imports: [
    NgIf,
    NgClass,
    NgForOf
  ],
  templateUrl: './family-events.component.html',
  styleUrl: './family-events.component.css'
})
export class FamilyEventsComponent implements OnInit,OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado principal
  familyGroup: FamilyGroup | null = null;
  allEvents: Event[] = [];
  filteredEvents: Event[] = [];
  familyRegistrations: Map<number, EventRegistration[]> = new Map();

  // Estados de UI
  viewMode: 'calendar' | 'list' | 'agenda' = 'calendar';
  selectedMemberId: number | null = null;
  showEventDetailsModal = false;
  showConfirmModal = false;
  selectedEvent: Event | null = null;
  membersToRegister: number[] = [];
  loading = false;
  showAlert = false;
  alertType: 'success' | 'error' | 'info' = 'success';
  alertText = '';
  
  // Estados para pagos
  showPaymentModal = false;
  paymentLoading = false;
  pendingEventPayments: Map<number, any[]> = new Map(); // eventId -> registrations que requieren pago

  // Calendario
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Colores por sección (aplicado como fondo del evento)
  sectionColors = {
    manada: 'bg-orange-500',
    unidad: 'bg-green-500', 
    caminantes: 'bg-blue-500',
    rovers: 'bg-red-500',
    all: 'bg-gray-500'
  };

  // Iconos por tipo de evento
  eventIcons = {
    campamento: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    salida: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    reunion: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    actividad: 'M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    otro: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  };

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private familyService: FamilyGroupService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFamilyData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFamilyData(): void {
    this.loading = true;

    combineLatest([
      this.authService.currentUser$,
      this.familyService.getFamilyGroup()
    ]).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([user, familyGroup]) => {
          if (user && familyGroup) {
            this.familyGroup = familyGroup;
            this.loadEvents();
            console.log(this.familyRegistrations)
          }
        },
        error: (error) => {
          this.showAlertMessage('Error al cargar datos familiares', 'error');
          this.loading = false;
        }
      });
  }

  loadEvents(): void {
    if (!this.familyGroup) return;

    // Obtener todas las secciones de los miembros de la familia
    const sections = [...new Set(this.familyGroup.members.map(m => m.section))];

    this.eventService.getEvents({ sections })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.allEvents = events.filter(e => e.status === 'published');
          this.loadRegistrations();
        },
        error: (error) => {
          this.showAlertMessage('Error al cargar eventos', 'error');
          this.loading = false;
        }
      });
  }

  loadRegistrations(): void {
    const registrationPromises = this.allEvents.map(event =>
      this.eventService.getEventRegistrations(event.id!).toPromise()
        .then(registrations => {
          if (registrations) {
            this.familyRegistrations.set(event.id!, registrations);
          }
        })
    );

    Promise.all(registrationPromises).then(() => {
      this.loadEventPaymentStatus();
      this.filterEvents();
      this.generateCalendar();
      this.loading = false;
    });
  }

  loadEventPaymentStatus(): void {
    if (!this.familyGroup) return;

    // Cargar estado de pagos para todos los eventos que requieren pago
    const paymentPromises = this.allEvents
      .filter(event => event.requiresPayment)
      .map(event => this.loadEventPaymentStatusForEvent(event));

    Promise.all(paymentPromises);
  }

  private loadEventPaymentStatusForEvent(event: Event): Promise<void> {
    if (!this.familyGroup) return Promise.resolve();

    const memberPromises = this.familyGroup.members.map(member =>
      this.paymentService.getPendingFeed(member.id!).toPromise()
        .then(fees => {
          const eventFees = fees?.filter(fee => 
            fee.description.startsWith('Evento:') && 
            fee.description.includes(event.title)
          ) || [];
          return { member, eventFees };
        })
    );

    return Promise.all(memberPromises).then(results => {
      const pendingPayments = results.filter(r => r.eventFees.length > 0);
      if (pendingPayments.length > 0) {
        this.pendingEventPayments.set(event.id!, pendingPayments);
      }
    });
  }

  filterEvents(): void {
    if (!this.familyGroup) return;

    this.filteredEvents = this.allEvents.filter(event => {
      // Verificar si el evento es para las secciones de la familia
      const familySections = this.familyGroup!.members.map(m => m.section.toLowerCase());
      const hasMatchingSection = event.sections.some(s =>
        s === 'all' || familySections.includes(s.toLowerCase())
      );

      if (!hasMatchingSection) return false;

      // Si hay un miembro seleccionado, filtrar por ese miembro
      if (this.selectedMemberId) {
        const member = this.familyGroup!.members.find(m => m.id === this.selectedMemberId);
        if (!member) return false;

        // Verificar si el evento es para la sección del miembro
        const isSectionMatch = event.sections.includes('all') ||
          event.sections.some(s => s.toLowerCase() === member.section.toLowerCase());

        if (!isSectionMatch) return false;

        // Si es invitación específica, verificar si el miembro está invitado
        if (event.invitationType === 'selected' && event.invitedMembers) {
          return event.invitedMembers.includes(member.id!);
        }
      }

      return true;
    });
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    // Obtener el primer día de la semana del calendario
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Obtener el último día de la semana del calendario
    const endDate = new Date(lastDay);
    const daysToAdd = 6 - lastDay.getDay();
    endDate.setDate(endDate.getDate() + daysToAdd);

    this.calendarDays = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayEvents = this.getEventsForDay(currentDate);

      this.calendarDays.push({
        date: new Date(currentDate),
        dayNumber: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isSameDay(currentDate, today),
        events: dayEvents
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  getEventsForDay(date: Date): CalendarEvent[] {
    const dayEvents: CalendarEvent[] = [];

    this.filteredEvents.forEach(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // Normalizar las fechas para comparación
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);

      if (eventStart <= dayEnd && eventEnd >= dayStart) {
        const startOnDay = this.isSameDay(eventStart, date);
        const endOnDay = this.isSameDay(eventEnd, date);
        const daySpan = Math.ceil((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Obtener miembros de la familia registrados en este evento
        const registrations = this.familyRegistrations.get(event.id!) || [];
        const familyMemberIds = this.familyGroup?.members.map(m => m.id!) || [];
        const registeredMemberIds = registrations
          .filter(r => familyMemberIds.includes(r.memberId) && r.status !== 'cancelled')
          .map(r => r.memberId);

        dayEvents.push({
          event,
          startOnDay,
          endOnDay,
          continuesFromPrevious: !startOnDay && eventStart < dayStart,
          continuesToNext: !endOnDay && eventEnd > dayEnd,
          daySpan,
          memberIds: registeredMemberIds
        });
      }
    });

    return dayEvents;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.currentDate = new Date(this.currentDate);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.currentDate = new Date(this.currentDate);
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
  }

  selectMember(memberId: number | null): void {
    this.selectedMemberId = memberId;
    this.filterEvents();
    if (this.viewMode === 'calendar') {
      this.generateCalendar();
    }
  }

  changeView(mode: 'calendar' | 'list' | 'agenda'): void {
    this.viewMode = mode;
    if (mode === 'calendar') {
      this.generateCalendar();
    }
  }

  openEventDetails(event: Event): void {
    this.selectedEvent = event;
    this.showEventDetailsModal = true;
  }

  closeEventDetailsModal(): void {
    this.showEventDetailsModal = false;
    this.selectedEvent = null;
  }

  openConfirmAttendanceModal(event: Event): void {
    if (!this.familyGroup) return;

    this.selectedEvent = event;
    const registrations = this.familyRegistrations.get(event.id!) || [];
    const familyMemberIds = this.familyGroup.members.map(m => m.id!);
    const registeredMemberIds = registrations
      .filter(r => r.status !== 'cancelled')
      .map(r => r.memberId);

    // Pre-seleccionar miembros que pueden asistir y no están registrados
    this.membersToRegister = this.familyGroup.members
      .filter(member => {
        // Verificar si el evento es para su sección
        const canAttend = event.sections.includes('all') ||
          event.sections.some(s => s.toLowerCase() === member.section.toLowerCase());

        // Si es invitación específica, verificar si está invitado
        if (event.invitationType === 'selected' && event.invitedMembers) {
          return canAttend &&
            event.invitedMembers.includes(member.id!) &&
            !registeredMemberIds.includes(member.id!);
        }

        return canAttend && !registeredMemberIds.includes(member.id!);
      })
      .map(m => m.id!);

    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.selectedEvent = null;
    this.membersToRegister = [];
  }

  toggleMemberForRegistration(memberId: number): void {
    const index = this.membersToRegister.indexOf(memberId);
    if (index > -1) {
      this.membersToRegister.splice(index, 1);
    } else {
      this.membersToRegister.push(memberId);
    }
  }

  confirmAttendance(): void {
    if (!this.selectedEvent || this.membersToRegister.length === 0) return;

    this.loading = true;
    this.eventService.registerMembersToEvent(this.selectedEvent.id!, this.membersToRegister)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (registrations) => {
          this.showAlertMessage(
            `Se confirmó la asistencia de ${registrations.length} miembro(s)`,
            'success'
          );
          this.closeConfirmModal();
          this.loadRegistrations();
          
          // Si el evento requiere pago, mostrar modal de pago
          if (this.selectedEvent?.requiresPayment && this.selectedEvent?.cost && this.selectedEvent.cost > 0) {
            this.checkForEventPayments();
          }
        },
        error: (error) => {
          this.showAlertMessage('Error al confirmar asistencia', 'error');
          this.loading = false;
        }
      });
  }

  cancelRegistration(eventId: number, memberId: number): void {
    const registrations = this.familyRegistrations.get(eventId) || [];
    const registration = registrations.find(r => r.memberId === memberId);

    if (!registration) return;

    this.loading = true;
    this.eventService.updateRegistration(eventId, registration.id!, 'cancelled')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showAlertMessage('Asistencia cancelada exitosamente', 'success');
          this.loadRegistrations();
        },
        error: (error) => {
          this.showAlertMessage('Error al cancelar asistencia', 'error');
          this.loading = false;
        }
      });
  }

  confirmPendingRegistrations(event: Event): void {
    if (!this.familyGroup) return;

    const registrations = this.familyRegistrations.get(event.id!) || [];
    const familyMemberIds = this.familyGroup.members.map(m => m.id!);
    
    const pendingRegistrations = registrations.filter(r => 
      familyMemberIds.includes(r.memberId) && r.status === 'pending'
    );

    if (pendingRegistrations.length === 0) return;

    this.loading = true;

    // Confirmar cada registración pendiente
    const confirmPromises = pendingRegistrations.map(reg =>
      this.eventService.updateRegistration(event.id!, reg.id!, 'confirmed').toPromise()
    );

    Promise.all(confirmPromises).then(() => {
      this.showAlertMessage(
        `Se confirmó la asistencia de ${pendingRegistrations.length} miembro(s)`,
        'success'
      );
      this.loadRegistrations();
      
      // Si el evento requiere pago, mostrar modal de pago
      if (event.requiresPayment && event.cost && event.cost > 0) {
        this.selectedEvent = event;
        this.checkForEventPayments();
      }
      this.loading = false;
    }).catch(error => {
      this.showAlertMessage('Error al confirmar asistencia', 'error');
      this.loading = false;
    });
  }

  exportToCalendar(event: Event): void {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Grupo Scout//ES
BEGIN:VEVENT
UID:${event.id}@gruposcout.com
DTSTAMP:${this.formatDateForICS(new Date())}
DTSTART:${this.formatDateForICS(startDate)}
DTEND:${this.formatDateForICS(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  formatDateForICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  // Métodos auxiliares
  getMemberName(memberId: number): string {
    const member = this.familyGroup?.members.find(m => m.id === memberId);
    return member ? `${member.name} ${member.lastName}` : '';
  }

  getMemberInitials(member: MemberProtagonist): string {
    return `${member.name.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
  }

  getMemberInitialsById(memberId: number): string {
    const member = this.familyGroup?.members.find(m => m.id === memberId);
    if (!member) return '?';
    return `${member.name.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
  }

  getEventTypeLabel(type: string): string {
    const labels = {
      'campamento': 'Campamento',
      'salida': 'Salida',
      'reunion': 'Reunión',
      'actividad': 'Actividad Especial',
      'otro': 'Otro'
    };
    return labels[type as keyof typeof labels] || type;
  }

  getSectionLabel(section: string): string {
    const labels = {
      'manada': 'Manada',
      'unidad': 'Unidad Scout',
      'caminantes': 'Caminantes',
      'rovers': 'Rovers'
    };
    return labels[section as keyof typeof labels] || section;
  }

  getEventColorClass(event: Event): string {
    // Si el evento es para múltiples secciones, usar color neutro
    if (event.sections.length > 1 || event.sections.includes('all')) {
      return this.sectionColors['all'];
    }
    // Si es para una sección específica, usar el color de esa sección
    const section = event.sections[0]?.toLowerCase();
    return this.sectionColors[section as keyof typeof this.sectionColors] || this.sectionColors['all'];
  }

  getEventIconPath(eventType: string): string {
    return this.eventIcons[eventType as keyof typeof this.eventIcons] || this.eventIcons['otro'];
  }

  getSectionColorClass(section: string): string {
    return this.sectionColors[section as keyof typeof this.sectionColors] || 'bg-gray-500';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateShort(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  getDaysUntilEvent(event: Event): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.startDate);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isEventFull(event: Event): boolean {
    return event.maxCapacity ? (event.currentCapacity || 0) >= event.maxCapacity : false;
  }

  canRegisterForEvent(event: Event, memberId: number): boolean {
    if (!this.familyGroup) return false;

    const member = this.familyGroup.members.find(m => m.id === memberId);
    if (!member) return false;

    // Verificar si el evento ya pasó
    if (new Date(event.startDate) < new Date()) return false;

    // Verificar si hay cupo
    if (this.isEventFull(event)) return false;

    // Verificar si ya está registrado
    const registrations = this.familyRegistrations.get(event.id!) || [];
    const isRegistered = registrations.some(r =>
      r.memberId === memberId && r.status !== 'cancelled'
    );
    if (isRegistered) return false;

    // Verificar si el evento es para su sección
    const canAttend = event.sections.includes('all') ||
      event.sections.some(s => s.toLowerCase() === member.section.toLowerCase());

    // Si es invitación específica, verificar si está invitado
    if (event.invitationType === 'selected' && event.invitedMembers) {
      return canAttend && event.invitedMembers.includes(memberId);
    }

    return canAttend;
  }

  getMemberRegistrationStatus(eventId: number, memberId: number): EventRegistration | null {
    const registrations = this.familyRegistrations.get(eventId) || [];
    return registrations.find(r => r.memberId === memberId) || null;
  }

  getUpcomingEvents(): Event[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.filteredEvents
      .filter(event => new Date(event.startDate) >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  }

  showAlertMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.alertText = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  getEventDayNumber(event: Event): number {
    return event.startDate ? new Date(event.startDate).getDate() : 0;
  }

  getEventMonth(event: Event): string {
    return event.startDate ? this.months[new Date(event.startDate).getMonth()].slice(0, 3) : '';
  }

  getEventSections(event: Event): string {
    return event.sections ? event.sections.map(s => this.getSectionLabel(s)).join(', ') : '';
  }

  isSameDayDates(date1: Date | string, date2: Date | string): boolean {
    return this.isSameDay(new Date(date1), new Date(date2));
  }

  canFamilyRegisterForEvent(event: Event): boolean {
    return this.familyGroup ? this.familyGroup.members.some(m => this.canRegisterForEvent(event, m.id!)) : false;
  }

  hasFamilyPendingRegistrations(event: Event): boolean {
    if (!this.familyGroup) return false;
    
    const registrations = this.familyRegistrations.get(event.id!) || [];
    const familyMemberIds = this.familyGroup.members.map(m => m.id!);
    
    return registrations.some(r => 
      familyMemberIds.includes(r.memberId) && r.status === 'pending'
    );
  }

  hasFamilyConfirmedRegistrations(event: Event): boolean {
    if (!this.familyGroup) return false;
    
    const registrations = this.familyRegistrations.get(event.id!) || [];
    const familyMemberIds = this.familyGroup.members.map(m => m.id!);
    
    return registrations.some(r => 
      familyMemberIds.includes(r.memberId) && r.status === 'confirmed'
    );
  }

  checkForEventPayments(): void {
    // Verificar si hay registraciones que requieren pago después de un breve delay
    // para que el backend haya procesado las cuotas
    setTimeout(() => {
      this.loadPendingEventPayments();
    }, 1000);
  }

  loadPendingEventPayments(): void {
    if (!this.familyGroup || !this.selectedEvent) return;

    // Buscar cuotas pendientes de eventos para cada miembro de la familia
    const memberPromises = this.familyGroup.members.map(member =>
      this.paymentService.getPendingFeed(member.id!).toPromise()
        .then(fees => {
          const eventFees = fees?.filter(fee => 
            fee.description.startsWith('Evento:') && 
            fee.description.includes(this.selectedEvent!.title)
          ) || [];
          return { member, eventFees };
        })
    );

    Promise.all(memberPromises).then(results => {
      const hasPendingPayments = results.some(result => result.eventFees.length > 0);
      
      if (hasPendingPayments) {
        // Mostrar modal de pago
        this.showPaymentModal = true;
        // Guardar información de pagos pendientes
        this.pendingEventPayments.set(this.selectedEvent!.id!, results.filter(r => r.eventFees.length > 0));
      }
    });
  }

  openEventPaymentModal(event: Event): void {
    this.selectedEvent = event;
    this.showPaymentModal = true;
    this.loadPendingEventPayments();
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedEvent = null;
    this.pendingEventPayments.clear();
  }

  processEventPayment(): void {
    if (!this.selectedEvent || !this.familyGroup) return;

    const eventPayments = this.pendingEventPayments.get(this.selectedEvent.id!) || [];
    const allFees = eventPayments.flatMap(ep => ep.eventFees);
    
    if (allFees.length === 0) return;

    this.paymentLoading = true;

    // Close the modal and navigate to payments component
    this.closePaymentModal();
    
    // Navigate to payments component where event fees can be paid using Checkout Bricks
    this.router.navigate(['/payments']).then(() => {
      this.paymentLoading = false;
      this.showAlertMessage('Dirigiendo a la sección de pagos para completar el pago del evento...', 'info');
    }).catch(() => {
      this.paymentLoading = false;
      this.showAlertMessage('Error al navegar a la sección de pagos', 'error');
    });
  }

  hasEventPendingPayments(event: Event): boolean {
    if (!this.familyGroup || !event.requiresPayment) return false;
    
    // Esta es una verificación simple - en producción podrías cachear esta información
    return this.pendingEventPayments.has(event.id!) && 
           this.pendingEventPayments.get(event.id!)!.length > 0;
  }

  getEventPaymentTotal(event: Event): number {
    if (!event.requiresPayment || !event.cost) return 0;
    
    const eventPayments = this.pendingEventPayments.get(event.id!) || [];
    return eventPayments.reduce((total, ep) => 
      total + ep.eventFees.reduce((sum: number, fee: any) => sum + fee.amount, 0), 0
    );
  }
}
