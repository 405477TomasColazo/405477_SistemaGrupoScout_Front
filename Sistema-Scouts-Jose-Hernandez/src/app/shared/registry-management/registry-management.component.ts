import {Component, inject} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {list} from 'postcss';
import {Invitation} from '../../core/models/user.model';

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

  activeSection:'invitaciones'|'pendientes'|'completados' = 'completados';
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

  }

  sendInvitation() {

  }

  reSendInvitation(invitation: Invitation) {

  }

  deleteInvitation(invitation: Invitation) {

  }

  closeModal() {

  }

  confDelete() {

  }
}
