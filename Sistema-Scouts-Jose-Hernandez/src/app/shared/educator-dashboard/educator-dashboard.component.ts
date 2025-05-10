import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {EducatorsService} from "../../core/services/educators.service";
import {MiembroConDetalles, SectionMember} from "../../core/models/user.model";
import {FamilyGroupService} from '../../core/services/family-group.service';
import {Tutor} from '../../core/models/family-group.model';

@Component({
  selector: 'app-educator-dashboard',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    NgClass,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './educator-dashboard.component.html',
  styleUrl: './educator-dashboard.component.css'
})
export class EducatorDashboardComponent implements OnInit, OnDestroy {
  miembrosSeccion: SectionMember[] = [];
  miembrosFiltrados: SectionMember[] = [];
  miembroSeleccionado: MiembroConDetalles | null = null;
  showModal: boolean = false;
  loading: boolean = false;
  loadingDetails: boolean = false;
  error: string | null = null;

  filtrosForm = new FormGroup({
    searchText: new FormControl(''),
    tipo: new FormControl('todos') // 'todos', 'beneficiarios', 'educadores'
  });

  constructor(private educatorService: EducatorsService, private familyGroupService: FamilyGroupService) {}

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

  cerrarModal() {
    this.showModal = false;
    this.miembroSeleccionado = null;
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
}
