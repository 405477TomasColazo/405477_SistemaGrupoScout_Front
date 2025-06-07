import {Component, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, Subject, takeUntil} from 'rxjs';
import {FamilyGroup, MemberProtagonist} from '../../core/models/family-group.model';
import {CalendarDay, EventRegistration, Event, CalendarEvent} from '../../core/models/events.model';
import {AuthService} from '../../core/auth/auth.service';
import {EventService} from '../../core/services/event.service';
import {FamilyGroupService} from '../../core/services/family-group.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';

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

  // Calendario
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Colores por tipo de evento
  eventColors = {
    campamento: 'bg-green-500',
    salida: 'bg-blue-500',
    reunion: 'bg-yellow-500',
    actividad: 'bg-purple-500',
    otro: 'bg-gray-500'
  };

  // Leyenda de secciones
  sectionColors = {
    manada: 'border-orange-500',
    unidad: 'border-green-500',
    caminantes: 'border-blue-500',
    rovers: 'border-red-500'
  };

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private familyService: FamilyGroupService
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
      this.filterEvents();
      this.generateCalendar();
      this.loading = false;
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

  getEventColorClass(eventType: string): string {
    return this.eventColors[eventType as keyof typeof this.eventColors] || 'bg-gray-500';
  }

  getSectionBorderClass(section: string): string {
    return this.sectionColors[section as keyof typeof this.sectionColors] || 'border-gray-500';
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
}
