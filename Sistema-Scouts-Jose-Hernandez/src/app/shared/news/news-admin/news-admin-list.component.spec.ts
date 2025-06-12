import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsAdminListComponent } from './news-admin-list.component';

describe('NewsAdminListComponent', () => {
  let component: NewsAdminListComponent;
  let fixture: ComponentFixture<NewsAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsAdminListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});