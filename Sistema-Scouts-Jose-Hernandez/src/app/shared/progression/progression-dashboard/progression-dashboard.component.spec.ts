import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { ProgressionDashboardComponent } from './progression-dashboard.component';
import { ProgressionService } from '../../../core/services/progression.service';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { HojaDeMarcha, EtapaProgresion, ProgressionStats, AreaCrecimiento } from '../../../core/models/progression.model';
import { User } from '../../../core/models/user.model';

describe('ProgressionDashboardComponent', () => {
  let component: ProgressionDashboardComponent;
  let fixture: ComponentFixture<ProgressionDashboardComponent>;
  let progressionService: jasmine.SpyObj<ProgressionService>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;

  const mockUser: User = {
    id: 1,
    lastName: 'Test',
    email: 'test@test.com',
    roles: ['family']
  };

  const mockHojaDeMarcha: HojaDeMarcha = {
    id: 1,
    scoutId: 1,
    scoutName: 'Juan Test',
    etapaProgresion: EtapaProgresion.AMBIENTACION,
    fechaCreacion: new Date(),
    fechaUltimaActualizacion: new Date(),
    competenciasProgreso: []
  };

  const mockStats: ProgressionStats = {
    totalCompetencias: 4,
    completadas: 1,
    enProgreso: 2,
    pendientes: 1,
    porcentajeGeneral: 25,
    porAreas: {
      [AreaCrecimiento.PAZ_DESARROLLO]: { total: 1, completadas: 0, porcentaje: 0 },
      [AreaCrecimiento.SALUD_BIENESTAR]: { total: 1, completadas: 1, porcentaje: 100 },
      [AreaCrecimiento.AMBIENTE]: { total: 1, completadas: 0, porcentaje: 0 },
      [AreaCrecimiento.HABILIDADES_VIDA]: { total: 1, completadas: 0, porcentaje: 0 }
    }
  };

  beforeEach(async () => {
    const progressionServiceSpy = jasmine.createSpyObj('ProgressionService', [
      'getHojaDeMarcha',
      'createHojaDeMarcha',
      'calculateProgressionStats'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);

    await TestBed.configureTestingModule({
      declarations: [ProgressionDashboardComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: ProgressionService, useValue: progressionServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressionDashboardComponent);
    component = fixture.componentInstance;
    progressionService = TestBed.inject(ProgressionService) as jasmine.SpyObj<ProgressionService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load progression data on init', () => {
    authService.getCurrentUser.and.returnValue(mockUser);
    progressionService.getHojaDeMarcha.and.returnValue(of(mockHojaDeMarcha));
    progressionService.calculateProgressionStats.and.returnValue(mockStats);

    component.ngOnInit();

    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(progressionService.getHojaDeMarcha).toHaveBeenCalledWith(1);
    expect(component.hojaDeMarcha).toEqual(mockHojaDeMarcha);
    expect(component.stats).toEqual(mockStats);
    expect(component.loading).toBeFalse();
  });

  it('should handle user not authenticated', () => {
    authService.getCurrentUser.and.returnValue(null);

    component.ngOnInit();

    expect(component.error).toBe('Usuario no autenticado');
    expect(component.loading).toBeFalse();
  });

  it('should create new hoja de marcha if not exists', () => {
    authService.getCurrentUser.and.returnValue(mockUser);
    progressionService.getHojaDeMarcha.and.returnValue(throwError({ status: 404 }));
    progressionService.createHojaDeMarcha.and.returnValue(of(mockHojaDeMarcha));
    progressionService.calculateProgressionStats.and.returnValue(mockStats);

    component.ngOnInit();

    expect(progressionService.createHojaDeMarcha).toHaveBeenCalled();
    expect(component.hojaDeMarcha).toEqual(mockHojaDeMarcha);
  });

  it('should get correct progress bar class', () => {
    expect(component.getProgressBarClass(90)).toBe('bg-green-500');
    expect(component.getProgressBarClass(70)).toBe('bg-yellow-500');
    expect(component.getProgressBarClass(50)).toBe('bg-orange-500');
    expect(component.getProgressBarClass(30)).toBe('bg-red-500');
  });

  it('should get correct etapa color', () => {
    expect(component.getEtapaColor(EtapaProgresion.TIERRA)).toBe('bg-amber-700');
    expect(component.getEtapaColor(EtapaProgresion.AIRE)).toBe('bg-blue-500');
    expect(component.getEtapaColor(EtapaProgresion.FUEGO)).toBe('bg-red-500');
    expect(component.getEtapaColor(EtapaProgresion.AGUA)).toBe('bg-blue-700');
  });
});