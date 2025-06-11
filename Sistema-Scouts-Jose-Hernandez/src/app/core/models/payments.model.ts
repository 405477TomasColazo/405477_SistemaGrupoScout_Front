export interface Fee {
  id: number;
  description: string;
  amount: number;
  period: string; // Formato de fecha para el período (ej: '2025-04-01')
  memberId: number; // Miembro al que corresponde la cuota
  status: 'pending' | 'paid' | 'overdue';
}

export interface Payment {
  id: number;
  memberId: number;
  amount: number;
  paymentDate: string;
  status: 'completed' | 'processing' | 'failed' | 'pending';
  referenceId?: string; // Referencia externa del pago (ej: ID de MercadoPago)
  paymentMethod?: string;
  items: PaymentItem[]; // Cuotas incluidas en este pago
}

export interface PaymentItem {
  feeId?: number;  // Para cuotas mensuales
  eventId?: number;  // Para eventos - NUEVO
  eventRegistrationId?: number;  // Para registros de eventos - NUEVO
  description: string;
  period?: string;  // Para cuotas mensuales
  eventDate?: string;  // Para eventos - NUEVO
  amount: number;
}

export interface PaymentFilters {
  memberId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  minAmount: number | null;
}

export interface PaymentPreferenceRequest {
  memberId: number;
  paymentType: 'fee' | 'event';  // ACTUALIZADO para distinguir tipos
  items: {
    feeId?: number;  // Para cuotas mensuales
    eventId?: number;  // Para eventos - NUEVO
    eventRegistrationId?: number;  // Para registros de eventos - NUEVO
    description: string;
    period?: string;  // Para cuotas mensuales
    eventDate?: string;  // Para eventos - NUEVO
    amount: number;
  }[];
  totalAmount: number;
  externalReferenceId: string;
}

export interface PaymentPreferenceResponse {
  preferenceId: string;
  initPoint?: string;
}

export interface ProcessPaymentRequest {
  cardFormData: any;
  preferenceId: string;
  feeIds: number[];
}

export interface ProcessPaymentResponse {
  status: 'success' | 'error';
  message?: string;
  payment?: Payment;
}

export interface PaymentsHistoryResponse {
  payments: Payment[];
  total: number;
}

// Nuevas interfaces para eventos
export interface EventPaymentItem {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  memberId: number;
  memberName: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'exempt';
  registrationId: number;
}
