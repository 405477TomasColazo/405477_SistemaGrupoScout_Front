import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {EducatorsService} from "../../core/services/educators.service";
import {MiembroConDetalles, SectionMember} from "../../core/models/user.model";
import {FamilyGroupService} from '../../core/services/family-group.service';
import {Tutor} from '../../core/models/family-group.model';
import {ProgressionService} from '../../core/services/progression.service';
import {MarchSheet, ProgressionStage, GrowthArea, AREA_LABELS} from '../../core/models/progression.model';
import {ExportService} from '../../core/services/export.service';
import {ExportButtonsComponent} from '../components/export-buttons/export-buttons.component';
import {AuthService} from '../../core/auth/auth.service';

@Component({
  selector: 'app-educator-dashboard',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    NgClass,
    CurrencyPipe,
    DatePipe,
    ExportButtonsComponent
  ],
  templateUrl: './educator-dashboard.component.html',
  styleUrl: './educator-dashboard.component.css'
})
export class EducatorDashboardComponent implements OnInit, OnDestroy {
  miembrosSeccion: SectionMember[] = [];
  miembrosFiltrados: SectionMember[] = [];
  miembroSeleccionado: MiembroConDetalles | null = null;
  showModal: boolean = false;
  showProgressionModal: boolean = false;
  showChangeStageModal: boolean = false;
  marchSheetSeleccionada: MarchSheet | null = null;
  loading: boolean = false;
  loadingDetails: boolean = false;
  loadingProgression: boolean = false;
  changingStage: boolean = false;
  error: string | null = null;
  
  // Balance editing properties
  showEditBalanceModal: boolean = false;
  selectedMemberForBalance: SectionMember | null = null;
  updatingBalance: boolean = false;

  filtrosForm = new FormGroup({
    searchText: new FormControl(''),
    tipo: new FormControl('todos') // 'todos', 'beneficiarios', 'educadores'
  });

  changeStageForm = new FormGroup({
    newStage: new FormControl('', [Validators.required]),
    comments: new FormControl('')
  });

  editBalanceForm = new FormGroup({
    newBalance: new FormControl(0, [Validators.required, Validators.min(0.01)]),
    reason: new FormControl('', [Validators.required, Validators.minLength(5)])
  });

  // Export state variables
  isExportingMembers = false;

