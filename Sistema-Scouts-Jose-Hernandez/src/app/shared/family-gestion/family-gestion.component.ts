import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FamilyGroup, Member, MemberProtagonist, Relationship, Tutor} from '../../core/models/family-group.model';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {FamilyGroupService} from '../../core/services/family-group.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-family-gestion',
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    NgForOf
  ],
  templateUrl: './family-gestion.component.html',
  styleUrl: './family-gestion.component.css'
})
export class FamilyGestionComponent implements OnInit {
  // Initialize with default values
  familyGroup: FamilyGroup = {} as FamilyGroup;
  seccionActiva: 'beneficiarios' | 'tutores' | 'relaciones' = 'beneficiarios';

  // Gestión de modales
  modalAbierto = false;
  modoEdicion = false;
  tipoMiembroActual: 'tutor' | 'beneficiario' | null = null;

  // Gestión de confirmaciones
  modalConfirmacionAbierto = false;
  miembroAEditar: Member | null = null;
  miembroAEliminar: Member | null = null;

  // Gestión de relaciones
  beneficiarioSeleccionado: MemberProtagonist | null = null;
  relacionForm: FormGroup = {} as FormGroup;
  modalConfirmacionRelacionAbierto = false;
  relacionAEliminar: Relationship | null = null;

  // Formularios
  tutorForm: FormGroup = {} as FormGroup;
  beneficiarioForm: FormGroup = {} as FormGroup;

  // Alertas
  mostrarAlerta = false;
  mensajeAlerta = '';

  constructor(
    private fb: FormBuilder,
    private familyGroupService: FamilyGroupService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarDatosGrupoFamiliar();
    this.inicializarFormularios();
  }

  cargarDatosGrupoFamiliar(): void {
    this.familyGroupService.getFamilyGroup().subscribe({
      next: (data) => {
        this.familyGroup = data;
      },
      error: (error) => {
        this.toastr.error('Error al cargar los datos del grupo familiar', 'Error');
        console.error('Error al cargar los datos del grupo familiar', error);
      }
    });
  }

  inicializarFormularios(): void {
    // Formulario para tutores
    this.tutorForm = this.fb.group({
      id: [null],
      userId: [null],
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      birthdate: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required],
      notes: ['']
    });

    // Formulario para beneficiarios
    this.beneficiarioForm = this.fb.group({
      id: [null],
      userId: [null],
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      birthdate: ['', Validators.required],
      dni: ['', Validators.required],
      memberType: ['', Validators.required],
      section: ['', Validators.required],
      accountBalance: [0],
      notes: ['']
    });

