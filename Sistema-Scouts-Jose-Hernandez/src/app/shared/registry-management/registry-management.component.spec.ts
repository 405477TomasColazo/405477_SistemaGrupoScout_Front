import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistryManagementComponent } from './registry-management.component';

describe('RegistryManagementComponent', () => {
  let component: RegistryManagementComponent;
  let fixture: ComponentFixture<RegistryManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistryManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistryManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