  constructor(
    private educatorService: EducatorsService, 
    private familyGroupService: FamilyGroupService,
    private progressionService: ProgressionService,
    private exportService: ExportService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarMiembrosSeccion();
    this.filtrosForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  cargarMiembrosSeccion() {
    this.loading = true;
    this.error = null;

    this.educatorService.getNomina().subscribe({
      next: (miembros) => {
        this.miembrosSeccion = miembros;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando la nómina:', err);
        this.error = 'Error cargando los datos. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    const searchText = this.filtrosForm.get('searchText')?.value?.toLowerCase() || '';
    const tipo = this.filtrosForm.get('tipo')?.value || 'todos';

    this.miembrosFiltrados = this.miembrosSeccion.filter(miembro => {
      // Filtro por texto
      const cumpleBusqueda = !searchText ||
          miembro.name.toLowerCase().includes(searchText) ||
          miembro.lastName.toLowerCase().includes(searchText) ||
          miembro.dni.includes(searchText) ||
          miembro.section.toLowerCase().includes(searchText);

      // Filtro por tipo
      const cumpleTipo = tipo === 'todos' ||
          (tipo === 'educadores' && miembro.isEducator) ||
          (tipo === 'beneficiarios' && !miembro.isEducator);

      return cumpleBusqueda && cumpleTipo;
    });
  }

  verDetallesMiembro(miembro: SectionMember) {
    if (miembro.isEducator) {
      this.miembroSeleccionado = miembro;
      this.showModal = true;
    } else {
      this.loadingDetails = true;
      this.miembroSeleccionado = miembro; // Mostramos la info básica mientras carga
      this.showModal = true;

      this.familyGroupService.getFamilyGroupById(miembro.userId).subscribe({
        next: (familyGroup) => {
          const tutoresInfo = miembro.relationships.map(rel => {
            const tutor = familyGroup.tutors.find(t => t.id === rel.tutorId) ||
              (familyGroup.mainContact.id === rel.tutorId ? familyGroup.mainContact : null);
            return tutor ? {
              ...tutor,
              relationship: rel.relationship
            } : null;
          }).filter((t): t is (Tutor & { relationship: string }) => t !== null);

          this.miembroSeleccionado = {
            ...miembro,
            tutoresInfo
          };
          this.loadingDetails = false;
        },
        error: (err) => {
          console.error('Error cargando detalles del grupo familiar:', err);
          this.error = 'Error cargando los detalles de los tutores.';
          this.loadingDetails = false;
        }
      });
    }
  }

  verProgresionMiembro(miembro: SectionMember) {
    this.loadingProgression = true;
    this.showProgressionModal = true;
    this.error = null;

    this.progressionService.getMarchSheet(miembro.id).subscribe({
      next: (marchSheet) => {
        this.marchSheetSeleccionada = marchSheet;
        this.loadingProgression = false;
      },
      error: (err) => {
        console.error('Error cargando hoja de marcha:', err);
        this.error = 'Error cargando la progresión del scout. Es posible que no tenga una hoja de marcha creada.';
        this.loadingProgression = false;
      }
    });
  }

  cerrarModal() {
    this.showModal = false;
    this.miembroSeleccionado = null;
    this.error = null;
  }

  cerrarModalProgresion() {
    this.showProgressionModal = false;
    this.marchSheetSeleccionada = null;
    this.error = null;
  }

  getRolLabel(miembro: SectionMember): string {
    if (miembro.isEducator) {
      return 'Educador';
    }
    return 'Beneficiario';
  }

  getStatusClass(miembro: SectionMember): string {
    return miembro.isEducator ?
        'bg-blue-100 text-blue-800' :
        'bg-purple-100 text-purple-800';
  }

  getSectionClass(miembro: SectionMember): string {
    switch (miembro.section?.toUpperCase()) {
      case 'MANADA':
        return 'text-yellow-600'; // o 'text-amber-600' para un amarillo más cálido
      case 'UNIDAD':
        return 'text-green-600';
      case 'CAMINANTES':
        return 'text-sky-600'; // o 'text-blue-400' para un celeste más claro
      case 'ROVERS':
        return 'text-red-600';
      default:
        return 'text-gray-600'; // color por defecto
    }
  }

  ngOnDestroy(): void {
  }

  getAge(dateInput: Date | string): number {
    const date = new Date(dateInput); // convierte string a Date si es necesario
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En progreso';
      case 'COMPLETED': return 'Completada';
      case 'APPROVED': return 'Aprobada';
      default: return status;
    }
  }

  aprobarCompetencia(progress: any) {
    this.progressionService.approveCompetence(progress.id, 'Aprobada por educador').subscribe({
      next: (updatedProgress) => {
        // Actualizar el status en la hoja de marcha actual
        if (this.marchSheetSeleccionada && this.marchSheetSeleccionada.competenceProgress) {
          const index = this.marchSheetSeleccionada.competenceProgress.findIndex(cp => cp.id === progress.id);
          if (index !== -1) {
            this.marchSheetSeleccionada.competenceProgress[index] = updatedProgress;
          }
        }
      },
      error: (err) => {
        console.error('Error aprobando competencia:', err);
        this.error = 'Error al aprobar la competencia. Intente nuevamente.';
      }
    });
  }

  cambiarEtapa() {
    if (!this.changeStageForm.valid || !this.marchSheetSeleccionada) {
      return;
    }

    this.changingStage = true;
    this.error = null;

    const newStage = this.changeStageForm.get('newStage')?.value as ProgressionStage;
    const comments = this.changeStageForm.get('comments')?.value || '';

    this.progressionService.updateProgressionStage(
      this.marchSheetSeleccionada.memberId,
      newStage,
      comments
    ).subscribe({
      next: (updatedMarchSheet) => {
        this.marchSheetSeleccionada = updatedMarchSheet;
        this.changingStage = false;
        this.showChangeStageModal = false;
        this.changeStageForm.reset();
      },
      error: (err) => {
        console.error('Error cambiando etapa:', err);
        this.error = 'Error al cambiar la etapa. Intente nuevamente.';
        this.changingStage = false;
      }
    });
  }

  cancelarCambioEtapa() {
    this.showChangeStageModal = false;
    this.changeStageForm.reset();
    this.error = null;
  }

  getAreaLabel(area: GrowthArea | undefined): string {
    if (!area) return '';
    return AREA_LABELS[area] || area;
  }

  getInitials(name: string, lastName: string): string {
    const firstInitial = name && name.length > 0 ? name.charAt(0).toUpperCase() : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  // Export Methods
  exportMembersToPDF(): void {
    if (this.miembrosFiltrados.length === 0) {
      this.error = 'No hay miembros para exportar';
      return;
    }

    this.isExportingMembers = true;

    const exportData = this.miembrosFiltrados.map(miembro => ({
      firstName: miembro.name,
      lastName: miembro.lastName,
      dni: miembro.dni,
      age: this.getAge(miembro.birthdate),
      section: miembro.section,
      memberType: this.getRolLabel(miembro)
    }));

    try {
      this.exportService.exportMembersToPDF(exportData, 'Lista de Miembros de la Sección');
      // No hay sistema de alertas en este componente, solo limpiamos el error
      this.error = null;
    } catch (error) {
      console.error('Error al exportar miembros a PDF:', error);
      this.error = 'Error al exportar miembros a PDF';
    }

    this.isExportingMembers = false;
  }

  exportMembersToCSV(): void {
    if (this.miembrosFiltrados.length === 0) {
      this.error = 'No hay miembros para exportar';
      return;
    }

    this.isExportingMembers = true;

    const exportData = this.miembrosFiltrados.map(miembro => ({
      firstName: miembro.name,
      lastName: miembro.lastName,
      dni: miembro.dni,
      age: this.getAge(miembro.birthdate),
      section: miembro.section,
      memberType: this.getRolLabel(miembro)
    }));

    try {
      this.exportService.exportMembersToCSV(exportData, 'lista-miembros-seccion');
      // No hay sistema de alertas en este componente, solo limpiamos el error
      this.error = null;
    } catch (error) {
      console.error('Error al exportar miembros a CSV:', error);
      this.error = 'Error al exportar miembros a CSV';
    }

    this.isExportingMembers = false;
  }

  // Balance editing methods
  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  editBalance(member: SectionMember): void {
    this.selectedMemberForBalance = member;
    this.editBalanceForm.patchValue({
      newBalance: member.accountBalance,
      reason: ''
    });
    this.showEditBalanceModal = true;
  }

  saveBalance(): void {
    if (!this.editBalanceForm.valid || !this.selectedMemberForBalance) {
      return;
    }

    this.updatingBalance = true;
    this.error = null;

    const newBalance = this.editBalanceForm.get('newBalance')?.value || 0;
    const reason = this.editBalanceForm.get('reason')?.value || '';

    this.familyGroupService.updateMemberBalance(
      this.selectedMemberForBalance.id,
      newBalance,
      reason
    ).subscribe({
      next: (updatedMember) => {
        // Update the member in local arrays
        const memberIndex = this.miembrosSeccion.findIndex(m => m.id === this.selectedMemberForBalance?.id);
        if (memberIndex !== -1) {
          this.miembrosSeccion[memberIndex].accountBalance = updatedMember.accountBalance;
        }
        
        const filteredIndex = this.miembrosFiltrados.findIndex(m => m.id === this.selectedMemberForBalance?.id);
        if (filteredIndex !== -1) {
          this.miembrosFiltrados[filteredIndex].accountBalance = updatedMember.accountBalance;
        }

        this.updatingBalance = false;
        this.showEditBalanceModal = false;
        this.selectedMemberForBalance = null;
        this.editBalanceForm.reset();
      },
      error: (err) => {
        console.error('Error updating member balance:', err);
        this.error = 'Error al actualizar el balance. Intente nuevamente.';
        this.updatingBalance = false;
      }
    });
  }

  cancelEditBalance(): void {
    this.showEditBalanceModal = false;
    this.selectedMemberForBalance = null;
    this.editBalanceForm.reset();
    this.error = null;
  }
}
