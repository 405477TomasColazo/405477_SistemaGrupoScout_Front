import {Component, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FamilyGroup, Member, MemberProtagonist, Relationship, Tutor} from '../../core/models/family-group.model';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {FamilyGroupService} from '../../core/services/family-group.service';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from '../../core/auth/auth.service';

@Component({
  selector: 'app-family-gestion',
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    DatePipe
  ],
  templateUrl: './family-gestion.component.html',
  styleUrl: './family-gestion.component.css'
})
export class FamilyGestionComponent implements OnInit {
  // Initialize with default values
  familyGroup: FamilyGroup = {} as FamilyGroup;
  seccionActiva: 'beneficiarios' | 'tutores' | 'relaciones' = 'beneficiarios';
  userID: number = 0;

  // Gestión de modales
  infoModal: boolean = false;
  editModal = false;
  editMode = false;
  actualMemberType: 'tutor' | 'beneficiario' | null = null;
  selectedTutor: Tutor | null = null;

  // Gestión de confirmaciones
  modalConfirmacionAbierto = false;
  miembroAEditar: Member | null = null;
  miembroAEliminar: Member | null = null;

  // Gestión de relaciones
  selectedProtagonist: MemberProtagonist | null = null;
  relationshipForm: FormGroup = {} as FormGroup;
  confirmationRelationshipModalOpen = false;
  relationshipToDelete: Relationship | null = null;

  // Formularios
  tutorForm: FormGroup = {} as FormGroup;
  protagonistForm: FormGroup = {} as FormGroup;

  // Alertas
  showAlert = false;
  alertText = '';

  constructor(
    private fb: FormBuilder,
    private familyGroupService: FamilyGroupService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFamilyGroup();
    this.startForm();

  }

