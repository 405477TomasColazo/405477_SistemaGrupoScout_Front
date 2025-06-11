import { TestBed } from '@angular/core/testing';

import { EducatorsService } from './educators.service';

describe('EducatorsService', () => {
  let service: EducatorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EducatorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
