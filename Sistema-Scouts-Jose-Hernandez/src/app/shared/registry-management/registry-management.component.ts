import {Component, inject, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Invitation, InvitationRequest, Section} from '../../core/models/user.model';
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
export class RegistryManagementComponent implements OnInit {
  fb: FormBuilder = inject(FormBuilder);
  invitationService = inject(InvitationService);

  activeSection:'invitaciones'|'pendientes'|'completados' = 'invitaciones';
  invitationForm: FormGroup = this.fb.group({
    lastName: ['', [Validators.required,Validators.maxLength(50), Validators.minLength(4)]],
    email: ['', [Validators.required,Validators.email]],
    userType: ['FAMILY', [Validators.required]],
    sectionId: [null], // Will be required conditionally
  })

  // Alertas
  showAlert = false;
  alertText = '';
  alertType:'success'|'error'|null = null;
  pendingInvitations: Invitation[] = [];
  completedRegistrations: Invitation[] = [];
  showDeleteModal: boolean = false;
  invitationToDelete: Invitation | null = null;
  sections: Section[] = [];
  isEducatorSelected = false;

  ngOnInit() {
    this.loadPendingInvitations();
    this.loadCompletedRegistrations();
    this.loadSections();
    this.setupUserTypeWatcher();
  }

  loadPendingInvitations() {
    this.invitationService.getPendingInvitations().subscribe({
      next: (invitations) => {
        this.pendingInvitations = invitations;
      },
      error: (err) => {
        this.showErrorAlert('Error al cargar invitaciones pendientes');
      }
    });
  }

  loadCompletedRegistrations() {
    this.invitationService.getCompletedRegistrations().subscribe({
      next: (registrations) => {
        this.completedRegistrations = registrations;
      },
      error: (err) => {
        this.showErrorAlert('Error al cargar registros completados');
      }
    });
  }

  loadSections() {
    this.invitationService.getAllSections().subscribe({
      next: (sections) => {
        this.sections = sections;
      },
      error: (err) => {
        this.showErrorAlert('Error al cargar las secciones');
      }
    });
  }

  setupUserTypeWatcher() {
    this.invitationForm.get('userType')?.valueChanges.subscribe(userType => {
      this.isEducatorSelected = userType === 'EDUCATOR';
      const sectionControl = this.invitationForm.get('sectionId');
      
      if (this.isEducatorSelected) {
        sectionControl?.setValidators([Validators.required]);
      } else {
        sectionControl?.clearValidators();
        sectionControl?.setValue(null);
      }
      sectionControl?.updateValueAndValidity();
    });
  }

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
      userType: this.invitationForm.get('userType')?.value,
      sectionId: this.invitationForm.get('sectionId')?.value,
    }
    this.invitationService.sendInvitation(invitation).subscribe({
      next: () => {
        this.showSuccessAlert('Invitacion enviada con exito!');
        this.invitationForm.reset();
        this.invitationForm.get('userType')?.setValue('FAMILY');
        this.loadPendingInvitations();
      },
      error: err => {
        this.showErrorAlert(err.message || 'Error al enviar la invitacion');
      }
    })
  }

  reSendInvitation(invitation: Invitation) {
    if (!invitation.id) return;
    
    this.invitationService.resendInvitation(invitation.id).subscribe({
      next: () => {
        this.showSuccessAlert('Invitación reenviada con éxito!');
        this.loadPendingInvitations();
      },
      error: err => {
        this.showErrorAlert('Error al reenviar la invitación');
      }
    });
  }

  deleteInvitation(invitation: Invitation) {
    this.invitationToDelete = invitation;
    this.showDeleteModal = true;
  }

  closeModal() {
    this.showDeleteModal = false;
    this.invitationToDelete = null;
  }

  confDelete() {
    if (!this.invitationToDelete?.id) return;
    
    this.invitationService.deleteInvitation(this.invitationToDelete.id).subscribe({
      next: () => {
        this.showSuccessAlert('Invitación eliminada con éxito!');
        this.loadPendingInvitations();
        this.closeModal();
      },
      error: err => {
        this.showErrorAlert('Error al eliminar la invitación');
      }
    });
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