  loadFamilyGroup(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log(user);
        this.userID = user.id;
      }
    })

    this.familyGroupService.getFamilyGroup().subscribe({
      next: (data) => {
        console.log(data);
        this.familyGroup = data;
      },
      error: (error) => {
        this.toastr.error('Error al cargar los datos del grupo familiar', 'Error');
        console.error('Error al cargar los datos del grupo familiar', error);
      }
    });
  }

  startForm(): void {
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
      address: ['', [Validators.required]],
      notes: ['']
    });

    // Formulario para beneficiarios
    this.protagonistForm = this.fb.group({
      id: [null],
      userId: [null],
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      birthdate: ['', Validators.required],
      address: ['', [Validators.required]],
      dni: ['', Validators.required],
      memberType: ['', Validators.required],
      section: ['', Validators.required],
      notes: ['']
    });

    // Formulario para relaciones
    this.relationshipForm = this.fb.group({
      tutorId: [null, Validators.required],
      relationship: ['', Validators.required]
    });
  }

  // Métodos para gestionar las secciones
  cambiarSeccion(seccion: 'beneficiarios' | 'tutores' | 'relaciones'): void {
    this.seccionActiva = seccion;
    if (seccion === 'relaciones') {
      this.selectedProtagonist = null;
      this.relationshipForm.reset();
    }
  }

  // Métodos para modales
  abrirModalNuevoMiembro(tipo: 'tutor' | 'beneficiario'): void {
    this.editMode = false;
    this.actualMemberType = tipo;
    this.editModal = true;

    // Resetear el formulario correspondiente
    if (tipo === 'tutor') {
      this.tutorForm.reset();
    } else {
      this.protagonistForm.reset({
        accountBalance: 0
      });
    }
  }

  cerrarModal(): void {
    this.editModal = false;
    this.actualMemberType = null;
    this.miembroAEditar = null;
    this.infoModal = false;
    this.selectedTutor = null;
  }

  // Métodos para tutores
  editarTutor(tutor: Tutor): void {
    this.editMode = true;
    this.actualMemberType = 'tutor';
    this.miembroAEditar = tutor;
    this.editModal = true;

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

    let tutorData = this.tutorForm.value;
    tutorData.userId = this.userID;

    if (this.editMode) {
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
    this.editMode = true;
    this.actualMemberType = 'beneficiario';
    this.miembroAEditar = beneficiario;
    this.editModal = true;

    // Llenar el formulario con los datos del beneficiario
    this.protagonistForm.patchValue({
      id: beneficiario.id,
      userId: beneficiario.userId,
      name: beneficiario.name,
      lastName: beneficiario.lastName,
      address: beneficiario.address,
      birthdate: this.formatDateForInput(beneficiario.birthdate),
      dni: beneficiario.dni,
      memberType: beneficiario.memberType,
      section: beneficiario.section,
      notes: beneficiario.notes || ''
    });
  }

  guardarBeneficiario(): void {
    if (this.protagonistForm.invalid) {
      this.protagonistForm.markAllAsTouched();
      return;
    }

    let beneficiarioData = this.protagonistForm.value;
    beneficiarioData.userId = this.userID;

    if (this.editMode) {
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

    if (esUnTutor && this.miembroAEliminar) {
      this.familyGroupService.deleteTutor(this.miembroAEliminar.id ?? 0).subscribe({
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
      this.familyGroupService.deleteMember(this.miembroAEliminar.id ?? 0).subscribe({
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
    if (this.selectedProtagonist) {
      this.relationshipForm.reset();
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
    if (this.relationshipForm.invalid || !this.selectedProtagonist) {
      this.relationshipForm.markAllAsTouched();
      return;
    }

    const tutorId = this.relationshipForm.value.tutorId;
    const relationship = this.relationshipForm.value.relationship;

    // Verificar si ya existe esta relación
    const yaExiste = this.selectedProtagonist.relationships?.some(
      r => r.tutorId === tutorId
    );

    if (yaExiste) {
      this.toastr.warning('Este tutor ya está relacionado con este beneficiario', 'Advertencia');
      return;
    }

    const nuevaRelacion: Relationship = {
      memberId: this.selectedProtagonist.id ?? 0,
      tutorId: tutorId,
      relationship: relationship
    };

    this.familyGroupService.addRelationship(nuevaRelacion).subscribe({
      next: (response) => {
        // Asegurarse de que el beneficiario tenga un array de relaciones
        if (!this.selectedProtagonist!.relationships) {
          this.selectedProtagonist!.relationships = [];
        }

        // Agregar la relación al beneficiario seleccionado
        this.selectedProtagonist!.relationships.push(response);
        this.mostrarMensajeExito('Relación agregada exitosamente');
        this.relationshipForm.reset();
      },
      error: (error) => {
        this.toastr.error('Error al agregar la relación', 'Error');
        console.error('Error al agregar la relación', error);
      }
    });
  }

  eliminarRelacion(relacion: Relationship): void {
    this.relationshipToDelete = relacion;
    this.confirmationRelationshipModalOpen = true;
  }

  confirmarEliminacionRelacion(): void {
    if (!this.relationshipToDelete || !this.selectedProtagonist) return;

    this.familyGroupService.deleteRelationship(this.relationshipToDelete).subscribe({
      next: () => {
        // Eliminar la relación del array local
        this.selectedProtagonist!.relationships = this.selectedProtagonist!.relationships!.filter(
          r => !(r.memberId === this.relationshipToDelete!.memberId && r.tutorId === this.relationshipToDelete!.tutorId)
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
    this.confirmationRelationshipModalOpen = false;
    this.relationshipToDelete = null;
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
    this.alertText = mensaje;
    this.showAlert = true;
    this.toastr.success(mensaje, 'Éxito');

    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
      this.cerrarAlerta();
    }, 5000);
  }

  cerrarAlerta(): void {
    this.showAlert = false;
    this.alertText = '';
  }

  showInfoTutor(tutor: Tutor) {
    this.selectedTutor = tutor;
    this.infoModal = true;
    this.actualMemberType = 'tutor'
  }

  getProtagonistName(memberId: number) {
    for (const member of this.familyGroup.members) {
      if (member.id === memberId) {
        return member.name + " " + member.lastName;
      }
    }
    return "";
  }

  showInfoProtagonist(protagonist: MemberProtagonist) {
    this.selectedProtagonist = protagonist;
    this.infoModal = true;
    this.actualMemberType = 'beneficiario';
  }

}
