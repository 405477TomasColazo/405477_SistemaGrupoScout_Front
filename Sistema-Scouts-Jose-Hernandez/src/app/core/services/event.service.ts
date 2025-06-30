import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, tap, map} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {EventFilter, EventRegistration,Event} from '../models/events.model';
import {SectionMember} from '../models/user.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadEvents();
  }

  loadEvents(): void {
    this.getEvents().subscribe(events => {
      this.eventsSubject.next(events);
    });
  }

  getEvents(filter?: EventFilter): Observable<Event[]> {
    let params = new HttpParams();

    if (filter) {
      if (filter.sections?.length) {
        params = params.set('sections', filter.sections.join(','));
      }
      if (filter.eventType) {
        params = params.set('eventType', filter.eventType);
      }
      if (filter.status) {
        params = params.set('status', filter.status);
      }
      if (filter.dateFrom) {
        params = params.set('dateFrom', filter.dateFrom.toISOString());
      }
      if (filter.dateTo) {
        params = params.set('dateTo', filter.dateTo.toISOString());
      }
      if (filter.createdBy) {
        params = params.set('createdBy', filter.createdBy.toString());
      }
    }

    return this.http.get<Event[]>(this.apiUrl, { params }).pipe(
      map(events => events.map(event => this.convertEventDates(event)))
    );
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`).pipe(
      map(event => this.convertEventDates(event))
    );
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event).pipe(
      map(createdEvent => this.convertEventDates(createdEvent)),
      tap(() => this.loadEvents())
    );
  }

  updateEvent(id: number, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event).pipe(
      map(updatedEvent => this.convertEventDates(updatedEvent)),
      tap(() => this.loadEvents())
    );
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadEvents())
    );
  }

  // Métodos para manejar registros
  getEventRegistrations(eventId: number): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(`${this.apiUrl}/${eventId}/registrations`);
  }

  registerMembersToEvent(eventId: number, memberIds: number[]): Observable<EventRegistration[]> {
    return this.http.post<EventRegistration[]>(`${this.apiUrl}/${eventId}/register`, { memberIds });
  }

  updateRegistration(eventId: number, registrationId: number, status: string): Observable<EventRegistration> {
    return this.http.put<EventRegistration>(
      `${this.apiUrl}/${eventId}/registrations/${registrationId}`,
      { status }
    );
  }

  // Método auxiliar para obtener las secciones disponibles
  getAvailableSections(): string[] {
    return ['manada', 'unidad', 'caminantes', 'rovers'];
  }

  // Método para obtener miembros por sección
  getMembersBySection(sections: string[]): Observable<SectionMember[]> {
    const params = new HttpParams().set('sections', sections.join(','));
    return this.http.get<SectionMember[]>(`${environment.apiUrl}/members`, { params });
  }

  // Método auxiliar para convertir strings de fecha a objetos Date
  private convertEventDates(event: any): Event {
    return {
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
      updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline) : undefined,
      paymentDeadline: event.paymentDeadline ? new Date(event.paymentDeadline) : undefined
    };
  }
}
