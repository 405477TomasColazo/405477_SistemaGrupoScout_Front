import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyEventsComponent } from './family-events.component';

describe('FamilyEventsComponent', () => {
  let component: FamilyEventsComponent;
  let fixture: ComponentFixture<FamilyEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilyEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
