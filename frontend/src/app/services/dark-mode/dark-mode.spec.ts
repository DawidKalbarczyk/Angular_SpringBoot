import { TestBed } from '@angular/core/testing';

import { DarkMode } from './dark-mode';

describe('DarkMode', () => {
  let service: DarkMode;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DarkMode);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
