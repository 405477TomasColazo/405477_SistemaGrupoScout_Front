import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import {
  Competence,
  MarchSheet,
  CompetenceProgress,
  ProgressionStats,
  ProgressionSummary,
  GrowthArea,
  CompetenceStatus,
  ProgressionStage
} from '../models/progression.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgressionService {
  private apiUrl = `${environment.apiUrl}/api`;
  private currentProgressionSubject = new BehaviorSubject<MarchSheet | null>(null);
  public currentProgression$ = this.currentProgressionSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Competences
  getCompetences(area?: GrowthArea, sectionId?: number): Observable<Competence[]> {
    let url = `${this.apiUrl}/competences`;
    const params = new URLSearchParams();

    if (area) params.append('area', area);
    // if (sectionId) params.append('sectionId', sectionId.toString());

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http.get<Competence[]>(url);
  }

  getCompetenceById(id: number): Observable<Competence> {
    return this.http.get<Competence>(`${this.apiUrl}/competences/${id}`);
  }

  // March Sheets
  getMarchSheet(memberId: number): Observable<MarchSheet> {
    return this.http.get<MarchSheet>(`${this.apiUrl}/progression/march-sheet/member/${memberId}`)
      .pipe(tap(marchSheet => this.currentProgressionSubject.next(marchSheet)));
  }

  createMarchSheet(marchSheet: Partial<MarchSheet>): Observable<MarchSheet> {
    return this.http.post<MarchSheet>(`${this.apiUrl}/progression/march-sheet`, marchSheet)
      .pipe(tap(newMarchSheet => this.currentProgressionSubject.next(newMarchSheet)));
  }

  updateMarchSheet(id: number, marchSheet: Partial<MarchSheet>): Observable<MarchSheet> {
    return this.http.put<MarchSheet>(`${this.apiUrl}/progression/march-sheet/${id}`, marchSheet)
      .pipe(tap(updatedMarchSheet => this.currentProgressionSubject.next(updatedMarchSheet)));
  }

  // Competence Progress
  getCompetenceProgress(memberId: number): Observable<CompetenceProgress[]> {
    return this.http.get<CompetenceProgress[]>(`${this.apiUrl}/progression/competence-progress/member/${memberId}`);
  }

  addCompetenceToMarchSheet(marchSheetId: number, competenceId: number): Observable<CompetenceProgress> {
    return this.http.post<CompetenceProgress>(`${this.apiUrl}/progression/march-sheet/${marchSheetId}/competence/${competenceId}`, {});
  }

  updateCompetenceProgress(id: number, competenceProgress: Partial<CompetenceProgress>): Observable<CompetenceProgress> {
    return this.http.put<CompetenceProgress>(`${this.apiUrl}/progression/competence-progress/${id}`, competenceProgress);
  }

  approveCompetence(id: number, comment?: string): Observable<CompetenceProgress> {
    return this.http.post<CompetenceProgress>(`${this.apiUrl}/progression/competence-progress/${id}/approve`, {
      comments: comment
    });
  }

  // Estadísticas y Reportes
  getProgressionStats(memberId: number): Observable<ProgressionStats> {
    return this.http.get<ProgressionStats>(`${this.apiUrl}/progression/stats/member/${memberId}`);
  }

  getPendingApprovals(): Observable<CompetenceProgress[]> {
    return this.http.get<CompetenceProgress[]>(`${this.apiUrl}/progression/pending-approvals`);
  }

  removeCompetenceFromMarchSheet(progressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/progression/competence-progress/${progressId}`);
  }

  updateProgressionStage(memberId: number, newStage: ProgressionStage, comments?: string): Observable<MarchSheet> {
    return this.http.put<MarchSheet>(`${this.apiUrl}/progression/progression-stage`, {
      memberId: memberId,
      newStage: newStage,
      comments: comments
    }).pipe(tap(updatedMarchSheet => this.currentProgressionSubject.next(updatedMarchSheet)));
  }

  // Métodos auxiliares para cálculos locales
  calculateProgressionStats(competenceProgress: CompetenceProgress[]): ProgressionStats {
    const totalCompetences = competenceProgress.length;
    const completed = competenceProgress.filter(c =>
      c.status === CompetenceStatus.COMPLETED || c.status === CompetenceStatus.APPROVED
    ).length;
    const inProgress = competenceProgress.filter(c =>
      c.status === CompetenceStatus.IN_PROGRESS
    ).length;
    const pending = competenceProgress.filter(c =>
      c.status === CompetenceStatus.PENDING
    ).length;

    const overallPercentage = totalCompetences > 0 ? (completed / totalCompetences) * 100 : 0;

    // Calculate statistics by area
    const byAreas = {} as ProgressionStats['byAreas'];

    Object.values(GrowthArea).forEach(area => {
      const competencesInArea = competenceProgress.filter(c => c.competence?.growthArea === area);
      const completedInArea = competencesInArea.filter(c =>
        c.status === CompetenceStatus.COMPLETED || c.status === CompetenceStatus.APPROVED
      ).length;

      byAreas[area] = {
        total: competencesInArea.length,
        completed: completedInArea,
        percentage: competencesInArea.length > 0 ? (completedInArea / competencesInArea.length) * 100 : 0
      };
    });

    return {
      totalCompetences,
      completed,
      inProgress,
      pending,
      overallPercentage,
      byAreas
    };
  }

  // Métodos para validaciones
  canSelectMoreCompetences(currentCompetences: CompetenceProgress[]): boolean {
    return currentCompetences.length < 14;
  }

  getAvailableCompetences(allCompetences: Competence[], selectedCompetences: CompetenceProgress[]): Competence[] {
    const selectedIds = selectedCompetences.map(cp => cp.competenceId);
    return allCompetences.filter(c => !selectedIds.includes(c.id));
  }

  validateCompetenceSelection(competencesByArea: Map<GrowthArea, number>): boolean {
    // Validar que hay al menos una competencia por área y máximo 14 en total
    const totalSelected = Array.from(competencesByArea.values()).reduce((sum, count) => sum + count, 0);
    const areasWithCompetences = Array.from(competencesByArea.values()).filter(count => count > 0).length;

    return totalSelected >= 12 && totalSelected <= 14 && areasWithCompetences === 4;
  }

  // Mock data for development (remove when connected to real backend)
  getMockMarchSheet(scoutId: number): MarchSheet {
    const competences = this.getMockCompetences();
    const competenceProgress: CompetenceProgress[] = [
      {
        id: 1,
        competenceId: 1,
        marchSheetId: 1,
        competence: competences[0],
        ownAction: 'Me comprometo a mantener mi cuarto ordenado y cocinar una vez por semana',
        achievement: 'He logrado mantener mi espacio limpio durante 3 semanas consecutivas',
        startDate: new Date('2024-01-15'),
        completionDate: new Date('2024-02-15'),
        status: CompetenceStatus.COMPLETED
      },
      {
        id: 2,
        competenceId: 2,
        marchSheetId: 1,
        competence: competences[1],
        ownAction: 'Voy a participar en un proyecto de ayuda alimentaria en mi barrio',
        achievement: '',
        startDate: new Date('2024-02-01'),
        status: CompetenceStatus.IN_PROGRESS
      },
      {
        id: 3,
        competenceId: 3,
        marchSheetId: 1,
        competence: competences[2],
        ownAction: '',
        achievement: '',
        startDate: new Date('2024-02-10'),
        status: CompetenceStatus.PENDING
      }
    ];

    return {
      id: 1,
      memberId: scoutId,
      memberName: 'Juan Pérez',
      totem: 'Águila Valiente',
      progressionStage: ProgressionStage.TIERRA,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-02-20'),
      competenceProgress: competenceProgress
    };
  }

  getMockCompetences(): Competence[] {
    return [
      {
        id: 1,
        title: "Adopto y promuevo hábitos de alimentación e higiene saludables",
        description: "Desarrollo hábitos saludables de alimentación e higiene personal",
        growthArea: GrowthArea.HEALTH_WELLBEING,
        suggestedActions: [
          {
            id: 1,
            description: "Mantengo el ambiente limpio y ordenado, en mi hogar, en mi espacio de reunión con el equipo",
            competenceId: 1
          },
          {
            id: 2,
            description: "Sostengo una alimentación equilibrada que incluya variedad de alimentos con recetas saludables",
            competenceId: 1
          }
        ],
        guidingQuestions: [
          "¿Por qué debe importarme lo que como?",
          "¿Cuál es la importancia de aprender a cocinar?"
        ]
      },
      {
        id: 2,
        title: "Contribuyo al desarrollo de mi comunidad",
        description: "Participo activamente en proyectos que beneficien a mi comunidad",
        growthArea: GrowthArea.PEACE_DEVELOPMENT,
        suggestedActions: [
          {
            id: 3,
            description: "Participo en proyectos de servicio comunitario",
            competenceId: 2
          }
        ]
      },
      {
        id: 3,
        title: "Cuido y protejo el medio ambiente",
        description: "Desarrollo conciencia ambiental y prácticas sostenibles",
        growthArea: GrowthArea.ENVIRONMENT,
        suggestedActions: [
          {
            id: 4,
            description: "Implemento prácticas de reciclaje en mi hogar",
            competenceId: 3
          }
        ]
      },
      {
        id: 4,
        title: "Desarrollo habilidades de liderazgo",
        description: "Aprendo a liderar equipos y proyectos",
        growthArea: GrowthArea.LIFE_SKILLS,
        suggestedActions: [
          {
            id: 5,
            description: "Lidero un proyecto en mi equipo",
            competenceId: 4
          }
        ]
      }
    ];
  }
}
