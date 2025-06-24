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
  memberName?: string;
  memberLastName?: string;
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
  familyGroupId: number | null;
  sectionId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  status: string | null;
  paymentMethod: string | null;
  memberName: string | null;
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
  paymentFormData: any; // Generic payment data for any method
  preferenceId: string;
  feeIds: number[];
  paymentMethod?: string; // Optional payment method type
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

// Interfaces for admin functionality
export interface PaymentStatistics {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  averagePaymentAmount: number;
}

export interface PendingPaymentsBySection {
  sectionId: number;
  sectionName: string;
  totalPendingFees: number;
  totalPendingAmount: number;
  membersWithPendingPayments: number;
}

export interface UpdatePaymentStatusRequest {
  status: string;
  reason?: string;
}
