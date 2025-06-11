import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProgressionService } from '../../../core/services/progression.service';
import { FamilyGroupService } from '../../../core/services/family-group.service';
import {
  Competence,
  GrowthArea,
  AREA_LABELS
} from '../../../core/models/progression.model';
import { MemberProtagonist } from '../../../core/models/family-group.model';

@Component({
  selector: 'app-select-competences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-competences.component.html',
  styleUrls: ['./select-competences.component.css']
})
export class SelectCompetencesComponent implements OnInit, OnDestroy {
  allCompetences: Competence[] = [];
  availableCompetences: Competence[] = [];
  competencesByArea: Map<GrowthArea, Competence[]> = new Map();
  selectedCompetences: Set<number> = new Set();
  currentMember: MemberProtagonist | null = null;
  memberId: number | null = null;
  marchSheetId: number | null = null;
  selectedArea: GrowthArea = GrowthArea.PEACE_DEVELOPMENT;
  loading = true;
  saving = false;
  error: string | null = null;

  // References for template
  areaLabels = AREA_LABELS;
  growthArea = GrowthArea;
  areas = Object.values(GrowthArea);

  private destroy$ = new Subject<void>();

  constructor(
    private progressionService: ProgressionService,
    private familyGroupService: FamilyGroupService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    // Get memberId from query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const memberIdParam = params['memberId'];
      if (memberIdParam) {
        this.memberId = parseInt(memberIdParam, 10);
        this.loadMemberAndCompetences();
      } else {
        this.router.navigate(['/progression/dashboard']);
      }
    });
  }

  private loadMemberAndCompetences(): void {
    if (!this.memberId) {
      this.router.navigate(['/progression/dashboard']);
      return;
    }

    console.log('Loading data for memberId:', this.memberId);

    // Load family group first
    this.familyGroupService.getFamilyGroup()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (familyGroup) => {
          console.log('Family group loaded:', familyGroup);
          
          // Find the member
          this.currentMember = familyGroup.members.find(m => m.id === this.memberId) || null;
          
          if (!this.currentMember) {
            this.error = 'Miembro no encontrado';
            this.loading = false;
            return;
          }

          console.log('Member found:', this.currentMember);
          
          // Load competences
          this.loadCompetences();
        },
        error: (error) => {
          console.error('Error loading family group:', error);
          this.error = 'Error al cargar el grupo familiar';
          this.loading = false;
        }
      });
  }

  private loadCompetences(): void {
    console.log('Loading competences...');
    
    this.progressionService.getCompetences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (allCompetences) => {
          console.log('Competences loaded:', allCompetences);
          this.allCompetences = allCompetences;
          
          // Load march sheet
          this.loadMarchSheet();
        },
        error: (error) => {
          console.error('Error loading competences:', error);
          this.error = 'Error al cargar las competencias';
          this.loading = false;
        }
      });
  }

  private loadMarchSheet(): void {
    console.log('Loading march sheet for memberId:', this.memberId);
    
    this.progressionService.getMarchSheet(this.memberId!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (marchSheet) => {
          console.log('March sheet loaded:', marchSheet);
          this.marchSheetId = marchSheet.id;

          // Get already selected competence IDs
          const selectedIds = marchSheet.competenceProgress.map(cp => cp.competenceId);
          console.log('Already selected competence IDs:', selectedIds);
          
          // Filter available competences (not already selected)
          this.availableCompetences = this.allCompetences.filter(c => !selectedIds.includes(c.id));
          console.log('Available competences:', this.availableCompetences);
          
          this.organizeCompetencesByArea();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading march sheet:', error);
          this.error = 'Error al cargar la hoja de marcha';
          this.loading = false;
        }
      });
  }

  private organizeCompetencesByArea(): void {
    this.competencesByArea.clear();
    
    // Initialize all areas
    this.areas.forEach(area => {
      this.competencesByArea.set(area, []);
    });

    // Group available competences by area
    this.availableCompetences.forEach(competence => {
      const area = competence.growthArea;
      const competencesInArea = this.competencesByArea.get(area) || [];
      competencesInArea.push(competence);
      this.competencesByArea.set(area, competencesInArea);
    });
  }

  onSelectArea(area: GrowthArea): void {
    this.selectedArea = area;
  }

  onToggleCompetence(competenceId: number): void {
    if (this.selectedCompetences.has(competenceId)) {
      this.selectedCompetences.delete(competenceId);
    } else {
      this.selectedCompetences.add(competenceId);
    }
  }

  isCompetenceSelected(competenceId: number): boolean {
    return this.selectedCompetences.has(competenceId);
  }

  getCompetencesForArea(area: GrowthArea): Competence[] {
    return this.competencesByArea.get(area) || [];
  }

  onSaveSelection(): void {
    if (this.selectedCompetences.size === 0) {
      this.error = 'Selecciona al menos una competencia';
      return;
    }

    if (!this.marchSheetId) {
      this.error = 'Error: No se encontró la hoja de marcha';
      return;
    }

    this.saving = true;
    this.error = null;

    // Add competences one by one
    const competenceIds = Array.from(this.selectedCompetences);
    this.addCompetencesSequentially(competenceIds, 0);
  }

  private addCompetencesSequentially(competenceIds: number[], index: number): void {
    if (index >= competenceIds.length) {
      // All competences added successfully
      this.saving = false;
      this.router.navigate(['/progression/march-sheet'], {
        queryParams: { memberId: this.memberId }
      });
      return;
    }

    const competenceId = competenceIds[index];
    this.progressionService.addCompetenceToMarchSheet(this.marchSheetId!, competenceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Add next competence
          this.addCompetencesSequentially(competenceIds, index + 1);
        },
        error: (error) => {
          console.error('Error adding competence:', error);
          this.error = `Error al agregar la competencia ${index + 1} de ${competenceIds.length}`;
          this.saving = false;
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/progression/march-sheet'], {
      queryParams: { memberId: this.memberId }
    });
  }

  getSelectedCount(): number {
    return this.selectedCompetences.size;
  }
}