    // Formulario para relaciones
    this.relacionForm = this.fb.group({
      tutorId: [null, Validators.required],
      relationship: ['', Validators.required]
    });
  }

  // Métodos para gestionar las secciones
  cambiarSeccion(seccion: 'beneficiarios' | 'tutores' | 'relaciones'): void {
    this.seccionActiva = seccion;
    if (seccion === 'relaciones') {
      this.beneficiarioSeleccionado = null;
      this.relacionForm.reset();
    }
  }

  // Métodos para modales
  abrirModalNuevoMiembro(tipo: 'tutor' | 'beneficiario'): void {
    this.modoEdicion = false;
    this.tipoMiembroActual = tipo;
    this.modalAbierto = true;

    // Resetear el formulario correspondiente
    if (tipo === 'tutor') {
      this.tutorForm.reset();
    } else {
      this.beneficiarioForm.reset({
        accountBalance: 0
      });
    }
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.tipoMiembroActual = null;
    this.miembroAEditar = null;
  }

  // Métodos para tutores
  editarTutor(tutor: Tutor): void {
    this.modoEdicion = true;
    this.tipoMiembroActual = 'tutor';
    this.miembroAEditar = tutor;
    this.modalAbierto = true;

    // Llenar el formulario con los datos del tutor
    this.tutorForm.patchValue({
      id: tutor.id,
      userId: tutor.userId,
      name: tutor.name,
      lastName: tutor.lastName,
      birthdate: this.formatDateForInput(tutor.birthdate),
      dni: tutor.dni,
      email: tutor.email,
      contactPhone: tutor.contactPhone,
      notes: tutor.notes || ''
    });
  }

  guardarTutor(): void {
    if (this.tutorForm.invalid) {
      this.tutorForm.markAllAsTouched();
      return;
    }

    const tutorData = this.tutorForm.value;

    if (this.modoEdicion) {
      this.familyGroupService.updateTutor(tutorData).subscribe({
        next: (response) => {
          // Actualizar el tutor en el arreglo local
          if (tutorData.id === this.familyGroup.mainContact.id) {
            this.familyGroup.mainContact = response;
          } else {
            const index = this.familyGroup.tutors.findIndex(t => t.id === tutorData.id);
            if (index !== -1) {
              this.familyGroup.tutors[index] = response;
            }
          }
          this.mostrarMensajeExito('Tutor actualizado exitosamente');
          this.cerrarModal();
        },
        error: (error) => {
          this.toastr.error('Error al actualizar el tutor', 'Error');
          console.error('Error al actualizar el tutor', error);
        }
      });
    } else {
      this.familyGroupService.addTutor(tutorData).subscribe({
        next: (response) => {
          this.familyGroup.tutors.push(response);
          this.mostrarMensajeExito('Tutor agregado exitosamente');
          this.cerrarModal();
        },
        error: (error) => {
          this.toastr.error('Error al agregar el tutor', 'Error');
          console.error('Error al agregar el tutor', error);
        }
      });
    }
  }

  // Métodos para beneficiarios
  editarBeneficiario(beneficiario: MemberProtagonist): void {
    this.modoEdicion = true;
    this.tipoMiembroActual = 'beneficiario';
    this.miembroAEditar = beneficiario;
    this.modalAbierto = true;

    // Llenar el formulario con los datos del beneficiario
    this.beneficiarioForm.patchValue({
      id: beneficiario.id,
      userId: beneficiario.userId,
      name: beneficiario.name,
      lastName: beneficiario.lastName,
      birthdate: this.formatDateForInput(beneficiario.birthdate),
      dni: beneficiario.dni,
      memberType: beneficiario.memberType,
      section: beneficiario.section,
      accountBalance: beneficiario.accountBalance,
      notes: beneficiario.notes || ''
    });
  }

  guardarBeneficiario(): void {
    if (this.beneficiarioForm.invalid) {
      this.beneficiarioForm.markAllAsTouched();
      return;
    }

    const beneficiarioData = this.beneficiarioForm.value;

    if (this.modoEdicion) {
      this.familyGroupService.updateMember(beneficiarioData).subscribe({
        next: (response) => {
          // Actualizar el beneficiario en el arreglo local
          const index = this.familyGroup.members.findIndex(m => m.id === beneficiarioData.id);
          if (index !== -1) {
            this.familyGroup.members[index] = response;
          }
          this.mostrarMensajeExito('Beneficiario actualizado exitosamente');
          this.cerrarModal();
        },
        error: (error) => {
          this.toastr.error('Error al actualizar el beneficiario', 'Error');
          console.error('Error al actualizar el beneficiario', error);
        }
      });
    } else {
      this.familyGroupService.addMember(beneficiarioData).subscribe({
        next: (response) => {
          this.familyGroup.members.push(response);
          this.mostrarMensajeExito('Beneficiario agregado exitosamente');
          this.cerrarModal();
        },
        error: (error) => {
          this.toastr.error('Error al agregar el beneficiario', 'Error');
          console.error('Error al agregar el beneficiario', error);
        }
      });
    }
  }

  // Métodos para eliminación
  eliminarMiembro(miembro: Member): void {
    this.miembroAEliminar = miembro;
    this.modalConfirmacionAbierto = true;
  }

  confirmarEliminacion(): void {
    if (!this.miembroAEliminar) return;

    const esUnTutor = this.miembroAEliminar === this.familyGroup.mainContact ||
      this.familyGroup.tutors.some(t => t.id === this.miembroAEliminar!.id);

    if (esUnTutor) {
      this.familyGroupService.deleteTutor(this.miembroAEliminar.id).subscribe({
        next: () => {
          // Eliminar el tutor del arreglo local
          this.familyGroup.tutors = this.familyGroup.tutors.filter(t => t.id !== this.miembroAEliminar!.id);
          this.mostrarMensajeExito('Tutor eliminado exitosamente');
          this.cancelarEliminacion();
        },
        error: (error) => {
          this.toastr.error('Error al eliminar el tutor', 'Error');
          console.error('Error al eliminar el tutor', error);
        }
      });
    } else {
      this.familyGroupService.deleteMember(this.miembroAEliminar.id).subscribe({
        next: () => {
          // Eliminar el beneficiario del arreglo local
          this.familyGroup.members = this.familyGroup.members.filter(m => m.id !== this.miembroAEliminar!.id);
          this.mostrarMensajeExito('Beneficiario eliminado exitosamente');
          this.cancelarEliminacion();
        },
        error: (error) => {
          this.toastr.error('Error al eliminar el beneficiario', 'Error');
          console.error('Error al eliminar el beneficiario', error);
        }
      });
    }
  }

  cancelarEliminacion(): void {
    this.modalConfirmacionAbierto = false;
    this.miembroAEliminar = null;
  }

  // Métodos para relaciones
  cargarRelacionesBeneficiario(): void {
    if (this.beneficiarioSeleccionado) {
      this.relacionForm.reset();
    }
  }

  getTutoresRelacionados(beneficiarioId: number): Relationship[] {
    const beneficiario = this.familyGroup.members.find(m => m.id === beneficiarioId);
    return beneficiario ? beneficiario.relationships || [] : [];
  }

  getTutorNombre(tutorId: number | undefined): string {
    if (tutorId === undefined){
      return 'Desconocido'
    }
    if (this.familyGroup.mainContact.id === tutorId) {
      return `${this.familyGroup.mainContact.name} ${this.familyGroup.mainContact.lastName}`;
    }

    const tutor = this.familyGroup.tutors.find(t => t.id === tutorId);
    return tutor ? `${tutor.name} ${tutor.lastName}` : 'Desconocido';
  }

  guardarRelacion(): void {
    if (this.relacionForm.invalid || !this.beneficiarioSeleccionado) {
      this.relacionForm.markAllAsTouched();
      return;
    }

    const tutorId = this.relacionForm.value.tutorId;
    const relationship = this.relacionForm.value.relationship;

    // Verificar si ya existe esta relación
    const yaExiste = this.beneficiarioSeleccionado.relationships?.some(
      r => r.tutorId === tutorId
    );

    if (yaExiste) {
      this.toastr.warning('Este tutor ya está relacionado con este beneficiario', 'Advertencia');
      return;
    }

    const nuevaRelacion: Relationship = {
      memberId: this.beneficiarioSeleccionado.id,
      tutorId: tutorId,
      relationship: relationship
    };

    this.familyGroupService.addRelationship(nuevaRelacion).subscribe({
      next: (response) => {
        // Asegurarse de que el beneficiario tenga un array de relaciones
        if (!this.beneficiarioSeleccionado!.relationships) {
          this.beneficiarioSeleccionado!.relationships = [];
        }

        // Agregar la relación al beneficiario seleccionado
        this.beneficiarioSeleccionado!.relationships.push(response);
        this.mostrarMensajeExito('Relación agregada exitosamente');
        this.relacionForm.reset();
      },
      error: (error) => {
        this.toastr.error('Error al agregar la relación', 'Error');
        console.error('Error al agregar la relación', error);
      }
    });
  }

  eliminarRelacion(relacion: Relationship): void {
    this.relacionAEliminar = relacion;
    this.modalConfirmacionRelacionAbierto = true;
  }

  confirmarEliminacionRelacion(): void {
    if (!this.relacionAEliminar || !this.beneficiarioSeleccionado) return;

    this.familyGroupService.deleteRelationship(this.relacionAEliminar).subscribe({
      next: () => {
        // Eliminar la relación del array local
        this.beneficiarioSeleccionado!.relationships = this.beneficiarioSeleccionado!.relationships!.filter(
          r => !(r.memberId === this.relacionAEliminar!.memberId && r.tutorId === this.relacionAEliminar!.tutorId)
        );
        this.mostrarMensajeExito('Relación eliminada exitosamente');
        this.cancelarEliminacionRelacion();
      },
      error: (error) => {
        this.toastr.error('Error al eliminar la relación', 'Error');
        console.error('Error al eliminar la relación', error);
      }
    });
  }

  cancelarEliminacionRelacion(): void {
    this.modalConfirmacionRelacionAbierto = false;
    this.relacionAEliminar = null;
  }

  // Métodos de utilidad
  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  mostrarMensajeExito(mensaje: string): void {
    this.mensajeAlerta = mensaje;
    this.mostrarAlerta = true;
    this.toastr.success(mensaje, 'Éxito');

    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
      this.cerrarAlerta();
    }, 5000);
  }

  cerrarAlerta(): void {
    this.mostrarAlerta = false;
    this.mensajeAlerta = '';
  }
}
