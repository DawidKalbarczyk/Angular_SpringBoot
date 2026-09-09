import { TestBed } from '@angular/core/testing';

import { AMService } from './a-m-service';

describe('AMService', () => {
  let service: AMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
