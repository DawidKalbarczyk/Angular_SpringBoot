import { TestBed } from '@angular/core/testing';

import { ObjSelection } from './obj-selection';

describe('ObjSelection', () => {
  let service: ObjSelection;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjSelection);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
