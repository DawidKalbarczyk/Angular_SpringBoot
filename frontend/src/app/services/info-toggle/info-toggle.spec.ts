import { TestBed } from '@angular/core/testing';

import { InfoToggle } from './info-toggle';

describe('InfoToggle', () => {
  let service: InfoToggle;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoToggle);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
