import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyGestionComponent } from './family-gestion.component';

describe('FamilyGestionComponent', () => {
  let component: FamilyGestionComponent;
  let fixture: ComponentFixture<FamilyGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilyGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
