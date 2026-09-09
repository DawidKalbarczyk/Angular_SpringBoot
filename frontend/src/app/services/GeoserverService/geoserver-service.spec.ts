import { TestBed } from '@angular/core/testing';

import { GeoserverService } from './geoserver-service';

describe('GeoserverService', () => {
  let service: GeoserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
