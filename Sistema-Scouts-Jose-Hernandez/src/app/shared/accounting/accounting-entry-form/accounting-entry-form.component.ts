import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AccountingService } from '../../../core/services/accounting.service';
import {
  AccountingEntry,
  Account,
  MovementType,
  AccountingMovement,
  CreateAccountingEntryRequest,
  UpdateAccountingEntryRequest,
  MOVEMENT_TYPE_LABELS
} from '../../../core/models/accounting.model';

@Component({
  selector: 'app-accounting-entry-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './accounting-entry-form.component.html',
  styleUrls: ['./accounting-entry-form.component.css']
})
export class AccountingEntryFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  entryForm: FormGroup;
  accounts: Account[] = [];
  loading = false;
  error: string | null = null;
  isEditMode = false;
  entryId: number | null = null;

  // Enums for template
  MovementType = MovementType;
  MOVEMENT_TYPE_LABELS = MOVEMENT_TYPE_LABELS;

  constructor(
    private fb: FormBuilder,
    private accountingService: AccountingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.entryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      entryDate: [new Date().toISOString().split('T')[0], Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      movements: this.fb.array([], [Validators.required, Validators.minLength(2)])
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.entryId = +id;
      this.loadEntry(this.entryId);
    } else {
      // Add initial empty movements for new entry
      this.addMovement();
      this.addMovement();
    }
  }

  private loadAccounts(): void {
    this.accountingService.getAllAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts.filter(a => a.active);
        },
        error: (error) => {
          console.error('Error loading accounts:', error);
          this.error = 'Error loading accounts';
        }
      });
  }

  private loadEntry(id: number): void {
    this.loading = true;
    this.accountingService.getAccountingEntry(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entry) => {
          this.populateForm(entry);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading entry:', error);
          this.error = 'Error loading accounting entry';
          this.loading = false;
        }
      });
  }

  private populateForm(entry: AccountingEntry): void {
    this.entryForm.patchValue({
      entryDate: entry.entryDate,
      description: entry.description
    });

    // Clear existing movements and add from entry
    this.clearMovements();
    entry.movements.forEach(movement => {
      this.addMovementFromData(movement);
    });
  }

  get movementsArray(): FormArray {
    return this.entryForm.get('movements') as FormArray;
  }

  addMovement(): void {
    const movementForm = this.fb.group({
      accountId: [null, Validators.required],
      movementType: [MovementType.DEBIT, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['']
    });

    this.movementsArray.push(movementForm);
  }

  private addMovementFromData(movement: AccountingMovement): void {
    const movementForm = this.fb.group({
      accountId: [movement.accountId, Validators.required],
      movementType: [movement.movementType, Validators.required],
      amount: [movement.amount, [Validators.required, Validators.min(0.01)]],
      description: [movement.description || '']
    });

    this.movementsArray.push(movementForm);
  }

  removeMovement(index: number): void {
    if (this.movementsArray.length > 2) {
      this.movementsArray.removeAt(index);
    }
  }

  private clearMovements(): void {
    while (this.movementsArray.length !== 0) {
      this.movementsArray.removeAt(0);
    }
  }

  getAccountName(accountId: number): string {
    const account = this.accounts.find(a => a.id === accountId);
    return account ? `${account.code} - ${account.name}` : 'Unknown Account';
  }

  calculateTotalDebits(): number {
    return this.movementsArray.controls
      .filter(control => control.get('movementType')?.value === MovementType.DEBIT)
      .reduce((sum, control) => sum + (control.get('amount')?.value || 0), 0);
  }

  calculateTotalCredits(): number {
    return this.movementsArray.controls
      .filter(control => control.get('movementType')?.value === MovementType.CREDIT)
      .reduce((sum, control) => sum + (control.get('amount')?.value || 0), 0);
  }

  getBalanceDifference(): number {
    return this.calculateTotalDebits() - this.calculateTotalCredits();
  }

  isBalanced(): boolean {
    return Math.abs(this.getBalanceDifference()) < 0.01;
  }

  getBalanceClass(): string {
    const difference = this.getBalanceDifference();
    if (Math.abs(difference) < 0.01) return 'text-green-600';
    return 'text-red-600';
  }

  getBalanceText(): string {
    const difference = this.getBalanceDifference();
    if (Math.abs(difference) < 0.01) return 'Balanceado';
    return difference > 0 ? 'El debe es superior al haber' : 'El haber es superior al debe';
  }

  getAbsoluteBalanceDifference(): number {
    return Math.abs(this.getBalanceDifference());
  }

  formatCurrency(amount: number): string {
    return this.accountingService.formatCurrency(amount);
  }

  onSubmit(): void {
    if (this.entryForm.invalid || !this.isBalanced()) {
      this.markFormGroupTouched(this.entryForm);
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.entryForm.value;

    if (this.isEditMode && this.entryId) {
      this.updateEntry(this.entryId, formValue);
    } else {
      this.createEntry(formValue);
    }
  }

  private createEntry(formValue: any): void {
    const request: CreateAccountingEntryRequest = {
      entryDate: formValue.entryDate,
      description: formValue.description,
      movements: formValue.movements.map((movement: any) => ({
        accountId: movement.accountId,
        movementType: movement.movementType,
        amount: movement.amount,
        description: movement.description || null
      }))
    };

    this.accountingService.createAccountingEntry(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/accounting/entries']);
        },
        error: (error) => {
          console.error('Error creating entry:', error);
          this.error = error.error?.message || 'Error creating accounting entry';
          this.loading = false;
        }
      });
  }

  private updateEntry(id: number, formValue: any): void {
    const request: UpdateAccountingEntryRequest = {
      entryDate: formValue.entryDate,
      description: formValue.description,
      movements: formValue.movements.map((movement: any) => ({
        accountId: movement.accountId,
        movementType: movement.movementType,
        amount: movement.amount,
        description: movement.description || null
      }))
    };

    this.accountingService.updateAccountingEntry(id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/accounting/entries']);
        },
        error: (error) => {
          console.error('Error updating entry:', error);
          this.error = error.error?.message || 'Error updating accounting entry';
          this.loading = false;
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/accounting/entries']);
  }

  // Template helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.entryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isMovementFieldInvalid(index: number, fieldName: string): boolean {
    const movement = this.movementsArray.at(index);
    const field = movement.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.entryForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
    }
    return '';
  }

  getMovementFieldError(index: number, fieldName: string): string {
    const movement = this.movementsArray.at(index);
    const field = movement.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }
}
