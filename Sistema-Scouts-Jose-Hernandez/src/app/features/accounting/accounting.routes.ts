import { Routes } from '@angular/router';
import { AdminGuard } from '../../core/guards/admin.guard';

export const accountingRoutes: Routes = [
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../../shared/accounting/accounting-dashboard/accounting-dashboard.component')
          .then(c => c.AccountingDashboardComponent),
        title: 'Accounting Dashboard'
      },
      {
        path: 'journal',
        loadComponent: () => import('../../shared/accounting/journal-ledger/journal-ledger.component')
          .then(c => c.JournalLedgerComponent),
        title: 'Journal Ledger'
      },
      {
        path: 'entries',
        loadComponent: () => import('../../shared/accounting/accounting-entries/accounting-entries.component')
          .then(c => c.AccountingEntriesComponent),
        title: 'Accounting Entries'
      },
      {
        path: 'entries/new',
        loadComponent: () => import('../../shared/accounting/accounting-entry-form/accounting-entry-form.component')
          .then(c => c.AccountingEntryFormComponent),
        title: 'New Accounting Entry'
      },
      {
        path: 'entries/edit/:id',
        loadComponent: () => import('../../shared/accounting/accounting-entry-form/accounting-entry-form.component')
          .then(c => c.AccountingEntryFormComponent),
        title: 'Edit Accounting Entry'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];