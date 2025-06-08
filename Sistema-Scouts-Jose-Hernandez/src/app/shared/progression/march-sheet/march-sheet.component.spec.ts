import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { MarchSheetComponent } from './march-sheet.component';
import { ProgressionService } from '../../../core/services/progression.service';
import { AuthService } from '../../../core/auth/auth.service';
import { 
  HojaDeMarcha, 
  CompetenciaProgreso, 
  AreaCrecimiento, 
  EstadoCompetencia,
  EtapaProgresion 
} from '../../../core/models/progression.model';
import { User } from '../../../core/models/user.model';

describe('MarchSheetComponent', () => {
  let component: MarchSheetComponent;
  let fixture: ComponentFixture<MarchSheetComponent>;
  let progressionService: jasmine.SpyObj<ProgressionService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    id: 1,
    lastName: 'Test',
    email: 'test@test.com',
    roles: ['family']
  };

  const mockCompetenciaProgreso: CompetenciaProgreso = {
    id: 1,
    competenciaId: 1,
    hojaDeMarachaId: 1,
    competencia: {
      id: 1,
      titulo: 'Test Competencia',
      descripcion: 'Descripción de prueba',
      area: AreaCrecimiento.SALUD_BIENESTAR,
      accionesSugeridas: []
    },
    accionPropia: 'Mi acción personalizada',
    logro: 'Mi logro',
    fechaInicio: new Date(),
    estado: EstadoCompetencia.EN_PROGRESO
  };

  const mockHojaDeMarcha: HojaDeMarcha = {
    id: 1,
    scoutId: 1,
    scoutName: 'Juan Test',
    etapaProgresion: EtapaProgresion.AMBIENTACION,
    fechaCreacion: new Date(),
    fechaUltimaActualizacion: new Date(),
    competenciasProgreso: [mockCompetenciaProgreso]
  };

  beforeEach(async () => {
    const progressionServiceSpy = jasmine.createSpyObj('ProgressionService', [
      'getHojaDeMarcha',
      'updateCompetenciaProgreso'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    await TestBed.configureTestingModule({
      declarations: [MarchSheetComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: ProgressionService, useValue: progressionServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarchSheetComponent);
    component = fixture.componentInstance;
    progressionService = TestBed.inject(ProgressionService) as jasmine.SpyObj<ProgressionService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load march sheet on init', () => {
    authService.getCurrentUser.and.returnValue(mockUser);
    progressionService.getHojaDeMarcha.and.returnValue(of(mockHojaDeMarcha));

    component.ngOnInit();

    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(progressionService.getHojaDeMarcha).toHaveBeenCalledWith(1);
    expect(component.hojaDeMarcha).toEqual(mockHojaDeMarcha);
    expect(component.loading).toBeFalse();
  });

  it('should handle user not authenticated', () => {
    authService.getCurrentUser.and.returnValue(null);

    component.ngOnInit();

    expect(component.error).toBe('Usuario no autenticado');
    expect(component.loading).toBeFalse();
  });

  it('should organize competencias by area', () => {
    component.hojaDeMarcha = mockHojaDeMarcha;
    component['organizarCompetenciasPorArea']();

    const competenciasSalud = component.getCompetenciasForArea(AreaCrecimiento.SALUD_BIENESTAR);
    expect(competenciasSalud.length).toBe(1);
    expect(competenciasSalud[0]).toEqual(mockCompetenciaProgreso);
  });

  it('should select area correctly', () => {
    component.onSelectArea(AreaCrecimiento.AMBIENTE);
    
    expect(component.selectedArea).toBe(AreaCrecimiento.AMBIENTE);
    expect(component.editingCompetencia).toBeNull();
  });

  it('should edit competencia', () => {
    component.onEditCompetencia(mockCompetenciaProgreso);
    
    expect(component.editingCompetencia).toEqual(mockCompetenciaProgreso);
    expect(component.editForm.get('accionPropia')?.value).toBe('Mi acción personalizada');
    expect(component.editForm.get('logro')?.value).toBe('Mi logro');
    expect(component.editForm.get('estado')?.value).toBe(EstadoCompetencia.EN_PROGRESO);
  });

  it('should save competencia changes', () => {
    component.editingCompetencia = mockCompetenciaProgreso;
    component.hojaDeMarcha = mockHojaDeMarcha;
    component.editForm.patchValue({
      accionPropia: 'Nueva acción',
      logro: 'Nuevo logro',
      estado: EstadoCompetencia.COMPLETADA
    });

    const updatedCompetencia = { ...mockCompetenciaProgreso, accionPropia: 'Nueva acción' };
    progressionService.updateCompetenciaProgreso.and.returnValue(of(updatedCompetencia));

    component.onSaveCompetencia();

    expect(progressionService.updateCompetenciaProgreso).toHaveBeenCalled();
    expect(component.editingCompetencia).toBeNull();
    expect(component.saving).toBeFalse();
  });

  it('should get correct estado class', () => {
    expect(component.getEstadoClass(EstadoCompetencia.PENDIENTE)).toBe('bg-gray-100 text-gray-800');
    expect(component.getEstadoClass(EstadoCompetencia.EN_PROGRESO)).toBe('bg-blue-100 text-blue-800');
    expect(component.getEstadoClass(EstadoCompetencia.COMPLETADA)).toBe('bg-green-100 text-green-800');
    expect(component.getEstadoClass(EstadoCompetencia.APROBADA)).toBe('bg-purple-100 text-purple-800');
  });

  it('should calculate area completion percentage', () => {
    component.hojaDeMarcha = mockHojaDeMarcha;
    component['organizarCompetenciasPorArea']();

    // Área con competencias en progreso
    const percentage = component.getAreaCompletionPercentage(AreaCrecimiento.SALUD_BIENESTAR);
    expect(percentage).toBe(0); // EN_PROGRESO no cuenta como completada

    // Área sin competencias
    const emptyPercentage = component.getAreaCompletionPercentage(AreaCrecimiento.AMBIENTE);
    expect(emptyPercentage).toBe(0);
  });

  it('should get area stats correctly', () => {
    component.hojaDeMarcha = mockHojaDeMarcha;
    component['organizarCompetenciasPorArea']();

    const stats = component.getAreaStats(AreaCrecimiento.SALUD_BIENESTAR);
    expect(stats).toBe('0/1'); // 0 completadas de 1 total
  });
});