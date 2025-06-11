import { TestBed } from '@angular/core/testing';

import { FamilyGroupService } from './family-group.service';

describe('FamilyGroupService', () => {
  let service: FamilyGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FamilyGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
