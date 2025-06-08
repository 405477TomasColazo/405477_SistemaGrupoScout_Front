export enum GrowthArea {
  PEACE_DEVELOPMENT = 'PEACE_DEVELOPMENT',
  HEALTH_WELLBEING = 'HEALTH_WELLBEING',
  ENVIRONMENT = 'ENVIRONMENT',
  LIFE_SKILLS = 'LIFE_SKILLS'
}

export enum CompetenceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED'
}

export enum ProgressionStage {
  AMBIENTACION = 'AMBIENTACION',
  TIERRA = 'TIERRA',
  AIRE = 'AIRE',
  FUEGO = 'FUEGO',
  AGUA = 'AGUA'
}

export interface SuggestedAction {
  id: number;
  description: string;
  competenceId: number;
}

export interface Competence {
  id: number;
  title: string;
  description: string;
  growthArea: GrowthArea;
  sectionId?: number;
  sectionName?: string;
  suggestedActions: SuggestedAction[];
  guidingQuestions?: string[];
}

export interface CompetenceProgress {
  id: number;
  competenceId: number;
  marchSheetId: number;
  competence?: Competence;
  ownAction?: string;
  achievement?: string;
  startDate: Date;
  completionDate?: Date;
  status: CompetenceStatus;
  approvedByEducatorId?: number;
  approvedByEducatorName?: string;
  approvalDate?: Date;
  educatorComments?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MarchSheet {
  id: number;
  memberId: number;
  memberName?: string;
  totem?: string;
  progressionStage: ProgressionStage;
  createdAt: Date;
  updatedAt: Date;
  competenceProgress: CompetenceProgress[];
}

export interface ProgressionStats {
  totalCompetences: number;
  completed: number;
  inProgress: number;
  pending: number;
  overallPercentage: number;
  byAreas: {
    [key in GrowthArea]: {
      total: number;
      completed: number;
      percentage: number;
    }
  };
}

export interface ProgressionSummary {
  scoutId: number;
  scoutName: string;
  section: string;
  currentStage: ProgressionStage;
  stats: ProgressionStats;
  lastActivity: Date;
}

export const AREA_LABELS: { [key in GrowthArea]: string } = {
  [GrowthArea.PEACE_DEVELOPMENT]: 'Paz y Desarrollo',
  [GrowthArea.HEALTH_WELLBEING]: 'Salud y Bienestar',
  [GrowthArea.ENVIRONMENT]: 'Ambiente',
  [GrowthArea.LIFE_SKILLS]: 'Habilidades para la Vida'
};

export const STAGE_LABELS: { [key in ProgressionStage]: string } = {
  [ProgressionStage.AMBIENTACION]: 'Ambientación',
  [ProgressionStage.TIERRA]: 'Tierra',
  [ProgressionStage.AIRE]: 'Aire',
  [ProgressionStage.FUEGO]: 'Fuego',
  [ProgressionStage.AGUA]: 'Agua'
};

export const STATUS_LABELS: { [key in CompetenceStatus]: string } = {
  [CompetenceStatus.PENDING]: 'Pendiente',
  [CompetenceStatus.IN_PROGRESS]: 'En Progreso',
  [CompetenceStatus.COMPLETED]: 'Completada',
  [CompetenceStatus.APPROVED]: 'Aprobada'
};