import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  @Output() openTermsModal = new EventEmitter<void>();
  @Output() openFaqModal = new EventEmitter<void>();
  
  currentYear = new Date().getFullYear();

  onOpenTermsModal(): void {
    this.openTermsModal.emit();
  }

  onOpenFaqModal(): void {
    this.openFaqModal.emit();
  }
}