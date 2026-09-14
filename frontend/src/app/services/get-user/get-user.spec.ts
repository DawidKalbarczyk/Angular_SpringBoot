import { TestBed } from '@angular/core/testing';

import { GetUser } from './get-user';

describe('GetUser', () => {
  let service: GetUser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
