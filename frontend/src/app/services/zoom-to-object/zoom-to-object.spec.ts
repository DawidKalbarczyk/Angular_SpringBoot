import { TestBed } from '@angular/core/testing';

import { ZoomToObject } from './zoom-to-object';

describe('ZoomToObject', () => {
  let service: ZoomToObject;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoomToObject);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
