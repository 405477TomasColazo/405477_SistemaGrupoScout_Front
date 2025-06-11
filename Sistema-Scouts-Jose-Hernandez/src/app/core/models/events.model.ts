export interface Event {
  id?: number;
  title: string;
  description: string;
  eventType: 'campamento' | 'salida' | 'reunion' | 'actividad' | 'otro';
  startDate: Date;
  endDate: Date;
  location: string;
  sections: string[]; // ['manada', 'unidad', 'caminantes', 'rovers'] o ['all']
  cost?: number;
  maxCapacity?: number;
  currentCapacity?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdBy: number; // userId del educador
  createdAt?: Date;
  updatedAt?: Date;
  registrationDeadline?: Date;
  invitationType: 'all' | 'selected'; // todos los de la sección o específicos
  invitedMembers?: number[]; // memberIds específicos si invitationType es 'selected'
  requiresPayment: boolean;
  paymentDeadline?: Date;
  attachments?: EventAttachment[];
  notes?: string;
}

export interface EventAttachment {
  id?: number;
  eventId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

export interface EventRegistration {
  id?: number;
  eventId: number;
  memberId: number;
  memberName?: string;
  memberLastName?: string;
  registrationDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist';
  paymentStatus?: 'pending' | 'paid' | 'exempt';
  paymentId?: number;
  notes?: string;
}

export interface EventFilter {
  sections?: string[];
  eventType?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  createdBy?: number;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface CalendarEvent {
  event: Event;
  startOnDay: boolean;
  endOnDay: boolean;
  continuesFromPrevious: boolean;
  continuesToNext: boolean;
  daySpan: number;
  memberIds: number[];
}
