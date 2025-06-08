import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ProgressionService } from '../../../core/services/progression.service';
import { AuthService } from '../../../core/auth/auth.service';
import { FamilyGroupService } from '../../../core/services/family-group.service';
import {
  MarchSheet,
  CompetenceProgress,
  Competence,
  GrowthArea,
  CompetenceStatus,
  AREA_LABELS,
  STATUS_LABELS
} from '../../../core/models/progression.model';
import { MemberProtagonist } from '../../../core/models/family-group.model';

@Component({
  selector: 'app-march-sheet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './march-sheet.component.html',
  styleUrls: ['./march-sheet.component.css']
})
export class MarchSheetComponent implements OnInit, OnDestroy {
  marchSheet: MarchSheet | null = null;
  competencesByArea: Map<GrowthArea, CompetenceProgress[]> = new Map();
  selectedArea: GrowthArea = GrowthArea.PEACE_DEVELOPMENT;
  editingCompetence: CompetenceProgress | null = null;
  editForm: FormGroup;
  currentMember: MemberProtagonist | null = null;
  memberId: number | null = null;
  loading = true;
  saving = false;
  error: string | null = null;

  // References for template
  areaLabels = AREA_LABELS;
  statusLabels = STATUS_LABELS;
  growthArea = GrowthArea;
  competenceStatus = CompetenceStatus;
  areas = Object.values(GrowthArea);

  private destroy$ = new Subject<void>();

  constructor(
    private progressionService: ProgressionService,
    private authService: AuthService,
    private familyGroupService: FamilyGroupService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editForm = this.createEditForm();
  }

  ngOnInit(): void {
    this.loadMarchSheet();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createEditForm(): FormGroup {
    return this.fb.group({
      ownAction: ['', [Validators.maxLength(500)]],
      achievement: ['', [Validators.maxLength(1000)]],
      status: [CompetenceStatus.PENDING, Validators.required]
    });
  }

  private loadMarchSheet(): void {
    this.loading = true;
    this.error = null;

    // Get memberId from query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const memberIdParam = params['memberId'];
      if (memberIdParam) {
        this.memberId = parseInt(memberIdParam, 10);
        this.loadMemberAndMarchSheet();
      } else {
        // No memberId provided, redirect back to dashboard
        this.router.navigate(['/progression/dashboard']);
      }
    });
  }

  private loadMemberAndMarchSheet(): void {
    if (!this.memberId) {
      this.router.navigate(['/progression/dashboard']);
      return;
    }

    // Load family group to get member info
    this.familyGroupService.getFamilyGroup()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (familyGroup) => {
          // Find the member
          this.currentMember = familyGroup.members.find(m => m.id === this.memberId) || null;
          
          if (!this.currentMember) {
            this.error = 'Miembro no encontrado';
            this.loading = false;
            return;
          }

          // Load march sheet for the member
          this.progressionService.getMarchSheet(this.memberId!)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (marchSheet) => {
                this.marchSheet = marchSheet;
                this.organizeCompetencesByArea();
                this.loading = false;
              },
              error: (error) => {
                if (error.status === 404) {
                  this.error = 'No se encontró una hoja de marcha para este miembro. Crear una desde el dashboard.';
                  this.loading = false;
                } else {
                  this.error = 'Error loading march sheet';
                  this.loading = false;
                }
              }
            });
        },
        error: () => {
          this.error = 'Error al cargar el grupo familiar';
          this.loading = false;
        }
      });
  }

  private organizeCompetencesByArea(): void {
    if (!this.marchSheet) return;

    this.competencesByArea.clear();
    
    // Initialize all areas
    this.areas.forEach(area => {
      this.competencesByArea.set(area, []);
    });

    // Group competences by area
    this.marchSheet.competenceProgress.forEach(cp => {
      if (cp.competence) {
        const area = cp.competence.growthArea;
        const competencesInArea = this.competencesByArea.get(area) || [];
        competencesInArea.push(cp);
        this.competencesByArea.set(area, competencesInArea);
      }
    });
  }

  onSelectArea(area: GrowthArea): void {
    this.selectedArea = area;
    this.editingCompetence = null;
  }

  onEditCompetence(competence: CompetenceProgress): void {
    this.editingCompetence = competence;
    this.editForm.patchValue({
      ownAction: competence.ownAction || '',
      achievement: competence.achievement || '',
      status: competence.status
    });
  }

  onSaveCompetence(): void {
    if (!this.editingCompetence || !this.editForm.valid) return;

    this.saving = true;
    const formValues = this.editForm.value;
    
    const updatedCompetence: Partial<CompetenceProgress> = {
      ownAction: formValues.ownAction,
      achievement: formValues.achievement,
      status: formValues.status,
      updatedAt: new Date()
    };

    // If marked as completed, add completion date
    if (formValues.status === CompetenceStatus.COMPLETED && 
        this.editingCompetence.status !== CompetenceStatus.COMPLETED) {
      updatedCompetence.completionDate = new Date();
    }

    this.progressionService.updateCompetenceProgress(this.editingCompetence.id, updatedCompetence)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedCompetence) => {
          // Update competence in local list
          if (this.marchSheet) {
            const index = this.marchSheet.competenceProgress.findIndex(
              cp => cp.id === updatedCompetence.id
            );
            if (index !== -1) {
              this.marchSheet.competenceProgress[index] = updatedCompetence;
              this.organizeCompetencesByArea();
            }
          }
          
          this.editingCompetence = null;
          this.saving = false;
          this.editForm.reset();
        },
        error: () => {
          this.error = 'Error saving changes';
          this.saving = false;
        }
      });
  }

  onCancelEdit(): void {
    this.editingCompetence = null;
    this.editForm.reset();
  }

  onNavigateBack(): void {
    this.router.navigate(['/progression/dashboard']);
  }

  onAddCompetence(): void {
    if (this.memberId) {
      this.router.navigate(['/progression/select-competences'], {
        queryParams: { memberId: this.memberId }
      });
    }
  }

  getCompetencesForArea(area: GrowthArea): CompetenceProgress[] {
    return this.competencesByArea.get(area) || [];
  }

  getStatusClass(status: CompetenceStatus): string {
    switch (status) {
      case CompetenceStatus.PENDING:
        return 'bg-gray-100 text-gray-800';
      case CompetenceStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case CompetenceStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case CompetenceStatus.APPROVED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: CompetenceStatus): string {
    switch (status) {
      case CompetenceStatus.PENDING:
        return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case CompetenceStatus.IN_PROGRESS:
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case CompetenceStatus.COMPLETED:
        return 'M5 13l4 4L19 7';
      case CompetenceStatus.APPROVED:
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getAreaCompletionPercentage(area: GrowthArea): number {
    const competences = this.getCompetencesForArea(area);
    if (competences.length === 0) return 0;
    
    const completed = competences.filter(c => 
      c.status === CompetenceStatus.COMPLETED || c.status === CompetenceStatus.APPROVED
    ).length;
    
    return (completed / competences.length) * 100;
  }

  getAreaStats(area: GrowthArea): string {
    const competences = this.getCompetencesForArea(area);
    const completed = competences.filter(c => 
      c.status === CompetenceStatus.COMPLETED || c.status === CompetenceStatus.APPROVED
    ).length;
    
    return `${completed}/${competences.length}`;
  }

  trackByCompetenceId(index: number, item: CompetenceProgress): number {
    return item.id;
  }
}