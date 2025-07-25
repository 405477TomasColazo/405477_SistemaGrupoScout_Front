export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum MovementType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export enum OriginType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL'
}

export enum EntryStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED'
}

export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  active: boolean;
  description?: string;
}

export interface AccountingMovement {
  id: number;
  accountId: number;
  accountCode: string;
  accountName: string;
  movementType: MovementType;
  amount: number;
  description?: string;
}

export interface AccountingEntry {
  id: number;
  entryNumber: number;
  entryDate: string; // ISO date string
  description: string;
  originType: OriginType;
  originReference?: string;
  status: EntryStatus;
  createdByUserName?: string;
  createdAt: string; // ISO datetime string
  modifiedByUserName?: string;
  modifiedAt?: string; // ISO datetime string
  movements: AccountingMovement[];
  totalDebits: number;
  totalCredits: number;
}

export interface CreateAccountingMovement {
  accountId: number;
  movementType: MovementType;
  amount: number;
  description?: string;
}

export interface CreateAccountingEntry {
  entryDate: string; // ISO date string
  description: string;
  movements: CreateAccountingMovement[];
}

export interface CreateAccountingEntryRequest {
  entryDate: string; // ISO date string
  description: string;
  movements: CreateAccountingMovement[];
}

export interface UpdateAccountingEntryRequest {
  entryDate: string; // ISO date string
  description: string;
  movements: CreateAccountingMovement[];
}

export interface AccountingFilters {
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  status?: EntryStatus;
  originType?: OriginType;
  description?: string;
  accountId?: number;
}

export interface AccountBalance {
  accountId: number;
  accountCode: string;
  accountName: string;
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

export interface AccountingReport {
  reportType: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalDebits: number;
  totalCredits: number;
  balanceDifference: number;
  entries?: AccountingEntry[];
  accountBalances?: AccountBalance[];
}

export interface AccountingDashboardStats {
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
  totalEntries: number;
  totalDebits: number;
  totalCredits: number;
  balanceDifference: number;
  accountsWithMovements: number;
  automaticEntries?: number;
  manualEntries?: number;
}

// Page response wrapper
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// API response types
export interface AccountingEntriesResponse extends PageResponse<AccountingEntry> {}

// Form interfaces for components
export interface AccountingEntryForm {
  entryDate: Date;
  description: string;
  movements: AccountingMovementForm[];
}

export interface AccountingMovementForm {
  accountId: number | null;
  account?: Account; // For display purposes
  movementType: MovementType | null;
  amount: number | null;
  description: string;
}

// Filter form interface
export interface AccountingFiltersForm {
  dateFrom: Date | null;
  dateTo: Date | null;
  status: EntryStatus | null;
  originType: OriginType | null;
  description: string;
  accountId: number | null;
}

// Constants for UI
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.ASSET]: 'Activo',
  [AccountType.LIABILITY]: 'Pasivo',
  [AccountType.EQUITY]: 'Patrimonio',
  [AccountType.INCOME]: 'Ingreso',
  [AccountType.EXPENSE]: 'Gasto'
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.DEBIT]: 'Débito',
  [MovementType.CREDIT]: 'Crédito'
};

export const ORIGIN_TYPE_LABELS: Record<OriginType, string> = {
  [OriginType.AUTOMATIC]: 'Automático',
  [OriginType.MANUAL]: 'Manual'
};

export const ENTRY_STATUS_LABELS: Record<EntryStatus, string> = {
  [EntryStatus.ACTIVE]: 'Activo',
  [EntryStatus.CANCELLED]: 'Cancelado'
};