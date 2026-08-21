import { TestBed } from '@angular/core/testing';

import { InfoFeatures } from './info-features';

describe('InfoFeatures', () => {
  let service: InfoFeatures;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoFeatures);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
