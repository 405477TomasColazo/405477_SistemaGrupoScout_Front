import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ProgressionService } from '../../../core/services/progression.service';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { FamilyGroupService } from '../../../core/services/family-group.service';
import {
  MarchSheet,
  ProgressionStats,
  GrowthArea,
  AREA_LABELS,
  STAGE_LABELS,
  ProgressionStage
} from '../../../core/models/progression.model';
import { SectionMember } from '../../../core/models/user.model';
import { FamilyGroup, MemberProtagonist } from '../../../core/models/family-group.model';

@Component({
  selector: 'app-progression-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progression-dashboard.component.html',
  styleUrls: ['./progression-dashboard.component.css']
})
export class ProgressionDashboardComponent implements OnInit, OnDestroy {
  marchSheet: MarchSheet | null = null;
  stats: ProgressionStats | null = null;
  familyGroup: FamilyGroup | null = null;
  selectedMember: MemberProtagonist | null = null;
  loading = true;
  error: string | null = null;
  showMemberSelection = false;

  // References for template
  areaLabels = AREA_LABELS;
  stageLabels = STAGE_LABELS;
  growthArea = GrowthArea;

  private destroy$ = new Subject<void>();

  constructor(
    private progressionService: ProgressionService,
    private authService: AuthService,
    private userService: UserService,
    private familyGroupService: FamilyGroupService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProgressionData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProgressionData(): void {
    this.loading = true;
    this.error = null;

    // Load family group first
    this.familyGroupService.getFamilyGroup()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (familyGroup) => {
          this.familyGroup = familyGroup;
          
          // If there are members, auto-select the first one or show selection
          if (familyGroup.members && familyGroup.members.length > 0) {
            if (familyGroup.members.length === 1) {
              // Auto-select if only one member
              this.selectMember(familyGroup.members[0]);
            } else {
              // Show member selection if multiple members
              this.showMemberSelection = true;
              this.loading = false;
            }
          } else {
            this.error = 'No se encontraron miembros en el grupo familiar';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading family group:', error);
          this.error = 'Error al cargar el grupo familiar';
          this.loading = false;
        }
      });
  }

  selectMember(member: MemberProtagonist): void {
    this.selectedMember = member;
    this.showMemberSelection = false;
    this.loading = true;
    
    // Load march sheet for selected member
    this.progressionService.getMarchSheet(member.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (marchSheet) => {
          this.marchSheet = marchSheet;
          this.stats = this.progressionService.calculateProgressionStats(marchSheet.competenceProgress);
          this.loading = false;
        },
        error: (error) => {
          // If no march sheet exists, create a new one
          if (error.status === 404) {
            this.createNewMarchSheet(member);
          } else {
            this.error = 'Error al cargar la progresión';
            this.loading = false;
          }
        }
      });
  }

  private createNewMarchSheet(member: MemberProtagonist): void {
    const newMarchSheet: Partial<MarchSheet> = {
      memberId: member.id!,
      memberName: `${member.name} ${member.lastName}`,
      progressionStage: ProgressionStage.AMBIENTACION,
      createdAt: new Date(),
      updatedAt: new Date(),
      competenceProgress: []
    };

    this.progressionService.createMarchSheet(newMarchSheet)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (marchSheet) => {
          this.marchSheet = marchSheet;
          this.stats = this.progressionService.calculateProgressionStats(marchSheet.competenceProgress);
          this.loading = false;
        },
        error: () => {
          this.error = 'Error creating march sheet';
          this.loading = false;
        }
      });
  }

  onNavigateToMarchSheet(): void {
    if (this.selectedMember) {
      this.router.navigate(['/progression/march-sheet'], { 
        queryParams: { memberId: this.selectedMember.id } 
      });
    }
  }

  onSelectCompetences(): void {
    if (this.selectedMember) {
      this.router.navigate(['/progression/select-competences'], { 
        queryParams: { memberId: this.selectedMember.id } 
      });
    }
  }

  onChangeMember(): void {
    this.showMemberSelection = true;
    this.marchSheet = null;
    this.stats = null;
    this.selectedMember = null;
  }

  getAreaProgress(area: GrowthArea): number {
    return this.stats?.byAreas[area]?.percentage || 0;
  }

  getAreaStats(area: GrowthArea): string {
    const areaStats = this.stats?.byAreas[area];
    if (!areaStats) return '0/0';
    return `${areaStats.completed}/${areaStats.total}`;
  }

  getProgressBarClass(percentage: number): string {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  getStageColor(stage: ProgressionStage): string {
    switch (stage) {
      case ProgressionStage.AMBIENTACION: return 'bg-gray-500';
      case ProgressionStage.TIERRA: return 'bg-amber-700';
      case ProgressionStage.AIRE: return 'bg-blue-500';
      case ProgressionStage.FUEGO: return 'bg-red-500';
      case ProgressionStage.AGUA: return 'bg-blue-700';
      default: return 'bg-gray-500';
    }
  }
}
