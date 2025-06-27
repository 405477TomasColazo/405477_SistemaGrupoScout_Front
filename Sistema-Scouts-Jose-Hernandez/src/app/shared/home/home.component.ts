import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { LatestNewsComponent } from '../news/latest-news/latest-news.component';
import { ContactService, ContactMessageType, CreateContactMessage } from '../../core/services/contact.service';
import { TermsModalComponent } from '../terms-modal/terms-modal.component';
import { FaqModalComponent } from '../faq-modal/faq-modal.component';

@Component({
  selector: 'app-home',
  imports: [
    LatestNewsComponent,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    NgClass,
    TermsModalComponent,
    FaqModalComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  submitMessage = '';

  // Modal states
  showTermsModal = false;
  showFaqModal = false;

  messageTypeOptions = [
    { value: ContactMessageType.GENERAL, label: 'Consulta General' },
    { value: ContactMessageType.MEMBERSHIP, label: 'Información sobre Membresía' },
    { value: ContactMessageType.EVENTS, label: 'Consulta sobre Eventos' },
    { value: ContactMessageType.COMPLAINT, label: 'Queja o Reclamo' },
    { value: ContactMessageType.SUGGESTION, label: 'Sugerencia' },
    { value: ContactMessageType.TECHNICAL, label: 'Problema Técnico' },
    { value: ContactMessageType.OTHER, label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
      messageType: [ContactMessageType.GENERAL, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.showSuccessMessage = false;
      this.showErrorMessage = false;

      const contactData: CreateContactMessage = this.contactForm.value;

      this.contactService.submitContactForm(contactData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccessMessage = true;
            this.submitMessage = response.message;
            this.contactForm.reset();
            this.contactForm.patchValue({ messageType: ContactMessageType.GENERAL });
            
            // Hide success message after 8 seconds
            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 8000);
          } else {
            this.showErrorMessage = true;
            this.submitMessage = response.message;
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error submitting contact form:', error);
          this.showErrorMessage = true;
          this.submitMessage = 'Error al enviar el mensaje. Por favor, intenta nuevamente más tarde.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors && field.touched) {
      const errors = field.errors;
      
      if (errors['required']) return `El ${fieldName} es obligatorio`;
      if (errors['email']) return 'Debe ser un email válido';
      if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  hideMessages(): void {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
  }

  // Modal control methods
  openTermsModal(): void {
    this.showTermsModal = true;
  }

  closeTermsModal(): void {
    this.showTermsModal = false;
  }

  openFaqModal(): void {
    this.showFaqModal = true;
  }

  closeFaqModal(): void {
    this.showFaqModal = false;
  }
}
