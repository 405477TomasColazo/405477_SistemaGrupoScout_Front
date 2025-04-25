import {Component, inject} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Invitation, InvitationRequest} from '../../core/models/user.model';
import {InvitationService} from '../../core/services/invitation.service';

@Component({
  selector: 'app-registry-management',
  imports: [
    NgIf,
    NgClass,
    DatePipe,
    ReactiveFormsModule,
    NgForOf
  ],
  templateUrl: './registry-management.component.html',
  styleUrl: './registry-management.component.css'
})
export class RegistryManagementComponent {
  fb: FormBuilder = inject(FormBuilder);
  invitationService = inject(InvitationService);

  activeSection:'invitaciones'|'pendientes'|'completados' = 'invitaciones';
  invitationForm: FormGroup = this.fb.group({
    lastName: ['', [Validators.required,Validators.maxLength(50), Validators.minLength(4)]],
    email: ['', [Validators.required,Validators.email]],
  })

  // Alertas
  showAlert = false;
  alertText = '';
  alertType:'success'|'error'|null = null;
  pendingInvitations: Invitation[] = [];
  completedRegistrations: Invitation[] = [];
  showDeleteModal: boolean = false;
  invitationToDelete: Invitation | null = null;


  closeAlert() {
    this.showAlert = false;
    this.alertText = '';
    this.alertType = null;
  }

  sendInvitation() {
    if (this.invitationForm.invalid) {
      Object.keys(this.invitationForm.controls).forEach(field => {
        this.invitationForm.get(field)?.markAsTouched();
      })
      return;
    }
    const invitation:InvitationRequest = {
      email: this.invitationForm.get('email')?.value,
      lastName: this.invitationForm.get('lastName')?.value,
    }
    this.invitationService.sendInvitation(invitation).subscribe({
      next: () => {
        this.showSuccessAlert('Invitacion enviada con exito!')
      },
      error: err => {
        this.showErrorAlert(err.message || 'Error al enviar la invitacion');
      }
      }
    )
  }

  reSendInvitation(invitation: Invitation) {

  }

  deleteInvitation(invitation: Invitation) {

  }

  closeModal() {

  }

  confDelete() {

  }

  showSuccessAlert(message: string): void {
    this.alertType = 'success';
    this.alertText = message;
    this.showAlert = true;
  }

  showErrorAlert(message: string): void {
    this.alertType = 'error';
    this.alertText = message;
    this.showAlert = true;
  }
}
