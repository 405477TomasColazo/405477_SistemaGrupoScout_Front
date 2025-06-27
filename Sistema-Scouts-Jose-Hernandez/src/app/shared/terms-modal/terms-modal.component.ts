import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-terms-modal',
  imports: [
    CommonModule
  ],
  templateUrl: './terms-modal.component.html',
  styleUrl: './terms-modal.component.css'
})
export class TermsModalComponent {
  @Output() closeModal = new EventEmitter<void>();

  // Track active section for navigation
  activeSection: string = 'bienvenida';

  // Section navigation
  sections = [
    { id: 'bienvenida', title: 'Bienvenida y Aceptación' },
    { id: 'operaciones', title: 'Operaciones Habilitadas' },
    { id: 'acceso', title: 'Acceso y Uso del Sistema' },
    { id: 'costo', title: 'Costo del Servicio' },
    { id: 'vigencia', title: 'Vigencia' },
    { id: 'validez', title: 'Validez de Operaciones' },
    { id: 'propiedad', title: 'Propiedad Intelectual' },
    { id: 'privacidad', title: 'Privacidad de la Información' },
    { id: 'responsabilidad', title: 'Limitación de Responsabilidad' },
    { id: 'valores', title: 'Valores Scouts' },
    { id: 'jurisdiccion', title: 'Jurisdicción' },
    { id: 'contacto', title: 'Contáctanos' }
  ];

  scrollToSection(sectionId: string) {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  // Handle ESC key to close modal
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onClose();
    }
  }
}